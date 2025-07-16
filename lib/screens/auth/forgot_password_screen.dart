import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  bool _isLoading = false;
  String? _message;

  void _submit() async {
    setState(() {
      _isLoading = true;
      _message = null;
    });

    // TODO: Implement actual password reset logic using your provider/service
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _isLoading = false;
      _message = 'If your email exists, you will receive a reset link.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot Password')),
      body: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingLarge),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Forgot Password',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: AppConstants.paddingLarge),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: AppConstants.paddingLarge),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Send Reset Link'),
            ),
            if (_message != null) ...[
              const SizedBox(height: AppConstants.paddingMedium),
              Text(_message!, style: const TextStyle(color: Colors.green)),
            ],
          ],
        ),
      ),
    );
  }
}
