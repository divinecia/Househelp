import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/splash_screen.dart';
import '../screens/welcome_screen.dart';
import '../screens/login_screen.dart';
import '../screens/otp_verification_screen.dart';
import '../screens/password_reset_screen.dart';
import '../screens/worker_registration/worker_registration_screen.dart';
import '../screens/household_registration/household_registration_screen.dart';
import '../screens/admin_registration/admin_registration_screen.dart';
import '../screens/registration_success_screen.dart';
import '../services/auth_service.dart';

class AppRouter {
  static final AuthService _authService = AuthService();

  static final GoRouter _router = GoRouter(
    initialLocation: '/splash',
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Welcome Screen
      GoRoute(
        path: '/welcome',
        name: 'welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),

      // Login Screen
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) {
          final userType = state.uri.queryParameters['userType'];
          return LoginScreen(userType: userType);
        },
      ),

      // OTP Verification Screen
      GoRoute(
        path: '/otp-verification',
        name: 'otpVerification',
        builder: (context, state) {
          final phone = state.uri.queryParameters['phone'] ?? '';
          final verificationType = state.uri.queryParameters['type'] ?? 'phone';
          return OTPVerificationScreen(
            phone: phone,
            verificationType: verificationType,
          );
        },
      ),

      // Password Reset Screen
      GoRoute(
        path: '/password-reset',
        name: 'passwordReset',
        builder: (context, state) {
          final step = state.uri.queryParameters['step'] ?? '1';
          final email = state.uri.queryParameters['email'];
          final code = state.uri.queryParameters['code'];
          return PasswordResetScreen(
            step: int.parse(step),
            email: email,
            code: code,
          );
        },
      ),

      // Worker Registration Routes
      GoRoute(
        path: '/worker-registration',
        name: 'workerRegistration',
        builder: (context, state) {
          final step = state.uri.queryParameters['step'] ?? '1';
          return WorkerRegistrationScreen(step: int.parse(step));
        },
      ),

      // Household Registration Routes
      GoRoute(
        path: '/household-registration',
        name: 'householdRegistration',
        builder: (context, state) {
          final step = state.uri.queryParameters['step'] ?? '1';
          return HouseholdRegistrationScreen(step: int.parse(step));
        },
      ),

      // Admin Registration Routes
      GoRoute(
        path: '/admin-registration',
        name: 'adminRegistration',
        builder: (context, state) => const AdminRegistrationScreen(),
      ),

      // Registration Success Screen
      GoRoute(
        path: '/registration-success',
        name: 'registrationSuccess',
        builder: (context, state) {
          final userType = state.uri.queryParameters['userType'] ?? 'worker';
          return RegistrationSuccessScreen(userType: userType);
        },
      ),

      // Email Verification Screen
      GoRoute(
        path: '/email-verification',
        name: 'emailVerification',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return EmailVerificationScreen(email: email);
        },
      ),

      // Biometric Setup Screen
      GoRoute(
        path: '/biometric-setup',
        name: 'biometricSetup',
        builder: (context, state) => const BiometricSetupScreen(),
      ),

      // Home Screen (after successful login)
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
        redirect: (context, state) {
          if (!_authService.isAuthenticated) {
            return '/welcome';
          }
          return null;
        },
      ),
    ],
    redirect: (context, state) {
      final isLoggedIn = _authService.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login' ||
          state.matchedLocation == '/welcome' ||
          state.matchedLocation == '/splash' ||
          state.matchedLocation.startsWith('/worker-registration') ||
          state.matchedLocation.startsWith('/household-registration') ||
          state.matchedLocation.startsWith('/admin-registration') ||
          state.matchedLocation.startsWith('/otp-verification') ||
          state.matchedLocation.startsWith('/password-reset') ||
          state.matchedLocation.startsWith('/email-verification') ||
          state.matchedLocation.startsWith('/registration-success');

      // If not logged in and not on a login/registration page, redirect to welcome
      if (!isLoggedIn && !isLoggingIn) {
        return '/welcome';
      }

      // If logged in and on a login/registration page, redirect to home
      if (isLoggedIn && isLoggingIn && state.matchedLocation != '/splash') {
        return '/home';
      }

      return null;
    },
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you are looking for does not exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/welcome'),
              child: const Text('Go to Welcome'),
            ),
          ],
        ),
      ),
    ),
  );

  static GoRouter get router => _router;
}

// Screen imports that need to be created
class EmailVerificationScreen extends StatelessWidget {
  final String email;
  
  const EmailVerificationScreen({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Email Verification')),
      body: const Center(child: Text('Email Verification Screen')),
    );
  }
}

class BiometricSetupScreen extends StatelessWidget {
  const BiometricSetupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Biometric Setup')),
      body: const Center(child: Text('Biometric Setup Screen')),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: const Center(child: Text('Home Screen')),
    );
  }
}