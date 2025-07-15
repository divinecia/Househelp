import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../providers/language_provider.dart';
import '../widgets/user_type_card.dart';
import '../widgets/language_selector.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimation();
  }

  void _initializeAnimation() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _navigateToRegistration(String userType) {
    switch (userType) {
      case AppConstants.userTypeWorker:
        context.go('/worker-registration?step=1');
        break;
      case AppConstants.userTypeHousehold:
        context.go('/household-registration?step=1');
        break;
      case AppConstants.userTypeAdmin:
        context.go('/admin-registration');
        break;
    }
  }

  void _navigateToLogin(String userType) {
    context.go('/login?userType=$userType');
  }

  void _continueAsGuest() {
    // Show guest mode dialog or navigate to limited features
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Browse as Guest'),
          content: const Text(
            'As a guest, you can browse available services but cannot book or register as a worker. Would you like to continue?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Navigate to guest browse mode
                context.go('/home');
              },
              child: const Text('Continue'),
            ),
          ],
        );
      },
    );
  }

  void _showTermsAndPrivacy() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.borderMedium,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Terms & Privacy',
                style: AppTheme.headingMedium,
              ),
              const SizedBox(height: 20),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Terms of Service',
                        style: AppTheme.headingSmall,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'By using HouseHelp Rwanda, you agree to our terms of service...',
                        style: AppTheme.bodyMedium,
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Privacy Policy',
                        style: AppTheme.headingSmall,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Your privacy is important to us. This policy explains how we collect, use, and protect your information...',
                        style: AppTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundPrimary,
      body: SafeArea(
        child: Stack(
          children: [
            // Background gradient
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFFF8FAFC),
                    Color(0xFFF1F5F9),
                  ],
                ),
              ),
            ),
            
            // Language selector in top-right
            Positioned(
              top: 16,
              right: 16,
              child: const LanguageSelector(),
            ),
            
            // Main content
            FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      const SizedBox(height: 40),
                      
                      // Welcome header
                      Column(
                        children: [
                          // App logo
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withOpacity(0.2),
                                  blurRadius: 15,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.home_work_outlined,
                              size: 40,
                              color: Colors.white,
                            ),
                          ),
                          
                          const SizedBox(height: 24),
                          
                          Text(
                            'Welcome to ${AppConstants.appName}',
                            style: AppTheme.headingLarge.copyWith(
                              color: AppTheme.textPrimary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          
                          const SizedBox(height: 8),
                          
                          Text(
                            AppConstants.appTagline,
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppTheme.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 48),
                      
                      // User type selection
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              'Choose your account type',
                              style: AppTheme.headingMedium.copyWith(
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // User type cards
                            Expanded(
                              child: Column(
                                children: [
                                  UserTypeCard(
                                    title: "I'm Looking for Work",
                                    subtitle: 'Register as a professional worker',
                                    icon: Icons.work_outline,
                                    color: AppTheme.workerColor,
                                    onTap: () => _navigateToRegistration(AppConstants.userTypeWorker),
                                    onLoginTap: () => _navigateToLogin(AppConstants.userTypeWorker),
                                  ),
                                  
                                  const SizedBox(height: 16),
                                  
                                  UserTypeCard(
                                    title: 'I Need Help at Home',
                                    subtitle: 'Find trusted home services',
                                    icon: Icons.home_outlined,
                                    color: AppTheme.householdColor,
                                    onTap: () => _navigateToRegistration(AppConstants.userTypeHousehold),
                                    onLoginTap: () => _navigateToLogin(AppConstants.userTypeHousehold),
                                  ),
                                  
                                  const SizedBox(height: 16),
                                  
                                  UserTypeCard(
                                    title: 'Admin Access',
                                    subtitle: 'Administrative portal',
                                    icon: Icons.admin_panel_settings_outlined,
                                    color: AppTheme.adminColor,
                                    onTap: () => _navigateToRegistration(AppConstants.userTypeAdmin),
                                    onLoginTap: () => _navigateToLogin(AppConstants.userTypeAdmin),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      // Continue as guest
                      const SizedBox(height: 24),
                      
                      OutlinedButton(
                        onPressed: _continueAsGuest,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppTheme.borderMedium),
                          foregroundColor: AppTheme.textSecondary,
                        ),
                        child: const Text('Continue as Guest'),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Terms and privacy
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton(
                            onPressed: _showTermsAndPrivacy,
                            child: Text(
                              'Terms & Privacy',
                              style: AppTheme.bodySmall.copyWith(
                                color: AppTheme.textMuted,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}