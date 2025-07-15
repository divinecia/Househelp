import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_darwin/local_auth_darwin.dart';
import 'storage_service.dart';

class BiometricService {
  static final BiometricService _instance = BiometricService._internal();
  factory BiometricService() => _instance;
  BiometricService._internal();

  final LocalAuthentication _localAuth = LocalAuthentication();
  final StorageService _storageService = StorageService();

  // Check if biometric authentication is available
  Future<bool> isAvailable() async {
    try {
      final bool isAvailable = await _localAuth.isDeviceSupported();
      return isAvailable;
    } catch (e) {
      debugPrint('Biometric availability check error: $e');
      return false;
    }
  }

  // Check if biometric authentication can be used
  Future<bool> canCheckBiometrics() async {
    try {
      final bool canCheck = await _localAuth.canCheckBiometrics;
      return canCheck;
    } catch (e) {
      debugPrint('Can check biometrics error: $e');
      return false;
    }
  }

  // Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      final List<BiometricType> availableBiometrics = 
          await _localAuth.getAvailableBiometrics();
      return availableBiometrics;
    } catch (e) {
      debugPrint('Get available biometrics error: $e');
      return [];
    }
  }

  // Authenticate with biometrics
  Future<Map<String, dynamic>> authenticateWithBiometrics() async {
    try {
      // Check if biometric authentication is available
      if (!await isAvailable()) {
        return {
          'success': false,
          'message': 'Biometric authentication is not available on this device.',
        };
      }

      if (!await canCheckBiometrics()) {
        return {
          'success': false,
          'message': 'Biometric authentication is not enabled on this device.',
        };
      }

      // Get available biometric types
      final List<BiometricType> availableBiometrics = await getAvailableBiometrics();
      
      if (availableBiometrics.isEmpty) {
        return {
          'success': false,
          'message': 'No biometric authentication methods are set up on this device.',
        };
      }

      // Perform biometric authentication
      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Please authenticate to access your HouseHelp account',
        authMessages: const <AuthMessages>[
          AndroidAuthMessages(
            signInTitle: 'HouseHelp Authentication',
            biometricHint: 'Verify your identity',
            biometricNotRecognized: 'Not recognized, try again',
            biometricRequiredTitle: 'Biometric Required',
            biometricSuccess: 'Authentication successful',
            cancelButton: 'Cancel',
            deviceCredentialsRequiredTitle: 'Device Credentials Required',
            deviceCredentialsSetupDescription: 'Please set up device credentials',
            goToSettingsButton: 'Settings',
            goToSettingsDescription: 'Please set up biometric authentication',
          ),
          IOSAuthMessages(
            lockOut: 'Please re-enable biometric authentication',
            goToSettingsButton: 'Settings',
            goToSettingsDescription: 'Please set up biometric authentication',
            cancelButton: 'Cancel',
          ),
        ],
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
          sensitiveTransaction: true,
        ),
      );

      if (didAuthenticate) {
        return {
          'success': true,
          'message': 'Authentication successful',
          'biometric_types': availableBiometrics.map((type) => type.name).toList(),
        };
      } else {
        return {
          'success': false,
          'message': 'Authentication failed or cancelled',
        };
      }
    } on PlatformException catch (e) {
      debugPrint('Biometric authentication error: $e');
      String message = 'Authentication failed';
      
      switch (e.code) {
        case 'NotAvailable':
          message = 'Biometric authentication is not available';
          break;
        case 'NotEnrolled':
          message = 'No biometric authentication methods are set up';
          break;
        case 'LockedOut':
          message = 'Biometric authentication is locked. Please try again later';
          break;
        case 'PermanentlyLockedOut':
          message = 'Biometric authentication is permanently locked';
          break;
        case 'UserCancel':
          message = 'Authentication cancelled by user';
          break;
        case 'UserFallback':
          message = 'User chose to use fallback authentication';
          break;
        case 'BiometricOnlyNotSupported':
          message = 'Biometric-only authentication is not supported';
          break;
        case 'DeviceNotSupported':
          message = 'Device does not support biometric authentication';
          break;
        case 'InvalidContext':
          message = 'Invalid authentication context';
          break;
        case 'NotRecognized':
          message = 'Biometric not recognized';
          break;
        default:
          message = 'Authentication failed: ${e.message}';
          break;
      }
      
      return {
        'success': false,
        'message': message,
        'error_code': e.code,
      };
    } catch (e) {
      debugPrint('Biometric authentication error: $e');
      return {
        'success': false,
        'message': 'Authentication failed: $e',
      };
    }
  }

  // Enable biometric authentication for the app
  Future<Map<String, dynamic>> enableBiometricAuth() async {
    try {
      final result = await authenticateWithBiometrics();
      
      if (result['success']) {
        await _storageService.setBiometricEnabled(true);
        return {
          'success': true,
          'message': 'Biometric authentication enabled successfully',
        };
      } else {
        return result;
      }
    } catch (e) {
      debugPrint('Enable biometric auth error: $e');
      return {
        'success': false,
        'message': 'Failed to enable biometric authentication',
      };
    }
  }

  // Disable biometric authentication for the app
  Future<void> disableBiometricAuth() async {
    try {
      await _storageService.setBiometricEnabled(false);
    } catch (e) {
      debugPrint('Disable biometric auth error: $e');
    }
  }

  // Check if biometric authentication is enabled for the app
  bool isBiometricEnabled() {
    return _storageService.getBiometricEnabled();
  }

  // Get biometric type name for display
  String getBiometricTypeName(BiometricType type) {
    switch (type) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Fingerprint';
      case BiometricType.iris:
        return 'Iris';
      case BiometricType.weak:
        return 'Weak Biometric';
      case BiometricType.strong:
        return 'Strong Biometric';
      default:
        return 'Biometric';
    }
  }

  // Get biometric icon for display
  String getBiometricIcon(BiometricType type) {
    switch (type) {
      case BiometricType.face:
        return 'face_id';
      case BiometricType.fingerprint:
        return 'fingerprint';
      case BiometricType.iris:
        return 'iris';
      default:
        return 'biometric';
    }
  }

  // Check if device supports specific biometric type
  Future<bool> supportsBiometricType(BiometricType type) async {
    try {
      final List<BiometricType> availableBiometrics = await getAvailableBiometrics();
      return availableBiometrics.contains(type);
    } catch (e) {
      debugPrint('Check biometric type support error: $e');
      return false;
    }
  }

  // Get primary biometric type (for display purposes)
  Future<BiometricType?> getPrimaryBiometricType() async {
    try {
      final List<BiometricType> availableBiometrics = await getAvailableBiometrics();
      
      if (availableBiometrics.isEmpty) {
        return null;
      }

      // Prioritize Face ID, then Fingerprint, then others
      if (availableBiometrics.contains(BiometricType.face)) {
        return BiometricType.face;
      } else if (availableBiometrics.contains(BiometricType.fingerprint)) {
        return BiometricType.fingerprint;
      } else {
        return availableBiometrics.first;
      }
    } catch (e) {
      debugPrint('Get primary biometric type error: $e');
      return null;
    }
  }

  // Stop biometric authentication (if in progress)
  Future<void> stopAuthentication() async {
    try {
      await _localAuth.stopAuthentication();
    } catch (e) {
      debugPrint('Stop authentication error: $e');
    }
  }
}