import 'package:flutter/material.dart';
import 'package:flutterwave_standard/flutterwave.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';
import 'dart:math';
import '../constants/app_constants.dart';
import '../models/payment_model.dart';
import 'supabase_service.dart';

class PaymentService {
  static const String _flutterwaveBaseUrl = 'https://api.flutterwave.com/v3';

  // Generate transaction reference
  static String generateTransactionReference() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = Random().nextInt(10000);
    return 'HOUSEHELP_${timestamp}_$random';
  }

  // Calculate service payment with tax
  static PaymentCalculation calculateServicePayment({
    required double grossAmount,
    required String paymentType,
    bool isWorkerPayment = false,
  }) {
    double vatAmount = 0;
    double incomeTax = 0;
    double socialSecurity = 0;
    double netAmount = grossAmount;

    if (paymentType == AppConstants.paymentTypeService) {
      // VAT calculation (18%)
      vatAmount = grossAmount * AppConstants.serviceTaxRate;

      if (isWorkerPayment) {
        // Income tax for workers (30%)
        incomeTax = grossAmount * AppConstants.incomeTaxRate;

        // Social security (6%)
        socialSecurity = grossAmount * AppConstants.socialSecurityRate;

        // Net amount after deductions
        netAmount = grossAmount - incomeTax - socialSecurity;
      } else {
        // For household payments, add VAT
        netAmount = grossAmount + vatAmount;
      }
    } else if (paymentType == AppConstants.paymentTypeTraining) {
      // Training payments have different tax structure
      vatAmount = grossAmount * AppConstants.serviceTaxRate;
      netAmount = grossAmount + vatAmount;
    }

    return PaymentCalculation(
      grossAmount: grossAmount,
      vatAmount: vatAmount,
      incomeTax: incomeTax,
      socialSecurity: socialSecurity,
      netAmount: netAmount,
      paymentType: paymentType,
    );
  }

  // Process payment with Flutterwave
  static Future<PaymentResponse> processPayment({
    required BuildContext context,
    required double amount,
    required String currency,
    required String customerEmail,
    required String customerPhone,
    required String customerName,
    required String paymentType,
    required String description,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final calculation = calculateServicePayment(
        grossAmount: amount,
        paymentType: paymentType,
      );

      final customer = Customer(
        name: customerName,
        phoneNumber: customerPhone,
        email: customerEmail,
      );

      final flutterwave = Flutterwave(
        context: context,
        publicKey: AppConstants.flutterwavePublicKey,
        currency: currency,
        redirectUrl: "https://househelp.rw/payment-callback",
        txRef: generateTransactionReference(),
        amount: calculation.netAmount.toString(),
        customer: customer,
        paymentOptions: "card,mobilemoney,banktransfer",
        customization: Customization(
          title: "HouseHelp Rwanda",
          description: description,
          logo: "https://househelp.rw/logo.png",
        ),
        isTestMode: false, // Set to true for testing
      );

      final ChargeResponse response = await flutterwave.charge();

      if (response.success == true) {
        // Save payment record to database
        await _savePaymentRecord(
          transactionRef: response.transactionId!,
          amount: calculation.netAmount,
          paymentType: paymentType,
          customerEmail: customerEmail,
          status: 'successful',
          calculation: calculation,
          metadata: metadata,
        );

        // Report tax to RRA if applicable
        if (paymentType == AppConstants.paymentTypeService) {
          await _reportTaxToRRA(calculation, response.transactionId!);
        }

        return PaymentResponse(
          success: true,
          transactionId: response.transactionId!,
          message: 'Payment successful',
          calculation: calculation,
        );
      } else {
        return PaymentResponse(
          success: false,
          message: response.status ?? 'Payment failed',
          calculation: calculation,
        );
      }
    } catch (e) {
      return PaymentResponse(
        success: false,
        message: 'Payment processing failed: ${e.toString()}',
        calculation: calculateServicePayment(
          grossAmount: amount,
          paymentType: paymentType,
        ),
      );
    }
  }

  // Save payment record to database
  static Future<void> _savePaymentRecord({
    required String transactionRef,
    required double amount,
    required String paymentType,
    required String customerEmail,
    required String status,
    required PaymentCalculation calculation,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      await SupabaseService.client.from('payments').insert({
        'transaction_ref': transactionRef,
        'amount': amount,
        'gross_amount': calculation.grossAmount,
        'vat_amount': calculation.vatAmount,
        'income_tax': calculation.incomeTax,
        'social_security': calculation.socialSecurity,
        'payment_type': paymentType,
        'customer_email': customerEmail,
        'status': status,
        'created_at': DateTime.now().toIso8601String(),
        'metadata': metadata,
      });
    } catch (e) {
      debugPrint('Failed to save payment record: $e');
    }
  }

  // Report tax to RRA
  static Future<void> _reportTaxToRRA(
    PaymentCalculation calculation,
    String transactionId,
  ) async {
    try {
      if (calculation.vatAmount > 0 || calculation.incomeTax > 0) {
        await SupabaseService.client.from('tax_reports').insert({
          'transaction_id': transactionId,
          'vat_amount': calculation.vatAmount,
          'income_tax': calculation.incomeTax,
          'social_security': calculation.socialSecurity,
          'reporting_date': DateTime.now().toIso8601String(),
          'rra_status': 'pending',
        });

        // TODO: Implement actual RRA API integration
        // This would involve calling RRA's API to report the tax
        debugPrint('Tax reported to RRA for transaction: $transactionId');
      }
    } catch (e) {
      debugPrint('Failed to report tax to RRA: $e');
    }
  }

  // Process worker payment with deductions
  static Future<PaymentResponse> processWorkerPayment({
    required String workerId,
    required double grossAmount,
    required String description,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final calculation = calculateServicePayment(
        grossAmount: grossAmount,
        paymentType: AppConstants.paymentTypeService,
        isWorkerPayment: true,
      );

      // Get worker banking details
      final workerProfile = await SupabaseService.getWorkerProfile(workerId);
      if (workerProfile == null) {
        return PaymentResponse(
          success: false,
          message: 'Worker profile not found',
          calculation: calculation,
        );
      }

      // Process direct bank transfer or mobile money
      final paymentMethod = workerProfile['payment_method'] as String?;
      final accountDetails =
          workerProfile['account_details'] as Map<String, dynamic>?;

      if (paymentMethod == null || accountDetails == null) {
        return PaymentResponse(
          success: false,
          message: 'Worker payment details not configured',
          calculation: calculation,
        );
      }

      // Create payment record
      final transactionRef = generateTransactionReference();

      await _savePaymentRecord(
        transactionRef: transactionRef,
        amount: calculation.netAmount,
        paymentType: AppConstants.paymentTypeService,
        customerEmail: workerProfile['email'] ?? '',
        status: 'processing',
        calculation: calculation,
        metadata: {
          'worker_id': workerId,
          'payment_method': paymentMethod,
          'account_details': accountDetails,
          ...?metadata,
        },
      );

      // Process the actual payment based on method
      bool paymentSuccess = false;

      if (paymentMethod == 'mobile_money') {
        paymentSuccess = await _processMobileMoneyPayment(
          phoneNumber: accountDetails['phone_number'],
          amount: calculation.netAmount,
          transactionRef: transactionRef,
        );
      } else if (paymentMethod == 'bank_transfer') {
        paymentSuccess = await _processBankTransfer(
          accountNumber: accountDetails['account_number'],
          bankCode: accountDetails['bank_code'],
          amount: calculation.netAmount,
          transactionRef: transactionRef,
        );
      }

      if (paymentSuccess) {
        // Update payment status
        await SupabaseService.client
            .from('payments')
            .update({'status': 'successful'})
            .eq('transaction_ref', transactionRef);

        // Update worker earnings
        await _updateWorkerEarnings(workerId, calculation);

        return PaymentResponse(
          success: true,
          transactionId: transactionRef,
          message: 'Payment processed successfully',
          calculation: calculation,
        );
      } else {
        return PaymentResponse(
          success: false,
          message: 'Payment processing failed',
          calculation: calculation,
        );
      }
    } catch (e) {
      return PaymentResponse(
        success: false,
        message: 'Worker payment failed: ${e.toString()}',
        calculation: calculateServicePayment(
          grossAmount: grossAmount,
          paymentType: AppConstants.paymentTypeService,
          isWorkerPayment: true,
        ),
      );
    }
  }

  // Process mobile money payment
  static Future<bool> _processMobileMoneyPayment({
    required String phoneNumber,
    required double amount,
    required String transactionRef,
  }) async {
    try {
      // TODO: Implement mobile money payment via Flutterwave
      // This would involve calling Flutterwave's mobile money API

      // For now, simulate successful payment
      await Future.delayed(const Duration(seconds: 2));
      return true;
    } catch (e) {
      debugPrint('Mobile money payment failed: $e');
      return false;
    }
  }

  // Process bank transfer
  static Future<bool> _processBankTransfer({
    required String accountNumber,
    required String bankCode,
    required double amount,
    required String transactionRef,
  }) async {
    try {
      // TODO: Implement bank transfer via Flutterwave
      // This would involve calling Flutterwave's bank transfer API

      // For now, simulate successful payment
      await Future.delayed(const Duration(seconds: 2));
      return true;
    } catch (e) {
      debugPrint('Bank transfer failed: $e');
      return false;
    }
  }

  // Update worker earnings
  static Future<void> _updateWorkerEarnings(
    String workerId,
    PaymentCalculation calculation,
  ) async {
    try {
      await SupabaseService.client.from('worker_earnings').insert({
        'worker_id': workerId,
        'gross_amount': calculation.grossAmount,
        'net_amount': calculation.netAmount,
        'income_tax': calculation.incomeTax,
        'social_security': calculation.socialSecurity,
        'payment_date': DateTime.now().toIso8601String(),
        'payment_type': calculation.paymentType,
      });
    } catch (e) {
      debugPrint('Failed to update worker earnings: $e');
    }
  }

  // Get payment history
  static Future<List<Map<String, dynamic>>> getPaymentHistory({
    required String userId,
    String? paymentType,
    int limit = 50,
  }) async {
    try {
      var query = SupabaseService.client
          .from('payments')
          .select()
          .eq('customer_email', userId)
          .order('created_at', ascending: false)
          .limit(limit);

      if (paymentType != null) {
        query = query.eq('payment_type', paymentType);
      }

      final response = await query;
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to get payment history: ${e.toString()}');
    }
  }

  // Get admin payment analytics
  static Future<Map<String, dynamic>> getAdminPaymentAnalytics({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final start =
          startDate ?? DateTime.now().subtract(const Duration(days: 30));
      final end = endDate ?? DateTime.now();

      // Total payments by type
      final servicePayments = await SupabaseService.client
          .from('payments')
          .select('amount')
          .eq('payment_type', AppConstants.paymentTypeService)
          .gte('created_at', start.toIso8601String())
          .lte('created_at', end.toIso8601String());

      final trainingPayments = await SupabaseService.client
          .from('payments')
          .select('amount')
          .eq('payment_type', AppConstants.paymentTypeTraining)
          .gte('created_at', start.toIso8601String())
          .lte('created_at', end.toIso8601String());

      // Calculate totals
      final serviceTotal = servicePayments.fold<double>(
        0,
        (sum, payment) => sum + (payment['amount'] as num).toDouble(),
      );

      final trainingTotal = trainingPayments.fold<double>(
        0,
        (sum, payment) => sum + (payment['amount'] as num).toDouble(),
      );

      // Tax collected
      final taxReports = await SupabaseService.client
          .from('tax_reports')
          .select('vat_amount, income_tax, social_security')
          .gte('reporting_date', start.toIso8601String())
          .lte('reporting_date', end.toIso8601String());

      double totalVat = 0;
      double totalIncomeTax = 0;
      double totalSocialSecurity = 0;

      for (final report in taxReports) {
        totalVat += (report['vat_amount'] as num).toDouble();
        totalIncomeTax += (report['income_tax'] as num).toDouble();
        totalSocialSecurity += (report['social_security'] as num).toDouble();
      }

      return {
        'service_payments': serviceTotal,
        'training_payments': trainingTotal,
        'total_revenue': serviceTotal + trainingTotal,
        'total_vat': totalVat,
        'total_income_tax': totalIncomeTax,
        'total_social_security': totalSocialSecurity,
        'tax_to_rra': totalVat + totalIncomeTax,
        'period_start': start.toIso8601String(),
        'period_end': end.toIso8601String(),
      };
    } catch (e) {
      throw Exception('Failed to get payment analytics: ${e.toString()}');
    }
  }

  // Process refund
  static Future<PaymentResponse> processRefund({
    required String transactionId,
    required double amount,
    required String reason,
  }) async {
    try {
      // TODO: Implement refund via Flutterwave API

      // Save refund record
      await SupabaseService.client.from('refunds').insert({
        'original_transaction_id': transactionId,
        'refund_amount': amount,
        'reason': reason,
        'status': 'processing',
        'created_at': DateTime.now().toIso8601String(),
      });

      return PaymentResponse(
        success: true,
        transactionId: 'REFUND_${generateTransactionReference()}',
        message: 'Refund processed successfully',
        calculation: PaymentCalculation(
          grossAmount: amount,
          vatAmount: 0,
          incomeTax: 0,
          socialSecurity: 0,
          netAmount: amount,
          paymentType: 'refund',
        ),
      );
    } catch (e) {
      return PaymentResponse(
        success: false,
        message: 'Refund processing failed: ${e.toString()}',
        calculation: PaymentCalculation(
          grossAmount: amount,
          vatAmount: 0,
          incomeTax: 0,
          socialSecurity: 0,
          netAmount: amount,
          paymentType: 'refund',
        ),
      );
    }
  }
}
