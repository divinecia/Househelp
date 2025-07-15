import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class OtpVerificationScreen extends StatelessWidget {
  final String phoneNumber;

  const OtpVerificationScreen({super.key, required this.phoneNumber});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('OTP Verification')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'OTP Verification Screen',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            Text(
              'Phone: $phoneNumber',
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
