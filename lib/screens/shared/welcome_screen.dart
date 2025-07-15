import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';
import '../../utils/app_router.dart';
import '../../widgets/user_type_card.dart';
import '../../widgets/language_selector.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _headerAnimation;
  late Animation<double> _cardsAnimation;
  late Animation<double> _footerAnimation;
  String _selectedLanguage = 'rw';

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _headerAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
      ),
    );

    _cardsAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.3, 0.8, curve: Curves.easeOut),
      ),
    );

    _footerAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOut),
      ),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onUserTypeSelected(String userType) {
    NavigationHelper.goToRegistration(context, userType);
  }

  void _onLanguageChanged(String languageCode) {
    setState(() {
      _selectedLanguage = languageCode;
    });
    // TODO: Implement language switching logic
  }

  void _onContinueAsGuest() {
    // TODO: Implement guest mode navigation
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Guest Mode'),
        content: const Text(
          'Guest mode is not yet implemented. Please register or login to continue.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showLoginDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Login'),
        content: const Text('Which type of user are you?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              NavigationHelper.goToLogin(
                context,
                userType: AppConstants.userTypeWorker,
              );
            },
            child: const Text('Worker'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              NavigationHelper.goToLogin(
                context,
                userType: AppConstants.userTypeHousehold,
              );
            },
            child: const Text('Household'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              NavigationHelper.goToLogin(
                context,
                userType: AppConstants.userTypeAdmin,
              );
            },
            child: const Text('Admin'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppConstants.surfaceColor,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            width: size.width,
            constraints: BoxConstraints(minHeight: size.height),
            padding: const EdgeInsets.all(AppConstants.paddingLarge),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Header with language selector
                AnimatedBuilder(
                  animation: _headerAnimation,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(0, 50 * (1 - _headerAnimation.value)),
                      child: Opacity(
                        opacity: _headerAnimation.value,
                        child: _buildHeader(),
                      ),
                    );
                  },
                ),

                const SizedBox(height: AppConstants.paddingXLarge),

                // Welcome message
                AnimatedBuilder(
                  animation: _headerAnimation,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _headerAnimation.value,
                      child: _buildWelcomeMessage(),
                    );
                  },
                ),

                const SizedBox(height: AppConstants.paddingXLarge),

                // User type selection cards
                AnimatedBuilder(
                  animation: _cardsAnimation,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(0, 30 * (1 - _cardsAnimation.value)),
                      child: Opacity(
                        opacity: _cardsAnimation.value,
                        child: _buildUserTypeCards(),
                      ),
                    );
                  },
                ),

                const SizedBox(height: AppConstants.paddingXLarge),

                // Footer with guest mode and login
                AnimatedBuilder(
                  animation: _footerAnimation,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _footerAnimation.value,
                      child: _buildFooter(),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // App Logo
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: AppConstants.primaryColor,
            borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
          ),
          child: const Icon(
            Icons.home_work_rounded,
            color: AppConstants.textWhite,
            size: 30,
          ),
        ),

        // Language Selector
        LanguageSelector(
          selectedLanguage: _selectedLanguage,
          onLanguageChanged: _onLanguageChanged,
        ),
      ],
    );
  }

  Widget _buildWelcomeMessage() {
    return Column(
      children: [
        Text(
          'Welcome to',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppConstants.textSecondary,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: AppConstants.paddingSmall),
        Text(
          AppConstants.appName,
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            color: AppConstants.primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppConstants.paddingMedium),
        Text(
          AppConstants.appTagline,
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: AppConstants.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildUserTypeCards() {
    return Column(
      children: [
        Text(
          'Who are you?',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppConstants.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppConstants.paddingLarge),

        // Worker Card
        UserTypeCard(
          title: 'I\'m Looking for Work',
          subtitle: 'Join as a professional worker',
          icon: Icons.work_outline,
          color: AppConstants.workerColor,
          onTap: () => _onUserTypeSelected(AppConstants.userTypeWorker),
        ),

        const SizedBox(height: AppConstants.paddingMedium),

        // Household Card
        UserTypeCard(
          title: 'I Need Help at Home',
          subtitle: 'Find trusted home services',
          icon: Icons.home_outlined,
          color: AppConstants.householdColor,
          onTap: () => _onUserTypeSelected(AppConstants.userTypeHousehold),
        ),

        const SizedBox(height: AppConstants.paddingMedium),

        // Admin Card
        UserTypeCard(
          title: 'Admin Access',
          subtitle: 'Administrative portal',
          icon: Icons.admin_panel_settings_outlined,
          color: AppConstants.adminColor,
          onTap: () => _onUserTypeSelected(AppConstants.userTypeAdmin),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Column(
      children: [
        // Continue as Guest
        TextButton(
          onPressed: _onContinueAsGuest,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.visibility_outlined, size: 18),
              const SizedBox(width: AppConstants.paddingSmall),
              Text(
                'Continue as Guest',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppConstants.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppConstants.paddingMedium),

        // Already have account
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Already have an account? ',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppConstants.textSecondary,
              ),
            ),
            TextButton(onPressed: _showLoginDialog, child: const Text('Login')),
          ],
        ),

        const SizedBox(height: AppConstants.paddingLarge),

        // Terms and Privacy
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () {
                // TODO: Navigate to terms
              },
              child: const Text('Terms of Service'),
            ),
            const Text(' • '),
            TextButton(
              onPressed: () {
                // TODO: Navigate to privacy
              },
              child: const Text('Privacy Policy'),
            ),
          ],
        ),
      ],
    );
  }
}