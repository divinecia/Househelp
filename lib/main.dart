import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'constants/app_constants.dart';
import 'constants/app_theme.dart';
import 'services/supabase_service.dart';
import 'providers/auth_provider.dart';
import 'utils/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Supabase
  try {
    await SupabaseService.initialize();
  } catch (e) {
    debugPrint('Failed to initialize Supabase: $e');
  }

  runApp(const HouseHelpApp());
}

class HouseHelpApp extends StatelessWidget {
  const HouseHelpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        // Add other providers here as needed
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return MaterialApp.router(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: AppRouter.createRouter(),
            
            // Global builder for handling loading states
            builder: (context, child) {
              return Stack(
                children: [
                  child ?? const SizedBox(),
                  if (authProvider.isLoading && authProvider.isInitialized)
                    const LoadingOverlay(),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

// Loading overlay widget
class LoadingOverlay extends StatelessWidget {
  const LoadingOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.5),
      child: const Center(
        child: SpinKitFadingCircle(
          color: AppConstants.primaryColor,
          size: 50.0,
        ),
      ),
    );
  }
}
