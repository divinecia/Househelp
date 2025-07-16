import 'package:geolocator/geolocator.dart';

enum JobStatus {
  pending,
  accepted,
  rejected,
  inProgress,
  completed,
  cancelled,
  disputed,
}

enum JobType { oneTime, recurring, urgent }

enum ServiceType {
  cleaning,
  cooking,
  childcare,
  elderlyCare,
  gardening,
  laundry,
  generalHousework,
  petCare,
  eventAssistance,
}

enum RecurrenceType { none, daily, weekly, biweekly, monthly }

class Job {
  final String id;
  final String householdId;
  final String? workerId;
  final String title;
  final String description;
  final ServiceType serviceType;
  final JobType jobType;
  final JobStatus status;
  final DateTime requestedDate;
  final DateTime? scheduledDate;
  final DateTime? startTime;
  final DateTime? endTime;
  final int estimatedDuration; // in minutes
  final double? hourlyRate;
  final double? totalAmount;
  final Position? location;
  final String? locationDescription;
  final List<String> requirements;
  final List<String> supplies;
  final RecurrenceType recurrenceType;
  final int? recurrenceInterval;
  final DateTime? recurrenceEndDate;
  final bool isUrgent;
  final double? urgentPremium;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? completedAt;
  final String? cancellationReason;
  final double? rating;
  final String? review;

  Job({
    required this.id,
    required this.householdId,
    this.workerId,
    required this.title,
    required this.description,
    required this.serviceType,
    required this.jobType,
    required this.status,
    required this.requestedDate,
    this.scheduledDate,
    this.startTime,
    this.endTime,
    required this.estimatedDuration,
    this.hourlyRate,
    this.totalAmount,
    this.location,
    this.locationDescription,
    required this.requirements,
    required this.supplies,
    required this.recurrenceType,
    this.recurrenceInterval,
    this.recurrenceEndDate,
    required this.isUrgent,
    this.urgentPremium,
    this.metadata,
    required this.createdAt,
    this.updatedAt,
    this.completedAt,
    this.cancellationReason,
    this.rating,
    this.review,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'],
      householdId: json['household_id'],
      workerId: json['worker_id'],
      title: json['title'],
      description: json['description'],
      serviceType: ServiceType.values.firstWhere(
        (e) => e.name == json['service_type'],
        orElse: () => ServiceType.generalHousework,
      ),
      jobType: JobType.values.firstWhere(
        (e) => e.name == json['job_type'],
        orElse: () => JobType.oneTime,
      ),
      status: JobStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => JobStatus.pending,
      ),
      requestedDate: DateTime.parse(json['requested_date']),
      scheduledDate: json['scheduled_date'] != null
          ? DateTime.parse(json['scheduled_date'])
          : null,
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : null,
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'])
          : null,
      estimatedDuration: json['estimated_duration'] ?? 0,
      hourlyRate: json['hourly_rate']?.toDouble(),
      totalAmount: json['total_amount']?.toDouble(),
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
      locationDescription: json['location_description'],
      requirements: List<String>.from(json['requirements'] ?? []),
      supplies: List<String>.from(json['supplies'] ?? []),
      recurrenceType: RecurrenceType.values.firstWhere(
        (e) => e.name == json['recurrence_type'],
        orElse: () => RecurrenceType.none,
      ),
      recurrenceInterval: json['recurrence_interval'],
      recurrenceEndDate: json['recurrence_end_date'] != null
          ? DateTime.parse(json['recurrence_end_date'])
          : null,
      isUrgent: json['is_urgent'] ?? false,
      urgentPremium: json['urgent_premium']?.toDouble(),
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'])
          : null,
      cancellationReason: json['cancellation_reason'],
      rating: json['rating']?.toDouble(),
      review: json['review'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'household_id': householdId,
      'worker_id': workerId,
      'title': title,
      'description': description,
      'service_type': serviceType.name,
      'job_type': jobType.name,
      'status': status.name,
      'requested_date': requestedDate.toIso8601String(),
      'scheduled_date': scheduledDate?.toIso8601String(),
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'estimated_duration': estimatedDuration,
      'hourly_rate': hourlyRate,
      'total_amount': totalAmount,
      'latitude': location?.latitude,
      'longitude': location?.longitude,
      'location_description': locationDescription,
      'requirements': requirements,
      'supplies': supplies,
      'recurrence_type': recurrenceType.name,
      'recurrence_interval': recurrenceInterval,
      'recurrence_end_date': recurrenceEndDate?.toIso8601String(),
      'is_urgent': isUrgent,
      'urgent_premium': urgentPremium,
      'metadata': metadata,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'cancellation_reason': cancellationReason,
      'rating': rating,
      'review': review,
    };
  }
}

class JobApplication {
  final String id;
  final String jobId;
  final String workerId;
  final String message;
  final double proposedRate;
  final DateTime availableDate;
  final String status;
  final DateTime createdAt;
  final DateTime? respondedAt;
  final String? responseMessage;

  JobApplication({
    required this.id,
    required this.jobId,
    required this.workerId,
    required this.message,
    required this.proposedRate,
    required this.availableDate,
    required this.status,
    required this.createdAt,
    this.respondedAt,
    this.responseMessage,
  });

  factory JobApplication.fromJson(Map<String, dynamic> json) {
    return JobApplication(
      id: json['id'],
      jobId: json['job_id'],
      workerId: json['worker_id'],
      message: json['message'],
      proposedRate: json['proposed_rate']?.toDouble() ?? 0.0,
      availableDate: DateTime.parse(json['available_date']),
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      respondedAt: json['responded_at'] != null
          ? DateTime.parse(json['responded_at'])
          : null,
      responseMessage: json['response_message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'job_id': jobId,
      'worker_id': workerId,
      'message': message,
      'proposed_rate': proposedRate,
      'available_date': availableDate.toIso8601String(),
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'responded_at': respondedAt?.toIso8601String(),
      'response_message': responseMessage,
    };
  }
}

class ServicePackage {
  final String id;
  final String name;
  final String description;
  final ServiceType serviceType;
  final int duration; // in minutes
  final double price;
  final List<String> includes;
  final List<String> excludes;
  final bool isPopular;
  final double? discount;
  final DateTime? discountValidUntil;

  ServicePackage({
    required this.id,
    required this.name,
    required this.description,
    required this.serviceType,
    required this.duration,
    required this.price,
    required this.includes,
    required this.excludes,
    required this.isPopular,
    this.discount,
    this.discountValidUntil,
  });

  factory ServicePackage.fromJson(Map<String, dynamic> json) {
    return ServicePackage(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      serviceType: ServiceType.values.firstWhere(
        (e) => e.name == json['service_type'],
        orElse: () => ServiceType.generalHousework,
      ),
      duration: json['duration'],
      price: json['price']?.toDouble() ?? 0.0,
      includes: List<String>.from(json['includes'] ?? []),
      excludes: List<String>.from(json['excludes'] ?? []),
      isPopular: json['is_popular'] ?? false,
      discount: json['discount']?.toDouble(),
      discountValidUntil: json['discount_valid_until'] != null
          ? DateTime.parse(json['discount_valid_until'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'service_type': serviceType.name,
      'duration': duration,
      'price': price,
      'includes': includes,
      'excludes': excludes,
      'is_popular': isPopular,
      'discount': discount,
      'discount_valid_until': discountValidUntil?.toIso8601String(),
    };
  }
}

class Rating {
  final String id;
  final String jobId;
  final String raterId;
  final String rateeId;
  final double rating;
  final String? review;
  final List<String> categories;
  final Map<String, double> categoryRatings;
  final DateTime createdAt;
  final bool isPublic;

  Rating({
    required this.id,
    required this.jobId,
    required this.raterId,
    required this.rateeId,
    required this.rating,
    this.review,
    required this.categories,
    required this.categoryRatings,
    required this.createdAt,
    required this.isPublic,
  });

  factory Rating.fromJson(Map<String, dynamic> json) {
    return Rating(
      id: json['id'],
      jobId: json['job_id'],
      raterId: json['rater_id'],
      rateeId: json['ratee_id'],
      rating: json['rating']?.toDouble() ?? 0.0,
      review: json['review'],
      categories: List<String>.from(json['categories'] ?? []),
      categoryRatings: Map<String, double>.from(json['category_ratings'] ?? {}),
      createdAt: DateTime.parse(json['created_at']),
      isPublic: json['is_public'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'job_id': jobId,
      'rater_id': raterId,
      'ratee_id': rateeId,
      'rating': rating,
      'review': review,
      'categories': categories,
      'category_ratings': categoryRatings,
      'created_at': createdAt.toIso8601String(),
      'is_public': isPublic,
    };
  }
}
