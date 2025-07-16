import 'package:flutter/material.dart';
import '../models/training_model.dart';
import '../models/user_model.dart';
import 'supabase_service.dart';
import 'notification_service.dart';

class TrainingService {
  static final _client = SupabaseService.client;

  // Get all available courses
  static Future<List<TrainingCourse>> getAllCourses({
    String? category,
    String? level,
    bool? isFree,
    int limit = 50,
  }) async {
    try {
      var query = _client
          .from('training_courses')
          .select()
          .eq('is_active', true)
          .order('created_at', ascending: false)
          .limit(limit);

      if (category != null) {
        query = query.eq('category', category);
      }

      if (level != null) {
        query = query.eq('level', level);
      }

      if (isFree != null) {
        query = query.eq('is_free', isFree);
      }

      final response = await query;
      return response
          .map<TrainingCourse>((json) => TrainingCourse.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get courses: ${e.toString()}');
    }
  }

  // Get course by ID
  static Future<TrainingCourse?> getCourse(String courseId) async {
    try {
      final response = await _client
          .from('training_courses')
          .select()
          .eq('id', courseId)
          .single();

      return TrainingCourse.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  // Get course modules
  static Future<List<CourseModule>> getCourseModules(String courseId) async {
    try {
      final response = await _client
          .from('course_modules')
          .select()
          .eq('course_id', courseId)
          .order('order_index', ascending: true);

      return response
          .map<CourseModule>((json) => CourseModule.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get course modules: ${e.toString()}');
    }
  }

  // Get module content
  static Future<List<ModuleContent>> getModuleContent(String moduleId) async {
    try {
      final response = await _client
          .from('module_content')
          .select()
          .eq('module_id', moduleId)
          .order('order_index', ascending: true);

      return response
          .map<ModuleContent>((json) => ModuleContent.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get module content: ${e.toString()}');
    }
  }

  // Enroll in a course
  static Future<Enrollment> enrollInCourse({
    required String userId,
    required String courseId,
    double? paymentAmount,
    String? paymentMethod,
  }) async {
    try {
      final enrollmentId = 'enroll_${DateTime.now().millisecondsSinceEpoch}';

      final enrollment = Enrollment(
        id: enrollmentId,
        userId: userId,
        courseId: courseId,
        enrolledAt: DateTime.now(),
        status: EnrollmentStatus.active,
        progress: 0.0,
        paymentAmount: paymentAmount,
        paymentMethod: paymentMethod,
      );

      await _client.from('enrollments').insert(enrollment.toJson());

      // Send welcome notification
      await NotificationService.sendNotification(
        userId: userId,
        title: 'Course Enrollment Successful',
        message: 'You have successfully enrolled in the course!',
        type: 'course_enrollment',
        data: {'course_id': courseId, 'enrollment_id': enrollmentId},
      );

      return enrollment;
    } catch (e) {
      throw Exception('Failed to enroll in course: ${e.toString()}');
    }
  }

  // Get user enrollments
  static Future<List<Enrollment>> getUserEnrollments(String userId) async {
    try {
      final response = await _client
          .from('enrollments')
          .select()
          .eq('user_id', userId)
          .order('enrolled_at', ascending: false);

      return response
          .map<Enrollment>((json) => Enrollment.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get user enrollments: ${e.toString()}');
    }
  }

  // Get user's progress for a course
  static Future<CourseProgress?> getCourseProgress(
    String userId,
    String courseId,
  ) async {
    try {
      final response = await _client
          .from('course_progress')
          .select()
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();

      return CourseProgress.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  // Update course progress
  static Future<void> updateCourseProgress({
    required String userId,
    required String courseId,
    required String moduleId,
    required String contentId,
    required double timeSpent,
  }) async {
    try {
      // Update or create progress record
      await _client.from('course_progress').upsert({
        'user_id': userId,
        'course_id': courseId,
        'module_id': moduleId,
        'content_id': contentId,
        'time_spent': timeSpent,
        'completed_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });

      // Calculate overall progress
      await _updateOverallProgress(userId, courseId);
    } catch (e) {
      throw Exception('Failed to update course progress: ${e.toString()}');
    }
  }

  // Update overall progress
  static Future<void> _updateOverallProgress(
    String userId,
    String courseId,
  ) async {
    try {
      // Get total content count
      final totalContentResponse = await _client
          .from('module_content')
          .select('id')
          .eq('course_id', courseId);

      final totalContent = totalContentResponse.length;

      // Get completed content count
      final completedContentResponse = await _client
          .from('course_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId);

      final completedContent = completedContentResponse.length;

      // Calculate progress percentage
      final progressPercentage = totalContent > 0
          ? (completedContent / totalContent) * 100
          : 0.0;

      // Update enrollment progress
      await _client
          .from('enrollments')
          .update({
            'progress': progressPercentage,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);

      // Check if course is completed
      if (progressPercentage >= 100.0) {
        await _completeCourse(userId, courseId);
      }
    } catch (e) {
      debugPrint('Failed to update overall progress: $e');
    }
  }

  // Complete a course
  static Future<void> _completeCourse(String userId, String courseId) async {
    try {
      // Update enrollment status
      await _client
          .from('enrollments')
          .update({
            'status': EnrollmentStatus.completed.name,
            'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);

      // Check if course has a certificate
      final course = await getCourse(courseId);
      if (course != null && course.hasCertificate) {
        await _generateCertificate(userId, courseId);
      }

      // Send completion notification
      await NotificationService.sendNotification(
        userId: userId,
        title: 'Course Completed!',
        message: 'Congratulations! You have completed the course.',
        type: 'course_completion',
        data: {
          'course_id': courseId,
          'has_certificate': course?.hasCertificate ?? false,
        },
      );
    } catch (e) {
      debugPrint('Failed to complete course: $e');
    }
  }

  // Generate certificate
  static Future<Certificate> _generateCertificate(
    String userId,
    String courseId,
  ) async {
    try {
      final certificateId = 'cert_${DateTime.now().millisecondsSinceEpoch}';

      final certificate = Certificate(
        id: certificateId,
        userId: userId,
        courseId: courseId,
        issuedAt: DateTime.now(),
        certificateNumber: _generateCertificateNumber(),
        isValid: true,
      );

      await _client.from('certificates').insert(certificate.toJson());

      // Send certificate notification
      await NotificationService.sendNotification(
        userId: userId,
        title: 'Certificate Issued!',
        message:
            'Your certificate has been generated and is ready for download.',
        type: 'certificate_issued',
        data: {'certificate_id': certificateId, 'course_id': courseId},
      );

      return certificate;
    } catch (e) {
      throw Exception('Failed to generate certificate: ${e.toString()}');
    }
  }

  // Generate certificate number
  static String _generateCertificateNumber() {
    final now = DateTime.now();
    final year = now.year.toString();
    final month = now.month.toString().padLeft(2, '0');
    final day = now.day.toString().padLeft(2, '0');
    final random = (DateTime.now().millisecondsSinceEpoch % 10000)
        .toString()
        .padLeft(4, '0');

    return 'HHR-$year$month$day-$random';
  }

  // Get user certificates
  static Future<List<Certificate>> getUserCertificates(String userId) async {
    try {
      final response = await _client
          .from('certificates')
          .select()
          .eq('user_id', userId)
          .eq('is_valid', true)
          .order('issued_at', ascending: false);

      return response
          .map<Certificate>((json) => Certificate.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get user certificates: ${e.toString()}');
    }
  }

  // Get certificate by ID
  static Future<Certificate?> getCertificate(String certificateId) async {
    try {
      final response = await _client
          .from('certificates')
          .select()
          .eq('id', certificateId)
          .single();

      return Certificate.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  // Verify certificate
  static Future<bool> verifyCertificate(String certificateNumber) async {
    try {
      final response = await _client
          .from('certificates')
          .select('id')
          .eq('certificate_number', certificateNumber)
          .eq('is_valid', true)
          .limit(1);

      return response.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // Submit assignment
  static Future<AssignmentSubmission> submitAssignment({
    required String userId,
    required String assignmentId,
    required String content,
    List<String>? attachments,
  }) async {
    try {
      final submissionId = 'sub_${DateTime.now().millisecondsSinceEpoch}';

      final submission = AssignmentSubmission(
        id: submissionId,
        userId: userId,
        assignmentId: assignmentId,
        content: content,
        attachments: attachments ?? [],
        submittedAt: DateTime.now(),
        status: SubmissionStatus.pending,
      );

      await _client.from('assignment_submissions').insert(submission.toJson());

      // Send notification to instructor
      await NotificationService.sendNotification(
        userId: 'instructor', // Would need to get actual instructor ID
        title: 'New Assignment Submission',
        message: 'A student has submitted an assignment for review.',
        type: 'assignment_submission',
        data: {
          'submission_id': submissionId,
          'assignment_id': assignmentId,
          'user_id': userId,
        },
      );

      return submission;
    } catch (e) {
      throw Exception('Failed to submit assignment: ${e.toString()}');
    }
  }

  // Get assignment submissions
  static Future<List<AssignmentSubmission>> getAssignmentSubmissions(
    String assignmentId,
  ) async {
    try {
      final response = await _client
          .from('assignment_submissions')
          .select()
          .eq('assignment_id', assignmentId)
          .order('submitted_at', ascending: false);

      return response
          .map<AssignmentSubmission>(
            (json) => AssignmentSubmission.fromJson(json),
          )
          .toList();
    } catch (e) {
      throw Exception('Failed to get assignment submissions: ${e.toString()}');
    }
  }

  // Take quiz
  static Future<QuizAttempt> takeQuiz({
    required String userId,
    required String quizId,
    required Map<String, dynamic> answers,
  }) async {
    try {
      final attemptId = 'attempt_${DateTime.now().millisecondsSinceEpoch}';

      // Get quiz questions to calculate score
      final quiz = await _getQuiz(quizId);
      final score = _calculateQuizScore(quiz, answers);

      final attempt = QuizAttempt(
        id: attemptId,
        userId: userId,
        quizId: quizId,
        answers: answers,
        score: score,
        completedAt: DateTime.now(),
        isPassed: score >= (quiz['passing_score'] ?? 70),
      );

      await _client.from('quiz_attempts').insert(attempt.toJson());

      // Send result notification
      await NotificationService.sendNotification(
        userId: userId,
        title: 'Quiz Completed',
        message: 'Your quiz score: ${score.toStringAsFixed(1)}%',
        type: 'quiz_completed',
        data: {
          'quiz_id': quizId,
          'attempt_id': attemptId,
          'score': score,
          'passed': attempt.isPassed,
        },
      );

      return attempt;
    } catch (e) {
      throw Exception('Failed to take quiz: ${e.toString()}');
    }
  }

  // Get quiz
  static Future<Map<String, dynamic>> _getQuiz(String quizId) async {
    try {
      final response = await _client
          .from('quizzes')
          .select()
          .eq('id', quizId)
          .single();

      return response;
    } catch (e) {
      throw Exception('Failed to get quiz: ${e.toString()}');
    }
  }

  // Calculate quiz score
  static double _calculateQuizScore(
    Map<String, dynamic> quiz,
    Map<String, dynamic> answers,
  ) {
    try {
      final questions = quiz['questions'] as List<dynamic>;
      int correctAnswers = 0;

      for (final question in questions) {
        final questionId = question['id'] as String;
        final correctAnswer = question['correct_answer'];
        final userAnswer = answers[questionId];

        if (userAnswer == correctAnswer) {
          correctAnswers++;
        }
      }

      return (correctAnswers / questions.length) * 100;
    } catch (e) {
      return 0.0;
    }
  }

  // Get quiz attempts
  static Future<List<QuizAttempt>> getQuizAttempts(
    String userId,
    String quizId,
  ) async {
    try {
      final response = await _client
          .from('quiz_attempts')
          .select()
          .eq('user_id', userId)
          .eq('quiz_id', quizId)
          .order('completed_at', ascending: false);

      return response
          .map<QuizAttempt>((json) => QuizAttempt.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get quiz attempts: ${e.toString()}');
    }
  }

  // Get learning path
  static Future<List<LearningPath>> getLearningPaths() async {
    try {
      final response = await _client
          .from('learning_paths')
          .select()
          .eq('is_active', true)
          .order('created_at', ascending: false);

      return response
          .map<LearningPath>((json) => LearningPath.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get learning paths: ${e.toString()}');
    }
  }

  // Enroll in learning path
  static Future<void> enrollInLearningPath(String userId, String pathId) async {
    try {
      await _client.from('learning_path_enrollments').insert({
        'id': 'lp_enroll_${DateTime.now().millisecondsSinceEpoch}',
        'user_id': userId,
        'path_id': pathId,
        'enrolled_at': DateTime.now().toIso8601String(),
        'status': 'active',
        'progress': 0.0,
      });

      // Send enrollment notification
      await NotificationService.sendNotification(
        userId: userId,
        title: 'Learning Path Enrollment',
        message: 'You have successfully enrolled in the learning path!',
        type: 'learning_path_enrollment',
        data: {'path_id': pathId},
      );
    } catch (e) {
      throw Exception('Failed to enroll in learning path: ${e.toString()}');
    }
  }

  // Get recommended courses
  static Future<List<TrainingCourse>> getRecommendedCourses(
    String userId,
  ) async {
    try {
      // Get user's completed courses to understand their interests
      final completedCourses = await _client
          .from('enrollments')
          .select('course_id')
          .eq('user_id', userId)
          .eq('status', EnrollmentStatus.completed.name);

      // Get user's service categories to recommend relevant courses
      final userProfile = await _client
          .from('worker_profiles')
          .select('service_categories')
          .eq('user_id', userId)
          .single();

      final serviceCategories = List<String>.from(
        userProfile['service_categories'] ?? [],
      );

      // Get recommended courses based on service categories
      var query = _client
          .from('training_courses')
          .select()
          .eq('is_active', true)
          .limit(10);

      if (serviceCategories.isNotEmpty) {
        query = query.in_('category', serviceCategories);
      }

      final response = await query;
      return response
          .map<TrainingCourse>((json) => TrainingCourse.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get recommended courses: ${e.toString()}');
    }
  }

  // Get training statistics
  static Future<Map<String, dynamic>> getTrainingStatistics(
    String userId,
  ) async {
    try {
      final enrollments = await _client
          .from('enrollments')
          .select()
          .eq('user_id', userId);

      final certificates = await _client
          .from('certificates')
          .select()
          .eq('user_id', userId)
          .eq('is_valid', true);

      final stats = {
        'total_courses': enrollments.length,
        'completed_courses': enrollments
            .where((e) => e['status'] == EnrollmentStatus.completed.name)
            .length,
        'in_progress_courses': enrollments
            .where((e) => e['status'] == EnrollmentStatus.active.name)
            .length,
        'total_certificates': certificates.length,
        'average_progress': 0.0,
        'total_time_spent': 0.0,
        'by_category': <String, int>{},
      };

      // Calculate average progress
      if (enrollments.isNotEmpty) {
        final totalProgress = enrollments.fold<double>(
          0,
          (sum, enrollment) => sum + (enrollment['progress'] ?? 0.0),
        );
        stats['average_progress'] = totalProgress / enrollments.length;
      }

      // Group by category
      for (final enrollment in enrollments) {
        final courseId = enrollment['course_id'];
        final course = await getCourse(courseId);
        if (course != null) {
          final category = course.category;
          stats['by_category'][category] =
              (stats['by_category'][category] ?? 0) + 1;
        }
      }

      return stats;
    } catch (e) {
      throw Exception('Failed to get training statistics: ${e.toString()}');
    }
  }

  // Search courses
  static Future<List<TrainingCourse>> searchCourses({
    required String query,
    String? category,
    String? level,
    bool? isFree,
    int limit = 20,
  }) async {
    try {
      var dbQuery = _client
          .from('training_courses')
          .select()
          .eq('is_active', true)
          .textSearch('title', query)
          .limit(limit);

      if (category != null) {
        dbQuery = dbQuery.eq('category', category);
      }

      if (level != null) {
        dbQuery = dbQuery.eq('level', level);
      }

      if (isFree != null) {
        dbQuery = dbQuery.eq('is_free', isFree);
      }

      final response = await dbQuery;
      return response
          .map<TrainingCourse>((json) => TrainingCourse.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to search courses: ${e.toString()}');
    }
  }

  // Rate course
  static Future<void> rateCourse({
    required String userId,
    required String courseId,
    required double rating,
    String? review,
  }) async {
    try {
      await _client.from('course_ratings').insert({
        'id': 'rating_${DateTime.now().millisecondsSinceEpoch}',
        'user_id': userId,
        'course_id': courseId,
        'rating': rating,
        'review': review,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Update course average rating
      await _updateCourseRating(courseId);
    } catch (e) {
      throw Exception('Failed to rate course: ${e.toString()}');
    }
  }

  // Update course rating
  static Future<void> _updateCourseRating(String courseId) async {
    try {
      final ratings = await _client
          .from('course_ratings')
          .select('rating')
          .eq('course_id', courseId);

      if (ratings.isNotEmpty) {
        final averageRating =
            ratings.fold<double>(0, (sum, rating) => sum + rating['rating']) /
            ratings.length;

        await _client
            .from('training_courses')
            .update({'rating': averageRating, 'rating_count': ratings.length})
            .eq('id', courseId);
      }
    } catch (e) {
      debugPrint('Failed to update course rating: $e');
    }
  }

  // Get course ratings
  static Future<List<CourseRating>> getCourseRatings(String courseId) async {
    try {
      final response = await _client
          .from('course_ratings')
          .select()
          .eq('course_id', courseId)
          .order('created_at', ascending: false);

      return response
          .map<CourseRating>((json) => CourseRating.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get course ratings: ${e.toString()}');
    }
  }

  // Get instructor courses
  static Future<List<TrainingCourse>> getInstructorCourses(
    String instructorId,
  ) async {
    try {
      final response = await _client
          .from('training_courses')
          .select()
          .eq('instructor_id', instructorId)
          .order('created_at', ascending: false);

      return response
          .map<TrainingCourse>((json) => TrainingCourse.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get instructor courses: ${e.toString()}');
    }
  }

  // Create course (for instructors)
  static Future<TrainingCourse> createCourse({
    required String instructorId,
    required String title,
    required String description,
    required String category,
    required String level,
    required bool isFree,
    double? price,
    required int duration,
    required bool hasCertificate,
    List<String>? tags,
    String? thumbnailUrl,
  }) async {
    try {
      final courseId = 'course_${DateTime.now().millisecondsSinceEpoch}';

      final course = TrainingCourse(
        id: courseId,
        title: title,
        description: description,
        category: category,
        level: level,
        instructorId: instructorId,
        thumbnailUrl: thumbnailUrl,
        duration: duration,
        isFree: isFree,
        price: price,
        hasCertificate: hasCertificate,
        tags: tags ?? [],
        createdAt: DateTime.now(),
        isActive: true,
        rating: 0.0,
        ratingCount: 0,
        enrollmentCount: 0,
      );

      await _client.from('training_courses').insert(course.toJson());

      return course;
    } catch (e) {
      throw Exception('Failed to create course: ${e.toString()}');
    }
  }

  // Get course analytics
  static Future<Map<String, dynamic>> getCourseAnalytics(
    String courseId,
  ) async {
    try {
      final enrollments = await _client
          .from('enrollments')
          .select()
          .eq('course_id', courseId);

      final completions = enrollments
          .where((e) => e['status'] == EnrollmentStatus.completed.name)
          .length;
      final inProgress = enrollments
          .where((e) => e['status'] == EnrollmentStatus.active.name)
          .length;

      final ratings = await _client
          .from('course_ratings')
          .select('rating')
          .eq('course_id', courseId);

      final analytics = {
        'total_enrollments': enrollments.length,
        'completions': completions,
        'in_progress': inProgress,
        'completion_rate': enrollments.isNotEmpty
            ? (completions / enrollments.length) * 100
            : 0.0,
        'average_rating': ratings.isNotEmpty
            ? ratings.fold<double>(0, (sum, r) => sum + r['rating']) /
                  ratings.length
            : 0.0,
        'total_revenue': enrollments.fold<double>(
          0,
          (sum, e) => sum + (e['payment_amount'] ?? 0.0),
        ),
        'monthly_enrollments': <String, int>{},
        'rating_distribution': <int, int>{},
      };

      // Group enrollments by month
      for (final enrollment in enrollments) {
        final date = DateTime.parse(enrollment['enrolled_at']);
        final month = '${date.year}-${date.month.toString().padLeft(2, '0')}';
        analytics['monthly_enrollments'][month] =
            (analytics['monthly_enrollments'][month] ?? 0) + 1;
      }

      // Rating distribution
      for (final rating in ratings) {
        final score = (rating['rating'] as double).round();
        analytics['rating_distribution'][score] =
            (analytics['rating_distribution'][score] ?? 0) + 1;
      }

      return analytics;
    } catch (e) {
      throw Exception('Failed to get course analytics: ${e.toString()}');
    }
  }
}
