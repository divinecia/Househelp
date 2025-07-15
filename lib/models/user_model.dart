class UserModel {
  final String id;
  final String email;
  final String? phone;
  final String fullName;
  final String userType;
  final String? profilePhotoUrl;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.email,
    this.phone,
    required this.fullName,
    required this.userType,
    this.profilePhotoUrl,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      phone: json['phone'],
      fullName: json['full_name'],
      userType: json['user_type'],
      profilePhotoUrl: json['profile_photo_url'],
      isEmailVerified: json['is_email_verified'] ?? false,
      isPhoneVerified: json['is_phone_verified'] ?? false,
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'full_name': fullName,
      'user_type': userType,
      'profile_photo_url': profilePhotoUrl,
      'is_email_verified': isEmailVerified,
      'is_phone_verified': isPhoneVerified,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class WorkerModel {
  final String userId;
  final String nationalId;
  final DateTime dateOfBirth;
  final String gender;
  final String district;
  final String sector;
  final String currentAddress;
  final double? latitude;
  final double? longitude;
  final String emergencyContactName;
  final String emergencyContactPhone;
  final String emergencyContactRelationship;
  final int yearsOfExperience;
  final List<String> serviceCategories;
  final List<String> languages;
  final List<String> certifications;
  final String workingDays;
  final String preferredHours;
  final String workType; // full-time, part-time
  final bool availableForOneTime;
  final bool availableForRecurring;
  final bool availableForEmergency;
  final double maxTravelDistance;
  final String transportationMethod;
  final List<String> preferredAreas;
  final double hourlyRate;
  final double dailyRate;
  final String applicationStatus; // pending, approved, rejected
  final DateTime? approvedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  WorkerModel({
    required this.userId,
    required this.nationalId,
    required this.dateOfBirth,
    required this.gender,
    required this.district,
    required this.sector,
    required this.currentAddress,
    this.latitude,
    this.longitude,
    required this.emergencyContactName,
    required this.emergencyContactPhone,
    required this.emergencyContactRelationship,
    required this.yearsOfExperience,
    required this.serviceCategories,
    required this.languages,
    required this.certifications,
    required this.workingDays,
    required this.preferredHours,
    required this.workType,
    required this.availableForOneTime,
    required this.availableForRecurring,
    required this.availableForEmergency,
    required this.maxTravelDistance,
    required this.transportationMethod,
    required this.preferredAreas,
    required this.hourlyRate,
    required this.dailyRate,
    required this.applicationStatus,
    this.approvedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    return WorkerModel(
      userId: json['user_id'],
      nationalId: json['national_id'],
      dateOfBirth: DateTime.parse(json['date_of_birth']),
      gender: json['gender'],
      district: json['district'],
      sector: json['sector'],
      currentAddress: json['current_address'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      emergencyContactName: json['emergency_contact_name'],
      emergencyContactPhone: json['emergency_contact_phone'],
      emergencyContactRelationship: json['emergency_contact_relationship'],
      yearsOfExperience: json['years_of_experience'],
      serviceCategories: List<String>.from(json['service_categories']),
      languages: List<String>.from(json['languages']),
      certifications: List<String>.from(json['certifications']),
      workingDays: json['working_days'],
      preferredHours: json['preferred_hours'],
      workType: json['work_type'],
      availableForOneTime: json['available_for_one_time'],
      availableForRecurring: json['available_for_recurring'],
      availableForEmergency: json['available_for_emergency'],
      maxTravelDistance: json['max_travel_distance'].toDouble(),
      transportationMethod: json['transportation_method'],
      preferredAreas: List<String>.from(json['preferred_areas']),
      hourlyRate: json['hourly_rate'].toDouble(),
      dailyRate: json['daily_rate'].toDouble(),
      applicationStatus: json['application_status'],
      approvedAt: json['approved_at'] != null ? DateTime.parse(json['approved_at']) : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'national_id': nationalId,
      'date_of_birth': dateOfBirth.toIso8601String(),
      'gender': gender,
      'district': district,
      'sector': sector,
      'current_address': currentAddress,
      'latitude': latitude,
      'longitude': longitude,
      'emergency_contact_name': emergencyContactName,
      'emergency_contact_phone': emergencyContactPhone,
      'emergency_contact_relationship': emergencyContactRelationship,
      'years_of_experience': yearsOfExperience,
      'service_categories': serviceCategories,
      'languages': languages,
      'certifications': certifications,
      'working_days': workingDays,
      'preferred_hours': preferredHours,
      'work_type': workType,
      'available_for_one_time': availableForOneTime,
      'available_for_recurring': availableForRecurring,
      'available_for_emergency': availableForEmergency,
      'max_travel_distance': maxTravelDistance,
      'transportation_method': transportationMethod,
      'preferred_areas': preferredAreas,
      'hourly_rate': hourlyRate,
      'daily_rate': dailyRate,
      'application_status': applicationStatus,
      'approved_at': approvedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class HouseholdModel {
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
  final String? childrenAges;
  final bool hasElderlyMembers;
  final bool hasSpecialNeedsMembers;
  final List<String> languagesSpoken;
  final String? religiousConsiderations;
  final String? dietaryRestrictions;
  final String? petInformation;
  final String smokingPolicy;
  final List<String> primaryServicesNeeded;
  final String serviceFrequency;
  final String preferredSchedule;
  final String budgetRange;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  HouseholdModel({
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
    this.childrenAges,
    required this.hasElderlyMembers,
    required this.hasSpecialNeedsMembers,
    required this.languagesSpoken,
    this.religiousConsiderations,
    this.dietaryRestrictions,
    this.petInformation,
    required this.smokingPolicy,
    required this.primaryServicesNeeded,
    required this.serviceFrequency,
    required this.preferredSchedule,
    required this.budgetRange,
    required this.isVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HouseholdModel.fromJson(Map<String, dynamic> json) {
    return HouseholdModel(
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
      hasGarden: json['has_garden'],
      hasParking: json['has_parking'],
      specialFeatures: json['special_features'],
      numberOfAdults: json['number_of_adults'],
      numberOfChildren: json['number_of_children'],
      childrenAges: json['children_ages'],
      hasElderlyMembers: json['has_elderly_members'],
      hasSpecialNeedsMembers: json['has_special_needs_members'],
      languagesSpoken: List<String>.from(json['languages_spoken']),
      religiousConsiderations: json['religious_considerations'],
      dietaryRestrictions: json['dietary_restrictions'],
      petInformation: json['pet_information'],
      smokingPolicy: json['smoking_policy'],
      primaryServicesNeeded: List<String>.from(json['primary_services_needed']),
      serviceFrequency: json['service_frequency'],
      preferredSchedule: json['preferred_schedule'],
      budgetRange: json['budget_range'],
      isVerified: json['is_verified'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
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
      'primary_services_needed': primaryServicesNeeded,
      'service_frequency': serviceFrequency,
      'preferred_schedule': preferredSchedule,
      'budget_range': budgetRange,
      'is_verified': isVerified,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class AdminModel {
  final String userId;
  final String employeeId;
  final String department;
  final String roleLevel;
  final List<String> permissions;
  final bool twoFactorEnabled;
  final DateTime? lastLoginAt;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  AdminModel({
    required this.userId,
    required this.employeeId,
    required this.department,
    required this.roleLevel,
    required this.permissions,
    required this.twoFactorEnabled,
    this.lastLoginAt,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AdminModel.fromJson(Map<String, dynamic> json) {
    return AdminModel(
      userId: json['user_id'],
      employeeId: json['employee_id'],
      department: json['department'],
      roleLevel: json['role_level'],
      permissions: List<String>.from(json['permissions']),
      twoFactorEnabled: json['two_factor_enabled'],
      lastLoginAt: json['last_login_at'] != null ? DateTime.parse(json['last_login_at']) : null,
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'employee_id': employeeId,
      'department': department,
      'role_level': roleLevel,
      'permissions': permissions,
      'two_factor_enabled': twoFactorEnabled,
      'last_login_at': lastLoginAt?.toIso8601String(),
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}