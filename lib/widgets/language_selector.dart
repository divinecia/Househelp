import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class LanguageSelector extends StatelessWidget {
  final String selectedLanguage;
  final ValueChanged<String> onLanguageChanged;

  const LanguageSelector({
    super.key,
    required this.selectedLanguage,
    required this.onLanguageChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConstants.paddingMedium,
        vertical: AppConstants.paddingSmall,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
      ),
      child: DropdownButton<String>(
        value: selectedLanguage,
        onChanged: (String? newValue) {
          if (newValue != null) {
            onLanguageChanged(newValue);
          }
        },
        underline: Container(),
        icon: const Icon(
          Icons.keyboard_arrow_down,
          color: Colors.white,
          size: 18,
        ),
        dropdownColor: AppConstants.primaryColor,
        items: AppConstants.languages.map<DropdownMenuItem<String>>((language) {
          return DropdownMenuItem<String>(
            value: language['code'],
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _getLanguageFlag(language['code']!),
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(width: AppConstants.paddingSmall),
                Text(
                  language['name']!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  String _getLanguageFlag(String code) {
    switch (code) {
      case 'rw':
        return '🇷🇼';
      case 'en':
        return '🇺🇸';
      case 'fr':
        return '🇫🇷';
      case 'sw':
        return '🇹🇿';
      default:
        return '🌍';
    }
  }
}
