import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/app_constants.dart';
import '../models/emergency_model.dart';
import 'supabase_service.dart';

enum EmergencyType {
  medical,
  fire,
  police,
  traffic,
  genderViolence,
  childAbuse,
  theft,
  assault,
  accident,
  appIssue,
  other
}

class EmergencyService {
  // Make emergency call
  static Future<bool> makeEmergencyCall(String phoneNumber) async {
    try {
      final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Failed to make emergency call: $e');
      return false;
    }
  }

  // Get emergency contact based on type
  static String getEmergencyContact(EmergencyType type) {
    switch (type) {
      case EmergencyType.medical:
        return AppConstants.emergencyHealth;
      case EmergencyType.fire:
      case EmergencyType.police:
        return AppConstants.emergencyGeneral;
      case EmergencyType.traffic:
        return AppConstants.emergencyTrafficPolice;
      case EmergencyType.genderViolence:
        return AppConstants.emergencyGenderViolence;
      case EmergencyType.childAbuse:
        return AppConstants.emergencyChildHelpLine;
      case EmergencyType.accident:
        return AppConstants.emergencyAmbulance;
      default:
        return AppConstants.emergencyGeneral;
    }
  }

  // Handle emergency report
  static Future<EmergencyResponse> handleEmergencyReport({
    required EmergencyType type,
    required String description,
    required String reporterId,
    String? workerId,
    String? householdId,
    String? jobId,
    Position? location,
    List<String>? evidenceFiles,
  }) async {
    try {
      // Determine if this should go to admin or external authority
      final bool isAppIssue = type == EmergencyType.appIssue;
      final bool isCriminalIssue = _isCriminalIssue(type);
      
      // Get current location if not provided
      Position? currentLocation = location;
      if (currentLocation == null) {
        try {
          currentLocation = await _getCurrentLocation();
        } catch (e) {
          debugPrint('Could not get location: $e');
        }
      }

      // Create emergency report
      final emergencyReport = EmergencyReport(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: type,
        description: description,
        reporterId: reporterId,
        workerId: workerId,
        householdId: householdId,
        jobId: jobId,
        location: currentLocation,
        evidenceFiles: evidenceFiles ?? [],
        status: EmergencyStatus.pending,
        createdAt: DateTime.now(),
        isAppIssue: isAppIssue,
        isCriminalIssue: isCriminalIssue,
      );

      // Save to database
      await _saveEmergencyReport(emergencyReport);

      // Route to appropriate authority
      if (isAppIssue) {
        // App issues go to admin
        await _notifyAdmin(emergencyReport);
        return EmergencyResponse(
          success: true,
          message: 'Report submitted to admin team',
          reportId: emergencyReport.id,
          contactNumber: null,
          routedTo: 'admin',
        );
      } else if (isCriminalIssue) {
        // Criminal issues go to ISANGE One Stop Center
        await _reportToIsange(emergencyReport);
        return EmergencyResponse(
          success: true,
          message: 'Report submitted to ISANGE One Stop Center',
          reportId: emergencyReport.id,
          contactNumber: AppConstants.emergencyGenderViolence,
          routedTo: 'isange',
        );
      } else {
        // Other emergencies go to appropriate emergency services
        final contactNumber = getEmergencyContact(type);
        await _notifyEmergencyServices(emergencyReport, contactNumber);
        
        return EmergencyResponse(
          success: true,
          message: 'Emergency services contacted',
          reportId: emergencyReport.id,
          contactNumber: contactNumber,
          routedTo: 'emergency_services',
        );
      }
    } catch (e) {
      return EmergencyResponse(
        success: false,
        message: 'Failed to handle emergency report: ${e.toString()}',
        reportId: null,
        contactNumber: null,
        routedTo: null,
      );
    }
  }

  // Check if emergency type is criminal
  static bool _isCriminalIssue(EmergencyType type) {
    return [
      EmergencyType.theft,
      EmergencyType.assault,
      EmergencyType.genderViolence,
      EmergencyType.childAbuse,
    ].contains(type);
  }

  // Get current location
  static Future<Position> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied');
    }

    return await Geolocator.getCurrentPosition();
  }

  // Save emergency report to database
  static Future<void> _saveEmergencyReport(EmergencyReport report) async {
    try {
      await SupabaseService.client.from('emergency_reports').insert({
        'id': report.id,
        'type': report.type.name,
        'description': report.description,
        'reporter_id': report.reporterId,
        'worker_id': report.workerId,
        'household_id': report.householdId,
        'job_id': report.jobId,
        'latitude': report.location?.latitude,
        'longitude': report.location?.longitude,
        'evidence_files': report.evidenceFiles,
        'status': report.status.name,
        'is_app_issue': report.isAppIssue,
        'is_criminal_issue': report.isCriminalIssue,
        'created_at': report.createdAt.toIso8601String(),
      });
    } catch (e) {
      debugPrint('Failed to save emergency report: $e');
      rethrow;
    }
  }

  // Notify admin team
  static Future<void> _notifyAdmin(EmergencyReport report) async {
    try {
      // Send notification to admin users
      final adminUsers = await SupabaseService.client
          .from('users')
          .select('id, email, full_name')
          .eq('user_type', AppConstants.userTypeAdmin);

      for (final admin in adminUsers) {
        await SupabaseService.client.from('notifications').insert({
          'user_id': admin['id'],
          'type': 'emergency_report',
          'title': 'Emergency Report: ${report.type.name}',
          'message': report.description,
          'data': {
            'report_id': report.id,
            'reporter_id': report.reporterId,
            'emergency_type': report.type.name,
          },
          'created_at': DateTime.now().toIso8601String(),
        });
      }

      // Update report status
      await SupabaseService.client
          .from('emergency_reports')
          .update({'status': EmergencyStatus.adminNotified.name})
          .eq('id', report.id);
    } catch (e) {
      debugPrint('Failed to notify admin: $e');
    }
  }

  // Report to ISANGE One Stop Center
  static Future<void> _reportToIsange(EmergencyReport report) async {
    try {
      // Prepare data for ISANGE
      final isangeData = {
        'case_id': report.id,
        'case_type': report.type.name,
        'description': report.description,
        'reporter_id': report.reporterId,
        'location': {
          'latitude': report.location?.latitude,
          'longitude': report.location?.longitude,
        },
        'evidence_files': report.evidenceFiles,
        'timestamp': report.createdAt.toIso8601String(),
        'platform': 'HouseHelp Rwanda',
      };

      // Send to ISANGE API (mock implementation)
      final response = await http.post(
        Uri.parse('${AppConstants.isangeOneCenterUrl}/api/reports'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ISANGE_API_TOKEN',
        },
        body: json.encode(isangeData),
      );

      if (response.statusCode == 200) {
        // Update report status
        await SupabaseService.client
            .from('emergency_reports')
            .update({
              'status': EmergencyStatus.isangeNotified.name,
              'isange_case_id': json.decode(response.body)['case_id'],
            })
            .eq('id', report.id);
      } else {
        throw Exception('Failed to report to ISANGE: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Failed to report to ISANGE: $e');
      
      // If API fails, still save locally and mark for manual follow-up
      await SupabaseService.client
          .from('emergency_reports')
          .update({
            'status': EmergencyStatus.isangeRetry.name,
            'error_message': e.toString(),
          })
          .eq('id', report.id);
    }
  }

  // Notify emergency services
  static Future<void> _notifyEmergencyServices(
    EmergencyReport report,
    String contactNumber,
  ) async {
    try {
      // Update report status
      await SupabaseService.client
          .from('emergency_reports')
          .update({
            'status': EmergencyStatus.emergencyServicesNotified.name,
            'emergency_contact': contactNumber,
          })
          .eq('id', report.id);

      // Log the emergency contact
      await SupabaseService.client.from('emergency_contacts').insert({
        'report_id': report.id,
        'contact_number': contactNumber,
        'contact_type': report.type.name,
        'contacted_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Failed to notify emergency services: $e');
    }
  }

  // Get emergency reports for admin
  static Future<List<EmergencyReport>> getEmergencyReports({
    int limit = 50,
    EmergencyStatus? status,
    EmergencyType? type,
  }) async {
    try {
      var query = SupabaseService.client
          .from('emergency_reports')
          .select()
          .order('created_at', ascending: false)
          .limit(limit);

      if (status != null) {
        query = query.eq('status', status.name);
      }

      if (type != null) {
        query = query.eq('type', type.name);
      }

      final response = await query;
      return response.map<EmergencyReport>((json) {
        return EmergencyReport.fromJson(json);
      }).toList();
    } catch (e) {
      throw Exception('Failed to get emergency reports: ${e.toString()}');
    }
  }

  // Update emergency report status
  static Future<void> updateEmergencyReportStatus({
    required String reportId,
    required EmergencyStatus status,
    String? adminNotes,
  }) async {
    try {
      await SupabaseService.client
          .from('emergency_reports')
          .update({
            'status': status.name,
            'admin_notes': adminNotes,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', reportId);
    } catch (e) {
      throw Exception('Failed to update emergency report: ${e.toString()}');
    }
  }

  // Quick emergency actions
  static Future<void> quickEmergencyAction({
    required EmergencyType type,
    String? description,
    String? reporterId,
  }) async {
    final contactNumber = getEmergencyContact(type);
    
    // Show emergency dialog
    // This would typically be called from a widget with context
    
    // Auto-call if it's a critical emergency
    if (_isCriticalEmergency(type)) {
      await makeEmergencyCall(contactNumber);
    }
    
    // Create quick report
    if (reporterId != null) {
      await handleEmergencyReport(
        type: type,
        description: description ?? 'Quick emergency report',
        reporterId: reporterId,
      );
    }
  }

  // Check if emergency is critical (requires immediate call)
  static bool _isCriticalEmergency(EmergencyType type) {
    return [
      EmergencyType.medical,
      EmergencyType.fire,
      EmergencyType.accident,
      EmergencyType.assault,
    ].contains(type);
  }

  // Get emergency statistics for admin
  static Future<Map<String, dynamic>> getEmergencyStatistics({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final start = startDate ?? DateTime.now().subtract(const Duration(days: 30));
      final end = endDate ?? DateTime.now();

      final reports = await SupabaseService.client
          .from('emergency_reports')
          .select()
          .gte('created_at', start.toIso8601String())
          .lte('created_at', end.toIso8601String());

      final stats = <String, dynamic>{
        'total_reports': reports.length,
        'app_issues': 0,
        'criminal_issues': 0,
        'emergency_services': 0,
        'resolved': 0,
        'pending': 0,
        'by_type': <String, int>{},
      };

      for (final report in reports) {
        final type = report['type'] as String;
        final status = report['status'] as String;
        final isAppIssue = report['is_app_issue'] as bool? ?? false;
        final isCriminalIssue = report['is_criminal_issue'] as bool? ?? false;

        if (isAppIssue) {
          stats['app_issues']++;
        } else if (isCriminalIssue) {
          stats['criminal_issues']++;
        } else {
          stats['emergency_services']++;
        }

        if (status == EmergencyStatus.resolved.name) {
          stats['resolved']++;
        } else {
          stats['pending']++;
        }

        stats['by_type'][type] = (stats['by_type'][type] ?? 0) + 1;
      }

      return stats;
    } catch (e) {
      throw Exception('Failed to get emergency statistics: ${e.toString()}');
    }
  }
}