import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import 'constants/app_constants.dart';
import 'constants/app_theme.dart';
import 'core/app_router.dart';
import 'services/auth_service.dart';
import 'services/storage_service.dart';
import 'services/location_service.dart';
import 'services/biometric_service.dart';
import 'services/image_service.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await Supabase.initialize(
    url: AppConstants.baseUrl,
    anonKey: AppConstants.supabaseKey,
  );

  // Initialize services
  await StorageService().initialize();
  await AuthService().initialize();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const HouseHelpApp());
}

class HouseHelpApp extends StatelessWidget {
  const HouseHelpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: Consumer<LanguageProvider>(
        builder: (context, languageProvider, child) {
          return MaterialApp.router(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: AppRouter.router,
            locale: languageProvider.locale,
            supportedLocales: const [
              Locale('en', 'US'), // English
              Locale('rw', 'RW'), // Kinyarwanda
              Locale('fr', 'FR'), // French
              Locale('sw', 'KE'), // Swahili
            ],
            builder: (context, child) {
              // Handle global error boundary
              ErrorWidget.builder = (FlutterErrorDetails details) {
                return Scaffold(
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
                          'Something went wrong',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Please restart the app',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                );
              };
              
              return child ?? const SizedBox();
            },
          );
        },
      ),
    );
  }
}
