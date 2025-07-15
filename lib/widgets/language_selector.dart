import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class LanguageSelector extends StatelessWidget {
  final String selectedLanguage;
  final Function(String) onLanguageChanged;

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
        color: AppConstants.backgroundColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        border: Border.all(
          color: AppConstants.textWhite.withOpacity(0.3),
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedLanguage,
          onChanged: (String? newValue) {
            if (newValue != null) {
              onLanguageChanged(newValue);
            }
          },
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppConstants.textWhite,
          ),
          dropdownColor: AppConstants.primaryColor,
          icon: const Icon(
            Icons.keyboard_arrow_down,
            color: AppConstants.textWhite,
          ),
          items: AppConstants.languages.map<DropdownMenuItem<String>>((lang) {
            return DropdownMenuItem<String>(
              value: lang['code'],
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _getLanguageFlag(lang['code']!),
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(width: AppConstants.paddingSmall),
                  Text(
                    lang['name']!,
                    style: const TextStyle(
                      color: AppConstants.textWhite,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  String _getLanguageFlag(String languageCode) {
    switch (languageCode) {
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