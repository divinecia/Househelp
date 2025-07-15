import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final StorageService _storageService = StorageService();

  UserModel? _user;
  bool _isLoading = false;
  bool _isInitialized = false;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  bool get isAuthenticated => _user != null;
  String? get error => _error;

  // Initialize auth state
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.initialize();
      _user = _authService.currentUser;
      _isInitialized = true;
      _error = null;
    } catch (e) {
      _error = e.toString();
      debugPrint('Auth provider initialization error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login
  Future<Map<String, dynamic>> login({
    required String emailOrPhone,
    required String password,
    String? userType,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(
        emailOrPhone: emailOrPhone,
        password: password,
        userType: userType,
      );

      if (result['success']) {
        _user = _authService.currentUser;
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Register
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    required String userType,
    String? phone,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.register(
        email: email,
        password: password,
        fullName: fullName,
        userType: userType,
        phone: phone,
      );

      if (result['success']) {
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Google Sign-In
  Future<Map<String, dynamic>> signInWithGoogle() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.signInWithGoogle();

      if (result['success']) {
        _user = _authService.currentUser;
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Facebook Sign-In
  Future<Map<String, dynamic>> signInWithFacebook() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.signInWithFacebook();

      if (result['success']) {
        _user = _authService.currentUser;
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Apple Sign-In
  Future<Map<String, dynamic>> signInWithApple() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.signInWithApple();

      if (result['success']) {
        _user = _authService.currentUser;
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Send OTP
  Future<Map<String, dynamic>> sendOTP(String phone) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.sendPhoneOTP(phone);

      if (!result['success']) {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String phone, String otp) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.verifyPhoneOTP(phone, otp);

      if (result['success']) {
        _user = _authService.currentUser;
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Reset Password
  Future<Map<String, dynamic>> resetPassword(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.resetPassword(email);

      if (!result['success']) {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update Password
  Future<Map<String, dynamic>> updatePassword(String newPassword) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.updatePassword(newPassword);

      if (!result['success']) {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update Profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> updates) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.updateProfile(updates);

      if (result['success']) {
        _user = _authService.currentUser;
        _error = null;
      } else {
        _error = result['message'];
      }

      return result;
    } catch (e) {
      _error = e.toString();
      return {
        'success': false,
        'message': _error,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      _user = null;
      _error = null;
    } catch (e) {
      _error = e.toString();
      debugPrint('Logout error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Check if user type is complete
  bool isUserTypeComplete() {
    return _user != null && _user!.userType != 'pending';
  }
}