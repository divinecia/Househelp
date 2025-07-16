class RatingModel {
  final String id;
  final String employeeId;
  final String employerId;
  final double overallRating;
  final double punctualityRating;
  final double qualityRating;
  final double communicationRating;
  final double reliabilityRating;
  final double attitudeRating;
  final String? comment;
  final List<String> strengths;
  final List<String> improvements;
  final RatingPeriod period;
  final DateTime ratingDate;
  final DateTime periodStart;
  final DateTime periodEnd;
  final bool isAnonymous;
  final RatingStatus status;
  final String? reviewerName;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const RatingModel({
    required this.id,
    required this.employeeId,
    required this.employerId,
    required this.overallRating,
    required this.punctualityRating,
    required this.qualityRating,
    required this.communicationRating,
    required this.reliabilityRating,
    required this.attitudeRating,
    this.comment,
    this.strengths = const [],
    this.improvements = const [],
    required this.period,
    required this.ratingDate,
    required this.periodStart,
    required this.periodEnd,
    this.isAnonymous = false,
    this.status = RatingStatus.submitted,
    this.reviewerName,
    required this.createdAt,
    this.updatedAt,
  });

  // Factory constructor for creating from JSON
  factory RatingModel.fromJson(Map<String, dynamic> json) {
    return RatingModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      employerId: json['employer_id'] as String,
      overallRating: (json['overall_rating'] as num).toDouble(),
      punctualityRating: (json['punctuality_rating'] as num).toDouble(),
      qualityRating: (json['quality_rating'] as num).toDouble(),
      communicationRating: (json['communication_rating'] as num).toDouble(),
      reliabilityRating: (json['reliability_rating'] as num).toDouble(),
      attitudeRating: (json['attitude_rating'] as num).toDouble(),
      comment: json['comment'] as String?,
      strengths: (json['strengths'] as List<dynamic>?)?.cast<String>() ?? [],
      improvements:
          (json['improvements'] as List<dynamic>?)?.cast<String>() ?? [],
      period: RatingPeriod.fromString(json['period'] as String),
      ratingDate: DateTime.parse(json['rating_date'] as String),
      periodStart: DateTime.parse(json['period_start'] as String),
      periodEnd: DateTime.parse(json['period_end'] as String),
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      status: RatingStatus.fromString(json['status'] as String? ?? 'submitted'),
      reviewerName: json['reviewer_name'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employee_id': employeeId,
      'employer_id': employerId,
      'overall_rating': overallRating,
      'punctuality_rating': punctualityRating,
      'quality_rating': qualityRating,
      'communication_rating': communicationRating,
      'reliability_rating': reliabilityRating,
      'attitude_rating': attitudeRating,
      'comment': comment,
      'strengths': strengths,
      'improvements': improvements,
      'period': period.value,
      'rating_date': ratingDate.toIso8601String(),
      'period_start': periodStart.toIso8601String(),
      'period_end': periodEnd.toIso8601String(),
      'is_anonymous': isAnonymous,
      'status': status.value,
      'reviewer_name': reviewerName,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  RatingModel copyWith({
    String? id,
    String? employeeId,
    String? employerId,
    double? overallRating,
    double? punctualityRating,
    double? qualityRating,
    double? communicationRating,
    double? reliabilityRating,
    double? attitudeRating,
    String? comment,
    List<String>? strengths,
    List<String>? improvements,
    RatingPeriod? period,
    DateTime? ratingDate,
    DateTime? periodStart,
    DateTime? periodEnd,
    bool? isAnonymous,
    RatingStatus? status,
    String? reviewerName,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return RatingModel(
      id: id ?? this.id,
      employeeId: employeeId ?? this.employeeId,
      employerId: employerId ?? this.employerId,
      overallRating: overallRating ?? this.overallRating,
      punctualityRating: punctualityRating ?? this.punctualityRating,
      qualityRating: qualityRating ?? this.qualityRating,
      communicationRating: communicationRating ?? this.communicationRating,
      reliabilityRating: reliabilityRating ?? this.reliabilityRating,
      attitudeRating: attitudeRating ?? this.attitudeRating,
      comment: comment ?? this.comment,
      strengths: strengths ?? this.strengths,
      improvements: improvements ?? this.improvements,
      period: period ?? this.period,
      ratingDate: ratingDate ?? this.ratingDate,
      periodStart: periodStart ?? this.periodStart,
      periodEnd: periodEnd ?? this.periodEnd,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      status: status ?? this.status,
      reviewerName: reviewerName ?? this.reviewerName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Calculate average of all specific ratings
  double get calculatedOverallRating {
    return (punctualityRating +
            qualityRating +
            communicationRating +
            reliabilityRating +
            attitudeRating) /
        5;
  }

  // Get rating performance level
  RatingLevel get performanceLevel {
    if (overallRating >= 4.5) return RatingLevel.excellent;
    if (overallRating >= 4.0) return RatingLevel.good;
    if (overallRating >= 3.0) return RatingLevel.satisfactory;
    if (overallRating >= 2.0) return RatingLevel.needsImprovement;
    return RatingLevel.poor;
  }

  // Check if rating is recent (within last 30 days)
  bool get isRecent {
    return DateTime.now().difference(ratingDate).inDays <= 30;
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is RatingModel &&
        other.id == id &&
        other.employeeId == employeeId &&
        other.employerId == employerId &&
        other.overallRating == overallRating &&
        other.punctualityRating == punctualityRating &&
        other.qualityRating == qualityRating &&
        other.communicationRating == communicationRating &&
        other.reliabilityRating == reliabilityRating &&
        other.attitudeRating == attitudeRating &&
        other.comment == comment &&
        other.period == period &&
        other.ratingDate == ratingDate &&
        other.status == status;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      employeeId,
      employerId,
      overallRating,
      punctualityRating,
      qualityRating,
      communicationRating,
      reliabilityRating,
      attitudeRating,
      comment,
      period,
      ratingDate,
      status,
    );
  }

  @override
  String toString() {
    return 'RatingModel(id: $id, employeeId: $employeeId, overallRating: $overallRating, '
        'period: $period, status: $status)';
  }
}

class RatingSummary {
  final String employeeId;
  final double averageRating;
  final int totalRatings;
  final Map<RatingPeriod, double> ratingsByPeriod;
  final Map<String, double> categoryAverages;
  final List<String> commonStrengths;
  final List<String> commonImprovements;
  final DateTime lastRated;
  final RatingTrend trend;

  const RatingSummary({
    required this.employeeId,
    required this.averageRating,
    required this.totalRatings,
    required this.ratingsByPeriod,
    required this.categoryAverages,
    required this.commonStrengths,
    required this.commonImprovements,
    required this.lastRated,
    required this.trend,
  });

  factory RatingSummary.fromJson(Map<String, dynamic> json) {
    return RatingSummary(
      employeeId: json['employee_id'] as String,
      averageRating: (json['average_rating'] as num).toDouble(),
      totalRatings: json['total_ratings'] as int,
      ratingsByPeriod: (json['ratings_by_period'] as Map<String, dynamic>).map(
        (key, value) =>
            MapEntry(RatingPeriod.fromString(key), (value as num).toDouble()),
      ),
      categoryAverages: (json['category_averages'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(key, (value as num).toDouble()),
      ),
      commonStrengths: (json['common_strengths'] as List<dynamic>)
          .cast<String>(),
      commonImprovements: (json['common_improvements'] as List<dynamic>)
          .cast<String>(),
      lastRated: DateTime.parse(json['last_rated'] as String),
      trend: RatingTrend.fromString(json['trend'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'employee_id': employeeId,
      'average_rating': averageRating,
      'total_ratings': totalRatings,
      'ratings_by_period': ratingsByPeriod.map(
        (key, value) => MapEntry(key.value, value),
      ),
      'category_averages': categoryAverages,
      'common_strengths': commonStrengths,
      'common_improvements': commonImprovements,
      'last_rated': lastRated.toIso8601String(),
      'trend': trend.value,
    };
  }
}

enum RatingPeriod {
  weekly('weekly'),
  monthly('monthly'),
  quarterly('quarterly'),
  annually('annually'),
  custom('custom');

  const RatingPeriod(this.value);

  final String value;

  static RatingPeriod fromString(String value) {
    return RatingPeriod.values.firstWhere(
      (period) => period.value == value.toLowerCase(),
      orElse: () => RatingPeriod.monthly,
    );
  }

  String get displayName {
    switch (this) {
      case RatingPeriod.weekly:
        return 'Weekly';
      case RatingPeriod.monthly:
        return 'Monthly';
      case RatingPeriod.quarterly:
        return 'Quarterly';
      case RatingPeriod.annually:
        return 'Annually';
      case RatingPeriod.custom:
        return 'Custom Period';
    }
  }
}

enum RatingStatus {
  draft('draft'),
  submitted('submitted'),
  reviewed('reviewed'),
  approved('approved'),
  disputed('disputed');

  const RatingStatus(this.value);

  final String value;

  static RatingStatus fromString(String value) {
    return RatingStatus.values.firstWhere(
      (status) => status.value == value.toLowerCase(),
      orElse: () => RatingStatus.submitted,
    );
  }

  String get displayName {
    switch (this) {
      case RatingStatus.draft:
        return 'Draft';
      case RatingStatus.submitted:
        return 'Submitted';
      case RatingStatus.reviewed:
        return 'Reviewed';
      case RatingStatus.approved:
        return 'Approved';
      case RatingStatus.disputed:
        return 'Disputed';
    }
  }
}

enum RatingLevel {
  excellent('excellent'),
  good('good'),
  satisfactory('satisfactory'),
  needsImprovement('needs_improvement'),
  poor('poor');

  const RatingLevel(this.value);

  final String value;

  String get displayName {
    switch (this) {
      case RatingLevel.excellent:
        return 'Excellent';
      case RatingLevel.good:
        return 'Good';
      case RatingLevel.satisfactory:
        return 'Satisfactory';
      case RatingLevel.needsImprovement:
        return 'Needs Improvement';
      case RatingLevel.poor:
        return 'Poor';
    }
  }

  String get description {
    switch (this) {
      case RatingLevel.excellent:
        return 'Exceptional performance that exceeds expectations';
      case RatingLevel.good:
        return 'Strong performance that meets and often exceeds expectations';
      case RatingLevel.satisfactory:
        return 'Adequate performance that meets basic expectations';
      case RatingLevel.needsImprovement:
        return 'Performance below expectations that requires improvement';
      case RatingLevel.poor:
        return 'Performance significantly below expectations';
    }
  }
}

enum RatingTrend {
  improving('improving'),
  stable('stable'),
  declining('declining'),
  insufficient('insufficient');

  const RatingTrend(this.value);

  final String value;

  static RatingTrend fromString(String value) {
    return RatingTrend.values.firstWhere(
      (trend) => trend.value == value.toLowerCase(),
      orElse: () => RatingTrend.insufficient,
    );
  }

  String get displayName {
    switch (this) {
      case RatingTrend.improving:
        return 'Improving';
      case RatingTrend.stable:
        return 'Stable';
      case RatingTrend.declining:
        return 'Declining';
      case RatingTrend.insufficient:
        return 'Insufficient Data';
    }
  }
}
