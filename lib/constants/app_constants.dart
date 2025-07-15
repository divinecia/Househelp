import 'package:flutter/material.dart';

class AppConstants {
  // App Information
  static const String appName = 'HouseHelp Rwanda';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Connecting you to trusted home services';

  // Supabase Configuration
  static const String supabaseUrl = 'https://vxvegxuiefezdkzaempn.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dmVneHVpZWZlemRremFlbXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTQxOTMsImV4cCI6MjA2ODE5MDE5M30.qwzXDLkZ4ObVjtKkeZjPBQ4JwbPoxoB5TJEI7hwGi1I';

  // App Colors
  static const Color primaryColor = Color.fromARGB(255, 127, 191, 255);
  static const Color secondaryColor = Color.fromARGB(255, 76, 91, 175);
  static const Color accentColor = Color(0xFF757575);
  static const Color backgroundColor = Color(0xFFF5F5F5);
  static const Color errorColor = Color(0xFFD32F2F);
  static const Color successColor = Color(0xFF4CAF50);
  static const Color warningColor = Color(0xFFFF9800);

  // Custom Palette
  static const Color lightBlue = Color.fromRGBO(138, 165, 208, 1.0); // Light Blue
  static const Color cleanWhite = Color.fromRGBO(255, 255, 255, 1.0); // Clean White
  static const Color accentGray = Color.fromRGBO(95, 108, 126, 1.0); // Accent Gray

  // User Type Colors
  static const Color workerColor = Color.fromARGB(255, 16, 147, 255);
  static const Color householdColor = Color.fromARGB(255, 20, 55, 100);
  static const Color adminColor = Color(0xFF757575);

  // Text Colors
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textLight = Color(0xFF9E9E9E);
  static const Color textWhite = Color(0xFFFFFFFF);

  // Spacing
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;

  // Border Radius
  static const double borderRadiusSmall = 4.0;
  static const double borderRadiusMedium = 8.0;
  static const double borderRadiusLarge = 12.0;
  static const double borderRadiusXLarge = 16.0;

  // Animation Durations
  static const Duration animationDurationFast = Duration(milliseconds: 200);
  static const Duration animationDurationMedium = Duration(milliseconds: 300);
  static const Duration animationDurationSlow = Duration(milliseconds: 500);

  // OTP Configuration
  static const int otpLength = 6;
  static const int otpTimeout = 60;

  // Image Paths
  static const String logoPath = 'assets/logos/app_logo.png';
  static const String cleaningIconPath = 'assets/icons/cleaning.png';
  static const String homeIconPath = 'assets/icons/home.png';
  static const String settingsIconPath = 'assets/icons/settings.png';

  // Animation Paths
  static const String loadingAnimationPath = 'assets/animations/loading.json';
  static const String successAnimationPath = 'assets/animations/success.json';

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

  // Districts (Rwanda)
  static const List<String> districts = [
    'Kigali',
    'Nyarugenge',
    'Gasabo',
    'Kicukiro',
    'Musanze',
    'Rubavu',
    'Nyabihu',
    'Ngororero',
    'Rusizi',
    'Nyamasheke',
    'Karongi',
    'Rutsiro',
    'Karongi',
    'Muhanga',
    'Ruhango',
    'Nyanza',
    'Huye',
    'Nyamagabe',
    'Gisagara',
    'Nyaruguru',
    'Burera',
    'Gicumbi',
    'Rulindo',
    'Gakenke',
    'Rwamagana',
    'Nyagatare',
    'Gatsibo',
    'Kayonza',
    'Kirehe',
    'Ngoma',
    'Bugesera',
  ];

  // User Types
  static const String userTypeWorker = 'worker';
  static const String userTypeHousehold = 'household';
  static const String userTypeAdmin = 'admin';

  // Validation Messages
  static const String fieldRequiredMessage = 'This field is required';
  static const String invalidEmailMessage = 'Please enter a valid email';
  static const String invalidPhoneMessage = 'Please enter a valid phone number';
  static const String passwordTooShortMessage =
      'Password must be at least 8 characters';
  static const String passwordMismatchMessage = 'Passwords do not match';

  // Success Messages
  static const String registrationSuccessMessage = 'Registration successful!';
  static const String loginSuccessMessage = 'Login successful!';
  static const String otpSentMessage = 'OTP sent successfully';
  static const String phoneVerifiedMessage =
      'Phone number verified successfully';
  static const String emailVerifiedMessage = 'Email verified successfully';

  // Error Messages
  static const String genericErrorMessage =
      'Something went wrong. Please try again.';
  static const String networkErrorMessage =
      'Network error. Please check your connection.';
  static const String invalidCredentialsMessage =
      'Invalid credentials. Please try again.';
  static const String userNotFoundMessage = 'User not found.';
  static const String userExistsMessage =
      'User already exists with this email/phone.';
  static const String invalidOtpMessage = 'Invalid OTP. Please try again.';
  static const String otpExpiredMessage =
      'OTP has expired. Please request a new one.';

  // Time Constants
  static const int splashDurationSeconds = 3;
  static const int sessionTimeoutMinutes = 30;

  // File Upload
  static const int maxFileSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx'];
}
