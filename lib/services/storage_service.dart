import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  SharedPreferences? _preferences;

  // Initialize storage
  Future<void> initialize() async {
    _preferences = await SharedPreferences.getInstance();
  }

  // Secure storage methods (for sensitive data)
  Future<void> setSecureString(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  Future<String?> getSecureString(String key) async {
    return await _secureStorage.read(key: key);
  }

  Future<void> deleteSecureString(String key) async {
    await _secureStorage.delete(key: key);
  }

  // Regular storage methods (for non-sensitive data)
  Future<void> setString(String key, String value) async {
    await _preferences!.setString(key, value);
  }

  String? getString(String key) {
    return _preferences!.getString(key);
  }

  Future<void> setBool(String key, bool value) async {
    await _preferences!.setBool(key, value);
  }

  bool? getBool(String key) {
    return _preferences!.getBool(key);
  }

  Future<void> setInt(String key, int value) async {
    await _preferences!.setInt(key, value);
  }

  int? getInt(String key) {
    return _preferences!.getInt(key);
  }

  Future<void> setDouble(String key, double value) async {
    await _preferences!.setDouble(key, value);
  }

  double? getDouble(String key) {
    return _preferences!.getDouble(key);
  }

  Future<void> setStringList(String key, List<String> value) async {
    await _preferences!.setStringList(key, value);
  }

  List<String>? getStringList(String key) {
    return _preferences!.getStringList(key);
  }

  Future<void> remove(String key) async {
    await _preferences!.remove(key);
  }

  bool containsKey(String key) {
    return _preferences!.containsKey(key);
  }

  // App-specific storage methods
  Future<void> setUserType(String userType) async {
    await setString(AppConstants.keyUserType, userType);
  }

  String? getUserType() {
    return getString(AppConstants.keyUserType);
  }

  Future<void> setLanguage(String language) async {
    await setString(AppConstants.keyLanguage, language);
  }

  String? getLanguage() {
    return getString(AppConstants.keyLanguage);
  }

  Future<void> setRememberMe(bool remember) async {
    await setBool(AppConstants.keyRememberMe, remember);
  }

  bool getRememberMe() {
    return getBool(AppConstants.keyRememberMe) ?? false;
  }

  Future<void> setBiometricEnabled(bool enabled) async {
    await setBool(AppConstants.keyBiometricEnabled, enabled);
  }

  bool getBiometricEnabled() {
    return getBool(AppConstants.keyBiometricEnabled) ?? false;
  }

  Future<void> setFirstTime(bool isFirstTime) async {
    await setBool(AppConstants.keyFirstTime, isFirstTime);
  }

  bool isFirstTime() {
    return getBool(AppConstants.keyFirstTime) ?? true;
  }

  // Clear all data
  Future<void> clearAll() async {
    await _preferences!.clear();
    await _secureStorage.deleteAll();
  }

  // Clear only non-secure data
  Future<void> clearPreferences() async {
    await _preferences!.clear();
  }

  // Clear only secure data
  Future<void> clearSecureStorage() async {
    await _secureStorage.deleteAll();
  }
}