import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class OtpRequestScreen extends StatelessWidget {
  final String? phoneNumber;

  const OtpRequestScreen({super.key, this.phoneNumber});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('OTP Request')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'OTP Request Screen',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            if (phoneNumber != null)
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
