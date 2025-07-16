class UrgentBookingModel {
  final String id;
  final String customerId;
  final String? employeeId;
  final UrgencyLevel urgencyLevel;
  final String title;
  final String description;
  final List<String> serviceTypes;
  final String location;
  final double? latitude;
  final double? longitude;
  final DateTime requestedStartTime;
  final DateTime? requestedEndTime;
  final Duration? estimatedDuration;
  final double? offeredPrice;
  final double? finalPrice;
  final UrgentBookingStatus status;
  final List<String> requirements;
  final List<String> specialInstructions;
  final bool requiresEquipment;
  final bool requiresSupplies;
  final ContactInfo contactInfo;
  final DateTime createdAt;
  final DateTime? acceptedAt;
  final DateTime? completedAt;
  final DateTime? cancelledAt;
  final String? cancellationReason;
  final List<UrgentBookingResponse> responses;
  final PaymentInfo? paymentInfo;
  final Map<String, dynamic> metadata;

  const UrgentBookingModel({
    required this.id,
    required this.customerId,
    this.employeeId,
    required this.urgencyLevel,
    required this.title,
    required this.description,
    required this.serviceTypes,
    required this.location,
    this.latitude,
    this.longitude,
    required this.requestedStartTime,
    this.requestedEndTime,
    this.estimatedDuration,
    this.offeredPrice,
    this.finalPrice,
    this.status = UrgentBookingStatus.pending,
    this.requirements = const [],
    this.specialInstructions = const [],
    this.requiresEquipment = false,
    this.requiresSupplies = false,
    required this.contactInfo,
    required this.createdAt,
    this.acceptedAt,
    this.completedAt,
    this.cancelledAt,
    this.cancellationReason,
    this.responses = const [],
    this.paymentInfo,
    this.metadata = const {},
  });

  // Factory constructor for creating from JSON
  factory UrgentBookingModel.fromJson(Map<String, dynamic> json) {
    return UrgentBookingModel(
      id: json['id'] as String,
      customerId: json['customer_id'] as String,
      employeeId: json['employee_id'] as String?,
      urgencyLevel: UrgencyLevel.fromString(json['urgency_level'] as String),
      title: json['title'] as String,
      description: json['description'] as String,
      serviceTypes: (json['service_types'] as List<dynamic>).cast<String>(),
      location: json['location'] as String,
      latitude: json['latitude'] != null
          ? (json['latitude'] as num).toDouble()
          : null,
      longitude: json['longitude'] != null
          ? (json['longitude'] as num).toDouble()
          : null,
      requestedStartTime: DateTime.parse(
        json['requested_start_time'] as String,
      ),
      requestedEndTime: json['requested_end_time'] != null
          ? DateTime.parse(json['requested_end_time'] as String)
          : null,
      estimatedDuration: json['estimated_duration_minutes'] != null
          ? Duration(minutes: json['estimated_duration_minutes'] as int)
          : null,
      offeredPrice: json['offered_price'] != null
          ? (json['offered_price'] as num).toDouble()
          : null,
      finalPrice: json['final_price'] != null
          ? (json['final_price'] as num).toDouble()
          : null,
      status: UrgentBookingStatus.fromString(json['status'] as String),
      requirements:
          (json['requirements'] as List<dynamic>?)?.cast<String>() ?? [],
      specialInstructions:
          (json['special_instructions'] as List<dynamic>?)?.cast<String>() ??
          [],
      requiresEquipment: json['requires_equipment'] as bool? ?? false,
      requiresSupplies: json['requires_supplies'] as bool? ?? false,
      contactInfo: ContactInfo.fromJson(
        json['contact_info'] as Map<String, dynamic>,
      ),
      createdAt: DateTime.parse(json['created_at'] as String),
      acceptedAt: json['accepted_at'] != null
          ? DateTime.parse(json['accepted_at'] as String)
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      cancelledAt: json['cancelled_at'] != null
          ? DateTime.parse(json['cancelled_at'] as String)
          : null,
      cancellationReason: json['cancellation_reason'] as String?,
      responses:
          (json['responses'] as List<dynamic>?)
              ?.map(
                (e) =>
                    UrgentBookingResponse.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          [],
      paymentInfo: json['payment_info'] != null
          ? PaymentInfo.fromJson(json['payment_info'] as Map<String, dynamic>)
          : null,
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customer_id': customerId,
      'employee_id': employeeId,
      'urgency_level': urgencyLevel.value,
      'title': title,
      'description': description,
      'service_types': serviceTypes,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'requested_start_time': requestedStartTime.toIso8601String(),
      'requested_end_time': requestedEndTime?.toIso8601String(),
      'estimated_duration_minutes': estimatedDuration?.inMinutes,
      'offered_price': offeredPrice,
      'final_price': finalPrice,
      'status': status.value,
      'requirements': requirements,
      'special_instructions': specialInstructions,
      'requires_equipment': requiresEquipment,
      'requires_supplies': requiresSupplies,
      'contact_info': contactInfo.toJson(),
      'created_at': createdAt.toIso8601String(),
      'accepted_at': acceptedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'cancelled_at': cancelledAt?.toIso8601String(),
      'cancellation_reason': cancellationReason,
      'responses': responses.map((e) => e.toJson()).toList(),
      'payment_info': paymentInfo?.toJson(),
      'metadata': metadata,
    };
  }

  // Create a copy with updated fields
  UrgentBookingModel copyWith({
    String? id,
    String? customerId,
    String? employeeId,
    UrgencyLevel? urgencyLevel,
    String? title,
    String? description,
    List<String>? serviceTypes,
    String? location,
    double? latitude,
    double? longitude,
    DateTime? requestedStartTime,
    DateTime? requestedEndTime,
    Duration? estimatedDuration,
    double? offeredPrice,
    double? finalPrice,
    UrgentBookingStatus? status,
    List<String>? requirements,
    List<String>? specialInstructions,
    bool? requiresEquipment,
    bool? requiresSupplies,
    ContactInfo? contactInfo,
    DateTime? createdAt,
    DateTime? acceptedAt,
    DateTime? completedAt,
    DateTime? cancelledAt,
    String? cancellationReason,
    List<UrgentBookingResponse>? responses,
    PaymentInfo? paymentInfo,
    Map<String, dynamic>? metadata,
  }) {
    return UrgentBookingModel(
      id: id ?? this.id,
      customerId: customerId ?? this.customerId,
      employeeId: employeeId ?? this.employeeId,
      urgencyLevel: urgencyLevel ?? this.urgencyLevel,
      title: title ?? this.title,
      description: description ?? this.description,
      serviceTypes: serviceTypes ?? this.serviceTypes,
      location: location ?? this.location,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      requestedStartTime: requestedStartTime ?? this.requestedStartTime,
      requestedEndTime: requestedEndTime ?? this.requestedEndTime,
      estimatedDuration: estimatedDuration ?? this.estimatedDuration,
      offeredPrice: offeredPrice ?? this.offeredPrice,
      finalPrice: finalPrice ?? this.finalPrice,
      status: status ?? this.status,
      requirements: requirements ?? this.requirements,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      requiresEquipment: requiresEquipment ?? this.requiresEquipment,
      requiresSupplies: requiresSupplies ?? this.requiresSupplies,
      contactInfo: contactInfo ?? this.contactInfo,
      createdAt: createdAt ?? this.createdAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      completedAt: completedAt ?? this.completedAt,
      cancelledAt: cancelledAt ?? this.cancelledAt,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      responses: responses ?? this.responses,
      paymentInfo: paymentInfo ?? this.paymentInfo,
      metadata: metadata ?? this.metadata,
    );
  }

  // Check if booking is still pending
  bool get isPending => status == UrgentBookingStatus.pending;

  // Check if booking has been accepted
  bool get isAccepted => status == UrgentBookingStatus.accepted;

  // Check if booking is in progress
  bool get isInProgress => status == UrgentBookingStatus.inProgress;

  // Check if booking is completed
  bool get isCompleted => status == UrgentBookingStatus.completed;

  // Check if booking is cancelled
  bool get isCancelled => status == UrgentBookingStatus.cancelled;

  // Get time since creation
  Duration get timeSinceCreation => DateTime.now().difference(createdAt);

  // Check if booking is still urgent (within urgency time window)
  bool get isStillUrgent {
    final urgencyWindow = urgencyLevel.timeWindow;
    return DateTime.now().isBefore(requestedStartTime.add(urgencyWindow));
  }

  // Get urgency multiplier for pricing
  double get urgencyMultiplier => urgencyLevel.priceMultiplier;

  // Calculate urgency fee
  double get urgencyFee {
    if (offeredPrice != null) {
      return offeredPrice! * (urgencyMultiplier - 1);
    }
    return 0.0;
  }

  // Get number of responses
  int get responseCount => responses.length;

  // Check if booking has any responses
  bool get hasResponses => responses.isNotEmpty;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UrgentBookingModel &&
        other.id == id &&
        other.customerId == customerId &&
        other.employeeId == employeeId &&
        other.urgencyLevel == urgencyLevel &&
        other.status == status &&
        other.requestedStartTime == requestedStartTime;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      customerId,
      employeeId,
      urgencyLevel,
      status,
      requestedStartTime,
    );
  }

  @override
  String toString() {
    return 'UrgentBookingModel(id: $id, title: $title, urgencyLevel: $urgencyLevel, '
        'status: $status, requestedStartTime: $requestedStartTime)';
  }
}

class UrgentBookingResponse {
  final String id;
  final String bookingId;
  final String employeeId;
  final String employeeName;
  final double proposedPrice;
  final Duration? estimatedArrivalTime;
  final String? message;
  final bool canProvideEquipment;
  final bool canProvideSupplies;
  final ResponseStatus status;
  final DateTime createdAt;
  final DateTime? acceptedAt;
  final DateTime? rejectedAt;

  const UrgentBookingResponse({
    required this.id,
    required this.bookingId,
    required this.employeeId,
    required this.employeeName,
    required this.proposedPrice,
    this.estimatedArrivalTime,
    this.message,
    this.canProvideEquipment = false,
    this.canProvideSupplies = false,
    this.status = ResponseStatus.pending,
    required this.createdAt,
    this.acceptedAt,
    this.rejectedAt,
  });

  factory UrgentBookingResponse.fromJson(Map<String, dynamic> json) {
    return UrgentBookingResponse(
      id: json['id'] as String,
      bookingId: json['booking_id'] as String,
      employeeId: json['employee_id'] as String,
      employeeName: json['employee_name'] as String,
      proposedPrice: (json['proposed_price'] as num).toDouble(),
      estimatedArrivalTime: json['estimated_arrival_minutes'] != null
          ? Duration(minutes: json['estimated_arrival_minutes'] as int)
          : null,
      message: json['message'] as String?,
      canProvideEquipment: json['can_provide_equipment'] as bool? ?? false,
      canProvideSupplies: json['can_provide_supplies'] as bool? ?? false,
      status: ResponseStatus.fromString(json['status'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
      acceptedAt: json['accepted_at'] != null
          ? DateTime.parse(json['accepted_at'] as String)
          : null,
      rejectedAt: json['rejected_at'] != null
          ? DateTime.parse(json['rejected_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_id': bookingId,
      'employee_id': employeeId,
      'employee_name': employeeName,
      'proposed_price': proposedPrice,
      'estimated_arrival_minutes': estimatedArrivalTime?.inMinutes,
      'message': message,
      'can_provide_equipment': canProvideEquipment,
      'can_provide_supplies': canProvideSupplies,
      'status': status.value,
      'created_at': createdAt.toIso8601String(),
      'accepted_at': acceptedAt?.toIso8601String(),
      'rejected_at': rejectedAt?.toIso8601String(),
    };
  }
}

class ContactInfo {
  final String primaryPhone;
  final String? secondaryPhone;
  final String? email;
  final String? preferredContactMethod;
  final bool allowSmsUpdates;
  final bool allowCallUpdates;

  const ContactInfo({
    required this.primaryPhone,
    this.secondaryPhone,
    this.email,
    this.preferredContactMethod,
    this.allowSmsUpdates = true,
    this.allowCallUpdates = true,
  });

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      primaryPhone: json['primary_phone'] as String,
      secondaryPhone: json['secondary_phone'] as String?,
      email: json['email'] as String?,
      preferredContactMethod: json['preferred_contact_method'] as String?,
      allowSmsUpdates: json['allow_sms_updates'] as bool? ?? true,
      allowCallUpdates: json['allow_call_updates'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'primary_phone': primaryPhone,
      'secondary_phone': secondaryPhone,
      'email': email,
      'preferred_contact_method': preferredContactMethod,
      'allow_sms_updates': allowSmsUpdates,
      'allow_call_updates': allowCallUpdates,
    };
  }
}

class PaymentInfo {
  final String? paymentMethodId;
  final String paymentMethod;
  final double totalAmount;
  final double? urgencyFee;
  final String? transactionId;
  final PaymentStatus status;

  const PaymentInfo({
    this.paymentMethodId,
    required this.paymentMethod,
    required this.totalAmount,
    this.urgencyFee,
    this.transactionId,
    this.status = PaymentStatus.pending,
  });

  factory PaymentInfo.fromJson(Map<String, dynamic> json) {
    return PaymentInfo(
      paymentMethodId: json['payment_method_id'] as String?,
      paymentMethod: json['payment_method'] as String,
      totalAmount: (json['total_amount'] as num).toDouble(),
      urgencyFee: json['urgency_fee'] != null
          ? (json['urgency_fee'] as num).toDouble()
          : null,
      transactionId: json['transaction_id'] as String?,
      status: PaymentStatus.fromString(json['status'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'payment_method_id': paymentMethodId,
      'payment_method': paymentMethod,
      'total_amount': totalAmount,
      'urgency_fee': urgencyFee,
      'transaction_id': transactionId,
      'status': status.value,
    };
  }
}

enum UrgencyLevel {
  immediate('immediate', Duration(minutes: 30), 2.0),
  urgent('urgent', Duration(hours: 2), 1.5),
  sameDay('same_day', Duration(hours: 8), 1.25),
  nextDay('next_day', Duration(hours: 24), 1.1);

  const UrgencyLevel(this.value, this.timeWindow, this.priceMultiplier);

  final String value;
  final Duration timeWindow;
  final double priceMultiplier;

  static UrgencyLevel fromString(String value) {
    return UrgencyLevel.values.firstWhere(
      (level) => level.value == value.toLowerCase(),
      orElse: () => UrgencyLevel.sameDay,
    );
  }

  String get displayName {
    switch (this) {
      case UrgencyLevel.immediate:
        return 'Immediate (30 mins)';
      case UrgencyLevel.urgent:
        return 'Urgent (2 hours)';
      case UrgencyLevel.sameDay:
        return 'Same Day';
      case UrgencyLevel.nextDay:
        return 'Next Day';
    }
  }
}

enum UrgentBookingStatus {
  pending('pending'),
  accepted('accepted'),
  inProgress('in_progress'),
  completed('completed'),
  cancelled('cancelled'),
  expired('expired');

  const UrgentBookingStatus(this.value);

  final String value;

  static UrgentBookingStatus fromString(String value) {
    return UrgentBookingStatus.values.firstWhere(
      (status) => status.value == value.toLowerCase(),
      orElse: () => UrgentBookingStatus.pending,
    );
  }

  String get displayName {
    switch (this) {
      case UrgentBookingStatus.pending:
        return 'Pending';
      case UrgentBookingStatus.accepted:
        return 'Accepted';
      case UrgentBookingStatus.inProgress:
        return 'In Progress';
      case UrgentBookingStatus.completed:
        return 'Completed';
      case UrgentBookingStatus.cancelled:
        return 'Cancelled';
      case UrgentBookingStatus.expired:
        return 'Expired';
    }
  }
}

enum ResponseStatus {
  pending('pending'),
  accepted('accepted'),
  rejected('rejected'),
  withdrawn('withdrawn');

  const ResponseStatus(this.value);

  final String value;

  static ResponseStatus fromString(String value) {
    return ResponseStatus.values.firstWhere(
      (status) => status.value == value.toLowerCase(),
      orElse: () => ResponseStatus.pending,
    );
  }

  String get displayName {
    switch (this) {
      case ResponseStatus.pending:
        return 'Pending';
      case ResponseStatus.accepted:
        return 'Accepted';
      case ResponseStatus.rejected:
        return 'Rejected';
      case ResponseStatus.withdrawn:
        return 'Withdrawn';
    }
  }
}

enum PaymentStatus {
  pending('pending'),
  processing('processing'),
  completed('completed'),
  failed('failed'),
  refunded('refunded');

  const PaymentStatus(this.value);

  final String value;

  static PaymentStatus fromString(String value) {
    return PaymentStatus.values.firstWhere(
      (status) => status.value == value.toLowerCase(),
      orElse: () => PaymentStatus.pending,
    );
  }

  String get displayName {
    switch (this) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.processing:
        return 'Processing';
      case PaymentStatus.completed:
        return 'Completed';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }
}
