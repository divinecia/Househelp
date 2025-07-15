import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class LoginScreen extends StatelessWidget {
  final String? userType;

  const LoginScreen({super.key, this.userType});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Login Screen',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            if (userType != null)
              Text(
                'User Type: $userType',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            const SizedBox(height: AppConstants.paddingLarge),
            const Text('Coming Soon...'),
          ],
        ),
      ),
    );
  }
}
