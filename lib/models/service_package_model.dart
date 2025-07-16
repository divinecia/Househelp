class ServicePackageModel {
  final String id;
  final String name;
  final String description;
  final PackageType type;
  final double price;
  final PricingModel pricingModel;
  final Duration duration;
  final List<ServiceItem> services;
  final List<String> inclusions;
  final List<String> exclusions;
  final PackageCategory category;
  final int maxHours;
  final int minHours;
  final bool isActive;
  final bool isPopular;
  final bool isCustomizable;
  final double? discountPercentage;
  final DateTime? validFrom;
  final DateTime? validUntil;
  final List<String> targetAudience;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const ServicePackageModel({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.price,
    required this.pricingModel,
    required this.duration,
    required this.services,
    this.inclusions = const [],
    this.exclusions = const [],
    required this.category,
    this.maxHours = 8,
    this.minHours = 2,
    this.isActive = true,
    this.isPopular = false,
    this.isCustomizable = false,
    this.discountPercentage,
    this.validFrom,
    this.validUntil,
    this.targetAudience = const [],
    this.metadata = const {},
    required this.createdAt,
    this.updatedAt,
  });

  // Factory constructor for creating from JSON
  factory ServicePackageModel.fromJson(Map<String, dynamic> json) {
    return ServicePackageModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      type: PackageType.fromString(json['type'] as String),
      price: (json['price'] as num).toDouble(),
      pricingModel: PricingModel.fromString(json['pricing_model'] as String),
      duration: Duration(hours: json['duration_hours'] as int),
      services: (json['services'] as List<dynamic>)
          .map((e) => ServiceItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      inclusions: (json['inclusions'] as List<dynamic>?)?.cast<String>() ?? [],
      exclusions: (json['exclusions'] as List<dynamic>?)?.cast<String>() ?? [],
      category: PackageCategory.fromString(json['category'] as String),
      maxHours: json['max_hours'] as int? ?? 8,
      minHours: json['min_hours'] as int? ?? 2,
      isActive: json['is_active'] as bool? ?? true,
      isPopular: json['is_popular'] as bool? ?? false,
      isCustomizable: json['is_customizable'] as bool? ?? false,
      discountPercentage: json['discount_percentage'] != null
          ? (json['discount_percentage'] as num).toDouble()
          : null,
      validFrom: json['valid_from'] != null
          ? DateTime.parse(json['valid_from'] as String)
          : null,
      validUntil: json['valid_until'] != null
          ? DateTime.parse(json['valid_until'] as String)
          : null,
      targetAudience:
          (json['target_audience'] as List<dynamic>?)?.cast<String>() ?? [],
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
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
      'name': name,
      'description': description,
      'type': type.value,
      'price': price,
      'pricing_model': pricingModel.value,
      'duration_hours': duration.inHours,
      'services': services.map((e) => e.toJson()).toList(),
      'inclusions': inclusions,
      'exclusions': exclusions,
      'category': category.value,
      'max_hours': maxHours,
      'min_hours': minHours,
      'is_active': isActive,
      'is_popular': isPopular,
      'is_customizable': isCustomizable,
      'discount_percentage': discountPercentage,
      'valid_from': validFrom?.toIso8601String(),
      'valid_until': validUntil?.toIso8601String(),
      'target_audience': targetAudience,
      'metadata': metadata,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  ServicePackageModel copyWith({
    String? id,
    String? name,
    String? description,
    PackageType? type,
    double? price,
    PricingModel? pricingModel,
    Duration? duration,
    List<ServiceItem>? services,
    List<String>? inclusions,
    List<String>? exclusions,
    PackageCategory? category,
    int? maxHours,
    int? minHours,
    bool? isActive,
    bool? isPopular,
    bool? isCustomizable,
    double? discountPercentage,
    DateTime? validFrom,
    DateTime? validUntil,
    List<String>? targetAudience,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ServicePackageModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      price: price ?? this.price,
      pricingModel: pricingModel ?? this.pricingModel,
      duration: duration ?? this.duration,
      services: services ?? this.services,
      inclusions: inclusions ?? this.inclusions,
      exclusions: exclusions ?? this.exclusions,
      category: category ?? this.category,
      maxHours: maxHours ?? this.maxHours,
      minHours: minHours ?? this.minHours,
      isActive: isActive ?? this.isActive,
      isPopular: isPopular ?? this.isPopular,
      isCustomizable: isCustomizable ?? this.isCustomizable,
      discountPercentage: discountPercentage ?? this.discountPercentage,
      validFrom: validFrom ?? this.validFrom,
      validUntil: validUntil ?? this.validUntil,
      targetAudience: targetAudience ?? this.targetAudience,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Calculate discounted price
  double get discountedPrice {
    if (discountPercentage != null) {
      return price * (1 - discountPercentage! / 100);
    }
    return price;
  }

  // Calculate price per hour
  double get pricePerHour {
    return discountedPrice / duration.inHours;
  }

  // Check if package is currently valid
  bool get isCurrentlyValid {
    final now = DateTime.now();
    if (validFrom != null && now.isBefore(validFrom!)) return false;
    if (validUntil != null && now.isAfter(validUntil!)) return false;
    return isActive;
  }

  // Get savings amount if discounted
  double get savingsAmount {
    if (discountPercentage != null) {
      return price - discountedPrice;
    }
    return 0.0;
  }

  // Check if package has essential services
  bool get hasEssentialServices {
    return services.any((service) => service.isEssential);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ServicePackageModel &&
        other.id == id &&
        other.name == name &&
        other.type == type &&
        other.price == price &&
        other.pricingModel == pricingModel &&
        other.category == category;
  }

  @override
  int get hashCode {
    return Object.hash(id, name, type, price, pricingModel, category);
  }

  @override
  String toString() {
    return 'ServicePackageModel(id: $id, name: $name, type: $type, '
        'price: $price, category: $category)';
  }
}

class ServiceItem {
  final String id;
  final String name;
  final String description;
  final ServiceType serviceType;
  final Duration estimatedDuration;
  final bool isEssential;
  final bool isOptional;
  final double? additionalCost;
  final List<String> requirements;
  final Map<String, dynamic> specifications;

  const ServiceItem({
    required this.id,
    required this.name,
    required this.description,
    required this.serviceType,
    required this.estimatedDuration,
    this.isEssential = false,
    this.isOptional = false,
    this.additionalCost,
    this.requirements = const [],
    this.specifications = const {},
  });

  factory ServiceItem.fromJson(Map<String, dynamic> json) {
    return ServiceItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      serviceType: ServiceType.fromString(json['service_type'] as String),
      estimatedDuration: Duration(
        minutes: json['estimated_duration_minutes'] as int,
      ),
      isEssential: json['is_essential'] as bool? ?? false,
      isOptional: json['is_optional'] as bool? ?? false,
      additionalCost: json['additional_cost'] != null
          ? (json['additional_cost'] as num).toDouble()
          : null,
      requirements:
          (json['requirements'] as List<dynamic>?)?.cast<String>() ?? [],
      specifications: json['specifications'] as Map<String, dynamic>? ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'service_type': serviceType.value,
      'estimated_duration_minutes': estimatedDuration.inMinutes,
      'is_essential': isEssential,
      'is_optional': isOptional,
      'additional_cost': additionalCost,
      'requirements': requirements,
      'specifications': specifications,
    };
  }
}

enum PackageType {
  basic('basic'),
  standard('standard'),
  premium('premium'),
  custom('custom'),
  trial('trial');

  const PackageType(this.value);

  final String value;

  static PackageType fromString(String value) {
    return PackageType.values.firstWhere(
      (type) => type.value == value.toLowerCase(),
      orElse: () => PackageType.basic,
    );
  }

  String get displayName {
    switch (this) {
      case PackageType.basic:
        return 'Basic';
      case PackageType.standard:
        return 'Standard';
      case PackageType.premium:
        return 'Premium';
      case PackageType.custom:
        return 'Custom';
      case PackageType.trial:
        return 'Trial';
    }
  }
}

enum PricingModel {
  fixed('fixed'),
  hourly('hourly'),
  daily('daily'),
  weekly('weekly'),
  monthly('monthly'),
  perService('per_service');

  const PricingModel(this.value);

  final String value;

  static PricingModel fromString(String value) {
    return PricingModel.values.firstWhere(
      (model) => model.value == value.toLowerCase(),
      orElse: () => PricingModel.fixed,
    );
  }

  String get displayName {
    switch (this) {
      case PricingModel.fixed:
        return 'Fixed Price';
      case PricingModel.hourly:
        return 'Per Hour';
      case PricingModel.daily:
        return 'Per Day';
      case PricingModel.weekly:
        return 'Per Week';
      case PricingModel.monthly:
        return 'Per Month';
      case PricingModel.perService:
        return 'Per Service';
    }
  }
}

enum PackageCategory {
  houseCleaning('house_cleaning'),
  cooking('cooking'),
  childcare('childcare'),
  eldercare('eldercare'),
  petcare('petcare'),
  gardening('gardening'),
  laundry('laundry'),
  maintenance('maintenance'),
  comprehensive('comprehensive'),
  specialized('specialized');

  const PackageCategory(this.value);

  final String value;

  static PackageCategory fromString(String value) {
    return PackageCategory.values.firstWhere(
      (category) => category.value == value.toLowerCase(),
      orElse: () => PackageCategory.houseCleaning,
    );
  }

  String get displayName {
    switch (this) {
      case PackageCategory.houseCleaning:
        return 'House Cleaning';
      case PackageCategory.cooking:
        return 'Cooking';
      case PackageCategory.childcare:
        return 'Childcare';
      case PackageCategory.eldercare:
        return 'Elder Care';
      case PackageCategory.petcare:
        return 'Pet Care';
      case PackageCategory.gardening:
        return 'Gardening';
      case PackageCategory.laundry:
        return 'Laundry';
      case PackageCategory.maintenance:
        return 'Maintenance';
      case PackageCategory.comprehensive:
        return 'Comprehensive';
      case PackageCategory.specialized:
        return 'Specialized';
    }
  }
}

enum ServiceType {
  cleaning('cleaning'),
  cooking('cooking'),
  babysitting('babysitting'),
  eldercare('eldercare'),
  petSitting('pet_sitting'),
  gardening('gardening'),
  laundry('laundry'),
  ironing('ironing'),
  shopping('shopping'),
  organization('organization'),
  maintenance('maintenance'),
  other('other');

  const ServiceType(this.value);

  final String value;

  static ServiceType fromString(String value) {
    return ServiceType.values.firstWhere(
      (type) => type.value == value.toLowerCase(),
      orElse: () => ServiceType.other,
    );
  }

  String get displayName {
    switch (this) {
      case ServiceType.cleaning:
        return 'Cleaning';
      case ServiceType.cooking:
        return 'Cooking';
      case ServiceType.babysitting:
        return 'Babysitting';
      case ServiceType.eldercare:
        return 'Elder Care';
      case ServiceType.petSitting:
        return 'Pet Sitting';
      case ServiceType.gardening:
        return 'Gardening';
      case ServiceType.laundry:
        return 'Laundry';
      case ServiceType.ironing:
        return 'Ironing';
      case ServiceType.shopping:
        return 'Shopping';
      case ServiceType.organization:
        return 'Organization';
      case ServiceType.maintenance:
        return 'Maintenance';
      case ServiceType.other:
        return 'Other';
    }
  }
}
