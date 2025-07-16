class ComplianceModel {
  final String id;
  final String employeeId;
  final ComplianceType type;
  final String title;
  final String description;
  final ComplianceStatus status;
  final DateTime dueDate;
  final DateTime? completedDate;
  final String? documentUrl;
  final String? notes;
  final CompliancePriority priority;
  final List<String> tags;
  final String? assignedTo;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const ComplianceModel({
    required this.id,
    required this.employeeId,
    required this.type,
    required this.title,
    required this.description,
    required this.status,
    required this.dueDate,
    this.completedDate,
    this.documentUrl,
    this.notes,
    this.priority = CompliancePriority.medium,
    this.tags = const [],
    this.assignedTo,
    required this.createdAt,
    this.updatedAt,
  });

  // Factory constructor for creating from JSON
  factory ComplianceModel.fromJson(Map<String, dynamic> json) {
    return ComplianceModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      type: ComplianceType.fromString(json['type'] as String),
      title: json['title'] as String,
      description: json['description'] as String,
      status: ComplianceStatus.fromString(json['status'] as String),
      dueDate: DateTime.parse(json['due_date'] as String),
      completedDate: json['completed_date'] != null
          ? DateTime.parse(json['completed_date'] as String)
          : null,
      documentUrl: json['document_url'] as String?,
      notes: json['notes'] as String?,
      priority: CompliancePriority.fromString(
        json['priority'] as String? ?? 'medium',
      ),
      tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
      assignedTo: json['assigned_to'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employee_id': employeeId,
      'type': type.value,
      'title': title,
      'description': description,
      'status': status.value,
      'due_date': dueDate.toIso8601String(),
      'completed_date': completedDate?.toIso8601String(),
      'document_url': documentUrl,
      'notes': notes,
      'priority': priority.value,
      'tags': tags,
      'assigned_to': assignedTo,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  ComplianceModel copyWith({
    String? id,
    String? employeeId,
    ComplianceType? type,
    String? title,
    String? description,
    ComplianceStatus? status,
    DateTime? dueDate,
    DateTime? completedDate,
    String? documentUrl,
    String? notes,
    CompliancePriority? priority,
    List<String>? tags,
    String? assignedTo,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ComplianceModel(
      id: id ?? this.id,
      employeeId: employeeId ?? this.employeeId,
      type: type ?? this.type,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      dueDate: dueDate ?? this.dueDate,
      completedDate: completedDate ?? this.completedDate,
      documentUrl: documentUrl ?? this.documentUrl,
      notes: notes ?? this.notes,
      priority: priority ?? this.priority,
      tags: tags ?? this.tags,
      assignedTo: assignedTo ?? this.assignedTo,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Check if compliance is overdue
  bool get isOverdue {
    return status != ComplianceStatus.completed &&
        DateTime.now().isAfter(dueDate);
  }

  // Get days until due
  int get daysUntilDue {
    return dueDate.difference(DateTime.now()).inDays;
  }

  // Check if compliance is due soon (within 7 days)
  bool get isDueSoon {
    return status != ComplianceStatus.completed &&
        daysUntilDue <= 7 &&
        daysUntilDue >= 0;
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ComplianceModel &&
        other.id == id &&
        other.employeeId == employeeId &&
        other.type == type &&
        other.title == title &&
        other.description == description &&
        other.status == status &&
        other.dueDate == dueDate &&
        other.completedDate == completedDate &&
        other.documentUrl == documentUrl &&
        other.notes == notes &&
        other.priority == priority &&
        other.tags.toString() == tags.toString() &&
        other.assignedTo == assignedTo &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      employeeId,
      type,
      title,
      description,
      status,
      dueDate,
      completedDate,
      documentUrl,
      notes,
      priority,
      tags,
      assignedTo,
      createdAt,
      updatedAt,
    );
  }

  @override
  String toString() {
    return 'ComplianceModel(id: $id, employeeId: $employeeId, type: $type, '
        'title: $title, status: $status, dueDate: $dueDate, priority: $priority)';
  }
}

enum ComplianceType {
  medicalCheckup('medical_checkup'),
  vaccination('vaccination'),
  backgroundCheck('background_check'),
  training('training'),
  certification('certification'),
  workPermit('work_permit'),
  contractRenewal('contract_renewal'),
  insurance('insurance'),
  safetyTraining('safety_training'),
  other('other');

  const ComplianceType(this.value);

  final String value;

  static ComplianceType fromString(String value) {
    return ComplianceType.values.firstWhere(
      (type) => type.value == value.toLowerCase(),
      orElse: () => ComplianceType.other,
    );
  }

  String get displayName {
    switch (this) {
      case ComplianceType.medicalCheckup:
        return 'Medical Checkup';
      case ComplianceType.vaccination:
        return 'Vaccination';
      case ComplianceType.backgroundCheck:
        return 'Background Check';
      case ComplianceType.training:
        return 'Training';
      case ComplianceType.certification:
        return 'Certification';
      case ComplianceType.workPermit:
        return 'Work Permit';
      case ComplianceType.contractRenewal:
        return 'Contract Renewal';
      case ComplianceType.insurance:
        return 'Insurance';
      case ComplianceType.safetyTraining:
        return 'Safety Training';
      case ComplianceType.other:
        return 'Other';
    }
  }
}

enum ComplianceStatus {
  pending('pending'),
  inProgress('in_progress'),
  completed('completed'),
  overdue('overdue'),
  cancelled('cancelled');

  const ComplianceStatus(this.value);

  final String value;

  static ComplianceStatus fromString(String value) {
    return ComplianceStatus.values.firstWhere(
      (status) => status.value == value.toLowerCase(),
      orElse: () => ComplianceStatus.pending,
    );
  }

  String get displayName {
    switch (this) {
      case ComplianceStatus.pending:
        return 'Pending';
      case ComplianceStatus.inProgress:
        return 'In Progress';
      case ComplianceStatus.completed:
        return 'Completed';
      case ComplianceStatus.overdue:
        return 'Overdue';
      case ComplianceStatus.cancelled:
        return 'Cancelled';
    }
  }
}

enum CompliancePriority {
  low('low'),
  medium('medium'),
  high('high'),
  critical('critical');

  const CompliancePriority(this.value);

  final String value;

  static CompliancePriority fromString(String value) {
    return CompliancePriority.values.firstWhere(
      (priority) => priority.value == value.toLowerCase(),
      orElse: () => CompliancePriority.medium,
    );
  }

  String get displayName {
    switch (this) {
      case CompliancePriority.low:
        return 'Low';
      case CompliancePriority.medium:
        return 'Medium';
      case CompliancePriority.high:
        return 'High';
      case CompliancePriority.critical:
        return 'Critical';
    }
  }
}
