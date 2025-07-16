import 'package:geolocator/geolocator.dart';
import '../services/emergency_service.dart';

enum EmergencyStatus {
  pending,
  adminNotified,
  isangeNotified,
  isangeRetry,
  emergencyServicesNotified,
  inProgress,
  resolved,
  cancelled,
}

class EmergencyReport {
  final String id;
  final EmergencyType type;
  final String description;
  final String reporterId;
  final String? workerId;
  final String? householdId;
  final String? jobId;
  final Position? location;
  final List<String> evidenceFiles;
  final EmergencyStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isAppIssue;
  final bool isCriminalIssue;
  final String? emergencyContact;
  final String? isangeCaseId;
  final String? adminNotes;
  final String? errorMessage;

  EmergencyReport({
    required this.id,
    required this.type,
    required this.description,
    required this.reporterId,
    this.workerId,
    this.householdId,
    this.jobId,
    this.location,
    required this.evidenceFiles,
    required this.status,
    required this.createdAt,
    this.updatedAt,
    required this.isAppIssue,
    required this.isCriminalIssue,
    this.emergencyContact,
    this.isangeCaseId,
    this.adminNotes,
    this.errorMessage,
  });

  factory EmergencyReport.fromJson(Map<String, dynamic> json) {
    return EmergencyReport(
      id: json['id'],
      type: EmergencyType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => EmergencyType.other,
      ),
      description: json['description'],
      reporterId: json['reporter_id'],
      workerId: json['worker_id'],
      householdId: json['household_id'],
      jobId: json['job_id'],
      location: json['latitude'] != null && json['longitude'] != null
          ? Position(
              latitude: json['latitude'],
              longitude: json['longitude'],
              timestamp: DateTime.parse(json['created_at']),
              accuracy: 0,
              altitude: 0,
              altitudeAccuracy: 0,
              heading: 0,
              headingAccuracy: 0,
              speed: 0,
              speedAccuracy: 0,
            )
          : null,
      evidenceFiles: List<String>.from(json['evidence_files'] ?? []),
      status: EmergencyStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => EmergencyStatus.pending,
      ),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      isAppIssue: json['is_app_issue'] ?? false,
      isCriminalIssue: json['is_criminal_issue'] ?? false,
      emergencyContact: json['emergency_contact'],
      isangeCaseId: json['isange_case_id'],
      adminNotes: json['admin_notes'],
      errorMessage: json['error_message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'description': description,
      'reporter_id': reporterId,
      'worker_id': workerId,
      'household_id': householdId,
      'job_id': jobId,
      'latitude': location?.latitude,
      'longitude': location?.longitude,
      'evidence_files': evidenceFiles,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_app_issue': isAppIssue,
      'is_criminal_issue': isCriminalIssue,
      'emergency_contact': emergencyContact,
      'isange_case_id': isangeCaseId,
      'admin_notes': adminNotes,
      'error_message': errorMessage,
    };
  }

  EmergencyReport copyWith({
    String? id,
    EmergencyType? type,
    String? description,
    String? reporterId,
    String? workerId,
    String? householdId,
    String? jobId,
    Position? location,
    List<String>? evidenceFiles,
    EmergencyStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isAppIssue,
    bool? isCriminalIssue,
    String? emergencyContact,
    String? isangeCaseId,
    String? adminNotes,
    String? errorMessage,
  }) {
    return EmergencyReport(
      id: id ?? this.id,
      type: type ?? this.type,
      description: description ?? this.description,
      reporterId: reporterId ?? this.reporterId,
      workerId: workerId ?? this.workerId,
      householdId: householdId ?? this.householdId,
      jobId: jobId ?? this.jobId,
      location: location ?? this.location,
      evidenceFiles: evidenceFiles ?? this.evidenceFiles,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isAppIssue: isAppIssue ?? this.isAppIssue,
      isCriminalIssue: isCriminalIssue ?? this.isCriminalIssue,
      emergencyContact: emergencyContact ?? this.emergencyContact,
      isangeCaseId: isangeCaseId ?? this.isangeCaseId,
      adminNotes: adminNotes ?? this.adminNotes,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class EmergencyResponse {
  final bool success;
  final String message;
  final String? reportId;
  final String? contactNumber;
  final String? routedTo;

  EmergencyResponse({
    required this.success,
    required this.message,
    this.reportId,
    this.contactNumber,
    this.routedTo,
  });

  factory EmergencyResponse.fromJson(Map<String, dynamic> json) {
    return EmergencyResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      reportId: json['report_id'],
      contactNumber: json['contact_number'],
      routedTo: json['routed_to'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'report_id': reportId,
      'contact_number': contactNumber,
      'routed_to': routedTo,
    };
  }
}

class EmergencyContact {
  final String id;
  final String reportId;
  final String contactNumber;
  final String contactType;
  final DateTime contactedAt;

  EmergencyContact({
    required this.id,
    required this.reportId,
    required this.contactNumber,
    required this.contactType,
    required this.contactedAt,
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      id: json['id'],
      reportId: json['report_id'],
      contactNumber: json['contact_number'],
      contactType: json['contact_type'],
      contactedAt: DateTime.parse(json['contacted_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'report_id': reportId,
      'contact_number': contactNumber,
      'contact_type': contactType,
      'contacted_at': contactedAt.toIso8601String(),
    };
  }
}

class EmergencyStatistics {
  final int totalReports;
  final int appIssues;
  final int criminalIssues;
  final int emergencyServices;
  final int resolved;
  final int pending;
  final Map<String, int> byType;
  final DateTime periodStart;
  final DateTime periodEnd;

  EmergencyStatistics({
    required this.totalReports,
    required this.appIssues,
    required this.criminalIssues,
    required this.emergencyServices,
    required this.resolved,
    required this.pending,
    required this.byType,
    required this.periodStart,
    required this.periodEnd,
  });

  factory EmergencyStatistics.fromJson(Map<String, dynamic> json) {
    return EmergencyStatistics(
      totalReports: json['total_reports'] ?? 0,
      appIssues: json['app_issues'] ?? 0,
      criminalIssues: json['criminal_issues'] ?? 0,
      emergencyServices: json['emergency_services'] ?? 0,
      resolved: json['resolved'] ?? 0,
      pending: json['pending'] ?? 0,
      byType: Map<String, int>.from(json['by_type'] ?? {}),
      periodStart: DateTime.parse(json['period_start']),
      periodEnd: DateTime.parse(json['period_end']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_reports': totalReports,
      'app_issues': appIssues,
      'criminal_issues': criminalIssues,
      'emergency_services': emergencyServices,
      'resolved': resolved,
      'pending': pending,
      'by_type': byType,
      'period_start': periodStart.toIso8601String(),
      'period_end': periodEnd.toIso8601String(),
    };
  }
}

class EmergencyNotification {
  final String id;
  final String userId;
  final String type;
  final String title;
  final String message;
  final Map<String, dynamic> data;
  final DateTime createdAt;
  final bool isRead;

  EmergencyNotification({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.message,
    required this.data,
    required this.createdAt,
    required this.isRead,
  });

  factory EmergencyNotification.fromJson(Map<String, dynamic> json) {
    return EmergencyNotification(
      id: json['id'],
      userId: json['user_id'],
      type: json['type'],
      title: json['title'],
      message: json['message'],
      data: Map<String, dynamic>.from(json['data'] ?? {}),
      createdAt: DateTime.parse(json['created_at']),
      isRead: json['is_read'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type,
      'title': title,
      'message': message,
      'data': data,
      'created_at': createdAt.toIso8601String(),
      'is_read': isRead,
    };
  }
}
