import 'dart:math';

class LocationModel {
  final String id;
  final String address;
  final String city;
  final String state;
  final String country;
  final String postalCode;
  final double latitude;
  final double longitude;
  final String? landmark;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  LocationModel({
    required this.id,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
    this.landmark,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  // Factory constructor for creating from JSON
  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      id: json['id'] as String,
      address: json['address'] as String,
      city: json['city'] as String,
      state: json['state'] as String,
      country: json['country'] as String,
      postalCode: json['postalCode'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      landmark: json['landmark'] as String?,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'address': address,
      'city': city,
      'state': state,
      'country': country,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'landmark': landmark,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Copy with method for creating modified copies
  LocationModel copyWith({
    String? id,
    String? address,
    String? city,
    String? state,
    String? country,
    String? postalCode,
    double? latitude,
    double? longitude,
    String? landmark,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return LocationModel(
      id: id ?? this.id,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      country: country ?? this.country,
      postalCode: postalCode ?? this.postalCode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      landmark: landmark ?? this.landmark,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Get full address as a single string
  String get fullAddress {
    final parts = [
      address,
      city,
      state,
      postalCode,
      country,
    ].where((part) => part.isNotEmpty).toList();
    return parts.join(', ');
  }

  // Get display address (shorter version)
  String get displayAddress {
    return '$address, $city';
  }

  // Calculate distance to another location (in kilometers)
  double distanceTo(LocationModel other) {
    const double earthRadius = 6371; // Earth's radius in kilometers

    final double lat1Rad = latitude * (3.14159265359 / 180);
    final double lon1Rad = longitude * (3.14159265359 / 180);
    final double lat2Rad = other.latitude * (3.14159265359 / 180);
    final double lon2Rad = other.longitude * (3.14159265359 / 180);

    final double dLat = lat2Rad - lat1Rad;
    final double dLon = lon2Rad - lon1Rad;

    final double a =
        sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1Rad) * cos(lat2Rad) * sin(dLon / 2) * sin(dLon / 2);
    final double c = 2 * asin(sqrt(a));

    return earthRadius * c;
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LocationModel &&
        other.id == id &&
        other.address == address &&
        other.city == city &&
        other.state == state &&
        other.country == country &&
        other.postalCode == postalCode &&
        other.latitude == latitude &&
        other.longitude == longitude &&
        other.landmark == landmark &&
        other.notes == notes;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      landmark,
      notes,
    );
  }

  @override
  String toString() {
    return 'LocationModel(id: $id, address: $address, city: $city, lat: $latitude, lng: $longitude)';
  }
}
