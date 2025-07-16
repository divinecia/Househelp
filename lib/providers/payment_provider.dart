import 'package:flutter/foundation.dart';
import '../models/payment_model.dart';
import '../services/supabase_service.dart';

class PaymentProvider extends ChangeNotifier {
  List<PaymentModel> _payments = [];
  List<PaymentMethod> _paymentMethods = [];
  PaymentModel? _currentPayment;
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  List<PaymentModel> get payments => _payments;
  List<PaymentMethod> get paymentMethods => _paymentMethods;
  PaymentModel? get currentPayment => _currentPayment;
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
      print('Payment Provider Error: $error');
    }
    notifyListeners();
  }

  // Get user payments
  Future<void> getUserPayments(String userId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('payments')
          .select('*')
          .or('payer_id.eq.$userId,payee_id.eq.$userId')
          .order('created_at', ascending: false);

      _payments = response
          .map<PaymentModel>((json) => PaymentModel.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load payments: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Get payment methods
  Future<void> getPaymentMethods(String userId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('payment_methods')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      _paymentMethods = response
          .map<PaymentMethod>((json) => PaymentMethod.fromJson(json))
          .toList();

      notifyListeners();
    } catch (e) {
      _setError('Failed to load payment methods: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // Create payment
  Future<PaymentModel?> createPayment({
    required String payerId,
    required String payeeId,
    required double amount,
    required PaymentType type,
    required String description,
    String? bookingId,
    String? paymentMethodId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final paymentPayload = {
        'payer_id': payerId,
        'payee_id': payeeId,
        'amount': amount,
        'type': type.value,
        'description': description,
        'booking_id': bookingId,
        'payment_method_id': paymentMethodId,
        'metadata': metadata ?? {},
        'status': PaymentStatus.pending.value,
        'created_at': DateTime.now().toIso8601String(),
      };

      final response = await SupabaseService.client
          .from('payments')
          .insert(paymentPayload)
          .select()
          .single();

      final payment = PaymentModel.fromJson(response);
      _currentPayment = payment;

      // Add to payments list
      _payments.insert(0, payment);
      notifyListeners();

      return payment;
    } catch (e) {
      _setError('Failed to create payment: ${e.toString()}');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // Process payment
  Future<bool> processPayment({
    required String paymentId,
    required String paymentMethodId,
    Map<String, dynamic>? processingData,
  }) async {
    try {
      _setLoading(true);
      clearError();

      // Update payment status to processing
      await SupabaseService.client
          .from('payments')
          .update({
            'status': PaymentStatus.processing.value,
            'payment_method_id': paymentMethodId,
            'processing_data': processingData ?? {},
            'processed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', paymentId);

      // Simulate payment processing (replace with actual payment gateway integration)
      await Future.delayed(const Duration(seconds: 2));

      // Update payment status to completed
      await SupabaseService.client
          .from('payments')
          .update({
            'status': PaymentStatus.completed.value,
            'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', paymentId);

      // Refresh payments
      if (_currentPayment != null) {
        await getUserPayments(_currentPayment!.payerId);
      }

      return true;
    } catch (e) {
      // Update payment status to failed
      await SupabaseService.client
          .from('payments')
          .update({
            'status': PaymentStatus.failed.value,
            'failed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', paymentId);

      _setError('Failed to process payment: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Add payment method
  Future<bool> addPaymentMethod({
    required String userId,
    required PaymentMethodType type,
    required String displayName,
    required Map<String, dynamic> methodData,
    bool isDefault = false,
  }) async {
    try {
      _setLoading(true);
      clearError();

      // If this is set as default, update other methods
      if (isDefault) {
        await SupabaseService.client
            .from('payment_methods')
            .update({'is_default': false})
            .eq('user_id', userId);
      }

      final methodPayload = {
        'user_id': userId,
        'type': type.value,
        'display_name': displayName,
        'method_data': methodData,
        'is_default': isDefault,
        'is_active': true,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('payment_methods')
          .insert(methodPayload);

      // Refresh payment methods
      await getPaymentMethods(userId);

      return true;
    } catch (e) {
      _setError('Failed to add payment method: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Update payment method
  Future<bool> updatePaymentMethod({
    required String methodId,
    String? displayName,
    Map<String, dynamic>? methodData,
    bool? isDefault,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final updateData = <String, dynamic>{
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (displayName != null) updateData['display_name'] = displayName;
      if (methodData != null) updateData['method_data'] = methodData;
      if (isDefault != null) updateData['is_default'] = isDefault;

      await SupabaseService.client
          .from('payment_methods')
          .update(updateData)
          .eq('id', methodId);

      // Refresh payment methods
      final method = _paymentMethods.firstWhere((m) => m.id == methodId);
      await getPaymentMethods(method.userId);

      return true;
    } catch (e) {
      _setError('Failed to update payment method: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Delete payment method
  Future<bool> deletePaymentMethod(String methodId) async {
    try {
      _setLoading(true);
      clearError();

      await SupabaseService.client
          .from('payment_methods')
          .update({
            'is_active': false,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', methodId);

      // Remove from local list
      _paymentMethods.removeWhere((method) => method.id == methodId);
      notifyListeners();

      return true;
    } catch (e) {
      _setError('Failed to delete payment method: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Refund payment
  Future<bool> refundPayment({
    required String paymentId,
    required double refundAmount,
    required String reason,
  }) async {
    try {
      _setLoading(true);
      clearError();

      final refundPayload = {
        'payment_id': paymentId,
        'refund_amount': refundAmount,
        'reason': reason,
        'status': RefundStatus.pending.value,
        'requested_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from('payment_refunds')
          .insert(refundPayload);

      // Update payment status
      await SupabaseService.client
          .from('payments')
          .update({
            'status': PaymentStatus.refunded.value,
            'refunded_at': DateTime.now().toIso8601String(),
          })
          .eq('id', paymentId);

      return true;
    } catch (e) {
      _setError('Failed to process refund: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Get payment by ID
  Future<PaymentModel?> getPaymentById(String paymentId) async {
    try {
      _setLoading(true);
      clearError();

      final response = await SupabaseService.client
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();

      final payment = PaymentModel.fromJson(response);
      _currentPayment = payment;
      notifyListeners();

      return payment;
    } catch (e) {
      _setError('Failed to load payment: ${e.toString()}');
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // Get payment statistics
  Future<Map<String, dynamic>> getPaymentStatistics(String userId) async {
    try {
      final stats = await SupabaseService.client.rpc(
        'get_payment_statistics',
        params: {'user_id': userId},
      );

      return stats as Map<String, dynamic>;
    } catch (e) {
      _setError('Failed to load payment statistics: ${e.toString()}');
      return {};
    }
  }

  // Get pending payments
  List<PaymentModel> get pendingPayments {
    return _payments
        .where((payment) => payment.status == PaymentStatus.pending)
        .toList();
  }

  // Get completed payments
  List<PaymentModel> get completedPayments {
    return _payments
        .where((payment) => payment.status == PaymentStatus.completed)
        .toList();
  }

  // Get default payment method
  PaymentMethod? get defaultPaymentMethod {
    try {
      return _paymentMethods.firstWhere((method) => method.isDefault);
    } catch (e) {
      return _paymentMethods.isNotEmpty ? _paymentMethods.first : null;
    }
  }

  // Calculate total earnings
  double calculateTotalEarnings(String userId) {
    return _payments
        .where(
          (payment) =>
              payment.payeeId == userId &&
              payment.status == PaymentStatus.completed,
        )
        .fold(0.0, (sum, payment) => sum + payment.amount);
  }

  // Calculate total spending
  double calculateTotalSpending(String userId) {
    return _payments
        .where(
          (payment) =>
              payment.payerId == userId &&
              payment.status == PaymentStatus.completed,
        )
        .fold(0.0, (sum, payment) => sum + payment.amount);
  }

  // Clear all data
  void clearData() {
    _payments.clear();
    _paymentMethods.clear();
    _currentPayment = null;
    clearError();
    notifyListeners();
  }
}
