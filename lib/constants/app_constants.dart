class AppConstants {
  // App Information
  static const String appName = 'HouseHelp Rwanda';
  static const String appTagline = 'Connecting you to trusted home services';
  static const String appVersion = '1.0.0';
  
  // User Types
  static const String userTypeWorker = 'worker';
  static const String userTypeHousehold = 'household';
  static const String userTypeAdmin = 'admin';
  
  // Service Categories
  static const List<String> serviceCategories = [
    'House Cleaning',
    'Cooking',
    'Childcare',
    'Elderly Care',
    'Gardening',
    'Laundry & Ironing',
    'General Housework',
  ];
  
  // Languages
  static const List<Map<String, String>> languages = [
    {'code': 'rw', 'name': 'Kinyarwanda'},
    {'code': 'en', 'name': 'English'},
    {'code': 'fr', 'name': 'French'},
    {'code': 'sw', 'name': 'Swahili'},
  ];
  
  // Rwanda Districts
  static const List<String> districts = [
    'Gasabo',
    'Kicukiro',
    'Nyarugenge',
    'Bugesera',
    'Gatsibo',
    'Kayonza',
    'Kirehe',
    'Ngoma',
    'Nyagatare',
    'Rwamagana',
    'Gicumbi',
    'Musanze',
    'Burera',
    'Gakenke',
    'Rulindo',
    'Karongi',
    'Rutsiro',
    'Rubavu',
    'Nyabihu',
    'Ngororero',
    'Rusizi',
    'Nyamasheke',
    'Huye',
    'Nyaruguru',
    'Gisagara',
    'Nyanza',
    'Ruhango',
    'Muhanga',
    'Kamonyi',
    'Nyamagabe',
  ];
  
  // Time Constants
  static const int splashScreenDuration = 3; // seconds
  static const int otpTimeoutDuration = 60; // seconds
  static const int autoRedirectDuration = 5; // seconds
  
  // Validation Constants
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 50;
  static const int otpLength = 6;
  
  // File Upload Constants
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  
  // API Constants
  static const String baseUrl = 'https://your-supabase-url.supabase.co';
  static const String supabaseKey = 'your-supabase-anon-key';
  
  // Storage Keys
  static const String keyUserType = 'user_type';
  static const String keyLanguage = 'language';
  static const String keyRememberMe = 'remember_me';
  static const String keyBiometricEnabled = 'biometric_enabled';
  static const String keyFirstTime = 'first_time';
  
  // Error Messages
  static const String errorNetworkConnection = 'No internet connection';
  static const String errorGeneral = 'Something went wrong. Please try again.';
  static const String errorInvalidCredentials = 'Invalid credentials';
  static const String errorAccountNotFound = 'Account not found';
  static const String errorEmailAlreadyExists = 'Email already registered';
  static const String errorPhoneAlreadyExists = 'Phone number already registered';
  static const String errorInvalidOTP = 'Invalid verification code';
  static const String errorOTPExpired = 'Code has expired';
  static const String errorTooManyAttempts = 'Too many attempts. Please try again later.';
  
  // Success Messages
  static const String successAccountCreated = 'Account created successfully!';
  static const String successPasswordUpdated = 'Password updated successfully!';
  static const String successEmailVerified = 'Email verified successfully!';
  static const String successPhoneVerified = 'Phone number verified!';
  static const String successApplicationSubmitted = 'Application submitted successfully!';
  
  // Animation Paths
  static const String animationLoading = 'assets/animations/loading.json';
  static const String animationSuccess = 'assets/animations/success.json';
  static const String animationError = 'assets/animations/error.json';
  
  // Image Paths
  static const String logoPath = 'assets/logos/househelp_logo.png';
  static const String iconWorker = 'assets/icons/worker.svg';
  static const String iconHousehold = 'assets/icons/household.svg';
  static const String iconAdmin = 'assets/icons/admin.svg';
  static const String iconCleaning = 'assets/icons/cleaning.svg';
  static const String iconHome = 'assets/icons/home.svg';
  static const String iconSettings = 'assets/icons/settings.svg';
}