import 'package:flutter/foundation.dart';
import '../models/training_model.dart';
import '../services/supabase_service.dart';

class TrainingProvider extends ChangeNotifier {
  List<TrainingModel> _trainings = [];
  List<TrainingModel> _employeeTrainings = [];
  List<TrainingEnrollment> _enrollments = [];
  List<TrainingProgress> _progressList = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  List<TrainingModel> get trainings => _trainings;
  List<TrainingModel> get employeeTrainings => _employeeTrainings;
  List<TrainingEnrollment> get enrollments => _enrollments;
  List<TrainingProgress> get progressList => _progressList;
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
      print('Training Provider Error: $error');
    }
    notifyListeners();
  }

  // Get all trainings
  Future<void> getAllTrainings() async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('trainings')
          .select('*')
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _trainings = response
          .map<TrainingModel>((json) => TrainingModel.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load trainings: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get trainings by category
  Future<void> getTrainingsByCategory(TrainingCategory category) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('trainings')
          .select('*')
          .eq('category', category.value)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _trainings = response
          .map<TrainingModel>((json) => TrainingModel.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load trainings by category: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get employee trainings
  Future<void> getEmployeeTrainings(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('training_enrollments')
          .select('''
            *,
            trainings:training_id (*)
          ''')
          .eq('employee_id', employeeId)
          .order('enrolled_at', ascending: false);

      _employeeTrainings = response
          .map<TrainingModel>(
            (json) => TrainingModel.fromJson(json['trainings']),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load employee trainings: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Enroll employee in training
  Future<bool> enrollEmployeeInTraining({
    required String employeeId,
    required String trainingId,
    required DateTime enrollmentDate,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final enrollmentPayload = {
        'employee_id': employeeId,
        'training_id': trainingId,
        'enrollment_date': enrollmentDate.toIso8601String(),
        'status': EnrollmentStatus.enrolled.value,
        'enrolled_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('training_enrollments')
          .insert(enrollmentPayload);

      // Refresh employee trainings
      await getEmployeeTrainings(employeeId);

      return true;
    } catch (e) {
      _setError('Failed to enroll in training: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Update training progress
  Future<bool> updateTrainingProgress({
    required String employeeId,
    required String trainingId,
    required int lessonsCompleted,
    required double progressPercentage,
    int? currentModule,
    Map<String, dynamic>? progressData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final progressPayload = {
        'employee_id': employeeId,
        'training_id': trainingId,
        'lessons_completed': lessonsCompleted,
        'progress_percentage': progressPercentage,
        'current_module': currentModule,
        'progress_data': progressData ?? {},
        'last_accessed': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('training_progress')
          .upsert(progressPayload);

      // Update enrollment status if completed
      if (progressPercentage >= 100.0) {
        await SupabaseService.client
            .from('training_enrollments')
            .update({
              'status': EnrollmentStatus.completed.value,
              'completed_at': DateTime.now().toIso8601String(),
            })
            .eq('employee_id', employeeId)
            .eq('training_id', trainingId);
      }

      // Refresh progress
      await getTrainingProgress(employeeId, trainingId);

      return true;
    } catch (e) {
      _setError('Failed to update training progress: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get training progress
  Future<void> getTrainingProgress(String employeeId, String trainingId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('training_progress')
          .select('''
            *,
            trainings:training_id (*)
          ''')
          .eq('employee_id', employeeId)
          .eq('training_id', trainingId);

      if (response.isNotEmpty) {
        _progressList = response
            .map<TrainingProgress>((json) => TrainingProgress.fromJson(json))
            .toList();
      }

      notifyListeners();
    } catch (e) {
      _setError('Failed to load training progress: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Create new training
  Future<bool> createTraining({
    required String title,
    required String description,
    required TrainingCategory category,
    required TrainingType type,
    required TrainingLevel level,
    required Duration duration,
    required List<TrainingModule> modules,
    List<String>? prerequisites,
    bool isRequired = false,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final trainingPayload = {
        'title': title,
        'description': description,
        'category': category.value,
        'type': type.value,
        'level': level.value,
        'duration_hours': duration.inHours,
        'modules': modules.map((m) => m.toJson()).toList(),
        'prerequisites': prerequisites ?? [],
        'is_required': isRequired,
        'start_date': startDate?.toIso8601String(),
        'end_date': endDate?.toIso8601String(),
        'is_active': true,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client.from('trainings').insert(trainingPayload);

      // Refresh trainings
      await getAllTrainings();

      return true;
    } catch (e) {
      _setError('Failed to create training: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Complete training lesson
  Future<bool> completeLesson({
    required String employeeId,
    required String trainingId,
    required int moduleIndex,
    required int lessonIndex,
    Map<String, dynamic>? lessonData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final completionPayload = {
        'employee_id': employeeId,
        'training_id': trainingId,
        'module_index': moduleIndex,
        'lesson_index': lessonIndex,
        'lesson_data': lessonData ?? {},
        'completed_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('lesson_completions')
          .insert(completionPayload);

      // Update overall progress
      await _calculateAndUpdateProgress(employeeId, trainingId);

      return true;
    } catch (e) {
      _setError('Failed to complete lesson: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Calculate and update progress
  Future<void> _calculateAndUpdateProgress(
    String employeeId,
    String trainingId,
  ) async {
    try {
      // Get training details
      final trainingResponse = await SupabaseService.client
          .from('trainings')
          .select('modules')
          .eq('id', trainingId)
          .single();

      final modules = trainingResponse['modules'] as List;
      int totalLessons = 0;

      for (var module in modules) {
        totalLessons += (module['lessons'] as List).length;
      }

      // Get completed lessons count
      final completedResponse = await SupabaseService.client
          .from('lesson_completions')
          .select('id')
          .eq('employee_id', employeeId)
          .eq('training_id', trainingId);

      final completedLessons = completedResponse.length;
      final progressPercentage = (completedLessons / totalLessons) * 100;

      // Update progress
      await updateTrainingProgress(
        employeeId: employeeId,
        trainingId: trainingId,
        lessonsCompleted: completedLessons,
        progressPercentage: progressPercentage,
      );
    } catch (e) {
      if (kDebugMode) {
        print('Error calculating progress: $e');
      }
    }
  }

  // Get training certificates
  Future<void> getTrainingCertificates(String employeeId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('training_certificates')
          .select('''
            *,
            trainings:training_id (*)
          ''')
          .eq('employee_id', employeeId)
          .order('issued_at', ascending: false);

      // Handle certificates if needed
      notifyListeners();
    } catch (e) {
      _setError('Failed to load certificates: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Issue training certificate
  Future<bool> issueTrainingCertificate({
    required String employeeId,
    required String trainingId,
    required String certificateNumber,
    DateTime? expiryDate,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final certificatePayload = {
        'employee_id': employeeId,
        'training_id': trainingId,
        'certificate_number': certificateNumber,
        'issued_at': DateTime.now().toIso8601String(),
        'expiry_date': expiryDate?.toIso8601String(),
        'is_valid': true,
      };

      await SupabaseService.client
          .from('training_certificates')
          .insert(certificatePayload);

      return true;
    } catch (e) {
      _setError('Failed to issue certificate: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Search trainings
  List<TrainingModel> searchTrainings(String query) {
    if (query.isEmpty) return _trainings;

    final lowercaseQuery = query.toLowerCase();
    return _trainings
        .where(
          (training) =>
              training.title.toLowerCase().contains(lowercaseQuery) ||
              training.description.toLowerCase().contains(lowercaseQuery),
        )
        .toList();
  }

  // Get trainings by level
  List<TrainingModel> getTrainingsByLevel(TrainingLevel level) {
    return _trainings.where((training) => training.level == level).toList();
  }

  // Get required trainings
  List<TrainingModel> get requiredTrainings {
    return _trainings.where((training) => training.isRequired).toList();
  }

  // Get completed trainings count
  int getCompletedTrainingsCount(String employeeId) {
    return _enrollments
        .where(
          (enrollment) =>
              enrollment.employeeId == employeeId &&
              enrollment.status == EnrollmentStatus.completed,
        )
        .length;
  }

  // Get training statistics
  Future<Map<String, dynamic>> getTrainingStatistics() async {
    try {
      final stats = await SupabaseService.client.rpc('get_training_statistics');

      return stats as Map<String, dynamic>;
    } catch (e) {
      _setError('Failed to load training statistics: ${e.toString()}');
      return {};
    }
  }

  // Clear all data
  void clearData() {
    _trainings.clear();
    _employeeTrainings.clear();
    _enrollments.clear();
    _progressList.clear();
    clearError();
    notifyListeners();
  }
}
