class LoyaltyModel {
  final String id;
  final String employeeId;
  final int totalPoints;
  final int availablePoints;
  final int redeemedPoints;
  final LoyaltyTier tier;
  final int yearOfService;
  final double performanceRating;
  final List<LoyaltyTransaction> transactions;
  final List<LoyaltyReward> availableRewards;
  final DateTime lastUpdated;
  final DateTime createdAt;

  const LoyaltyModel({
    required this.id,
    required this.employeeId,
    this.totalPoints = 0,
    this.availablePoints = 0,
    this.redeemedPoints = 0,
    this.tier = LoyaltyTier.bronze,
    this.yearOfService = 0,
    this.performanceRating = 0.0,
    this.transactions = const [],
    this.availableRewards = const [],
    required this.lastUpdated,
    required this.createdAt,
  });

  // Factory constructor for creating from JSON
  factory LoyaltyModel.fromJson(Map<String, dynamic> json) {
    return LoyaltyModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      totalPoints: json['total_points'] as int? ?? 0,
      availablePoints: json['available_points'] as int? ?? 0,
      redeemedPoints: json['redeemed_points'] as int? ?? 0,
      tier: LoyaltyTier.fromString(json['tier'] as String? ?? 'bronze'),
      yearOfService: json['year_of_service'] as int? ?? 0,
      performanceRating:
          (json['performance_rating'] as num?)?.toDouble() ?? 0.0,
      transactions:
          (json['transactions'] as List<dynamic>?)
              ?.map(
                (e) => LoyaltyTransaction.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
      availableRewards:
          (json['available_rewards'] as List<dynamic>?)
              ?.map((e) => LoyaltyReward.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      lastUpdated: DateTime.parse(json['last_updated'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employee_id': employeeId,
      'total_points': totalPoints,
      'available_points': availablePoints,
      'redeemed_points': redeemedPoints,
      'tier': tier.value,
      'year_of_service': yearOfService,
      'performance_rating': performanceRating,
      'transactions': transactions.map((e) => e.toJson()).toList(),
      'available_rewards': availableRewards.map((e) => e.toJson()).toList(),
      'last_updated': lastUpdated.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  LoyaltyModel copyWith({
    String? id,
    String? employeeId,
    int? totalPoints,
    int? availablePoints,
    int? redeemedPoints,
    LoyaltyTier? tier,
    int? yearOfService,
    double? performanceRating,
    List<LoyaltyTransaction>? transactions,
    List<LoyaltyReward>? availableRewards,
    DateTime? lastUpdated,
    DateTime? createdAt,
  }) {
    return LoyaltyModel(
      id: id ?? this.id,
      employeeId: employeeId ?? this.employeeId,
      totalPoints: totalPoints ?? this.totalPoints,
      availablePoints: availablePoints ?? this.availablePoints,
      redeemedPoints: redeemedPoints ?? this.redeemedPoints,
      tier: tier ?? this.tier,
      yearOfService: yearOfService ?? this.yearOfService,
      performanceRating: performanceRating ?? this.performanceRating,
      transactions: transactions ?? this.transactions,
      availableRewards: availableRewards ?? this.availableRewards,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  // Calculate next tier requirements
  int get pointsToNextTier {
    return tier.nextTierPoints - totalPoints;
  }

  // Check if eligible for tier upgrade
  bool get canUpgradeTier {
    return totalPoints >= tier.nextTierPoints;
  }

  // Get tier progress percentage
  double get tierProgress {
    final currentTierPoints = tier.minimumPoints;
    final nextTierPoints = tier.nextTierPoints;
    final progress =
        (totalPoints - currentTierPoints) /
        (nextTierPoints - currentTierPoints);
    return progress.clamp(0.0, 1.0);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoyaltyModel &&
        other.id == id &&
        other.employeeId == employeeId &&
        other.totalPoints == totalPoints &&
        other.availablePoints == availablePoints &&
        other.redeemedPoints == redeemedPoints &&
        other.tier == tier &&
        other.yearOfService == yearOfService &&
        other.performanceRating == performanceRating &&
        other.lastUpdated == lastUpdated &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      employeeId,
      totalPoints,
      availablePoints,
      redeemedPoints,
      tier,
      yearOfService,
      performanceRating,
      lastUpdated,
      createdAt,
    );
  }

  @override
  String toString() {
    return 'LoyaltyModel(id: $id, employeeId: $employeeId, totalPoints: $totalPoints, '
        'tier: $tier, yearOfService: $yearOfService)';
  }
}

class LoyaltyTransaction {
  final String id;
  final String employeeId;
  final LoyaltyTransactionType type;
  final int points;
  final String description;
  final String? referenceId;
  final DateTime createdAt;

  const LoyaltyTransaction({
    required this.id,
    required this.employeeId,
    required this.type,
    required this.points,
    required this.description,
    this.referenceId,
    required this.createdAt,
  });

  factory LoyaltyTransaction.fromJson(Map<String, dynamic> json) {
    return LoyaltyTransaction(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      type: LoyaltyTransactionType.fromString(json['type'] as String),
      points: json['points'] as int,
      description: json['description'] as String,
      referenceId: json['reference_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employee_id': employeeId,
      'type': type.value,
      'points': points,
      'description': description,
      'reference_id': referenceId,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class LoyaltyReward {
  final String id;
  final String title;
  final String description;
  final int pointsCost;
  final LoyaltyRewardType type;
  final String? imageUrl;
  final bool isActive;
  final LoyaltyTier minimumTier;
  final DateTime? expiryDate;

  const LoyaltyReward({
    required this.id,
    required this.title,
    required this.description,
    required this.pointsCost,
    required this.type,
    this.imageUrl,
    this.isActive = true,
    this.minimumTier = LoyaltyTier.bronze,
    this.expiryDate,
  });

  factory LoyaltyReward.fromJson(Map<String, dynamic> json) {
    return LoyaltyReward(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      pointsCost: json['points_cost'] as int,
      type: LoyaltyRewardType.fromString(json['type'] as String),
      imageUrl: json['image_url'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      minimumTier: LoyaltyTier.fromString(
        json['minimum_tier'] as String? ?? 'bronze',
      ),
      expiryDate: json['expiry_date'] != null
          ? DateTime.parse(json['expiry_date'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'points_cost': pointsCost,
      'type': type.value,
      'image_url': imageUrl,
      'is_active': isActive,
      'minimum_tier': minimumTier.value,
      'expiry_date': expiryDate?.toIso8601String(),
    };
  }
}

enum LoyaltyTier {
  bronze('bronze', 0, 500, 'Bronze'),
  silver('silver', 500, 1500, 'Silver'),
  gold('gold', 1500, 3000, 'Gold'),
  platinum('platinum', 3000, 10000, 'Platinum');

  const LoyaltyTier(
    this.value,
    this.minimumPoints,
    this.nextTierPoints,
    this.displayName,
  );

  final String value;
  final int minimumPoints;
  final int nextTierPoints;
  final String displayName;

  static LoyaltyTier fromString(String value) {
    return LoyaltyTier.values.firstWhere(
      (tier) => tier.value == value.toLowerCase(),
      orElse: () => LoyaltyTier.bronze,
    );
  }

  static LoyaltyTier fromPoints(int points) {
    for (final tier in LoyaltyTier.values.reversed) {
      if (points >= tier.minimumPoints) {
        return tier;
      }
    }
    return LoyaltyTier.bronze;
  }
}

enum LoyaltyTransactionType {
  earned('earned'),
  redeemed('redeemed'),
  bonus('bonus'),
  penalty('penalty'),
  adjustment('adjustment');

  const LoyaltyTransactionType(this.value);

  final String value;

  static LoyaltyTransactionType fromString(String value) {
    return LoyaltyTransactionType.values.firstWhere(
      (type) => type.value == value.toLowerCase(),
      orElse: () => LoyaltyTransactionType.earned,
    );
  }

  String get displayName {
    switch (this) {
      case LoyaltyTransactionType.earned:
        return 'Points Earned';
      case LoyaltyTransactionType.redeemed:
        return 'Points Redeemed';
      case LoyaltyTransactionType.bonus:
        return 'Bonus Points';
      case LoyaltyTransactionType.penalty:
        return 'Point Penalty';
      case LoyaltyTransactionType.adjustment:
        return 'Point Adjustment';
    }
  }
}

enum LoyaltyRewardType {
  cashBonus('cash_bonus'),
  extraLeave('extra_leave'),
  giftVoucher('gift_voucher'),
  training('training'),
  recognition('recognition'),
  merchandise('merchandise'),
  experience('experience'),
  other('other');

  const LoyaltyRewardType(this.value);

  final String value;

  static LoyaltyRewardType fromString(String value) {
    return LoyaltyRewardType.values.firstWhere(
      (type) => type.value == value.toLowerCase(),
      orElse: () => LoyaltyRewardType.other,
    );
  }

  String get displayName {
    switch (this) {
      case LoyaltyRewardType.cashBonus:
        return 'Cash Bonus';
      case LoyaltyRewardType.extraLeave:
        return 'Extra Leave';
      case LoyaltyRewardType.giftVoucher:
        return 'Gift Voucher';
      case LoyaltyRewardType.training:
        return 'Training Course';
      case LoyaltyRewardType.recognition:
        return 'Recognition Award';
      case LoyaltyRewardType.merchandise:
        return 'Merchandise';
      case LoyaltyRewardType.experience:
        return 'Experience';
      case LoyaltyRewardType.other:
        return 'Other';
    }
  }
}
