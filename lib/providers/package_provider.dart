import 'package:flutter/foundation.dart';
import '../models/service_package_model.dart';
import '../services/supabase_service.dart';

class PackageProvider extends ChangeNotifier {
  List<ServicePackageModel> _packages = [];
  List<ServicePackageModel> _featuredPackages = [];
  ServicePackageModel? _selectedPackage;
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  List<ServicePackageModel> get packages => _packages;
  List<ServicePackageModel> get featuredPackages => _featuredPackages;
  ServicePackageModel? get selectedPackage => _selectedPackage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set error message
  void _setError(String error) {
    _errorMessage = error;
    if (kDebugMode) {
      print('Package Provider Error: $error');
    }
    notifyListeners();
  }

  // Get all packages
  Future<void> getAllPackages() async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('service_packages')
          .select('*')
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _packages = response
          .map<ServicePackageModel>(
            (json) => ServicePackageModel.fromJson(json),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load packages: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get packages by category
  Future<void> getPackagesByCategory(PackageCategory category) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('service_packages')
          .select('*')
          .eq('category', category.value)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _packages = response
          .map<ServicePackageModel>(
            (json) => ServicePackageModel.fromJson(json),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load packages by category: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get packages by type
  Future<void> getPackagesByType(PackageType type) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('service_packages')
          .select('*')
          .eq('type', type.value)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _packages = response
          .map<ServicePackageModel>(
            (json) => ServicePackageModel.fromJson(json),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load packages by type: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get featured packages
  Future<void> getFeaturedPackages() async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('service_packages')
          .select('*')
          .eq('is_popular', true)
          .eq('is_active', true)
          .order('created_at', ascending: false)
          .limit(6);

      _featuredPackages = response
          .map<ServicePackageModel>(
            (json) => ServicePackageModel.fromJson(json),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load featured packages: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get package by ID
  Future<ServicePackageModel?> getPackageById(String packageId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('service_packages')
          .select('*')
          .eq('id', packageId)
          .single();

      final package = ServicePackageModel.fromJson(response);
      _selectedPackage = package;
      notifyListeners();

      return package;
    } catch (e) {
      _setError('Failed to load package: ${e.toString()}');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // Create package
  Future<bool> createPackage({
    required String name,
    required String description,
    required PackageType type,
    required double price,
    required PricingModel pricingModel,
    required Duration duration,
    required List<ServiceItem> services,
    required PackageCategory category,
    List<String> inclusions = const [],
    List<String> exclusions = const [],
    int maxHours = 8,
    int minHours = 2,
    bool isPopular = false,
    bool isCustomizable = false,
    double? discountPercentage,
    DateTime? validFrom,
    DateTime? validUntil,
    List<String> targetAudience = const [],
    Map<String, dynamic> metadata = const {},
  }) async {
    try {
      _setLoading(true);
      clearError();

      final packagePayload = {
        'name': name,
        'description': description,
        'type': type.value,
        'price': price,
        'pricing_model': pricingModel.value,
        'duration_hours': duration.inHours,
        'services': services.map((s) => s.toJson()).toList(),
        'category': category.value,
        'inclusions': inclusions,
        'exclusions': exclusions,
        'max_hours': maxHours,
        'min_hours': minHours,
        'is_popular': isPopular,
        'is_customizable': isCustomizable,
        'discount_percentage': discountPercentage,
        'valid_from': validFrom?.toIso8601String(),
        'valid_until': validUntil?.toIso8601String(),
        'target_audience': targetAudience,
        'metadata': metadata,
        'is_active': true,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('service_packages')
          .insert(packagePayload);

      // Refresh packages
      await getAllPackages();

      return true;
    } catch (e) {
      _setError('Failed to create package: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Update package
  Future<bool> updatePackage({
    required String packageId,
    required Map<String, dynamic> updateData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      updateData['updated_at'] = DateTime.now().toIso8601String();

      await SupabaseService.client
          .from('service_packages')
          .update(updateData)
          .eq('id', packageId);

      // Refresh packages
      await getAllPackages();

      return true;
    } catch (e) {
      _setError('Failed to update package: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Delete package
  Future<bool> deletePackage(String packageId) async {
    try {
      _setLoading(true);
      clearError();

      await SupabaseService.client
          .from('service_packages')
          .update({
            'is_active': false,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', packageId);

      // Remove from local list
      _packages.removeWhere((package) => package.id == packageId);
      notifyListeners();

      return true;
    } catch (e) {
      _setError('Failed to delete package: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Search packages
  List<ServicePackageModel> searchPackages(String query) {
    if (query.isEmpty) return _packages;

    final lowercaseQuery = query.toLowerCase();
    return _packages
        .where(
          (package) =>
              package.name.toLowerCase().contains(lowercaseQuery) ||
              package.description.toLowerCase().contains(lowercaseQuery) ||
              package.inclusions.any(
                (inclusion) => inclusion.toLowerCase().contains(lowercaseQuery),
              ),
        )
        .toList();
  }

  // Filter packages by price range
  List<ServicePackageModel> filterByPriceRange(
    double minPrice,
    double maxPrice,
  ) {
    return _packages
        .where(
          (package) =>
              package.discountedPrice >= minPrice &&
              package.discountedPrice <= maxPrice,
        )
        .toList();
  }

  // Filter packages by duration
  List<ServicePackageModel> filterByDuration(
    Duration minDuration,
    Duration maxDuration,
  ) {
    return _packages
        .where(
          (package) =>
              package.duration >= minDuration &&
              package.duration <= maxDuration,
        )
        .toList();
  }

  // Get packages with discounts
  List<ServicePackageModel> get discountedPackages {
    return _packages
        .where(
          (package) =>
              package.discountPercentage != null &&
              package.discountPercentage! > 0,
        )
        .toList();
  }

  // Get customizable packages
  List<ServicePackageModel> get customizablePackages {
    return _packages.where((package) => package.isCustomizable).toList();
  }

  // Get packages by pricing model
  List<ServicePackageModel> getPackagesByPricingModel(
    PricingModel pricingModel,
  ) {
    return _packages
        .where((package) => package.pricingModel == pricingModel)
        .toList();
  }

  // Get most popular packages
  List<ServicePackageModel> get popularPackages {
    return _packages.where((package) => package.isPopular).toList();
  }

  // Get affordable packages for user
  List<ServicePackageModel> getAffordablePackages(double budget) {
    return _packages
        .where((package) => package.discountedPrice <= budget)
        .toList();
  }

  // Calculate package savings
  double calculatePackageSavings(ServicePackageModel package) {
    return package.savingsAmount;
  }

  // Get package recommendations based on category
  List<ServicePackageModel> getRecommendedPackages(
    PackageCategory category, {
    int limit = 5,
  }) {
    return _packages
        .where((package) => package.category == category)
        .take(limit)
        .toList();
  }

  // Get package statistics
  Future<Map<String, dynamic>> getPackageStatistics() async {
    try {
      final stats = await SupabaseService.client.rpc('get_package_statistics');

      return stats as Map<String, dynamic>;
    } catch (e) {
      _setError('Failed to load package statistics: ${e.toString()}');
      return {};
    }
  }

  // Set selected package
  void setSelectedPackage(ServicePackageModel? package) {
    _selectedPackage = package;
    notifyListeners();
  }

  // Clear selected package
  void clearSelectedPackage() {
    _selectedPackage = null;
    notifyListeners();
  }

  // Get valid packages (check validity dates)
  List<ServicePackageModel> get validPackages {
    final now = DateTime.now();
    return _packages.where((package) => package.isCurrentlyValid).toList();
  }

  // Sort packages by price (ascending)
  List<ServicePackageModel> get packagesSortedByPriceAsc {
    final sortedList = List<ServicePackageModel>.from(_packages);
    sortedList.sort((a, b) => a.discountedPrice.compareTo(b.discountedPrice));
    return sortedList;
  }

  // Sort packages by price (descending)
  List<ServicePackageModel> get packagesSortedByPriceDesc {
    final sortedList = List<ServicePackageModel>.from(_packages);
    sortedList.sort((a, b) => b.discountedPrice.compareTo(a.discountedPrice));
    return sortedList;
  }

  // Sort packages by duration
  List<ServicePackageModel> get packagesSortedByDuration {
    final sortedList = List<ServicePackageModel>.from(_packages);
    sortedList.sort((a, b) => a.duration.compareTo(b.duration));
    return sortedList;
  }

  // Clear all data
  void clearData() {
    _packages.clear();
    _featuredPackages.clear();
    _selectedPackage = null;
    clearError();
    notifyListeners();
  }

  // Refresh all data
  Future<void> refreshData() async {
    try {
      await getAllPackages();
      await getFeaturedPackages();
    } catch (e) {
      _setError('Failed to refresh data: ${e.toString()}');
    }
  }
}
