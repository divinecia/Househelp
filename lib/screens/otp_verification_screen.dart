import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_otp_text_field/flutter_otp_text_field.dart';
import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/loading_overlay.dart';

class OTPVerificationScreen extends StatefulWidget {
  final String phone;
  final String verificationType;

  const OTPVerificationScreen({
    super.key,
    required this.phone,
    required this.verificationType,
  });

  @override
  State<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  String _otp = '';
  bool _isLoading = false;
  int _timerSeconds = AppConstants.otpTimeoutDuration;
  Timer? _timer;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _canResend = false;
    _timerSeconds = AppConstants.otpTimeoutDuration;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timerSeconds > 0) {
        setState(() {
          _timerSeconds--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  Future<void> _verifyOTP() async {
    if (_otp.length != AppConstants.otpLength) {
      _showErrorDialog('Please enter the complete verification code');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.verifyOTP(widget.phone, _otp);

      if (result['success']) {
        if (mounted) {
          _showSuccessDialog();
        }
      } else {
        if (mounted) {
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('Verification failed. Please try again.');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _resendOTP() async {
    if (!_canResend) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.sendOTP(widget.phone);

      if (result['success']) {
        if (mounted) {
          _startTimer();
          _showSuccessSnackbar('New verification code sent');
        }
      } else {
        if (mounted) {
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('Failed to resend code. Please try again.');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Verification Failed'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              Icons.check_circle,
              color: AppTheme.successColor,
            ),
            const SizedBox(width: 8),
            const Text('Success'),
          ],
        ),
        content: const Text('Phone number verified successfully!'),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.go('/home');
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.successColor,
      ),
    );
  }

  String _formatPhoneNumber(String phone) {
    if (phone.length > 6) {
      return '${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}';
    }
    return phone;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundPrimary,
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                
                IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back),
                  style: IconButton.styleFrom(
                    backgroundColor: AppTheme.backgroundCard,
                    foregroundColor: AppTheme.textPrimary,
                  ),
                ),
                
                const SizedBox(height: 40),
                
                Text(
                  'Enter Verification Code',
                  style: AppTheme.headingLarge.copyWith(
                    color: AppTheme.textPrimary,
                  ),
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  'We sent a verification code to',
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
                
                const SizedBox(height: 4),
                
                Row(
                  children: [
                    Text(
                      _formatPhoneNumber(widget.phone),
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => context.pop(),
                      child: const Text('Change'),
                    ),
                  ],
                ),
                
                const SizedBox(height: 48),
                
                Center(
                  child: OtpTextField(
                    numberOfFields: AppConstants.otpLength,
                    borderColor: AppTheme.borderMedium,
                    focusedBorderColor: AppTheme.primaryColor,
                    fillColor: AppTheme.backgroundInput,
                    filled: true,
                    textStyle: AppTheme.headingSmall.copyWith(
                      color: AppTheme.textPrimary,
                    ),
                    fieldWidth: 50,
                    borderRadius: BorderRadius.circular(12),
                    showFieldAsBox: true,
                    onCodeChanged: (String code) {
                      setState(() {
                        _otp = code;
                      });
                    },
                    onSubmit: (String verificationCode) {
                      setState(() {
                        _otp = verificationCode;
                      });
                      _verifyOTP();
                    },
                  ),
                ),
                
                const SizedBox(height: 32),
                
                if (_canResend)
                  Center(
                    child: TextButton(
                      onPressed: _resendOTP,
                      child: const Text('Resend Code'),
                    ),
                  )
                else
                  Center(
                    child: Text(
                      'Resend code in ${_timerSeconds}s',
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ),
                
                const SizedBox(height: 48),
                
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _otp.length == AppConstants.otpLength
                        ? _verifyOTP
                        : null,
                    child: const Text('Verify'),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.backgroundSecondary,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppTheme.borderLight,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Having trouble?',
                        style: AppTheme.labelLarge.copyWith(
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '• Check your SMS messages\n• Ensure you have good network coverage\n• Try requesting a new code',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}