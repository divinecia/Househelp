import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class AdminRegistrationScreen extends StatelessWidget {
  const AdminRegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Registration')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Admin Registration Screen',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            const Text('Internal Use Only'),
            const SizedBox(height: AppConstants.paddingLarge),
            const Text('Coming Soon...'),
          ],
        ),
      ),
    );
  }
}
