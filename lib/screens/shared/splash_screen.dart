import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lottie/lottie.dart';
import '../../constants/app_constants.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _logoAnimation;
  late Animation<double> _taglineAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _handleNavigation();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _logoAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );

    _taglineAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.4, 1.0, curve: Curves.easeInOut),
      ),
    );

    _animationController.forward();
  }

  void _handleNavigation() {
    Future.delayed(
      const Duration(seconds: AppConstants.splashDurationSeconds),
      () {
        if (mounted) {
          final authProvider = Provider.of<AuthProvider>(
            context,
            listen: false,
          );

          // Wait for auth provider to initialize
          if (!authProvider.isInitialized) {
            // Listen for initialization completion
            authProvider.addListener(_onAuthInitialized);
          } else {
            _navigateToNextScreen();
          }
        }
      },
    );
  }

  void _onAuthInitialized() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.isInitialized) {
      authProvider.removeListener(_onAuthInitialized);
      _navigateToNextScreen();
    }
  }

  void _navigateToNextScreen() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (authProvider.isAuthenticated) {
      final userType = authProvider.getUserType();
      NavigationHelper.goToDashboard(
        context,
        userType ?? AppConstants.userTypeWorker,
      );
    } else {
      NavigationHelper.goToWelcome(context);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppConstants.primaryColor,
      body: SafeArea(
        child: Container(
          width: size.width,
          height: size.height,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [AppConstants.primaryColor, AppConstants.secondaryColor],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo section
              Expanded(
                flex: 3,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // App Logo
                    AnimatedBuilder(
                      animation: _logoAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _logoAnimation.value,
                          child: Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(
                                AppConstants.borderRadiusXLarge,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(
                                    Colors.black.red,
                                    Colors.black.green,
                                    Colors.black.blue,
                                    (0.2 * 255).round(),
                                  ),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.home_work_rounded,
                                size: 60,
                                color: AppConstants.primaryColor,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: AppConstants.paddingLarge),

                    // App Name
                    AnimatedBuilder(
                      animation: _logoAnimation,
                      builder: (context, child) {
                        return Opacity(
                          opacity: _logoAnimation.value,
                          child: Text(
                            AppConstants.appName,
                            style: Theme.of(context).textTheme.headlineMedium
                                ?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.5,
                                ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // Loading animation
              Expanded(
                flex: 2,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Loading animation
                    SizedBox(
                      width: 80,
                      height: 80,
                      child: Lottie.asset(
                        AppConstants.loadingAnimationPath,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return const CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: AppConstants.paddingLarge),

                    // Tagline
                    AnimatedBuilder(
                      animation: _taglineAnimation,
                      builder: (context, child) {
                        return Opacity(
                          opacity: _taglineAnimation.value,
                          child: Text(
                            AppConstants.appTagline,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(
                                  color: Color.fromARGB(
                                    (0.9 * 255).round(),
                                    Colors.white.red,
                                    Colors.white.green,
                                    Colors.white.blue,
                                  ),
                                  fontWeight: FontWeight.w500,
                                ),
                            textAlign: TextAlign.center,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // Version and footer
              Expanded(
                flex: 1,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    // Version number
                    Text(
                      'Version ${AppConstants.appVersion}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Color.fromARGB(
                          (0.7 * 255).round(),
                          Colors.white.red,
                          Colors.white.green,
                          Colors.white.blue,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppConstants.paddingSmall),

                    // Copyright
                    Text(
                      '© 2024 HouseHelp Rwanda',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Color.fromARGB(
                          (0.6 * 255).round(),
                          Colors.white.red,
                          Colors.white.green,
                          Colors.white.blue,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppConstants.paddingLarge),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
