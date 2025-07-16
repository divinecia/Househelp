class BenefitModel {
  final String id;
  final String title;
  final String description;
  final BenefitType type;
  final double? monetaryValue;
  final String? unit;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const BenefitModel({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    this.monetaryValue,
    this.unit,
    this.isActive = true,
    required this.createdAt,
    this.updatedAt,
  });

  // Factory constructor for creating from JSON
  factory BenefitModel.fromJson(Map<String, dynamic> json) {
    return BenefitModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: BenefitType.fromString(json['type'] as String),
      monetaryValue: json['monetary_value'] != null
          ? (json['monetary_value'] as num).toDouble()
          : null,
      unit: json['unit'] as String?,
      isActive: json['is_active'] as bool? ?? true,
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
      'title': title,
      'description': description,
      'type': type.value,
      'monetary_value': monetaryValue,
      'unit': unit,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  BenefitModel copyWith({
    String? id,
    String? title,
    String? description,
    BenefitType? type,
    double? monetaryValue,
    String? unit,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BenefitModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      monetaryValue: monetaryValue ?? this.monetaryValue,
      unit: unit ?? this.unit,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BenefitModel &&
        other.id == id &&
        other.title == title &&
        other.description == description &&
        other.type == type &&
        other.monetaryValue == monetaryValue &&
        other.unit == unit &&
        other.isActive == isActive &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      title,
      description,
      type,
      monetaryValue,
      unit,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  @override
  String toString() {
    return 'BenefitModel(id: $id, title: $title, description: $description, '
        'type: $type, monetaryValue: $monetaryValue, unit: $unit, '
        'isActive: $isActive, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

enum BenefitType {
  accommodation('accommodation'),
  meal('meal'),
  transportation('transportation'),
  healthcare('healthcare'),
  insurance('insurance'),
  bonus('bonus'),
  leave('leave'),
  training('training'),
  other('other');

  const BenefitType(this.value);

  final String value;

  static BenefitType fromString(String value) {
    return BenefitType.values.firstWhere(
      (type) => type.value == value.toLowerCase(),
      orElse: () => BenefitType.other,
    );
  }

  String get displayName {
    switch (this) {
      case BenefitType.accommodation:
        return 'Accommodation';
      case BenefitType.meal:
        return 'Meals';
      case BenefitType.transportation:
        return 'Transportation';
      case BenefitType.healthcare:
        return 'Healthcare';
      case BenefitType.insurance:
        return 'Insurance';
      case BenefitType.bonus:
        return 'Bonus';
      case BenefitType.leave:
        return 'Leave';
      case BenefitType.training:
        return 'Training';
      case BenefitType.other:
        return 'Other';
    }
  }
}
