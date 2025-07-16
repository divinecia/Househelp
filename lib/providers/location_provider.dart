import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../models/location_model.dart';
import '../services/supabase_service.dart';

class LocationProvider extends ChangeNotifier {
  Position? _currentPosition;
  LocationModel? _currentLocation;
  List<LocationModel> _savedLocations = [];
  List<LocationModel> _nearbyWorkers = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _locationPermissionGranted = false;

  // Getters
  Position? get currentPosition => _currentPosition;
  LocationModel? get currentLocation => _currentLocation;
  List<LocationModel> get savedLocations => _savedLocations;
  List<LocationModel> get nearbyWorkers => _nearbyWorkers;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get locationPermissionGranted => _locationPermissionGranted;

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
      print('Location Provider Error: $error');
    }
    notifyListeners();
  }

  // Check and request location permissions
  Future<bool> checkLocationPermissions() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        _setError('Location permissions are permanently denied');
        return false;
      }

      if (permission == LocationPermission.denied) {
        _setError('Location permissions are denied');
        return false;
      }

      _locationPermissionGranted = true;
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Failed to check location permissions: ${e.toString()}');
      return false;
    }
  }

  // Get current location
  Future<bool> getCurrentLocation() async {
    try {
      _setLoading(true);
      clearError();

      // Check permissions first
      if (!await checkLocationPermissions()) {
        return false;
      }

      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _setError('Location services are disabled');
        return false;
      }

      // Get current position
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Get address from coordinates
      await _getAddressFromCoordinates(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
      );

      return true;
    } catch (e) {
      _setError('Failed to get current location: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get address from coordinates
  Future<void> _getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      
      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        
        _currentLocation = LocationModel(
          id: 'current',
          userId: '', // Will be set when saving
          latitude: latitude,
          longitude: longitude,
          address: _formatAddress(placemark),
          city: placemark.locality ?? '',
          state: placemark.administrativeArea ?? '',
          country: placemark.country ?? '',
          postalCode: placemark.postalCode ?? '',
          type: LocationType.current,
          isDefault: false,
          createdAt: DateTime.now(),
        );

        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error getting address: $e');
      }
    }
  }

  // Format address from placemark
  String _formatAddress(Placemark placemark) {
    List<String> addressParts = [];
    
    if (placemark.street?.isNotEmpty == true) {
      addressParts.add(placemark.street!);
    }
    if (placemark.subLocality?.isNotEmpty == true) {
      addressParts.add(placemark.subLocality!);
    }
    if (placemark.locality?.isNotEmpty == true) {
      addressParts.add(placemark.locality!);
    }
    if (placemark.administrativeArea?.isNotEmpty == true) {
      addressParts.add(placemark.administrativeArea!);
    }
    
    return addressParts.join(', ');
  }

  // Get coordinates from address
  Future<LocationModel?> getCoordinatesFromAddress(String address) async {
    try// filepath: /media/iradie/Ira/Devs/househelp/lib/providers/location_provider.dart
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../models/location_model.dart';
import '../services/supabase_service.dart';

class LocationProvider extends ChangeNotifier {
  Position? _currentPosition;
  LocationModel? _currentLocation;
  List<LocationModel> _savedLocations = [];
  List<LocationModel> _nearbyWorkers = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _locationPermissionGranted = false;

  // Getters
  Position? get currentPosition => _currentPosition;
  LocationModel? get currentLocation => _currentLocation;
  List<LocationModel> get savedLocations => _savedLocations;
  List<LocationModel> get nearbyWorkers => _nearbyWorkers;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get locationPermissionGranted => _locationPermissionGranted;

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
      print('Location Provider Error: $error');
    }
    notifyListeners();
  }

  // Check and request location permissions
  Future<bool> checkLocationPermissions() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        _setError('Location permissions are permanently denied');
        return false;
      }

      if (permission == LocationPermission.denied) {
        _setError('Location permissions are denied');
        return false;
      }

      _locationPermissionGranted = true;
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Failed to check location permissions: ${e.toString()}');
      return false;
    }
  }

  // Get current location
  Future<bool> getCurrentLocation() async {
    try {
      _setLoading(true);
      clearError();

      // Check permissions first
      if (!await checkLocationPermissions()) {
        return false;
      }

      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _setError('Location services are disabled');
        return false;
      }

      // Get current position
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Get address from coordinates
      await _getAddressFromCoordinates(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
      );

      return true;
    } catch (e) {
      _setError('Failed to get current location: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get address from coordinates
  Future<void> _getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      
      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        
        _currentLocation = LocationModel(
          id: 'current',
          userId: '', // Will be set when saving
          latitude: latitude,
          longitude: longitude,
          address: _formatAddress(placemark),
          city: placemark.locality ?? '',
          state: placemark.administrativeArea ?? '',
          country: placemark.country ?? '',
          postalCode: placemark.postalCode ?? '',
          type: LocationType.current,
          isDefault: false,
          createdAt: DateTime.now(),
        );

        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error getting address: $e');
      }
    }
  }

  // Format address from placemark
  String _formatAddress(Placemark placemark) {
    List<String> addressParts = [];
    
    if (placemark.street?.isNotEmpty == true) {
      addressParts.add(placemark.street!);
    }
    if (placemark.subLocality?.isNotEmpty == true) {
      addressParts.add(placemark.subLocality!);
    }
    if (placemark.locality?.isNotEmpty == true) {
      addressParts.add(placemark.locality!);
    }
    if (placemark.administrativeArea?.isNotEmpty == true) {
      addressParts.add(placemark.administrativeArea!);
    }
    
    return addressParts.join(', ');
  }

  // Get coordinates from address
  Future<LocationModel?> getCoordinatesFromAddress(String address) async {
    try