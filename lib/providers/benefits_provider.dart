import 'package:flutter/foundation.dart';
import '../models/benefits_model.dart';
import '../services/supabase_service.dart';

class BenefitsProvider extends ChangeNotifier {
  List<BenefitsModel> _benefits = [];
  List<BenefitsModel> _employeeBenefits = [];
  List<BenefitsClaim> _claims = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  List<BenefitsModel> get benefits => _benefits;
  List<BenefitsModel> get employeeBenefits => _employeeBenefits;
  List<BenefitsClaim> get claims => _claims;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error message
  void _setError(String error) {
    _errorMessage = error;
    if (kDebugMode) {
      print('Benefits Provider Error: $error');
    }
    notifyListeners();
  }

  // Get all benefits
  Future<void> getAllBenefits() async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('benefits')
          .select('*')
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _benefits = response
          .map<BenefitsModel>((json) => BenefitsModel.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load benefits: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get benefits by category
  Future<void> getBenefitsByCategory(BenefitCategory category) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('benefits')
          .select('*')
          .eq('category', category.value)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _benefits = response
          .map<BenefitsModel>((json) => BenefitsModel.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load benefits by category: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get employee benefits
  Future<void> getEmployeeBenefits(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('employee_benefits')
          .select('''
            *,
            benefits:benefit_id (*)
          ''')
          .eq('employee_id', employeeId)
          .eq('is_active', true)
          .order('enrolled_at', ascending: false);

      _employeeBenefits = response
          .map<BenefitsModel>(
            (json) => BenefitsModel.fromJson(json['benefits']),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load employee benefits: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Enroll employee in benefit
  Future<bool> enrollEmployeeInBenefit({
    required String employeeId,
    required String benefitId,
    required DateTime startDate,
    DateTime? endDate,
    Map<String, dynamic>? enrollmentData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final enrollmentPayload = {
        'employee_id': employeeId,
        'benefit_id': benefitId,
        'start_date': startDate.toIso8601String(),
        'end_date': endDate?.toIso8601String(),
        'enrollment_data': enrollmentData ?? {},
        'is_active': true,
        'enrolled_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('employee_benefits')
          .insert(enrollmentPayload);

      // Refresh employee benefits
      await getEmployeeBenefits(employeeId);

      return true;
    } catch (e) {
      _setError('Failed to enroll in benefit: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Unenroll employee from benefit
  Future<bool> unenrollEmployeeFromBenefit({
    required String employeeId,
    required String benefitId,
  }) async {
    try {
      _setLoading(true);
      clearError();

      await SupabaseService.client
          .from('employee_benefits')
          .update({
            'is_active': false,
            'end_date': DateTime.now().toIso8601String(),
          })
          .eq('employee_id', employeeId)
          .eq('benefit_id', benefitId);

      // Refresh employee benefits
      await getEmployeeBenefits(employeeId);

      return true;
    } catch (e) {
      _setError('Failed to unenroll from benefit: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Create benefit claim
  Future<bool> createBenefitClaim({
    required String employeeId,
    required String benefitId,
    required ClaimType claimType,
    required double amount,
    required String description,
    List<String>? attachments,
    Map<String, dynamic>? claimData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final claimPayload = {
        'employee_id': employeeId,
        'benefit_id': benefitId,
        'claim_type': claimType.value,
        'amount': amount,
        'description': description,
        'attachments': attachments ?? [],
        'claim_data': claimData ?? {},
        'status': ClaimStatus.pending.value,
        'submitted_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client.from('benefit_claims').insert(claimPayload);

      // Refresh claims
      await getEmployeeClaims(employeeId);

      return true;
    } catch (e) {
      _setError('Failed to create benefit claim: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get employee claims
  Future<void> getEmployeeClaims(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('benefit_claims')
          .select('''
            *,
            benefits:benefit_id (*)
          ''')
          .eq('employee_id', employeeId)
          .order('submitted_at', ascending: false);

      _claims = response
          .map<BenefitsClaim>((json) => BenefitsClaim.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load employee claims: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get all claims (for admins)
  Future<void> getAllClaims() async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('benefit_claims')
          .select('''
            *,
            benefits:benefit_id (*),
            users:employee_id (*)
          ''')
          .order('submitted_at', ascending: false);

      _claims = response
          .map<BenefitsClaim>((json) => BenefitsClaim.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load all claims: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Update claim status
  Future<bool> updateClaimStatus({
    required String claimId,
    required ClaimStatus status,
    String? reviewNotes,
    String? reviewedBy,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final updateData = {
        'status': status.value,
        'reviewed_at': DateTime.now().toIso8601String(),
      };

      if (reviewNotes != null) {
        updateData['review_notes'] = reviewNotes;
      }

      if (reviewedBy != null) {
        updateData['reviewed_by'] = reviewedBy;
      }

      if (status == ClaimStatus.approved) {
        updateData['approved_at'] = DateTime.now().toIso8601String();
      } else if (status == ClaimStatus.rejected) {
        updateData['rejected_at'] = DateTime.now().toIso8601String();
      }

      await SupabaseService.client
          .from('benefit_claims')
          .update(updateData)
          .eq('id', claimId);

      // Refresh claims
      await getAllClaims();

      return true;
    } catch (e) {
      _setError('Failed to update claim status: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Create new benefit (for admins)
  Future<bool> createBenefit({
    required String title,
    required String description,
    required BenefitCategory category,
    required BenefitType type,
    required double value,
    required BenefitFrequency frequency,
    List<String>? eligibilityCriteria,
    Map<String, dynamic>? benefitData,
    DateTime? validFrom,
    DateTime? validUntil,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final benefitPayload = {
        'title': title,
        'description': description,
        'category': category.value,
        'type': type.value,
        'value': value,
        'frequency': frequency.value,
        'eligibility_criteria': eligibilityCriteria ?? [],
        'benefit_data': benefitData ?? {},
        'valid_from': validFrom?.toIso8601String(),
        'valid_until': validUntil?.toIso8601String(),
        'is_active': true,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client.from('benefits').insert(benefitPayload);

      // Refresh benefits
      await getAllBenefits();

      return true;
    } catch (e) {
      _setError('Failed to create benefit: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Update benefit
  Future<bool> updateBenefit({
    required String benefitId,
    required Map<String, dynamic> updateData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      updateData['updated_at'] = DateTime.now().toIso8601String();

      await SupabaseService.client
          .from('benefits')
          .update(updateData)
          .eq('id', benefitId);

      // Refresh benefits
      await getAllBenefits();

      return true;
    } catch (e) {
      _setError('Failed to update benefit: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Delete benefit
  Future<bool> deleteBenefit(String benefitId) async {
    try {
      _setLoading(true);
      clearError();

      await SupabaseService.client
          .from('benefits')
          .update({
            'is_active': false,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', benefitId);

      // Refresh benefits
      await getAllBenefits();

      return true;
    } catch (e) {
      _setError('Failed to delete benefit: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get benefit utilization statistics
  Future<Map<String, dynamic>> getBenefitUtilizationStats() async {
    try {
      _setLoading(true);
      clearError();

      // Get enrollment statistics
      final enrollmentStats = await SupabaseService.client.rpc(
        'get_benefit_enrollment_stats',
      );

      // Get claim statistics
      final claimStats = await SupabaseService.client.rpc(
        'get_benefit_claim_stats',
      );

      return {'enrollment_stats': enrollmentStats, 'claim_stats': claimStats};
    } catch (e) {
      _setError('Failed to load benefit statistics: ${e.toString()}');
      return {};
    } finally {
      _setLoading(false);
    }
  }

  // Check benefit eligibility
  Future<bool> checkBenefitEligibility({
    required String employeeId,
    required String benefitId,
  }) async {
    try {
      final response = await SupabaseService.client.rpc(
        'check_benefit_eligibility',
        params: {'employee_id': employeeId, 'benefit_id': benefitId},
      );

      return response as bool;
    } catch (e) {
      _setError('Failed to check benefit eligibility: ${e.toString()}');
      return false;
    }
  }

  // Calculate benefit value for employee
  Future<double> calculateBenefitValue({
    required String employeeId,
    required String benefitId,
  }) async {
    try {
      final response = await SupabaseService.client.rpc(
        'calculate_benefit_value',
        params: {'employee_id': employeeId, 'benefit_id': benefitId},
      );

      return (response as num).toDouble();
    } catch (e) {
      _setError('Failed to calculate benefit value: ${e.toString()}');
      return 0.0;
    }
  }

  // Get pending claims count
  int get pendingClaimsCount {
    return _claims.where((claim) => claim.status == ClaimStatus.pending).length;
  }

  // Get approved claims total amount
  double get approvedClaimsTotal {
    return _claims
        .where((claim) => claim.status == ClaimStatus.approved)
        .fold(0.0, (sum, claim) => sum + claim.amount);
  }

  // Get benefits by type
  List<BenefitsModel> getBenefitsByType(BenefitType type) {
    return _benefits.where((benefit) => benefit.type == type).toList();
  }

  // Get active employee benefits
  List<BenefitsModel> get activeEmployeeBenefits {
    return _employeeBenefits.where((benefit) => benefit.isActive).toList();
  }

  // Get recent claims
  List<BenefitsClaim> get recentClaims {
    final now = DateTime.now();
    return _claims
        .where((claim) => now.difference(claim.submittedAt).inDays <= 30)
        .toList();
  }

  // Search benefits
  List<BenefitsModel> searchBenefits(String query) {
    if (query.isEmpty) return _benefits;

    final lowercaseQuery = query.toLowerCase();
    return _benefits
        .where(
          (benefit) =>
              benefit.title.toLowerCase().contains(lowercaseQuery) ||
              benefit.description.toLowerCase().contains(lowercaseQuery),
        )
        .toList();
  }

  // Filter claims by status
  List<BenefitsClaim> getClaimsByStatus(ClaimStatus status) {
    return _claims.where((claim) => claim.status == status).toList();
  }

  // Get benefit summary for employee
  Future<Map<String, dynamic>> getEmployeeBenefitSummary(
    String employeeId,
  ) async {
    try {
      await getEmployeeBenefits(employeeId);
      await getEmployeeClaims(employeeId);

      final totalBenefitValue = _employeeBenefits.fold(
        0.0,
        (sum, benefit) => sum + benefit.value,
      );

      final totalClaimedAmount = _claims
          .where((claim) => claim.status == ClaimStatus.approved)
          .fold(0.0, (sum, claim) => sum + claim.amount);

      return {
        'total_benefits': _employeeBenefits.length,
        'total_benefit_value': totalBenefitValue,
        'total_claims': _claims.length,
        'total_claimed_amount': totalClaimedAmount,
        'pending_claims': getClaimsByStatus(ClaimStatus.pending).length,
        'approved_claims': getClaimsByStatus(ClaimStatus.approved).length,
        'rejected_claims': getClaimsByStatus(ClaimStatus.rejected).length,
      };
    } catch (e) {
      _setError('Failed to load benefit summary: ${e.toString()}');
      return {};
    }
  }

  // Refresh all data
  Future<void> refreshData() async {
    try {
      _setLoading(true);
      clearError();

      await getAllBenefits();
      await getAllClaims();
    } catch (e) {
      _setError('Failed to refresh data: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Clear all data
  void clearData() {
    _benefits.clear();
    _employeeBenefits.clear();
    _claims.clear();
    clearError();
    notifyListeners();
  }
}
