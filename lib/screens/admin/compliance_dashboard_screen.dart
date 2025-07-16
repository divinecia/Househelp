import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class ComplianceDashboardScreen extends StatelessWidget {
  const ComplianceDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Compliance Dashboard')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Compliance Dashboard',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: AppConstants.paddingLarge),
            const Text('Monitor and manage regulatory and safety compliance.'),
            const SizedBox(height: AppConstants.paddingLarge),
            const Text('Coming Soon...'),
          ],
        ),
      ),
    );
  }
}
