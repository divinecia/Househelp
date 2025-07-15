import 'package:flutter/material.dart';

class AppColors {
  // Primary color palette
  static const Color lightBlue = Color.fromRGBO(138, 165, 208, 1.0); // For secondary elements
  static const Color cleanWhite = Color.fromRGBO(255, 255, 255, 1.0); // For backgrounds and text contrast
  static const Color accentGray = Color.fromRGBO(95, 108, 126, 1.0); // For subtle text and UI elements
  
  // Additional colors for better UI design
  static const Color darkBlue = Color.fromRGBO(108, 135, 178, 1.0); // Darker shade of light blue
  static const Color lightGray = Color.fromRGBO(125, 138, 156, 1.0); // Lighter shade of accent gray
  static const Color backgroundGray = Color.fromRGBO(248, 249, 250, 1.0); // Very light gray for backgrounds
  
  // Text colors
  static const Color primaryText = accentGray;
  static const Color secondaryText = Color.fromRGBO(125, 138, 156, 1.0);
  static const Color whiteText = cleanWhite;
  
  // Status colors
  static const Color success = Color.fromRGBO(76, 175, 80, 1.0);
  static const Color error = Color.fromRGBO(244, 67, 54, 1.0);
  static const Color warning = Color.fromRGBO(255, 193, 7, 1.0);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.lightBlue,
        brightness: Brightness.light,
        primary: AppColors.lightBlue,
        secondary: AppColors.accentGray,
        surface: AppColors.cleanWhite,
        onPrimary: AppColors.cleanWhite,
        onSecondary: AppColors.cleanWhite,
        onSurface: AppColors.primaryText,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.lightBlue,
        foregroundColor: AppColors.cleanWhite,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: AppColors.cleanWhite,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.lightBlue,
          foregroundColor: AppColors.cleanWhite,
          elevation: 2,
          padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textTheme: TextTheme(
        headlineLarge: TextStyle(
          color: AppColors.primaryText,
          fontSize: 32,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: AppColors.primaryText,
          fontSize: 28,
          fontWeight: FontWeight.w600,
        ),
        titleLarge: TextStyle(
          color: AppColors.primaryText,
          fontSize: 22,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: AppColors.primaryText,
          fontSize: 16,
          fontWeight: FontWeight.normal,
        ),
        bodyMedium: TextStyle(
          color: AppColors.secondaryText,
          fontSize: 14,
          fontWeight: FontWeight.normal,
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.lightBlue,
        foregroundColor: AppColors.cleanWhite,
        elevation: 4,
      ),
      cardTheme: CardThemeData(
        color: AppColors.cleanWhite,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      scaffoldBackgroundColor: AppColors.backgroundGray,
    );
  }
}