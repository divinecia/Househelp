import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart' as models;
import '../services/supabase_service.dart';
import '../constants/app_constants.dart';

class AuthProvider extends ChangeNotifier {
  User? _supabaseUser;
  models.User? _appUser;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isInitialized = false;

  // Getters
  User? get supabaseUser => _supabaseUser;
  models.User? get appUser => _appUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _supabaseUser != null;
  bool get isInitialized => _isInitialized;

  // Constructor
  AuthProvider() {
    _initializeAuth();
  }

  // Initialize authentication state
  Future<void> _initializeAuth() async {
    try {
      _isLoading = true;
      notifyListeners();

      // Listen to auth state changes
      SupabaseService.client.auth.onAuthStateChange.listen((data) {
        _supabaseUser = data.user;
        if (_supabaseUser != null) {
          _loadUserProfile();
        } else {
          _appUser = null;
        }
        notifyListeners();
      });

      // Get current user if already authenticated
      _supabaseUser = SupabaseService.currentUser;
      if (_supabaseUser != null) {
        await _loadUserProfile();
      }

      _isInitialized = true;
    } catch (e) {
      _errorMessage = 'Failed to initialize authentication: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load user profile from database
  Future<void> _loadUserProfile() async {
    try {
      if (_supabaseUser != null) {
        final userProfile = await SupabaseService.getUserProfile(
          _supabaseUser!.id,
        );
        if (userProfile != null) {
          _appUser = models.User.fromJson(userProfile);
        }
      }
    } catch (e) {
      _errorMessage = 'Failed to load user profile: ${e.toString()}';
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Sign up with email
  Future<bool> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
    required String userType,
    String? phoneNumber,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await SupabaseService.signUpWithEmail(
        email: email,
        password: password,
        fullName: fullName,
        userType: userType,
        phoneNumber: phoneNumber,
      );

      if (response.user != null) {
        _supabaseUser = response.user;
        await _loadUserProfile();
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign in with email
  Future<bool> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await SupabaseService.signInWithEmail(
        email: email,
        password: password,
      );

      if (response.user != null) {
        _supabaseUser = response.user;
        await _loadUserProfile();
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign in with phone
  Future<bool> signInWithPhone({
    required String phoneNumber,
    required String password,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await SupabaseService.signInWithPhone(
        phoneNumber: phoneNumber,
        password: password,
      );

      if (response.user != null) {
        _supabaseUser = response.user;
        await _loadUserProfile();
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Send OTP
  Future<bool> sendOTP({required String phoneNumber}) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      await SupabaseService.sendOTP(phoneNumber: phoneNumber);
      return true;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Verify OTP
  Future<bool> verifyOTP({
    required String phoneNumber,
    required String otp,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await SupabaseService.verifyOTP(
        phoneNumber: phoneNumber,
        otp: otp,
      );

      if (response.user != null) {
        _supabaseUser = response.user;
        await _loadUserProfile();

        // Update phone verification status
        await SupabaseService.updatePhoneVerificationStatus(
          userId: _supabaseUser!.id,
          isVerified: true,
        );

        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign in with Google
  Future<bool> signInWithGoogle() async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final success = await SupabaseService.signInWithGoogle();
      if (success) {
        _supabaseUser = SupabaseService.currentUser;
        await _loadUserProfile();
      }
      return success;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign in with Facebook
  Future<bool> signInWithFacebook() async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final success = await SupabaseService.signInWithFacebook();
      if (success) {
        _supabaseUser = SupabaseService.currentUser;
        await _loadUserProfile();
      }
      return success;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign in with Apple
  Future<bool> signInWithApple() async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final success = await SupabaseService.signInWithApple();
      if (success) {
        _supabaseUser = SupabaseService.currentUser;
        await _loadUserProfile();
      }
      return success;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Send password reset email
  Future<bool> sendPasswordResetEmail({required String email}) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      await SupabaseService.sendPasswordResetEmail(email: email);
      return true;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update password
  Future<bool> updatePassword({required String newPassword}) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      final response = await SupabaseService.updatePassword(
        newPassword: newPassword,
      );

      return response.user != null;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update user profile
  Future<bool> updateUserProfile({required Map<String, dynamic> data}) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      if (_supabaseUser != null) {
        await SupabaseService.updateUserProfile(
          userId: _supabaseUser!.id,
          data: data,
        );

        // Reload user profile
        await _loadUserProfile();
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create worker profile
  Future<bool> createWorkerProfile({
    required Map<String, dynamic> profileData,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      if (_supabaseUser != null) {
        await SupabaseService.createWorkerProfile(
          userId: _supabaseUser!.id,
          profileData: profileData,
        );
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create household profile
  Future<bool> createHouseholdProfile({
    required Map<String, dynamic> profileData,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      if (_supabaseUser != null) {
        await SupabaseService.createHouseholdProfile(
          userId: _supabaseUser!.id,
          profileData: profileData,
        );
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create admin profile
  Future<bool> createAdminProfile({
    required Map<String, dynamic> profileData,
  }) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      if (_supabaseUser != null) {
        await SupabaseService.createAdminProfile(
          userId: _supabaseUser!.id,
          profileData: profileData,
        );
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update email verification status
  Future<bool> updateEmailVerificationStatus({required bool isVerified}) async {
    try {
      if (_supabaseUser != null) {
        await SupabaseService.updateEmailVerificationStatus(
          userId: _supabaseUser!.id,
          isVerified: isVerified,
        );

        // Reload user profile
        await _loadUserProfile();
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    }
  }

  // Update phone verification status
  Future<bool> updatePhoneVerificationStatus({required bool isVerified}) async {
    try {
      if (_supabaseUser != null) {
        await SupabaseService.updatePhoneVerificationStatus(
          userId: _supabaseUser!.id,
          isVerified: isVerified,
        );

        // Reload user profile
        await _loadUserProfile();
        return true;
      }

      return false;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
      return false;
    }
  }

  // Get user type
  String? getUserType() {
    return _appUser?.userType;
  }

  // Check if user is worker
  bool isWorker() {
    return getUserType() == AppConstants.userTypeWorker;
  }

  // Check if user is household
  bool isHousehold() {
    return getUserType() == AppConstants.userTypeHousehold;
  }

  // Check if user is admin
  bool isAdmin() {
    return getUserType() == AppConstants.userTypeAdmin;
  }

  // Check if email is verified
  bool isEmailVerified() {
    return _appUser?.isEmailVerified ?? false;
  }

  // Check if phone is verified
  bool isPhoneVerified() {
    return _appUser?.isPhoneVerified ?? false;
  }

  // Get user status
  models.UserStatus? getUserStatus() {
    return _appUser?.status;
  }

  // Check if user is active
  bool isUserActive() {
    return getUserStatus() == models.UserStatus.active;
  }

  // Sign out
  Future<void> signOut() async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      await SupabaseService.signOut();
      _supabaseUser = null;
      _appUser = null;
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Refresh user data
  Future<void> refreshUser() async {
    try {
      _isLoading = true;
      notifyListeners();

      if (_supabaseUser != null) {
        await _loadUserProfile();
      }
    } catch (e) {
      _errorMessage = SupabaseService.getErrorMessage(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
