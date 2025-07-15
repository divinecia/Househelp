import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/shared/splash_screen.dart';
import '../screens/shared/welcome_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/otp_request_screen.dart';
import '../screens/auth/otp_verification_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/worker_registration_screen.dart';
import '../screens/auth/household_registration_screen.dart';
import '../screens/auth/admin_registration_screen.dart';
import '../screens/worker/worker_dashboard.dart';
import '../screens/household/household_dashboard.dart';
import '../screens/admin/admin_dashboard.dart';
import '../constants/app_constants.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  
  static GoRouter createRouter() {
    return GoRouter(
      navigatorKey: _rootNavigatorKey,
      initialLocation: '/',
      redirect: (context, state) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final isAuthenticated = authProvider.isAuthenticated;
        final isInitialized = authProvider.isInitialized;
        
        // Show splash screen while initializing
        if (!isInitialized) {
          return '/';
        }
        
        // If user is not authenticated, redirect to welcome screen
        if (!isAuthenticated) {
          // Allow access to auth-related screens
          if (state.fullPath?.startsWith('/auth/') == true ||
              state.fullPath == '/welcome') {
            return null;
          }
          return '/welcome';
        }
        
        // If user is authenticated, redirect to appropriate dashboard
        if (isAuthenticated) {
          final userType = authProvider.getUserType();
          
          // Don't redirect if already on the correct dashboard
          if (state.fullPath?.startsWith('/dashboard/') == true) {
            return null;
          }
          
          // Don't redirect if on auth screens (user might be completing profile)
          if (state.fullPath?.startsWith('/auth/') == true) {
            return null;
          }
          
          // Redirect to appropriate dashboard based on user type
          switch (userType) {
            case AppConstants.userTypeWorker:
              return '/dashboard/worker';
            case AppConstants.userTypeHousehold:
              return '/dashboard/household';
            case AppConstants.userTypeAdmin:
              return '/dashboard/admin';
            default:
              return '/welcome';
          }
        }
        
        return null;
      },
      routes: [
        // Splash Screen
        GoRoute(
          path: '/',
          name: 'splash',
          builder: (context, state) => const SplashScreen(),
        ),
        
        // Welcome Screen
        GoRoute(
          path: '/welcome',
          name: 'welcome',
          builder: (context, state) => const WelcomeScreen(),
        ),
        
        // Authentication Routes
        GoRoute(
          path: '/auth/login',
          name: 'login',
          builder: (context, state) {
            final userType = state.uri.queryParameters['userType'];
            return LoginScreen(userType: userType);
          },
        ),
        
        GoRoute(
          path: '/auth/otp-request',
          name: 'otp-request',
          builder: (context, state) {
            final phoneNumber = state.uri.queryParameters['phoneNumber'];
            return OtpRequestScreen(phoneNumber: phoneNumber);
          },
        ),
        
        GoRoute(
          path: '/auth/otp-verification',
          name: 'otp-verification',
          builder: (context, state) {
            final phoneNumber = state.uri.queryParameters['phoneNumber'] ?? '';
            return OtpVerificationScreen(phoneNumber: phoneNumber);
          },
        ),
        
        GoRoute(
          path: '/auth/forgot-password',
          name: 'forgot-password',
          builder: (context, state) {
            final userType = state.uri.queryParameters['userType'];
            return ForgotPasswordScreen(userType: userType);
          },
        ),
        
        // Registration Routes
        GoRoute(
          path: '/auth/worker-registration',
          name: 'worker-registration',
          builder: (context, state) {
            final step = int.tryParse(state.uri.queryParameters['step'] ?? '1') ?? 1;
            return WorkerRegistrationScreen(initialStep: step);
          },
        ),
        
        GoRoute(
          path: '/auth/household-registration',
          name: 'household-registration',
          builder: (context, state) {
            final step = int.tryParse(state.uri.queryParameters['step'] ?? '1') ?? 1;
            return HouseholdRegistrationScreen(initialStep: step);
          },
        ),
        
        GoRoute(
          path: '/auth/admin-registration',
          name: 'admin-registration',
          builder: (context, state) => const AdminRegistrationScreen(),
        ),
        
        // Dashboard Routes
        GoRoute(
          path: '/dashboard/worker',
          name: 'worker-dashboard',
          builder: (context, state) => const WorkerDashboard(),
        ),
        
        GoRoute(
          path: '/dashboard/household',
          name: 'household-dashboard',
          builder: (context, state) => const HouseholdDashboard(),
        ),
        
        GoRoute(
          path: '/dashboard/admin',
          name: 'admin-dashboard',
          builder: (context, state) => const AdminDashboard(),
        ),
        
        // Profile Routes
        GoRoute(
          path: '/profile/worker',
          name: 'worker-profile',
          builder: (context, state) => const WorkerProfileScreen(),
        ),
        
        GoRoute(
          path: '/profile/household',
          name: 'household-profile',
          builder: (context, state) => const HouseholdProfileScreen(),
        ),
        
        GoRoute(
          path: '/profile/admin',
          name: 'admin-profile',
          builder: (context, state) => const AdminProfileScreen(),
        ),
        
        // Settings Routes
        GoRoute(
          path: '/settings',
          name: 'settings',
          builder: (context, state) => const SettingsScreen(),
        ),
        
        GoRoute(
          path: '/settings/language',
          name: 'language-settings',
          builder: (context, state) => const LanguageSettingsScreen(),
        ),
        
        GoRoute(
          path: '/settings/notifications',
          name: 'notification-settings',
          builder: (context, state) => const NotificationSettingsScreen(),
        ),
        
        GoRoute(
          path: '/settings/privacy',
          name: 'privacy-settings',
          builder: (context, state) => const PrivacySettingsScreen(),
        ),
        
        // Support Routes
        GoRoute(
          path: '/support',
          name: 'support',
          builder: (context, state) => const SupportScreen(),
        ),
        
        GoRoute(
          path: '/support/help',
          name: 'help',
          builder: (context, state) => const HelpScreen(),
        ),
        
        GoRoute(
          path: '/support/contact',
          name: 'contact',
          builder: (context, state) => const ContactScreen(),
        ),
        
        // Error Routes
        GoRoute(
          path: '/error',
          name: 'error',
          builder: (context, state) {
            final error = state.extra as String?;
            return ErrorScreen(error: error);
          },
        ),
        
        // Verification Routes
        GoRoute(
          path: '/verification/email',
          name: 'email-verification',
          builder: (context, state) => const EmailVerificationScreen(),
        ),
        
        GoRoute(
          path: '/verification/phone',
          name: 'phone-verification',
          builder: (context, state) => const PhoneVerificationScreen(),
        ),
        
        GoRoute(
          path: '/verification/documents',
          name: 'document-verification',
          builder: (context, state) => const DocumentVerificationScreen(),
        ),
      ],
      errorBuilder: (context, state) => ErrorScreen(
        error: 'Page not found: ${state.fullPath}',
      ),
    );
  }
}

// Extension for easy navigation
extension GoRouterExtension on GoRouter {
  void pushAndClearStack(String location) {
    while (canPop()) {
      pop();
    }
    pushReplacement(location);
  }
}

// Navigation helper functions
class NavigationHelper {
  static void goToLogin(BuildContext context, {String? userType}) {
    final uri = Uri(
      path: '/auth/login',
      queryParameters: userType != null ? {'userType': userType} : null,
    );
    context.go(uri.toString());
  }
  
  static void goToRegistration(BuildContext context, String userType) {
    switch (userType) {
      case AppConstants.userTypeWorker:
        context.go('/auth/worker-registration');
        break;
      case AppConstants.userTypeHousehold:
        context.go('/auth/household-registration');
        break;
      case AppConstants.userTypeAdmin:
        context.go('/auth/admin-registration');
        break;
    }
  }
  
  static void goToDashboard(BuildContext context, String userType) {
    switch (userType) {
      case AppConstants.userTypeWorker:
        context.go('/dashboard/worker');
        break;
      case AppConstants.userTypeHousehold:
        context.go('/dashboard/household');
        break;
      case AppConstants.userTypeAdmin:
        context.go('/dashboard/admin');
        break;
    }
  }
  
  static void goToProfile(BuildContext context, String userType) {
    switch (userType) {
      case AppConstants.userTypeWorker:
        context.go('/profile/worker');
        break;
      case AppConstants.userTypeHousehold:
        context.go('/profile/household');
        break;
      case AppConstants.userTypeAdmin:
        context.go('/profile/admin');
        break;
    }
  }
  
  static void goToOtpVerification(BuildContext context, String phoneNumber) {
    final uri = Uri(
      path: '/auth/otp-verification',
      queryParameters: {'phoneNumber': phoneNumber},
    );
    context.go(uri.toString());
  }
  
  static void goToForgotPassword(BuildContext context, {String? userType}) {
    final uri = Uri(
      path: '/auth/forgot-password',
      queryParameters: userType != null ? {'userType': userType} : null,
    );
    context.go(uri.toString());
  }
  
  static void goToWelcome(BuildContext context) {
    context.go('/welcome');
  }
  
  static void goToSettings(BuildContext context) {
    context.go('/settings');
  }
  
  static void goToSupport(BuildContext context) {
    context.go('/support');
  }
  
  static void goToError(BuildContext context, String error) {
    context.go('/error', extra: error);
  }
}

// Placeholder screens for routes that haven't been implemented yet
class WorkerProfileScreen extends StatelessWidget {
  const WorkerProfileScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Worker Profile Screen')),
    );
  }
}

class HouseholdProfileScreen extends StatelessWidget {
  const HouseholdProfileScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Household Profile Screen')),
    );
  }
}

class AdminProfileScreen extends StatelessWidget {
  const AdminProfileScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Admin Profile Screen')),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Settings Screen')),
    );
  }
}

class LanguageSettingsScreen extends StatelessWidget {
  const LanguageSettingsScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Language Settings Screen')),
    );
  }
}

class NotificationSettingsScreen extends StatelessWidget {
  const NotificationSettingsScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Notification Settings Screen')),
    );
  }
}

class PrivacySettingsScreen extends StatelessWidget {
  const PrivacySettingsScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Privacy Settings Screen')),
    );
  }
}

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Support Screen')),
    );
  }
}

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Help Screen')),
    );
  }
}

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Contact Screen')),
    );
  }
}

class ErrorScreen extends StatelessWidget {
  final String? error;
  
  const ErrorScreen({super.key, this.error});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              error ?? 'An error occurred',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/welcome'),
              child: const Text('Go to Welcome'),
            ),
          ],
        ),
      ),
    );
  }
}

class EmailVerificationScreen extends StatelessWidget {
  const EmailVerificationScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Email Verification Screen')),
    );
  }
}

class PhoneVerificationScreen extends StatelessWidget {
  const PhoneVerificationScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Phone Verification Screen')),
    );
  }
}

class DocumentVerificationScreen extends StatelessWidget {
  const DocumentVerificationScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Document Verification Screen')),
    );
  }
}