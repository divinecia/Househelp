class User {
  final String id;
  final String email;
  final String? phoneNumber;
  final String fullName;
  final String userType;
  final String? profilePhotoUrl;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final UserStatus status;
  final String preferredLanguage;

  User({
    required this.id,
    required this.email,
    this.phoneNumber,
    required this.fullName,
    required this.userType,
    this.profilePhotoUrl,
    required this.createdAt,
    this.updatedAt,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    required this.status,
    required this.preferredLanguage,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      phoneNumber: json['phone_number'],
      fullName: json['full_name'],
      userType: json['user_type'],
      profilePhotoUrl: json['profile_photo_url'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
      isEmailVerified: json['is_email_verified'] ?? false,
      isPhoneVerified: json['is_phone_verified'] ?? false,
      status: UserStatus.fromString(json['status']),
      preferredLanguage: json['preferred_language'] ?? 'rw',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone_number': phoneNumber,
      'full_name': fullName,
      'user_type': userType,
      'profile_photo_url': profilePhotoUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_email_verified': isEmailVerified,
      'is_phone_verified': isPhoneVerified,
      'status': status.toString(),
      'preferred_language': preferredLanguage,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? phoneNumber,
    String? fullName,
    String? userType,
    String? profilePhotoUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isEmailVerified,
    bool? isPhoneVerified,
    UserStatus? status,
    String? preferredLanguage,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      fullName: fullName ?? this.fullName,
      userType: userType ?? this.userType,
      profilePhotoUrl: profilePhotoUrl ?? this.profilePhotoUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      status: status ?? this.status,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
    );
  }
}

enum UserStatus {
  active,
  pending,
  suspended,
  inactive;

  static UserStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'active':
        return UserStatus.active;
      case 'pending':
        return UserStatus.pending;
      case 'suspended':
        return UserStatus.suspended;
      case 'inactive':
        return UserStatus.inactive;
      default:
        return UserStatus.pending;
    }
  }

  @override
  String toString() {
    return name;
  }
}

class WorkerProfile {
  final String userId;
  final String nationalId;
  final String gender;
  final DateTime dateOfBirth;
  final String district;
  final String sector;
  final String currentAddress;
  final double? latitude;
  final double? longitude;
  final String emergencyContactName;
  final String emergencyContactPhone;
  final String emergencyContactRelationship;
  final int yearsOfExperience;
  final String? previousEmployers;
  final String? workDescription;
  final List<String> serviceCategories;
  final List<String> certifications;
  final List<String> languages;
  final List<String> availableDays;
  final String preferredHours;
  final String workFlexibility;
  final bool oneTimeJobs;
  final bool recurringJobs;
  final bool emergencyServices;
  final double maxTravelDistance;
  final String transportationMethod;
  final List<String> preferredAreas;
  final double hourlyRateMin;
  final double hourlyRateMax;
  final double dailyRateMin;
  final double dailyRateMax;
  final double? rating;
  final int reviewCount;
  final VerificationStatus verificationStatus;
  final DateTime? lastBackgroundCheck;

  WorkerProfile({
    required this.userId,
    required this.nationalId,
    required this.gender,
    required this.dateOfBirth,
    required this.district,
    required this.sector,
    required this.currentAddress,
    this.latitude,
    this.longitude,
    required this.emergencyContactName,
    required this.emergencyContactPhone,
    required this.emergencyContactRelationship,
    required this.yearsOfExperience,
    this.previousEmployers,
    this.workDescription,
    required this.serviceCategories,
    required this.certifications,
    required this.languages,
    required this.availableDays,
    required this.preferredHours,
    required this.workFlexibility,
    required this.oneTimeJobs,
    required this.recurringJobs,
    required this.emergencyServices,
    required this.maxTravelDistance,
    required this.transportationMethod,
    required this.preferredAreas,
    required this.hourlyRateMin,
    required this.hourlyRateMax,
    required this.dailyRateMin,
    required this.dailyRateMax,
    this.rating,
    required this.reviewCount,
    required this.verificationStatus,
    this.lastBackgroundCheck,
  });

  factory WorkerProfile.fromJson(Map<String, dynamic> json) {
    return WorkerProfile(
      userId: json['user_id'],
      nationalId: json['national_id'],
      gender: json['gender'],
      dateOfBirth: DateTime.parse(json['date_of_birth']),
      district: json['district'],
      sector: json['sector'],
      currentAddress: json['current_address'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      emergencyContactName: json['emergency_contact_name'],
      emergencyContactPhone: json['emergency_contact_phone'],
      emergencyContactRelationship: json['emergency_contact_relationship'],
      yearsOfExperience: json['years_of_experience'],
      previousEmployers: json['previous_employers'],
      workDescription: json['work_description'],
      serviceCategories: List<String>.from(json['service_categories'] ?? []),
      certifications: List<String>.from(json['certifications'] ?? []),
      languages: List<String>.from(json['languages'] ?? []),
      availableDays: List<String>.from(json['available_days'] ?? []),
      preferredHours: json['preferred_hours'],
      workFlexibility: json['work_flexibility'],
      oneTimeJobs: json['one_time_jobs'] ?? false,
      recurringJobs: json['recurring_jobs'] ?? false,
      emergencyServices: json['emergency_services'] ?? false,
      maxTravelDistance: json['max_travel_distance']?.toDouble() ?? 0.0,
      transportationMethod: json['transportation_method'],
      preferredAreas: List<String>.from(json['preferred_areas'] ?? []),
      hourlyRateMin: json['hourly_rate_min']?.toDouble() ?? 0.0,
      hourlyRateMax: json['hourly_rate_max']?.toDouble() ?? 0.0,
      dailyRateMin: json['daily_rate_min']?.toDouble() ?? 0.0,
      dailyRateMax: json['daily_rate_max']?.toDouble() ?? 0.0,
      rating: json['rating']?.toDouble(),
      reviewCount: json['review_count'] ?? 0,
      verificationStatus: VerificationStatus.fromString(json['verification_status']),
      lastBackgroundCheck: json['last_background_check'] != null 
          ? DateTime.parse(json['last_background_check']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'national_id': nationalId,
      'gender': gender,
      'date_of_birth': dateOfBirth.toIso8601String(),
      'district': district,
      'sector': sector,
      'current_address': currentAddress,
      'latitude': latitude,
      'longitude': longitude,
      'emergency_contact_name': emergencyContactName,
      'emergency_contact_phone': emergencyContactPhone,
      'emergency_contact_relationship': emergencyContactRelationship,
      'years_of_experience': yearsOfExperience,
      'previous_employers': previousEmployers,
      'work_description': workDescription,
      'service_categories': serviceCategories,
      'certifications': certifications,
      'languages': languages,
      'available_days': availableDays,
      'preferred_hours': preferredHours,
      'work_flexibility': workFlexibility,
      'one_time_jobs': oneTimeJobs,
      'recurring_jobs': recurringJobs,
      'emergency_services': emergencyServices,
      'max_travel_distance': maxTravelDistance,
      'transportation_method': transportationMethod,
      'preferred_areas': preferredAreas,
      'hourly_rate_min': hourlyRateMin,
      'hourly_rate_max': hourlyRateMax,
      'daily_rate_min': dailyRateMin,
      'daily_rate_max': dailyRateMax,
      'rating': rating,
      'review_count': reviewCount,
      'verification_status': verificationStatus.toString(),
      'last_background_check': lastBackgroundCheck?.toIso8601String(),
    };
  }
}

class HouseholdProfile {
  final String userId;
  final String? alternativeContact;
  final String district;
  final String sector;
  final String detailedAddress;
  final double? latitude;
  final double? longitude;
  final String? landmarkDescription;
  final String propertyType;
  final int numberOfRooms;
  final bool hasGarden;
  final bool hasParking;
  final String? specialFeatures;
  final int numberOfAdults;
  final int numberOfChildren;
  final List<int> childrenAges;
  final bool hasElderlyMembers;
  final bool hasSpecialNeedsMembers;
  final List<String> languagesSpoken;
  final String? religiousConsiderations;
  final String? dietaryRestrictions;
  final String? petInformation;
  final String smokingPolicy;
  final double? rating;
  final int reviewCount;
  final VerificationStatus verificationStatus;

  HouseholdProfile({
    required this.userId,
    this.alternativeContact,
    required this.district,
    required this.sector,
    required this.detailedAddress,
    this.latitude,
    this.longitude,
    this.landmarkDescription,
    required this.propertyType,
    required this.numberOfRooms,
    required this.hasGarden,
    required this.hasParking,
    this.specialFeatures,
    required this.numberOfAdults,
    required this.numberOfChildren,
    required this.childrenAges,
    required this.hasElderlyMembers,
    required this.hasSpecialNeedsMembers,
    required this.languagesSpoken,
    this.religiousConsiderations,
    this.dietaryRestrictions,
    this.petInformation,
    required this.smokingPolicy,
    this.rating,
    required this.reviewCount,
    required this.verificationStatus,
  });

  factory HouseholdProfile.fromJson(Map<String, dynamic> json) {
    return HouseholdProfile(
      userId: json['user_id'],
      alternativeContact: json['alternative_contact'],
      district: json['district'],
      sector: json['sector'],
      detailedAddress: json['detailed_address'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      landmarkDescription: json['landmark_description'],
      propertyType: json['property_type'],
      numberOfRooms: json['number_of_rooms'],
      hasGarden: json['has_garden'] ?? false,
      hasParking: json['has_parking'] ?? false,
      specialFeatures: json['special_features'],
      numberOfAdults: json['number_of_adults'],
      numberOfChildren: json['number_of_children'],
      childrenAges: List<int>.from(json['children_ages'] ?? []),
      hasElderlyMembers: json['has_elderly_members'] ?? false,
      hasSpecialNeedsMembers: json['has_special_needs_members'] ?? false,
      languagesSpoken: List<String>.from(json['languages_spoken'] ?? []),
      religiousConsiderations: json['religious_considerations'],
      dietaryRestrictions: json['dietary_restrictions'],
      petInformation: json['pet_information'],
      smokingPolicy: json['smoking_policy'],
      rating: json['rating']?.toDouble(),
      reviewCount: json['review_count'] ?? 0,
      verificationStatus: VerificationStatus.fromString(json['verification_status']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'alternative_contact': alternativeContact,
      'district': district,
      'sector': sector,
      'detailed_address': detailedAddress,
      'latitude': latitude,
      'longitude': longitude,
      'landmark_description': landmarkDescription,
      'property_type': propertyType,
      'number_of_rooms': numberOfRooms,
      'has_garden': hasGarden,
      'has_parking': hasParking,
      'special_features': specialFeatures,
      'number_of_adults': numberOfAdults,
      'number_of_children': numberOfChildren,
      'children_ages': childrenAges,
      'has_elderly_members': hasElderlyMembers,
      'has_special_needs_members': hasSpecialNeedsMembers,
      'languages_spoken': languagesSpoken,
      'religious_considerations': religiousConsiderations,
      'dietary_restrictions': dietaryRestrictions,
      'pet_information': petInformation,
      'smoking_policy': smokingPolicy,
      'rating': rating,
      'review_count': reviewCount,
      'verification_status': verificationStatus.toString(),
    };
  }
}

class AdminProfile {
  final String userId;
  final String employeeId;
  final String department;
  final String roleLevel;
  final List<String> accessLevels;
  final bool twoFactorEnabled;
  final DateTime lastLogin;
  final bool isActive;

  AdminProfile({
    required this.userId,
    required this.employeeId,
    required this.department,
    required this.roleLevel,
    required this.accessLevels,
    required this.twoFactorEnabled,
    required this.lastLogin,
    required this.isActive,
  });

  factory AdminProfile.fromJson(Map<String, dynamic> json) {
    return AdminProfile(
      userId: json['user_id'],
      employeeId: json['employee_id'],
      department: json['department'],
      roleLevel: json['role_level'],
      accessLevels: List<String>.from(json['access_levels'] ?? []),
      twoFactorEnabled: json['two_factor_enabled'] ?? false,
      lastLogin: DateTime.parse(json['last_login']),
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'employee_id': employeeId,
      'department': department,
      'role_level': roleLevel,
      'access_levels': accessLevels,
      'two_factor_enabled': twoFactorEnabled,
      'last_login': lastLogin.toIso8601String(),
      'is_active': isActive,
    };
  }
}

enum VerificationStatus {
  pending,
  verified,
  rejected,
  expired;

  static VerificationStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'pending':
        return VerificationStatus.pending;
      case 'verified':
        return VerificationStatus.verified;
      case 'rejected':
        return VerificationStatus.rejected;
      case 'expired':
        return VerificationStatus.expired;
      default:
        return VerificationStatus.pending;
    }
  }

  @override
  String toString() {
    return name;
  }
}