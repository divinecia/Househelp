import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class LanguageSelector extends StatelessWidget {
  final String selectedLanguage;
  final void Function(String) onLanguageChanged;

  const LanguageSelector({
    super.key,
    required this.selectedLanguage,
    required this.onLanguageChanged,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      onSelected: onLanguageChanged,
      itemBuilder: (context) {
        return AppConstants.languages.map((language) {
          return PopupMenuItem<String>(
            value: language['code'],
            child: Row(
              children: [
                _buildLanguageFlag(language['code']!),
                const SizedBox(width: AppConstants.paddingSmall),
                Text(language['name']!),
                if (selectedLanguage == language['code'])
                  const Padding(
                    padding: EdgeInsets.only(left: AppConstants.paddingSmall),
                    child: Icon(
                      Icons.check,
                      size: 16,
                      color: AppConstants.primaryColor,
                    ),
                  ),
              ],
            ),
          );
        }).toList();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.paddingMedium,
          vertical: AppConstants.paddingSmall,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
          border: Border.all(
            color: AppConstants.accentColor.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildLanguageFlag(selectedLanguage),
            const SizedBox(width: AppConstants.paddingSmall),
            Text(
              _getLanguageName(selectedLanguage),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppConstants.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: AppConstants.paddingSmall),
            const Icon(
              Icons.keyboard_arrow_down,
              size: 16,
              color: AppConstants.textSecondary,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageFlag(String languageCode) {
    // Since we don't have flag assets, we'll use colored containers
    Color flagColor;
    switch (languageCode) {
      case 'rw':
        flagColor = const Color(0xFF1976D2); // Blue for Rwanda
        break;
      case 'en':
        flagColor = const Color(0xFFE91E63); // Pink for English
        break;
      case 'fr':
        flagColor = const Color(0xFF2196F3); // Blue for French
        break;
      case 'sw':
        flagColor = const Color(0xFF4CAF50); // Green for Swahili
        break;
      default:
        flagColor = AppConstants.primaryColor;
    }

    return Container(
      width: 20,
      height: 14,
      decoration: BoxDecoration(
        color: flagColor,
        borderRadius: BorderRadius.circular(2),
      ),
      child: Center(
        child: Text(
          languageCode.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 8,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  String _getLanguageName(String languageCode) {
    final language = AppConstants.languages.firstWhere(
      (lang) => lang['code'] == languageCode,
      orElse: () => {'name': 'Unknown'},
    );
    return language['name']!;
  }
}