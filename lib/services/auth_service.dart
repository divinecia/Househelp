import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:crypto/crypto.dart';
import '../models/user_model.dart';
import '../constants/app_constants.dart';
import 'storage_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final SupabaseClient _supabase = Supabase.instance.client;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final StorageService _storageService = StorageService();

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  bool get isAuthenticated => _currentUser != null;

  // Initialize auth service
  Future<void> initialize() async {
    try {
      final session = _supabase.auth.currentSession;
      if (session != null) {
        await _loadUserProfile(session.user.id);
      }
    } catch (e) {
      debugPrint('Error initializing auth service: $e');
    }
  }

  // Load user profile from database
  Future<void> _loadUserProfile(String userId) async {
    try {
      final response = await _supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();

      _currentUser = UserModel.fromJson(response);
    } catch (e) {
      debugPrint('Error loading user profile: $e');
    }
  }

  // Register with email/phone
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    required String userType,
    String? phone,
  }) async {
    try {
      // Check if email already exists
      final existingUser = await _supabase
          .from('users')
          .select()
          .eq('email', email)
          .maybeSingle();

      if (existingUser != null) {
        return {
          'success': false,
          'message': AppConstants.errorEmailAlreadyExists,
        };
      }

      // Check if phone already exists (if provided)
      if (phone != null) {
        final existingPhone = await _supabase
            .from('users')
            .select()
            .eq('phone', phone)
            .maybeSingle();

        if (existingPhone != null) {
          return {
            'success': false,
            'message': AppConstants.errorPhoneAlreadyExists,
          };
        }
      }

      // Create user in Supabase Auth
      final authResponse = await _supabase.auth.signUp(
        email: email,
        password: password,
      );

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': 'Failed to create account',
        };
      }

      // Create user profile in users table
      await _supabase.from('users').insert({
        'id': authResponse.user!.id,
        'email': email,
        'phone': phone,
        'full_name': fullName,
        'user_type': userType,
        'is_email_verified': false,
        'is_phone_verified': false,
        'is_active': true,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });

      // Send email verification
      await _sendEmailVerification(email);

      return {
        'success': true,
        'message': AppConstants.successAccountCreated,
        'user_id': authResponse.user!.id,
      };
    } catch (e) {
      debugPrint('Registration error: $e');
      return {
        'success': false,
        'message': AppConstants.errorGeneral,
      };
    }
  }

  // Login with email/phone and password
  Future<Map<String, dynamic>> login({
    required String emailOrPhone,
    required String password,
    String? userType,
  }) async {
    try {
      String email = emailOrPhone;
      
      // If input looks like phone number, find associated email
      if (emailOrPhone.startsWith('+') || emailOrPhone.startsWith('0')) {
        final userRecord = await _supabase
            .from('users')
            .select('email')
            .eq('phone', emailOrPhone)
            .maybeSingle();

        if (userRecord == null) {
          return {
            'success': false,
            'message': AppConstants.errorAccountNotFound,
          };
        }
        email = userRecord['email'];
      }

      final authResponse = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': AppConstants.errorInvalidCredentials,
        };
      }

      // Load user profile
      await _loadUserProfile(authResponse.user!.id);

      // Check if user type matches (if specified)
      if (userType != null && _currentUser?.userType != userType) {
        await logout();
        return {
          'success': false,
          'message': 'Invalid user type',
        };
      }

      return {
        'success': true,
        'message': 'Login successful',
        'user': _currentUser,
      };
    } catch (e) {
      debugPrint('Login error: $e');
      return {
        'success': false,
        'message': AppConstants.errorInvalidCredentials,
      };
    }
  }

  // Google Sign-In
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return {
          'success': false,
          'message': 'Google sign-in cancelled',
        };
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final authResponse = await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: googleAuth.idToken!,
        accessToken: googleAuth.accessToken,
      );

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': 'Google sign-in failed',
        };
      }

      // Check if user profile exists
      final existingUser = await _supabase
          .from('users')
          .select()
          .eq('id', authResponse.user!.id)
          .maybeSingle();

      if (existingUser == null) {
        // Create user profile for new Google user
        await _supabase.from('users').insert({
          'id': authResponse.user!.id,
          'email': authResponse.user!.email,
          'full_name': authResponse.user!.userMetadata?['full_name'] ?? googleUser.displayName,
          'user_type': 'pending', // User needs to complete registration
          'profile_photo_url': authResponse.user!.userMetadata?['avatar_url'],
          'is_email_verified': true,
          'is_phone_verified': false,
          'is_active': true,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        });
      }

      await _loadUserProfile(authResponse.user!.id);

      return {
        'success': true,
        'message': 'Google sign-in successful',
        'user': _currentUser,
        'is_new_user': existingUser == null,
      };
    } catch (e) {
      debugPrint('Google sign-in error: $e');
      return {
        'success': false,
        'message': 'Google sign-in failed',
      };
    }
  }

  // Facebook Login
  Future<Map<String, dynamic>> signInWithFacebook() async {
    try {
      final LoginResult result = await FacebookAuth.instance.login();

      if (result.status != LoginStatus.success) {
        return {
          'success': false,
          'message': 'Facebook login failed',
        };
      }

      final AccessToken accessToken = result.accessToken!;

      final authResponse = await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.facebook,
        idToken: accessToken.tokenString,
      );

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': 'Facebook authentication failed',
        };
      }

      // Check if user profile exists
      final existingUser = await _supabase
          .from('users')
          .select()
          .eq('id', authResponse.user!.id)
          .maybeSingle();

      if (existingUser == null) {
        // Get Facebook user data
        final userData = await FacebookAuth.instance.getUserData();
        
        // Create user profile for new Facebook user
        await _supabase.from('users').insert({
          'id': authResponse.user!.id,
          'email': authResponse.user!.email,
          'full_name': userData['name'],
          'user_type': 'pending', // User needs to complete registration
          'profile_photo_url': userData['picture']['data']['url'],
          'is_email_verified': true,
          'is_phone_verified': false,
          'is_active': true,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        });
      }

      await _loadUserProfile(authResponse.user!.id);

      return {
        'success': true,
        'message': 'Facebook login successful',
        'user': _currentUser,
        'is_new_user': existingUser == null,
      };
    } catch (e) {
      debugPrint('Facebook login error: $e');
      return {
        'success': false,
        'message': 'Facebook login failed',
      };
    }
  }

  // Apple Sign-In
  Future<Map<String, dynamic>> signInWithApple() async {
    try {
      final rawNonce = _generateNonce();
      final nonce = sha256.convert(utf8.encode(rawNonce)).toString();

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      final authResponse = await _supabase.auth.signInWithIdToken(
        provider: OAuthProvider.apple,
        idToken: credential.identityToken!,
        nonce: rawNonce,
      );

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': 'Apple sign-in failed',
        };
      }

      // Check if user profile exists
      final existingUser = await _supabase
          .from('users')
          .select()
          .eq('id', authResponse.user!.id)
          .maybeSingle();

      if (existingUser == null) {
        // Create user profile for new Apple user
        final fullName = credential.givenName != null && credential.familyName != null
            ? '${credential.givenName} ${credential.familyName}'
            : 'Apple User';

        await _supabase.from('users').insert({
          'id': authResponse.user!.id,
          'email': credential.email ?? authResponse.user!.email,
          'full_name': fullName,
          'user_type': 'pending', // User needs to complete registration
          'is_email_verified': true,
          'is_phone_verified': false,
          'is_active': true,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        });
      }

      await _loadUserProfile(authResponse.user!.id);

      return {
        'success': true,
        'message': 'Apple sign-in successful',
        'user': _currentUser,
        'is_new_user': existingUser == null,
      };
    } catch (e) {
      debugPrint('Apple sign-in error: $e');
      return {
        'success': false,
        'message': 'Apple sign-in failed',
      };
    }
  }

  // Send OTP to phone
  Future<Map<String, dynamic>> sendPhoneOTP(String phone) async {
    try {
      // Generate OTP
      final otp = _generateOTP();
      final expiresAt = DateTime.now().add(const Duration(minutes: 5));

      // Store OTP in database (you might want to use a dedicated OTP table)
      await _supabase.from('otp_codes').insert({
        'phone': phone,
        'code': otp,
        'expires_at': expiresAt.toIso8601String(),
        'created_at': DateTime.now().toIso8601String(),
      });

      // In a real app, you would send SMS here
      // For now, we'll just return success
      debugPrint('OTP for $phone: $otp');

      return {
        'success': true,
        'message': 'OTP sent successfully',
        'otp': kDebugMode ? otp : null, // Only return OTP in debug mode
      };
    } catch (e) {
      debugPrint('Send OTP error: $e');
      return {
        'success': false,
        'message': 'Failed to send OTP',
      };
    }
  }

  // Verify phone OTP
  Future<Map<String, dynamic>> verifyPhoneOTP(String phone, String otp) async {
    try {
      final otpRecord = await _supabase
          .from('otp_codes')
          .select()
          .eq('phone', phone)
          .eq('code', otp)
          .gte('expires_at', DateTime.now().toIso8601String())
          .maybeSingle();

      if (otpRecord == null) {
        return {
          'success': false,
          'message': AppConstants.errorInvalidOTP,
        };
      }

      // Delete used OTP
      await _supabase
          .from('otp_codes')
          .delete()
          .eq('phone', phone)
          .eq('code', otp);

      // Update user's phone verification status
      if (_currentUser != null) {
        await _supabase
            .from('users')
            .update({
              'is_phone_verified': true,
              'phone': phone,
              'updated_at': DateTime.now().toIso8601String(),
            })
            .eq('id', _currentUser!.id);

        await _loadUserProfile(_currentUser!.id);
      }

      return {
        'success': true,
        'message': AppConstants.successPhoneVerified,
      };
    } catch (e) {
      debugPrint('Verify OTP error: $e');
      return {
        'success': false,
        'message': AppConstants.errorInvalidOTP,
      };
    }
  }

  // Send email verification
  Future<void> _sendEmailVerification(String email) async {
    try {
      await _supabase.auth.resend(
        type: OtpType.signup,
        email: email,
      );
    } catch (e) {
      debugPrint('Send email verification error: $e');
    }
  }

  // Reset password
  Future<Map<String, dynamic>> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email);
      return {
        'success': true,
        'message': 'Password reset email sent',
      };
    } catch (e) {
      debugPrint('Reset password error: $e');
      return {
        'success': false,
        'message': 'Failed to send reset email',
      };
    }
  }

  // Update password
  Future<Map<String, dynamic>> updatePassword(String newPassword) async {
    try {
      await _supabase.auth.updateUser(
        UserAttributes(password: newPassword),
      );
      return {
        'success': true,
        'message': AppConstants.successPasswordUpdated,
      };
    } catch (e) {
      debugPrint('Update password error: $e');
      return {
        'success': false,
        'message': 'Failed to update password',
      };
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _supabase.auth.signOut();
      await _googleSignIn.signOut();
      await FacebookAuth.instance.logOut();
      _currentUser = null;
      await _storageService.clearAll();
    } catch (e) {
      debugPrint('Logout error: $e');
    }
  }

  // Generate random nonce for Apple Sign-In
  String _generateNonce([int length = 32]) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)]).join();
  }

  // Generate OTP
  String _generateOTP() {
    final random = Random.secure();
    return List.generate(AppConstants.otpLength, (_) => random.nextInt(10)).join();
  }

  // Update user profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> updates) async {
    try {
      if (_currentUser == null) {
        return {
          'success': false,
          'message': 'User not authenticated',
        };
      }

      updates['updated_at'] = DateTime.now().toIso8601String();
      
      await _supabase
          .from('users')
          .update(updates)
          .eq('id', _currentUser!.id);

      await _loadUserProfile(_currentUser!.id);

      return {
        'success': true,
        'message': 'Profile updated successfully',
      };
    } catch (e) {
      debugPrint('Update profile error: $e');
      return {
        'success': false,
        'message': 'Failed to update profile',
      };
    }
  }

  // Delete account
  Future<Map<String, dynamic>> deleteAccount() async {
    try {
      if (_currentUser == null) {
        return {
          'success': false,
          'message': 'User not authenticated',
        };
      }

      // Mark user as inactive instead of deleting
      await _supabase
          .from('users')
          .update({
            'is_active': false,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', _currentUser!.id);

      await logout();

      return {
        'success': true,
        'message': 'Account deleted successfully',
      };
    } catch (e) {
      debugPrint('Delete account error: $e');
      return {
        'success': false,
        'message': 'Failed to delete account',
      };
    }
  }
}