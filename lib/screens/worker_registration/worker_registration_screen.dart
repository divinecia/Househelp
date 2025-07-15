import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../constants/app_constants.dart';
import '../../constants/app_theme.dart';

class WorkerRegistrationScreen extends StatelessWidget {
  final int step;

  const WorkerRegistrationScreen({super.key, required this.step});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundPrimary,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () => context.go('/welcome'),
                    icon: const Icon(Icons.arrow_back),
                    style: IconButton.styleFrom(
                      backgroundColor: AppTheme.backgroundCard,
                      foregroundColor: AppTheme.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.workerColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppTheme.workerColor.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      'Step $step of 4',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppTheme.workerColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 40),
              
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: AppTheme.workerColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.work_outline,
                        size: 50,
                        color: Colors.white,
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    Text(
                      'Worker Registration',
                      style: AppTheme.headingLarge.copyWith(
                        color: AppTheme.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    Text(
                      'Join as a Professional Worker\nStep $step: ${_getStepTitle(step)}',
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    const SizedBox(height: 48),
                    
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppTheme.backgroundSecondary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppTheme.borderLight,
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            Icons.construction,
                            size: 48,
                            color: AppTheme.warningColor,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Registration Form Coming Soon',
                            style: AppTheme.headingSmall.copyWith(
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'The worker registration form is currently being developed. For now, you can proceed to see the success screen.',
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppTheme.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.go('/registration-success?userType=${AppConstants.userTypeWorker}'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.workerColor,
                      ),
                      child: const Text('Continue to Success Screen'),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  OutlinedButton(
                    onPressed: () => context.go('/login?userType=${AppConstants.userTypeWorker}'),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppTheme.workerColor),
                      foregroundColor: AppTheme.workerColor,
                    ),
                    child: const Text('Go to Login'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getStepTitle(int step) {
    switch (step) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Professional Details';
      case 3:
        return 'Availability & Rates';
      case 4:
        return 'Verification';
      default:
        return 'Registration';
    }
  }
}