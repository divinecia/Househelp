import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../constants/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/biometric_service.dart';
import '../widgets/social_login_button.dart';
import '../widgets/loading_overlay.dart';

class LoginScreen extends StatefulWidget {
  final String? userType;

  const LoginScreen({super.key, this.userType});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final BiometricService _biometricService = BiometricService();
  
  bool _isPasswordVisible = false;
  bool _rememberMe = false;
  bool _isLoading = false;
  bool _biometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _checkBiometricAvailability() async {
    final isAvailable = await _biometricService.isAvailable();
    final isEnabled = _biometricService.isBiometricEnabled();
    setState(() {
      _biometricAvailable = isAvailable && isEnabled;
    });
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.login(
        emailOrPhone: _emailController.text.trim(),
        password: _passwordController.text,
        userType: widget.userType,
      );

      if (result['success']) {
        if (mounted) {
          context.go('/home');
        }
      } else {
        if (mounted) {
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('An error occurred during login');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loginWithGoogle() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.signInWithGoogle();

      if (result['success']) {
        if (mounted) {
          context.go('/home');
        }
      } else {
        if (mounted) {
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('Google sign-in failed');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loginWithFacebook() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.signInWithFacebook();

      if (result['success']) {
        if (mounted) {
          context.go('/home');
        }
      } else {
        if (mounted) {
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('Facebook login failed');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loginWithApple() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.signInWithApple();

      if (result['success']) {
        if (mounted) {
          context.go('/home');
        }
      } else {
        if (mounted) {
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        _showErrorDialog('Apple sign-in failed');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loginWithBiometric() async {
    final result = await _biometricService.authenticateWithBiometrics();
    
    if (result['success']) {
      if (mounted) {
        context.go('/home');
      }
    } else {
      if (mounted) {
        _showErrorDialog(result['message']);
      }
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Login Failed'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundPrimary,
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                
                IconButton(
                  onPressed: () => context.go('/welcome'),
                  icon: const Icon(Icons.arrow_back),
                  style: IconButton.styleFrom(
                    backgroundColor: AppTheme.backgroundCard,
                    foregroundColor: AppTheme.textPrimary,
                  ),
                ),
                
                const SizedBox(height: 40),
                
                Text(
                  'Welcome Back',
                  style: AppTheme.headingLarge.copyWith(
                    color: AppTheme.textPrimary,
                  ),
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  'Sign in to your account',
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
                
                if (widget.userType != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: _getUserTypeColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _getUserTypeColor().withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      _getUserTypeLabel(),
                      style: AppTheme.bodySmall.copyWith(
                        color: _getUserTypeColor(),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
                
                const SizedBox(height: 32),
                
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email or Phone',
                          hintText: 'Enter your email or phone number',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your email or phone number';
                          }
                          return null;
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_isPasswordVisible,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Enter your password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _isPasswordVisible
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                            ),
                            onPressed: () {
                              setState(() {
                                _isPasswordVisible = !_isPasswordVisible;
                              });
                            },
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your password';
                          }
                          return null;
                        },
                      ),
                      
                      const SizedBox(height: 16),
                      
                      Row(
                        children: [
                          Checkbox(
                            value: _rememberMe,
                            onChanged: (value) {
                              setState(() {
                                _rememberMe = value ?? false;
                              });
                            },
                          ),
                          const Text('Remember me'),
                          const Spacer(),
                          TextButton(
                            onPressed: () => context.go('/password-reset'),
                            child: const Text('Forgot Password?'),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _login,
                          child: const Text('Login'),
                        ),
                      ),
                      
                      if (_biometricAvailable) ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: _loginWithBiometric,
                            icon: const Icon(Icons.fingerprint),
                            label: const Text('Use Biometric'),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Or continue with',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.textMuted,
                        ),
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                Column(
                  children: [
                    SocialLoginButton(
                      onPressed: _loginWithGoogle,
                      icon: Icons.g_mobiledata,
                      label: 'Continue with Google',
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black87,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    SocialLoginButton(
                      onPressed: _loginWithFacebook,
                      icon: Icons.facebook,
                      label: 'Continue with Facebook',
                      backgroundColor: const Color(0xFF1877F2),
                      foregroundColor: Colors.white,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    SocialLoginButton(
                      onPressed: _loginWithApple,
                      icon: Icons.apple,
                      label: 'Continue with Apple',
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                    ),
                  ],
                ),
                
                const SizedBox(height: 32),
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? "),
                    TextButton(
                      onPressed: () => context.go('/welcome'),
                      child: const Text('Sign Up'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getUserTypeColor() {
    switch (widget.userType) {
      case AppConstants.userTypeWorker:
        return AppTheme.workerColor;
      case AppConstants.userTypeHousehold:
        return AppTheme.householdColor;
      case AppConstants.userTypeAdmin:
        return AppTheme.adminColor;
      default:
        return AppTheme.primaryColor;
    }
  }

  String _getUserTypeLabel() {
    switch (widget.userType) {
      case AppConstants.userTypeWorker:
        return 'Worker Login';
      case AppConstants.userTypeHousehold:
        return 'Household Login';
      case AppConstants.userTypeAdmin:
        return 'Admin Login';
      default:
        return 'Login';
    }
  }
}