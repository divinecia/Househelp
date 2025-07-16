enum ReferralStatus { pending, completed, cancelled, expired }

enum RedemptionStatus { pending, approved, rejected, fulfilled }

enum RewardType { discount, cashback, freeService, points, upgrade }

class Referral {
  final String id;
  final String referrerId;
  final String referredUserId;
  final String referralCode;
  final ReferralStatus status;
  final DateTime createdAt;
  final DateTime? completedAt;
  final double? rewardAmount;
  final String? notes;
  final Map<String, dynamic>? metadata;

  Referral({
    required this.id,
    required this.referrerId,
    required this.referredUserId,
    required this.referralCode,
    required this.status,
    required this.createdAt,
    this.completedAt,
    this.rewardAmount,
    this.notes,
    this.metadata,
  });

  factory Referral.fromJson(Map<String, dynamic> json) {
    return Referral(
      id: json['id'],
      referrerId: json['referrer_id'],
      referredUserId: json['referred_user_id'],
      referralCode: json['referral_code'],
      status: ReferralStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ReferralStatus.pending,
      ),
      createdAt: DateTime.parse(json['created_at']),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'])
          : null,
      rewardAmount: json['reward_amount']?.toDouble(),
      notes: json['notes'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'referrer_id': referrerId,
      'referred_user_id': referredUserId,
      'referral_code': referralCode,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'reward_amount': rewardAmount,
      'notes': notes,
      'metadata': metadata,
    };
  }
}

class ReferralCode {
  final String id;
  final String userId;
  final String code;
  final DateTime createdAt;
  final DateTime? expiresAt;
  final bool isActive;
  final int usageCount;
  final int? maxUsage;
  final Map<String, dynamic>? metadata;

  ReferralCode({
    required this.id,
    required this.userId,
    required this.code,
    required this.createdAt,
    this.expiresAt,
    required this.isActive,
    required this.usageCount,
    this.maxUsage,
    this.metadata,
  });

  factory ReferralCode.fromJson(Map<String, dynamic> json) {
    return ReferralCode(
      id: json['id'],
      userId: json['user_id'],
      code: json['code'],
      createdAt: DateTime.parse(json['created_at']),
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      isActive: json['is_active'] ?? true,
      usageCount: json['usage_count'] ?? 0,
      maxUsage: json['max_usage'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'code': code,
      'created_at': createdAt.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'is_active': isActive,
      'usage_count': usageCount,
      'max_usage': maxUsage,
      'metadata': metadata,
    };
  }
}

class LoyaltyTransaction {
  final String id;
  final String userId;
  final int points;
  final String description;
  final String type;
  final String? referenceId;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  LoyaltyTransaction({
    required this.id,
    required this.userId,
    required this.points,
    required this.description,
    required this.type,
    this.referenceId,
    required this.createdAt,
    this.metadata,
  });

  factory LoyaltyTransaction.fromJson(Map<String, dynamic> json) {
    return LoyaltyTransaction(
      id: json['id'],
      userId: json['user_id'],
      points: json['points'] ?? 0,
      description: json['description'],
      type: json['type'],
      referenceId: json['reference_id'],
      createdAt: DateTime.parse(json['created_at']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'points': points,
      'description': description,
      'type': type,
      'reference_id': referenceId,
      'created_at': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

class LoyaltyReward {
  final String id;
  final String title;
  final String description;
  final RewardType type;
  final int pointsRequired;
  final double? value;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime? expiresAt;
  final bool isActive;
  final bool isLimited;
  final int? stockCount;
  final int? maxRedemptions;
  final String? terms;
  final Map<String, dynamic>? metadata;

  LoyaltyReward({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.pointsRequired,
    this.value,
    this.imageUrl,
    required this.createdAt,
    this.expiresAt,
    required this.isActive,
    this.isLimited = false,
    this.stockCount,
    this.maxRedemptions,
    this.terms,
    this.metadata,
  });

  factory LoyaltyReward.fromJson(Map<String, dynamic> json) {
    return LoyaltyReward(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: RewardType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => RewardType.points,
      ),
      pointsRequired: json['points_required'] ?? 0,
      value: json['value']?.toDouble(),
      imageUrl: json['image_url'],
      createdAt: DateTime.parse(json['created_at']),
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      isActive: json['is_active'] ?? true,
      isLimited: json['is_limited'] ?? false,
      stockCount: json['stock_count'],
      maxRedemptions: json['max_redemptions'],
      terms: json['terms'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'points_required': pointsRequired,
      'value': value,
      'image_url': imageUrl,
      'created_at': createdAt.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'is_active': isActive,
      'is_limited': isLimited,
      'stock_count': stockCount,
      'max_redemptions': maxRedemptions,
      'terms': terms,
      'metadata': metadata,
    };
  }
}

class RewardRedemption {
  final String id;
  final String userId;
  final String rewardId;
  final int pointsSpent;
  final RedemptionStatus status;
  final DateTime createdAt;
  final DateTime? fulfilledAt;
  final String? fulfillmentDetails;
  final DateTime? expiresAt;
  final String? notes;
  final Map<String, dynamic>? metadata;

  RewardRedemption({
    required this.id,
    required this.userId,
    required this.rewardId,
    required this.pointsSpent,
    required this.status,
    required this.createdAt,
    this.fulfilledAt,
    this.fulfillmentDetails,
    this.expiresAt,
    this.notes,
    this.metadata,
  });

  factory RewardRedemption.fromJson(Map<String, dynamic> json) {
    return RewardRedemption(
      id: json['id'],
      userId: json['user_id'],
      rewardId: json['reward_id'],
      pointsSpent: json['points_spent'] ?? 0,
      status: RedemptionStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => RedemptionStatus.pending,
      ),
      createdAt: DateTime.parse(json['created_at']),
      fulfilledAt: json['fulfilled_at'] != null
          ? DateTime.parse(json['fulfilled_at'])
          : null,
      fulfillmentDetails: json['fulfillment_details'],
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      notes: json['notes'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'reward_id': rewardId,
      'points_spent': pointsSpent,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'fulfilled_at': fulfilledAt?.toIso8601String(),
      'fulfillment_details': fulfillmentDetails,
      'expires_at': expiresAt?.toIso8601String(),
      'notes': notes,
      'metadata': metadata,
    };
  }
}

class LoyaltyTier {
  final String id;
  final String name;
  final int pointsRequired;
  final String color;
  final String? icon;
  final List<String> benefits;
  final double? discount;
  final int? priorityLevel;
  final DateTime createdAt;
  final bool isActive;
  final Map<String, dynamic>? metadata;

  LoyaltyTier({
    required this.id,
    required this.name,
    required this.pointsRequired,
    required this.color,
    this.icon,
    required this.benefits,
    this.discount,
    this.priorityLevel,
    required this.createdAt,
    required this.isActive,
    this.metadata,
  });

  factory LoyaltyTier.fromJson(Map<String, dynamic> json) {
    return LoyaltyTier(
      id: json['id'],
      name: json['name'],
      pointsRequired: json['points_required'] ?? 0,
      color: json['color'],
      icon: json['icon'],
      benefits: List<String>.from(json['benefits'] ?? []),
      discount: json['discount']?.toDouble(),
      priorityLevel: json['priority_level'],
      createdAt: DateTime.parse(json['created_at']),
      isActive: json['is_active'] ?? true,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'points_required': pointsRequired,
      'color': color,
      'icon': icon,
      'benefits': benefits,
      'discount': discount,
      'priority_level': priorityLevel,
      'created_at': createdAt.toIso8601String(),
      'is_active': isActive,
      'metadata': metadata,
    };
  }
}

class Promotion {
  final String id;
  final String title;
  final String description;
  final String type;
  final int pointsMultiplier;
  final DateTime startDate;
  final DateTime endDate;
  final String? targetUserType;
  final Map<String, dynamic>? conditions;
  final bool isActive;
  final DateTime createdAt;
  final String? imageUrl;
  final Map<String, dynamic>? metadata;

  Promotion({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.pointsMultiplier,
    required this.startDate,
    required this.endDate,
    this.targetUserType,
    this.conditions,
    required this.isActive,
    required this.createdAt,
    this.imageUrl,
    this.metadata,
  });

  factory Promotion.fromJson(Map<String, dynamic> json) {
    return Promotion(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: json['type'],
      pointsMultiplier: json['points_multiplier'] ?? 1,
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      targetUserType: json['target_user_type'],
      conditions: json['conditions'],
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      imageUrl: json['image_url'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'points_multiplier': pointsMultiplier,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
      'target_user_type': targetUserType,
      'conditions': conditions,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'image_url': imageUrl,
      'metadata': metadata,
    };
  }
}

class ReferralInvitation {
  final String id;
  final String userId;
  final String email;
  final String message;
  final String referralCode;
  final DateTime sentAt;
  final String status;
  final DateTime? acceptedAt;
  final String? acceptedByUserId;
  final Map<String, dynamic>? metadata;

  ReferralInvitation({
    required this.id,
    required this.userId,
    required this.email,
    required this.message,
    required this.referralCode,
    required this.sentAt,
    required this.status,
    this.acceptedAt,
    this.acceptedByUserId,
    this.metadata,
  });

  factory ReferralInvitation.fromJson(Map<String, dynamic> json) {
    return ReferralInvitation(
      id: json['id'],
      userId: json['user_id'],
      email: json['email'],
      message: json['message'],
      referralCode: json['referral_code'],
      sentAt: DateTime.parse(json['sent_at']),
      status: json['status'],
      acceptedAt: json['accepted_at'] != null
          ? DateTime.parse(json['accepted_at'])
          : null,
      acceptedByUserId: json['accepted_by_user_id'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'email': email,
      'message': message,
      'referral_code': referralCode,
      'sent_at': sentAt.toIso8601String(),
      'status': status,
      'accepted_at': acceptedAt?.toIso8601String(),
      'accepted_by_user_id': acceptedByUserId,
      'metadata': metadata,
    };
  }
}

class LoyaltyPoints {
  final String userId;
  final int totalPoints;
  final int earnedPoints;
  final int spentPoints;
  final int expiredPoints;
  final DateTime? lastEarnedAt;
  final DateTime? lastSpentAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? metadata;

  LoyaltyPoints({
    required this.userId,
    required this.totalPoints,
    required this.earnedPoints,
    required this.spentPoints,
    required this.expiredPoints,
    this.lastEarnedAt,
    this.lastSpentAt,
    required this.updatedAt,
    this.metadata,
  });

  factory LoyaltyPoints.fromJson(Map<String, dynamic> json) {
    return LoyaltyPoints(
      userId: json['user_id'],
      totalPoints: json['total_points'] ?? 0,
      earnedPoints: json['earned_points'] ?? 0,
      spentPoints: json['spent_points'] ?? 0,
      expiredPoints: json['expired_points'] ?? 0,
      lastEarnedAt: json['last_earned_at'] != null
          ? DateTime.parse(json['last_earned_at'])
          : null,
      lastSpentAt: json['last_spent_at'] != null
          ? DateTime.parse(json['last_spent_at'])
          : null,
      updatedAt: DateTime.parse(json['updated_at']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'total_points': totalPoints,
      'earned_points': earnedPoints,
      'spent_points': spentPoints,
      'expired_points': expiredPoints,
      'last_earned_at': lastEarnedAt?.toIso8601String(),
      'last_spent_at': lastSpentAt?.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

class LeaderboardEntry {
  final String userId;
  final String firstName;
  final String lastName;
  final String? profilePhoto;
  final int totalPoints;
  final int rank;
  final String? tier;
  final Map<String, dynamic>? metadata;

  LeaderboardEntry({
    required this.userId,
    required this.firstName,
    required this.lastName,
    this.profilePhoto,
    required this.totalPoints,
    required this.rank,
    this.tier,
    this.metadata,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      userId: json['user_id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      profilePhoto: json['profile_photo'],
      totalPoints: json['total_points'] ?? 0,
      rank: json['rank'] ?? 0,
      tier: json['tier'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'first_name': firstName,
      'last_name': lastName,
      'profile_photo': profilePhoto,
      'total_points': totalPoints,
      'rank': rank,
      'tier': tier,
      'metadata': metadata,
    };
  }
}

class ReferralCampaign {
  final String id;
  final String title;
  final String description;
  final int referrerReward;
  final int referredReward;
  final DateTime startDate;
  final DateTime endDate;
  final bool isActive;
  final String? targetAudience;
  final Map<String, dynamic>? conditions;
  final int totalReferrals;
  final int completedReferrals;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  ReferralCampaign({
    required this.id,
    required this.title,
    required this.description,
    required this.referrerReward,
    required this.referredReward,
    required this.startDate,
    required this.endDate,
    required this.isActive,
    this.targetAudience,
    this.conditions,
    required this.totalReferrals,
    required this.completedReferrals,
    required this.createdAt,
    this.metadata,
  });

  factory ReferralCampaign.fromJson(Map<String, dynamic> json) {
    return ReferralCampaign(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      referrerReward: json['referrer_reward'] ?? 0,
      referredReward: json['referred_reward'] ?? 0,
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      isActive: json['is_active'] ?? true,
      targetAudience: json['target_audience'],
      conditions: json['conditions'],
      totalReferrals: json['total_referrals'] ?? 0,
      completedReferrals: json['completed_referrals'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'referrer_reward': referrerReward,
      'referred_reward': referredReward,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
      'is_active': isActive,
      'target_audience': targetAudience,
      'conditions': conditions,
      'total_referrals': totalReferrals,
      'completed_referrals': completedReferrals,
      'created_at': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}
