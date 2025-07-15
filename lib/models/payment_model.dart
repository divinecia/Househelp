class PaymentCalculation {
  final double grossAmount;
  final double vatAmount;
  final double incomeTax;
  final double socialSecurity;
  final double netAmount;
  final String paymentType;

  PaymentCalculation({
    required this.grossAmount,
    required this.vatAmount,
    required this.incomeTax,
    required this.socialSecurity,
    required this.netAmount,
    required this.paymentType,
  });

  Map<String, dynamic> toJson() {
    return {
      'gross_amount': grossAmount,
      'vat_amount': vatAmount,
      'income_tax': incomeTax,
      'social_security': socialSecurity,
      'net_amount': netAmount,
      'payment_type': paymentType,
    };
  }

  factory PaymentCalculation.fromJson(Map<String, dynamic> json) {
    return PaymentCalculation(
      grossAmount: json['gross_amount']?.toDouble() ?? 0.0,
      vatAmount: json['vat_amount']?.toDouble() ?? 0.0,
      incomeTax: json['income_tax']?.toDouble() ?? 0.0,
      socialSecurity: json['social_security']?.toDouble() ?? 0.0,
      netAmount: json['net_amount']?.toDouble() ?? 0.0,
      paymentType: json['payment_type'] ?? '',
    );
  }
}

class PaymentResponse {
  final bool success;
  final String? transactionId;
  final String message;
  final PaymentCalculation calculation;

  PaymentResponse({
    required this.success,
    this.transactionId,
    required this.message,
    required this.calculation,
  });

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'transaction_id': transactionId,
      'message': message,
      'calculation': calculation.toJson(),
    };
  }

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      success: json['success'] ?? false,
      transactionId: json['transaction_id'],
      message: json['message'] ?? '',
      calculation: PaymentCalculation.fromJson(json['calculation'] ?? {}),
    );
  }
}

class PaymentRecord {
  final String id;
  final String transactionRef;
  final double amount;
  final double grossAmount;
  final double vatAmount;
  final double incomeTax;
  final double socialSecurity;
  final String paymentType;
  final String customerEmail;
  final String status;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  PaymentRecord({
    required this.id,
    required this.transactionRef,
    required this.amount,
    required this.grossAmount,
    required this.vatAmount,
    required this.incomeTax,
    required this.socialSecurity,
    required this.paymentType,
    required this.customerEmail,
    required this.status,
    required this.createdAt,
    this.metadata,
  });

  factory PaymentRecord.fromJson(Map<String, dynamic> json) {
    return PaymentRecord(
      id: json['id'],
      transactionRef: json['transaction_ref'],
      amount: json['amount']?.toDouble() ?? 0.0,
      grossAmount: json['gross_amount']?.toDouble() ?? 0.0,
      vatAmount: json['vat_amount']?.toDouble() ?? 0.0,
      incomeTax: json['income_tax']?.toDouble() ?? 0.0,
      socialSecurity: json['social_security']?.toDouble() ?? 0.0,
      paymentType: json['payment_type'],
      customerEmail: json['customer_email'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'transaction_ref': transactionRef,
      'amount': amount,
      'gross_amount': grossAmount,
      'vat_amount': vatAmount,
      'income_tax': incomeTax,
      'social_security': socialSecurity,
      'payment_type': paymentType,
      'customer_email': customerEmail,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

class TaxReport {
  final String id;
  final String transactionId;
  final double vatAmount;
  final double incomeTax;
  final double socialSecurity;
  final DateTime reportingDate;
  final String rraStatus;

  TaxReport({
    required this.id,
    required this.transactionId,
    required this.vatAmount,
    required this.incomeTax,
    required this.socialSecurity,
    required this.reportingDate,
    required this.rraStatus,
  });

  factory TaxReport.fromJson(Map<String, dynamic> json) {
    return TaxReport(
      id: json['id'],
      transactionId: json['transaction_id'],
      vatAmount: json['vat_amount']?.toDouble() ?? 0.0,
      incomeTax: json['income_tax']?.toDouble() ?? 0.0,
      socialSecurity: json['social_security']?.toDouble() ?? 0.0,
      reportingDate: DateTime.parse(json['reporting_date']),
      rraStatus: json['rra_status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'transaction_id': transactionId,
      'vat_amount': vatAmount,
      'income_tax': incomeTax,
      'social_security': socialSecurity,
      'reporting_date': reportingDate.toIso8601String(),
      'rra_status': rraStatus,
    };
  }
}

class WorkerEarnings {
  final String id;
  final String workerId;
  final double grossAmount;
  final double netAmount;
  final double incomeTax;
  final double socialSecurity;
  final DateTime paymentDate;
  final String paymentType;

  WorkerEarnings({
    required this.id,
    required this.workerId,
    required this.grossAmount,
    required this.netAmount,
    required this.incomeTax,
    required this.socialSecurity,
    required this.paymentDate,
    required this.paymentType,
  });

  factory WorkerEarnings.fromJson(Map<String, dynamic> json) {
    return WorkerEarnings(
      id: json['id'],
      workerId: json['worker_id'],
      grossAmount: json['gross_amount']?.toDouble() ?? 0.0,
      netAmount: json['net_amount']?.toDouble() ?? 0.0,
      incomeTax: json['income_tax']?.toDouble() ?? 0.0,
      socialSecurity: json['social_security']?.toDouble() ?? 0.0,
      paymentDate: DateTime.parse(json['payment_date']),
      paymentType: json['payment_type'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'worker_id': workerId,
      'gross_amount': grossAmount,
      'net_amount': netAmount,
      'income_tax': incomeTax,
      'social_security': socialSecurity,
      'payment_date': paymentDate.toIso8601String(),
      'payment_type': paymentType,
    };
  }
}

class RefundRecord {
  final String id;
  final String originalTransactionId;
  final double refundAmount;
  final String reason;
  final String status;
  final DateTime createdAt;

  RefundRecord({
    required this.id,
    required this.originalTransactionId,
    required this.refundAmount,
    required this.reason,
    required this.status,
    required this.createdAt,
  });

  factory RefundRecord.fromJson(Map<String, dynamic> json) {
    return RefundRecord(
      id: json['id'],
      originalTransactionId: json['original_transaction_id'],
      refundAmount: json['refund_amount']?.toDouble() ?? 0.0,
      reason: json['reason'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'original_transaction_id': originalTransactionId,
      'refund_amount': refundAmount,
      'reason': reason,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}