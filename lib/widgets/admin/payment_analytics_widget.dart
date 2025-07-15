import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../constants/app_constants.dart';
import '../../services/payment_service.dart';

class PaymentAnalyticsWidget extends StatefulWidget {
  const PaymentAnalyticsWidget({super.key});

  @override
  State<PaymentAnalyticsWidget> createState() => _PaymentAnalyticsWidgetState();
}

class _PaymentAnalyticsWidgetState extends State<PaymentAnalyticsWidget> {
  Map<String, dynamic>? _analytics;
  bool _isLoading = true;
  String _selectedPeriod = '30_days';

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    setState(() {
      _isLoading = true;
    });

    try {
      DateTime? startDate;
      DateTime? endDate = DateTime.now();

      switch (_selectedPeriod) {
        case '7_days':
          startDate = endDate.subtract(const Duration(days: 7));
          break;
        case '30_days':
          startDate = endDate.subtract(const Duration(days: 30));
          break;
        case '90_days':
          startDate = endDate.subtract(const Duration(days: 90));
          break;
        case '1_year':
          startDate = endDate.subtract(const Duration(days: 365));
          break;
      }

      final analytics = await PaymentService.getAdminPaymentAnalytics(
        startDate: startDate,
        endDate: endDate,
      );

      setState(() {
        _analytics = analytics;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load analytics: ${e.toString()}'),
          backgroundColor: AppConstants.errorColor,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Payment Analytics',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppConstants.primaryColor,
                  ),
                ),
                DropdownButton<String>(
                  value: _selectedPeriod,
                  onChanged: (String? newValue) {
                    if (newValue != null) {
                      setState(() {
                        _selectedPeriod = newValue;
                      });
                      _loadAnalytics();
                    }
                  },
                  items: const [
                    DropdownMenuItem(value: '7_days', child: Text('Last 7 Days')),
                    DropdownMenuItem(value: '30_days', child: Text('Last 30 Days')),
                    DropdownMenuItem(value: '90_days', child: Text('Last 90 Days')),
                    DropdownMenuItem(value: '1_year', child: Text('Last Year')),
                  ],
                ),
              ],
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(),
              )
            else if (_analytics != null)
              Column(
                children: [
                  _buildPaymentSummary(),
                  const SizedBox(height: AppConstants.paddingLarge),
                  _buildPaymentChart(),
                  const SizedBox(height: AppConstants.paddingLarge),
                  _buildTaxSummary(),
                ],
              )
            else
              const Center(
                child: Text('No analytics data available'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentSummary() {
    final servicePayments = _analytics!['service_payments'] as double;
    final trainingPayments = _analytics!['training_payments'] as double;
    final totalRevenue = _analytics!['total_revenue'] as double;

    return Row(
      children: [
        Expanded(
          child: _buildSummaryCard(
            'Service Payments',
            'RWF ${servicePayments.toStringAsFixed(0)}',
            AppConstants.primaryColor,
            Icons.work,
          ),
        ),
        const SizedBox(width: AppConstants.paddingMedium),
        Expanded(
          child: _buildSummaryCard(
            'Training Payments',
            'RWF ${trainingPayments.toStringAsFixed(0)}',
            AppConstants.secondaryColor,
            Icons.school,
          ),
        ),
        const SizedBox(width: AppConstants.paddingMedium),
        Expanded(
          child: _buildSummaryCard(
            'Total Revenue',
            'RWF ${totalRevenue.toStringAsFixed(0)}',
            AppConstants.successColor,
            Icons.monetization_on,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(width: AppConstants.paddingSmall),
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppConstants.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppConstants.paddingSmall),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentChart() {
    final servicePayments = _analytics!['service_payments'] as double;
    final trainingPayments = _analytics!['training_payments'] as double;
    final total = servicePayments + trainingPayments;

    if (total == 0) {
      return const Center(
        child: Text('No payment data for selected period'),
      );
    }

    return Container(
      height: 200,
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 40,
                sections: [
                  PieChartSectionData(
                    color: AppConstants.primaryColor,
                    value: servicePayments,
                    title: '${(servicePayments / total * 100).toStringAsFixed(1)}%',
                    radius: 60,
                    titleStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  PieChartSectionData(
                    color: AppConstants.secondaryColor,
                    value: trainingPayments,
                    title: '${(trainingPayments / total * 100).toStringAsFixed(1)}%',
                    radius: 60,
                    titleStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildLegendItem(
                  'Service Payments',
                  AppConstants.primaryColor,
                  'RWF ${servicePayments.toStringAsFixed(0)}',
                ),
                const SizedBox(height: AppConstants.paddingSmall),
                _buildLegendItem(
                  'Training Payments',
                  AppConstants.secondaryColor,
                  'RWF ${trainingPayments.toStringAsFixed(0)}',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, String value) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppConstants.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTaxSummary() {
    final totalVat = _analytics!['total_vat'] as double;
    final totalIncomeTax = _analytics!['total_income_tax'] as double;
    final totalSocialSecurity = _analytics!['total_social_security'] as double;
    final taxToRra = _analytics!['tax_to_rra'] as double;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tax Summary',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppConstants.textPrimary,
          ),
        ),
        const SizedBox(height: AppConstants.paddingMedium),
        Row(
          children: [
            Expanded(
              child: _buildTaxCard(
                'VAT Collected',
                'RWF ${totalVat.toStringAsFixed(0)}',
                AppConstants.warningColor,
              ),
            ),
            const SizedBox(width: AppConstants.paddingSmall),
            Expanded(
              child: _buildTaxCard(
                'Income Tax',
                'RWF ${totalIncomeTax.toStringAsFixed(0)}',
                AppConstants.errorColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppConstants.paddingSmall),
        Row(
          children: [
            Expanded(
              child: _buildTaxCard(
                'Social Security',
                'RWF ${totalSocialSecurity.toStringAsFixed(0)}',
                AppConstants.accentColor,
              ),
            ),
            const SizedBox(width: AppConstants.paddingSmall),
            Expanded(
              child: _buildTaxCard(
                'Total to RRA',
                'RWF ${taxToRra.toStringAsFixed(0)}',
                AppConstants.primaryColor,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTaxCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppConstants.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppConstants.paddingSmall),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}