import 'package:flutter/material.dart';
import '../services/storage_service.dart';
import '../constants/app_constants.dart';

class LanguageProvider with ChangeNotifier {
  final StorageService _storageService = StorageService();
  
  Locale _locale = const Locale('rw', 'RW'); // Default to Kinyarwanda
  String _selectedLanguage = 'rw';

  Locale get locale => _locale;
  String get selectedLanguage => _selectedLanguage;

  // Initialize language from storage
  Future<void> initialize() async {
    final savedLanguage = _storageService.getLanguage();
    if (savedLanguage != null) {
      _selectedLanguage = savedLanguage;
      _locale = _getLocaleFromLanguageCode(savedLanguage);
    }
    notifyListeners();
  }

  // Change language
  Future<void> changeLanguage(String languageCode) async {
    _selectedLanguage = languageCode;
    _locale = _getLocaleFromLanguageCode(languageCode);
    await _storageService.setLanguage(languageCode);
    notifyListeners();
  }

  // Get locale from language code
  Locale _getLocaleFromLanguageCode(String languageCode) {
    switch (languageCode) {
      case 'en':
        return const Locale('en', 'US');
      case 'rw':
        return const Locale('rw', 'RW');
      case 'fr':
        return const Locale('fr', 'FR');
      case 'sw':
        return const Locale('sw', 'KE');
      default:
        return const Locale('rw', 'RW');
    }
  }

  // Get language name
  String getLanguageName(String languageCode) {
    final language = AppConstants.languages.firstWhere(
      (lang) => lang['code'] == languageCode,
      orElse: () => {'code': 'rw', 'name': 'Kinyarwanda'},
    );
    return language['name'] ?? 'Kinyarwanda';
  }

  // Get available languages
  List<Map<String, String>> get availableLanguages => AppConstants.languages;

  // Check if language is RTL
  bool get isRTL => false; // None of the supported languages are RTL
}