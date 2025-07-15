import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;
  static User? get currentUser => client.auth.currentUser;
  static bool get isLoggedIn => currentUser != null;

  // Initialize Supabase
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: AppConstants.supabaseUrl,
      anonKey: AppConstants.supabaseAnonKey,
    );
  }

  // Authentication Methods
  static Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
    required String userType,
    String? phoneNumber,
  }) async {
    try {
      final response = await client.auth.signUp(
        email: email,
        password: password,
        data: {
          'full_name': fullName,
          'user_type': userType,
          'phone_number': phoneNumber,
        },
      );

      if (response.user != null) {
        // Insert user profile into users table
        await client.from('users').insert({
          'id': response.user!.id,
          'email': email,
          'full_name': fullName,
          'user_type': userType,
          'phone_number': phoneNumber,
          'created_at': DateTime.now().toIso8601String(),
          'status': 'pending',
          'is_email_verified': false,
          'is_phone_verified': false,
          'preferred_language': 'rw',
        });
      }

      return response;
    } catch (e) {
      throw Exception('Sign up failed: ${e.toString()}');
    }
  }

  static Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return response;
    } catch (e) {
      throw Exception('Sign in failed: ${e.toString()}');
    }
  }

  static Future<AuthResponse> signInWithPhone({
    required String phoneNumber,
    required String password,
  }) async {
    try {
      final response = await client.auth.signInWithPassword(
        phone: phoneNumber,
        password: password,
      );
      return response;
    } catch (e) {
      throw Exception('Sign in failed: ${e.toString()}');
    }
  }

  static Future<void> signOut() async {
    try {
      await client.auth.signOut();
    } catch (e) {
      throw Exception('Sign out failed: ${e.toString()}');
    }
  }

  static Future<void> sendOTP({
    required String phoneNumber,
  }) async {
    try {
      await client.auth.signInWithOtp(
        phone: phoneNumber,
      );
    } catch (e) {
      throw Exception('OTP send failed: ${e.toString()}');
    }
  }

  static Future<AuthResponse> verifyOTP({
    required String phoneNumber,
    required String otp,
  }) async {
    try {
      final response = await client.auth.verifyOTP(
        phone: phoneNumber,
        token: otp,
        type: OtpType.sms,
      );
      return response;
    } catch (e) {
      throw Exception('OTP verification failed: ${e.toString()}');
    }
  }

  static Future<void> sendPasswordResetEmail({
    required String email,
  }) async {
    try {
      await client.auth.resetPasswordForEmail(email);
    } catch (e) {
      throw Exception('Password reset failed: ${e.toString()}');
    }
  }

  static Future<AuthResponse> updatePassword({
    required String newPassword,
  }) async {
    try {
      final response = await client.auth.updateUser(
        UserAttributes(password: newPassword),
      );
      return response;
    } catch (e) {
      throw Exception('Password update failed: ${e.toString()}');
    }
  }

  // Social Authentication
  static Future<bool> signInWithGoogle() async {
    try {
      final response = await client.auth.signInWithOAuth(
        OAuthProvider.google,
      );
      return response;
    } catch (e) {
      throw Exception('Google sign in failed: ${e.toString()}');
    }
  }

  static Future<bool> signInWithFacebook() async {
    try {
      final response = await client.auth.signInWithOAuth(
        OAuthProvider.facebook,
      );
      return response;
    } catch (e) {
      throw Exception('Facebook sign in failed: ${e.toString()}');
    }
  }

  static Future<bool> signInWithApple() async {
    try {
      final response = await client.auth.signInWithOAuth(
        OAuthProvider.apple,
      );
      return response;
    } catch (e) {
      throw Exception('Apple sign in failed: ${e.toString()}');
    }
  }

  // User Profile Methods
  static Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final response = await client
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to get user profile: ${e.toString()}');
    }
  }

  static Future<void> updateUserProfile({
    required String userId,
    required Map<String, dynamic> data,
  }) async {
    try {
      await client
          .from('users')
          .update(data)
          .eq('id', userId);
    } catch (e) {
      throw Exception('Failed to update user profile: ${e.toString()}');
    }
  }

  static Future<void> updateEmailVerificationStatus({
    required String userId,
    required bool isVerified,
  }) async {
    try {
      await client
          .from('users')
          .update({'is_email_verified': isVerified})
          .eq('id', userId);
    } catch (e) {
      throw Exception('Failed to update email verification: ${e.toString()}');
    }
  }

  static Future<void> updatePhoneVerificationStatus({
    required String userId,
    required bool isVerified,
  }) async {
    try {
      await client
          .from('users')
          .update({'is_phone_verified': isVerified})
          .eq('id', userId);
    } catch (e) {
      throw Exception('Failed to update phone verification: ${e.toString()}');
    }
  }

  // Worker Profile Methods
  static Future<void> createWorkerProfile({
    required String userId,
    required Map<String, dynamic> profileData,
  }) async {
    try {
      await client
          .from('worker_profiles')
          .insert({
            'user_id': userId,
            ...profileData,
          });
    } catch (e) {
      throw Exception('Failed to create worker profile: ${e.toString()}');
    }
  }

  static Future<Map<String, dynamic>?> getWorkerProfile(String userId) async {
    try {
      final response = await client
          .from('worker_profiles')
          .select()
          .eq('user_id', userId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to get worker profile: ${e.toString()}');
    }
  }

  static Future<void> updateWorkerProfile({
    required String userId,
    required Map<String, dynamic> data,
  }) async {
    try {
      await client
          .from('worker_profiles')
          .update(data)
          .eq('user_id', userId);
    } catch (e) {
      throw Exception('Failed to update worker profile: ${e.toString()}');
    }
  }

  static Future<List<Map<String, dynamic>>> searchWorkers({
    String? district,
    List<String>? serviceCategories,
    double? minRating,
    double? maxDistance,
    String? availability,
  }) async {
    try {
      PostgrestFilterBuilder query = client
          .from('worker_profiles')
          .select('''
            *,
            users!inner(*)
          ''');

      if (district != null) {
        query = query.eq('district', district);
      }

      if (serviceCategories != null && serviceCategories.isNotEmpty) {
        query = query.overlaps('service_categories', serviceCategories);
      }

      if (minRating != null) {
        query = query.gte('rating', minRating);
      }

      // Add more filters as needed

      final response = await query;
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to search workers: ${e.toString()}');
    }
  }

  // Household Profile Methods
  static Future<void> createHouseholdProfile({
    required String userId,
    required Map<String, dynamic> profileData,
  }) async {
    try {
      await client
          .from('household_profiles')
          .insert({
            'user_id': userId,
            ...profileData,
          });
    } catch (e) {
      throw Exception('Failed to create household profile: ${e.toString()}');
    }
  }

  static Future<Map<String, dynamic>?> getHouseholdProfile(String userId) async {
    try {
      final response = await client
          .from('household_profiles')
          .select()
          .eq('user_id', userId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to get household profile: ${e.toString()}');
    }
  }

  static Future<void> updateHouseholdProfile({
    required String userId,
    required Map<String, dynamic> data,
  }) async {
    try {
      await client
          .from('household_profiles')
          .update(data)
          .eq('user_id', userId);
    } catch (e) {
      throw Exception('Failed to update household profile: ${e.toString()}');
    }
  }

  // Admin Profile Methods
  static Future<void> createAdminProfile({
    required String userId,
    required Map<String, dynamic> profileData,
  }) async {
    try {
      await client
          .from('admin_profiles')
          .insert({
            'user_id': userId,
            ...profileData,
          });
    } catch (e) {
      throw Exception('Failed to create admin profile: ${e.toString()}');
    }
  }

  static Future<Map<String, dynamic>?> getAdminProfile(String userId) async {
    try {
      final response = await client
          .from('admin_profiles')
          .select()
          .eq('user_id', userId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to get admin profile: ${e.toString()}');
    }
  }

  // File Upload Methods
  static Future<String> uploadFile({
    required String bucketName,
    required String fileName,
    required String filePath,
  }) async {
    try {
      final response = await client.storage
          .from(bucketName)
          .upload(fileName, filePath);
      
      return client.storage
          .from(bucketName)
          .getPublicUrl(fileName);
    } catch (e) {
      throw Exception('File upload failed: ${e.toString()}');
    }
  }

  static Future<void> deleteFile({
    required String bucketName,
    required String fileName,
  }) async {
    try {
      await client.storage
          .from(bucketName)
          .remove([fileName]);
    } catch (e) {
      throw Exception('File deletion failed: ${e.toString()}');
    }
  }

  // Real-time subscriptions
  static RealtimeChannel subscribeToUserUpdates({
    required String userId,
    required void Function(Map<String, dynamic>) onUpdate,
  }) {
    return client
        .from('users')
        .stream(primaryKey: ['id'])
        .eq('id', userId)
        .listen(onUpdate);
  }

  static RealtimeChannel subscribeToWorkerUpdates({
    required String userId,
    required void Function(Map<String, dynamic>) onUpdate,
  }) {
    return client
        .from('worker_profiles')
        .stream(primaryKey: ['user_id'])
        .eq('user_id', userId)
        .listen(onUpdate);
  }

  // Verification Methods
  static Future<void> submitVerificationDocuments({
    required String userId,
    required String userType,
    required List<String> documentUrls,
  }) async {
    try {
      await client.from('verification_documents').insert({
        'user_id': userId,
        'user_type': userType,
        'document_urls': documentUrls,
        'status': 'pending',
        'submitted_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to submit verification documents: ${e.toString()}');
    }
  }

  static Future<Map<String, dynamic>?> getVerificationStatus(String userId) async {
    try {
      final response = await client
          .from('verification_documents')
          .select()
          .eq('user_id', userId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to get verification status: ${e.toString()}');
    }
  }

  // Error Handling
  static String getErrorMessage(Object error) {
    if (error is AuthException) {
      return error.message;
    } else if (error is PostgrestException) {
      return error.message;
    } else if (error is StorageException) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }

  // Utility Methods
  static Future<bool> checkConnection() async {
    try {
      await client.from('users').select('id').limit(1);
      return true;
    } catch (e) {
      return false;
    }
  }

  static Future<Map<String, dynamic>> getAppStatistics() async {
    try {
      final totalUsers = await client
          .from('users')
          .select('id', const FetchOptions(count: CountOption.exact));

      final totalWorkers = await client
          .from('worker_profiles')
          .select('user_id', const FetchOptions(count: CountOption.exact));

      final totalHouseholds = await client
          .from('household_profiles')
          .select('user_id', const FetchOptions(count: CountOption.exact));

      return {
        'total_users': totalUsers.count,
        'total_workers': totalWorkers.count,
        'total_households': totalHouseholds.count,
      };
    } catch (e) {
      throw Exception('Failed to get app statistics: ${e.toString()}');
    }
  }
}