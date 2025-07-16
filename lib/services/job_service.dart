import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:math';
import '../constants/app_constants.dart';
import '../models/job_model.dart';
import '../models/user_model.dart';
import 'supabase_service.dart';
import 'notification_service.dart';
import 'payment_service.dart';

class JobService {
  // Create a new job
  static Future<Job> createJob({
    required String householdId,
    required String title,
    required String description,
    required ServiceType serviceType,
    required JobType jobType,
    required DateTime requestedDate,
    DateTime? scheduledDate,
    required int estimatedDuration,
    double? hourlyRate,
    Position? location,
    String? locationDescription,
    List<String>? requirements,
    List<String>? supplies,
    RecurrenceType recurrenceType = RecurrenceType.none,
    int? recurrenceInterval,
    DateTime? recurrenceEndDate,
    bool isUrgent = false,
    double? urgentPremium,
  }) async {
    try {
      final jobId = 'job_${DateTime.now().millisecondsSinceEpoch}';

      // Calculate pricing
      double? totalAmount;
      if (hourlyRate != null) {
        totalAmount = hourlyRate * (estimatedDuration / 60);
        if (isUrgent && urgentPremium != null) {
          totalAmount += urgentPremium;
        }
      }

      final job = Job(
        id: jobId,
        householdId: householdId,
        title: title,
        description: description,
        serviceType: serviceType,
        jobType: jobType,
        status: JobStatus.pending,
        requestedDate: requestedDate,
        scheduledDate: scheduledDate,
        estimatedDuration: estimatedDuration,
        hourlyRate: hourlyRate,
        totalAmount: totalAmount,
        location: location,
        locationDescription: locationDescription,
        requirements: requirements ?? [],
        supplies: supplies ?? [],
        recurrenceType: recurrenceType,
        recurrenceInterval: recurrenceInterval,
        recurrenceEndDate: recurrenceEndDate,
        isUrgent: isUrgent,
        urgentPremium: urgentPremium,
        createdAt: DateTime.now(),
      );

      // Save job to database
      await SupabaseService.client.from('jobs').insert(job.toJson());

      // Create recurring jobs if needed
      if (recurrenceType != RecurrenceType.none) {
        await _createRecurringJobs(job);
      }

      // Find and notify potential workers
      await _notifyPotentialWorkers(job);

      return job;
    } catch (e) {
      throw Exception('Failed to create job: ${e.toString()}');
    }
  }

  // Create recurring jobs
  static Future<void> _createRecurringJobs(Job parentJob) async {
    if (parentJob.recurrenceType == RecurrenceType.none) return;

    final endDate =
        parentJob.recurrenceEndDate ??
        DateTime.now().add(const Duration(days: 365));

    DateTime nextDate = parentJob.scheduledDate ?? parentJob.requestedDate;

    while (nextDate.isBefore(endDate)) {
      // Calculate next occurrence
      switch (parentJob.recurrenceType) {
        case RecurrenceType.daily:
          nextDate = nextDate.add(
            Duration(days: parentJob.recurrenceInterval ?? 1),
          );
          break;
        case RecurrenceType.weekly:
          nextDate = nextDate.add(
            Duration(days: 7 * (parentJob.recurrenceInterval ?? 1)),
          );
          break;
        case RecurrenceType.biweekly:
          nextDate = nextDate.add(const Duration(days: 14));
          break;
        case RecurrenceType.monthly:
          nextDate = DateTime(
            nextDate.year,
            nextDate.month + (parentJob.recurrenceInterval ?? 1),
            nextDate.day,
          );
          break;
        default:
          break;
      }

      if (nextDate.isAfter(endDate)) break;

      // Create recurring job
      final recurringJob = Job(
        id: 'job_${DateTime.now().millisecondsSinceEpoch}_${nextDate.millisecondsSinceEpoch}',
        householdId: parentJob.householdId,
        title: parentJob.title,
        description: parentJob.description,
        serviceType: parentJob.serviceType,
        jobType: JobType.recurring,
        status: JobStatus.pending,
        requestedDate: nextDate,
        scheduledDate: nextDate,
        estimatedDuration: parentJob.estimatedDuration,
        hourlyRate: parentJob.hourlyRate,
        totalAmount: parentJob.totalAmount,
        location: parentJob.location,
        locationDescription: parentJob.locationDescription,
        requirements: parentJob.requirements,
        supplies: parentJob.supplies,
        recurrenceType: RecurrenceType.none,
        isUrgent: false,
        createdAt: DateTime.now(),
        metadata: {'parent_job_id': parentJob.id},
      );

      await SupabaseService.client.from('jobs').insert(recurringJob.toJson());
    }
  }

  // Find and notify potential workers
  static Future<void> _notifyPotentialWorkers(Job job) async {
    try {
      // Find workers based on service type, location, and availability
      final workers = await _findMatchingWorkers(job);

      for (final worker in workers) {
        await NotificationService.sendNotification(
          userId: worker['user_id'],
          title: 'New Job Opportunity',
          message: '${job.title} - ${job.serviceType.name}',
          type: 'job_opportunity',
          data: {
            'job_id': job.id,
            'service_type': job.serviceType.name,
            'location': job.locationDescription,
            'estimated_duration': job.estimatedDuration,
            'hourly_rate': job.hourlyRate,
          },
        );
      }
    } catch (e) {
      debugPrint('Failed to notify workers: $e');
    }
  }

  // Find matching workers using smart algorithm
  static Future<List<Map<String, dynamic>>> _findMatchingWorkers(
    Job job,
  ) async {
    try {
      var query = SupabaseService.client
          .from('worker_profiles')
          .select('''
            *,
            users!inner(*)
          ''')
          .contains('service_categories', [job.serviceType.name])
          .eq('users.status', 'active');

      // Location-based filtering
      if (job.location != null) {
        // This would need to be implemented with PostGIS or similar
        // For now, we'll use a simple district-based filter
        query = query.eq('district', 'Gasabo'); // Placeholder
      }

      // Availability filtering
      final dayOfWeek = job.scheduledDate?.weekday ?? job.requestedDate.weekday;
      final dayName = _getDayName(dayOfWeek);
      query = query.contains('available_days', [dayName]);

      final workers = await query.limit(20);

      // Calculate match scores and sort
      final scoredWorkers = workers.map((worker) {
        final score = _calculateMatchScore(job, worker);
        return {...worker, 'match_score': score};
      }).toList();

      scoredWorkers.sort(
        (a, b) => b['match_score'].compareTo(a['match_score']),
      );

      return scoredWorkers;
    } catch (e) {
      throw Exception('Failed to find matching workers: ${e.toString()}');
    }
  }

  // Calculate match score between job and worker
  static double _calculateMatchScore(Job job, Map<String, dynamic> worker) {
    double score = 0.0;

    // Service type match (40%)
    final serviceCategories = List<String>.from(
      worker['service_categories'] ?? [],
    );
    if (serviceCategories.contains(job.serviceType.name)) {
      score += 40.0;
    }

    // Rating score (30%)
    final rating = worker['rating'] as double? ?? 0.0;
    score += (rating / 5.0) * 30.0;

    // Experience score (20%)
    final experience = worker['years_of_experience'] as int? ?? 0;
    score += (experience / 10.0) * 20.0;

    // Availability score (10%)
    final availableDays = List<String>.from(worker['available_days'] ?? []);
    final jobDay = _getDayName(
      job.scheduledDate?.weekday ?? job.requestedDate.weekday,
    );
    if (availableDays.contains(jobDay)) {
      score += 10.0;
    }

    return score;
  }

  static String _getDayName(int weekday) {
    switch (weekday) {
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
      case 7:
        return 'Sunday';
      default:
        return 'Monday';
    }
  }

  // Apply for a job
  static Future<JobApplication> applyForJob({
    required String jobId,
    required String workerId,
    required String message,
    required double proposedRate,
    required DateTime availableDate,
  }) async {
    try {
      final applicationId = 'app_${DateTime.now().millisecondsSinceEpoch}';

      final application = JobApplication(
        id: applicationId,
        jobId: jobId,
        workerId: workerId,
        message: message,
        proposedRate: proposedRate,
        availableDate: availableDate,
        status: 'pending',
        createdAt: DateTime.now(),
      );

      await SupabaseService.client
          .from('job_applications')
          .insert(application.toJson());

      // Notify household
      final job = await getJob(jobId);
      if (job != null) {
        await NotificationService.sendNotification(
          userId: job.householdId,
          title: 'New Job Application',
          message: 'A worker has applied for your job: ${job.title}',
          type: 'job_application',
          data: {
            'job_id': jobId,
            'application_id': applicationId,
            'worker_id': workerId,
          },
        );
      }

      return application;
    } catch (e) {
      throw Exception('Failed to apply for job: ${e.toString()}');
    }
  }

  // Accept job application
  static Future<void> acceptJobApplication({
    required String applicationId,
    required String jobId,
    String? responseMessage,
  }) async {
    try {
      // Update application status
      await SupabaseService.client
          .from('job_applications')
          .update({
            'status': 'accepted',
            'responded_at': DateTime.now().toIso8601String(),
            'response_message': responseMessage,
          })
          .eq('id', applicationId);

      // Get application details
      final applicationData = await SupabaseService.client
          .from('job_applications')
          .select()
          .eq('id', applicationId)
          .single();

      final application = JobApplication.fromJson(applicationData);

      // Update job with assigned worker
      await SupabaseService.client
          .from('jobs')
          .update({
            'worker_id': application.workerId,
            'status': JobStatus.accepted.name,
            'hourly_rate': application.proposedRate,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', jobId);

      // Reject other applications
      await SupabaseService.client
          .from('job_applications')
          .update({
            'status': 'rejected',
            'responded_at': DateTime.now().toIso8601String(),
          })
          .eq('job_id', jobId)
          .neq('id', applicationId);

      // Notify worker
      await NotificationService.sendNotification(
        userId: application.workerId,
        title: 'Job Application Accepted',
        message: 'Your application has been accepted!',
        type: 'job_accepted',
        data: {'job_id': jobId, 'application_id': applicationId},
      );
    } catch (e) {
      throw Exception('Failed to accept job application: ${e.toString()}');
    }
  }

  // Start job
  static Future<void> startJob(String jobId) async {
    try {
      await SupabaseService.client
          .from('jobs')
          .update({
            'status': JobStatus.inProgress.name,
            'start_time': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', jobId);

      // Send notifications
      final job = await getJob(jobId);
      if (job != null) {
        await NotificationService.sendNotification(
          userId: job.householdId,
          title: 'Job Started',
          message: 'Your job "${job.title}" has started',
          type: 'job_started',
          data: {'job_id': jobId},
        );
      }
    } catch (e) {
      throw Exception('Failed to start job: ${e.toString()}');
    }
  }

  // Complete job
  static Future<void> completeJob(String jobId) async {
    try {
      await SupabaseService.client
          .from('jobs')
          .update({
            'status': JobStatus.completed.name,
            'end_time': DateTime.now().toIso8601String(),
            'completed_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', jobId);

      // Process payment
      final job = await getJob(jobId);
      if (job != null && job.workerId != null && job.totalAmount != null) {
        await PaymentService.processWorkerPayment(
          workerId: job.workerId!,
          grossAmount: job.totalAmount!,
          description: 'Payment for job: ${job.title}',
          metadata: {'job_id': jobId, 'service_type': job.serviceType.name},
        );
      }

      // Send notifications
      if (job != null) {
        await NotificationService.sendNotification(
          userId: job.householdId,
          title: 'Job Completed',
          message: 'Your job "${job.title}" has been completed',
          type: 'job_completed',
          data: {'job_id': jobId},
        );

        if (job.workerId != null) {
          await NotificationService.sendNotification(
            userId: job.workerId!,
            title: 'Job Completed',
            message: 'You have completed the job "${job.title}"',
            type: 'job_completed',
            data: {'job_id': jobId},
          );
        }
      }
    } catch (e) {
      throw Exception('Failed to complete job: ${e.toString()}');
    }
  }

  // Cancel job
  static Future<void> cancelJob(String jobId, String reason) async {
    try {
      await SupabaseService.client
          .from('jobs')
          .update({
            'status': JobStatus.cancelled.name,
            'cancellation_reason': reason,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', jobId);

      // Send notifications
      final job = await getJob(jobId);
      if (job != null) {
        final recipients = [job.householdId];
        if (job.workerId != null) {
          recipients.add(job.workerId!);
        }

        for (final userId in recipients) {
          await NotificationService.sendNotification(
            userId: userId,
            title: 'Job Cancelled',
            message: 'Job "${job.title}" has been cancelled',
            type: 'job_cancelled',
            data: {'job_id': jobId, 'reason': reason},
          );
        }
      }
    } catch (e) {
      throw Exception('Failed to cancel job: ${e.toString()}');
    }
  }

  // Get job by ID
  static Future<Job?> getJob(String jobId) async {
    try {
      final response = await SupabaseService.client
          .from('jobs')
          .select()
          .eq('id', jobId)
          .single();

      return Job.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  // Get jobs for household
  static Future<List<Job>> getHouseholdJobs(
    String householdId, {
    JobStatus? status,
    int limit = 50,
  }) async {
    try {
      var query = SupabaseService.client
          .from('jobs')
          .select()
          .eq('household_id', householdId)
          .order('created_at', ascending: false)
          .limit(limit);

      if (status != null) {
        query = query.eq('status', status.name);
      }

      final response = await query;
      return response.map<Job>((json) => Job.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get household jobs: ${e.toString()}');
    }
  }

  // Get jobs for worker
  static Future<List<Job>> getWorkerJobs(
    String workerId, {
    JobStatus? status,
    int limit = 50,
  }) async {
    try {
      var query = SupabaseService.client
          .from('jobs')
          .select()
          .eq('worker_id', workerId)
          .order('created_at', ascending: false)
          .limit(limit);

      if (status != null) {
        query = query.eq('status', status.name);
      }

      final response = await query;
      return response.map<Job>((json) => Job.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get worker jobs: ${e.toString()}');
    }
  }

  // Get available jobs for worker
  static Future<List<Job>> getAvailableJobs(
    String workerId, {
    ServiceType? serviceType,
    double? maxDistance,
    int limit = 20,
  }) async {
    try {
      var query = SupabaseService.client
          .from('jobs')
          .select()
          .eq('status', JobStatus.pending.name)
          .order('created_at', ascending: false)
          .limit(limit);

      if (serviceType != null) {
        query = query.eq('service_type', serviceType.name);
      }

      final response = await query;
      final jobs = response.map<Job>((json) => Job.fromJson(json)).toList();

      // Filter jobs that the worker hasn't applied to
      final filteredJobs = <Job>[];
      for (final job in jobs) {
        final hasApplied = await _hasWorkerApplied(job.id, workerId);
        if (!hasApplied) {
          filteredJobs.add(job);
        }
      }

      return filteredJobs;
    } catch (e) {
      throw Exception('Failed to get available jobs: ${e.toString()}');
    }
  }

  // Check if worker has applied to job
  static Future<bool> _hasWorkerApplied(String jobId, String workerId) async {
    try {
      final response = await SupabaseService.client
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('worker_id', workerId)
          .limit(1);

      return response.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // Get job applications for job
  static Future<List<JobApplication>> getJobApplications(String jobId) async {
    try {
      final response = await SupabaseService.client
          .from('job_applications')
          .select()
          .eq('job_id', jobId)
          .order('created_at', ascending: false);

      return response
          .map<JobApplication>((json) => JobApplication.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get job applications: ${e.toString()}');
    }
  }

  // Search jobs
  static Future<List<Job>> searchJobs({
    String? searchTerm,
    ServiceType? serviceType,
    JobType? jobType,
    double? minRate,
    double? maxRate,
    bool? isUrgent,
    String? location,
    int limit = 20,
  }) async {
    try {
      var query = SupabaseService.client
          .from('jobs')
          .select()
          .eq('status', JobStatus.pending.name)
          .order('created_at', ascending: false)
          .limit(limit);

      if (serviceType != null) {
        query = query.eq('service_type', serviceType.name);
      }

      if (jobType != null) {
        query = query.eq('job_type', jobType.name);
      }

      if (minRate != null) {
        query = query.gte('hourly_rate', minRate);
      }

      if (maxRate != null) {
        query = query.lte('hourly_rate', maxRate);
      }

      if (isUrgent != null) {
        query = query.eq('is_urgent', isUrgent);
      }

      final response = await query;
      var jobs = response.map<Job>((json) => Job.fromJson(json)).toList();

      // Filter by search term
      if (searchTerm != null && searchTerm.isNotEmpty) {
        jobs = jobs.where((job) {
          return job.title.toLowerCase().contains(searchTerm.toLowerCase()) ||
              job.description.toLowerCase().contains(searchTerm.toLowerCase());
        }).toList();
      }

      return jobs;
    } catch (e) {
      throw Exception('Failed to search jobs: ${e.toString()}');
    }
  }

  // Get service packages
  static Future<List<ServicePackage>> getServicePackages({
    ServiceType? serviceType,
  }) async {
    try {
      var query = SupabaseService.client
          .from('service_packages')
          .select()
          .order('price', ascending: true);

      if (serviceType != null) {
        query = query.eq('service_type', serviceType.name);
      }

      final response = await query;
      return response
          .map<ServicePackage>((json) => ServicePackage.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get service packages: ${e.toString()}');
    }
  }

  // Rate job
  static Future<void> rateJob({
    required String jobId,
    required String raterId,
    required String rateeId,
    required double rating,
    String? review,
    required List<String> categories,
    required Map<String, double> categoryRatings,
    bool isPublic = true,
  }) async {
    try {
      final ratingId = 'rating_${DateTime.now().millisecondsSinceEpoch}';

      final ratingObj = Rating(
        id: ratingId,
        jobId: jobId,
        raterId: raterId,
        rateeId: rateeId,
        rating: rating,
        review: review,
        categories: categories,
        categoryRatings: categoryRatings,
        createdAt: DateTime.now(),
        isPublic: isPublic,
      );

      await SupabaseService.client.from('ratings').insert(ratingObj.toJson());

      // Update job with rating
      await SupabaseService.client
          .from('jobs')
          .update({
            'rating': rating,
            'review': review,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', jobId);

      // Update worker/household average rating
      await _updateAverageRating(rateeId);

      // Send notification
      await NotificationService.sendNotification(
        userId: rateeId,
        title: 'New Rating Received',
        message: 'You received a ${rating.toStringAsFixed(1)} star rating',
        type: 'rating_received',
        data: {'job_id': jobId, 'rating': rating},
      );
    } catch (e) {
      throw Exception('Failed to rate job: ${e.toString()}');
    }
  }

  // Update average rating
  static Future<void> _updateAverageRating(String userId) async {
    try {
      final ratings = await SupabaseService.client
          .from('ratings')
          .select('rating')
          .eq('ratee_id', userId);

      if (ratings.isNotEmpty) {
        final averageRating =
            ratings.fold<double>(0, (sum, rating) => sum + rating['rating']) /
            ratings.length;

        // Update worker profile
        await SupabaseService.client
            .from('worker_profiles')
            .update({'rating': averageRating, 'review_count': ratings.length})
            .eq('user_id', userId);

        // Update household profile
        await SupabaseService.client
            .from('household_profiles')
            .update({'rating': averageRating, 'review_count': ratings.length})
            .eq('user_id', userId);
      }
    } catch (e) {
      debugPrint('Failed to update average rating: $e');
    }
  }

  // Get user ratings
  static Future<List<Rating>> getUserRatings(
    String userId, {
    int limit = 20,
  }) async {
    try {
      final response = await SupabaseService.client
          .from('ratings')
          .select()
          .eq('ratee_id', userId)
          .eq('is_public', true)
          .order('created_at', ascending: false)
          .limit(limit);

      return response.map<Rating>((json) => Rating.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get user ratings: ${e.toString()}');
    }
  }

  // Get job statistics
  static Future<Map<String, dynamic>> getJobStatistics({
    String? userId,
    String? userType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final start =
          startDate ?? DateTime.now().subtract(const Duration(days: 30));
      final end = endDate ?? DateTime.now();

      var query = SupabaseService.client
          .from('jobs')
          .select()
          .gte('created_at', start.toIso8601String())
          .lte('created_at', end.toIso8601String());

      if (userId != null) {
        if (userType == 'worker') {
          query = query.eq('worker_id', userId);
        } else {
          query = query.eq('household_id', userId);
        }
      }

      final jobs = await query;

      final stats = {
        'total_jobs': jobs.length,
        'completed_jobs': jobs
            .where((j) => j['status'] == JobStatus.completed.name)
            .length,
        'pending_jobs': jobs
            .where((j) => j['status'] == JobStatus.pending.name)
            .length,
        'cancelled_jobs': jobs
            .where((j) => j['status'] == JobStatus.cancelled.name)
            .length,
        'total_earnings': jobs.fold<double>(
          0,
          (sum, job) => sum + (job['total_amount'] ?? 0.0),
        ),
        'average_rating': 0.0,
        'by_service_type': <String, int>{},
        'by_status': <String, int>{},
      };

      // Calculate average rating
      final ratedJobs = jobs.where((j) => j['rating'] != null).toList();
      if (ratedJobs.isNotEmpty) {
        stats['average_rating'] =
            ratedJobs.fold<double>(0, (sum, job) => sum + job['rating']) /
            ratedJobs.length;
      }

      // Group by service type
      for (final job in jobs) {
        final serviceType = job['service_type'] as String;
        stats['by_service_type'][serviceType] =
            (stats['by_service_type'][serviceType] ?? 0) + 1;
      }

      // Group by status
      for (final job in jobs) {
        final status = job['status'] as String;
        stats['by_status'][status] = (stats['by_status'][status] ?? 0) + 1;
      }

      return stats;
    } catch (e) {
      throw Exception('Failed to get job statistics: ${e.toString()}');
    }
  }
}
