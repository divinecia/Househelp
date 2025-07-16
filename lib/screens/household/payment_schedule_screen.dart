import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../constants/app_constants.dart';
import '../../models/payment_model.dart';
import '../../services/payment_service.dart';
import '../../widgets/common/loading_widget.dart';

class PaymentScheduleScreen extends StatefulWidget {
  final String userId;

  const PaymentScheduleScreen({Key? key, required this.userId})
    : super(key: key);

  @override
  State<PaymentScheduleScreen> createState() => _PaymentScheduleScreenState();
}

class _PaymentScheduleScreenState extends State<PaymentScheduleScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Payment> _upcomingPayments = [];
  List<Payment> _pastPayments = [];
  Map<String, dynamic>? _paymentStats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadPaymentData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadPaymentData() async {
    try {
      setState(() => _isLoading = true);

      final futures = await Future.wait([
        PaymentService.getUpcomingPayments(widget.userId),
        PaymentService.getPaymentHistory(widget.userId),
        PaymentService.getPaymentStatistics(widget.userId),
      ]);

      setState(() {
        _upcomingPayments = futures[0] as List<Payment>;
        _pastPayments = futures[1] as List<Payment>;
        _paymentStats = futures[2] as Map<String, dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading payments: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Schedule'),
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'History'),
            Tab(text: 'Analytics'),
          ],
        ),
      ),
      body: _isLoading
          ? const LoadingWidget()
          : TabBarView(
              controller: _tabController,
              children: [
                _buildUpcomingTab(),
                _buildHistoryTab(),
                _buildAnalyticsTab(),
              ],
            ),
    );
  }

  Widget _buildUpcomingTab() {
    return RefreshIndicator(
      onRefresh: _loadPaymentData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildUpcomingOverview(),
            const SizedBox(height: 24),
            _buildUpcomingPayments(),
            const SizedBox(height: 24),
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryTab() {
    return RefreshIndicator(
      onRefresh: _loadPaymentData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildPaymentFilters(),
            const SizedBox(height: 16),
            _buildPaymentHistory(),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalyticsTab() {
    if (_paymentStats == null) {
      return const Center(child: Text('No analytics data available'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSpendingOverview(),
          const SizedBox(height: 24),
          _buildMonthlySpendingChart(),
          const SizedBox(height: 24),
          _buildCategoryBreakdown(),
          const SizedBox(height: 24),
          _buildPaymentMethods(),
        ],
      ),
    );
  }

  Widget _buildUpcomingOverview() {
    final totalUpcoming = _upcomingPayments.fold<double>(
      0,
      (sum, payment) => sum + payment.amount,
    );
    final overdueCount = _upcomingPayments
        .where((p) => p.dueDate.isBefore(DateTime.now()))
        .length;

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        'RWF ${totalUpcoming.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                      const Text('Total Upcoming'),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        '${_upcomingPayments.length}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                      const Text('Pending Payments'),
                    ],
                  ),
                ),
                if (overdueCount > 0)
                  Expanded(
                    child: Column(
                      children: [
                        Text(
                          '$overdueCount',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                        const Text('Overdue'),
                      ],
                    ),
                  ),
              ],
            ),
            if (overdueCount > 0) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning, color: Colors.red[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'You have $overdueCount overdue payment${overdueCount > 1 ? 's' : ''}',
                        style: TextStyle(color: Colors.red[800]),
                      ),
                    ),
                    TextButton(
                      onPressed: () => _payOverdue(),
                      child: Text(
                        'Pay Now',
                        style: TextStyle(color: Colors.red[600]),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingPayments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Upcoming Payments',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (_upcomingPayments.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.payment, size: 48, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No upcoming payments',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ...(_upcomingPayments
              .take(5)
              .map((payment) => _buildPaymentCard(payment))
              .toList()),
        if (_upcomingPayments.length > 5)
          TextButton(
            onPressed: () => _showAllUpcoming(),
            child: const Text('View All Upcoming Payments'),
          ),
      ],
    );
  }

  Widget _buildPaymentCard(Payment payment) {
    final isOverdue = payment.dueDate.isBefore(DateTime.now());
    final daysDiff = payment.dueDate.difference(DateTime.now()).inDays;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isOverdue
              ? Colors.red
              : daysDiff <= 3
              ? Colors.orange
              : Colors.green,
          child: Icon(_getPaymentIcon(payment.type), color: Colors.white),
        ),
        title: Text(payment.description),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Due: ${_formatDate(payment.dueDate)}'),
            if (isOverdue)
              Text(
                'Overdue by ${(-daysDiff)} days',
                style: const TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              )
            else if (daysDiff <= 3)
              Text(
                'Due in $daysDiff days',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                ),
              ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'RWF ${payment.amount.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            ElevatedButton(
              onPressed: () => _payNow(payment),
              style: ElevatedButton.styleFrom(
                backgroundColor: isOverdue
                    ? Colors.red
                    : AppConstants.primaryBlue,
                foregroundColor: Colors.white,
                minimumSize: const Size(80, 30),
              ),
              child: Text(isOverdue ? 'Pay Now' : 'Pay'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Quick Actions',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildQuickActionButton(
                  'Set Auto-Pay',
                  Icons.autorenew,
                  () => _setupAutoPay(),
                ),
                _buildQuickActionButton(
                  'Payment Methods',
                  Icons.payment,
                  () => _managePaymentMethods(),
                ),
                _buildQuickActionButton(
                  'Receipts',
                  Icons.receipt,
                  () => _viewReceipts(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton(
    String label,
    IconData icon,
    VoidCallback onPressed,
  ) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConstants.lightBlue,
            foregroundColor: Colors.white,
            shape: const CircleBorder(),
            padding: const EdgeInsets.all(16),
          ),
          child: Icon(icon),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildPaymentFilters() {
    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField<String>(
            decoration: const InputDecoration(
              labelText: 'Filter by Type',
              border: OutlineInputBorder(),
            ),
            items: ['All', 'Job Payment', 'Subscription', 'Bonus', 'Refund']
                .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                .toList(),
            onChanged: (value) => _filterPayments(value),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: DropdownButtonFormField<String>(
            decoration: const InputDecoration(
              labelText: 'Time Period',
              border: OutlineInputBorder(),
            ),
            items:
                ['Last 30 days', 'Last 3 months', 'Last 6 months', 'Last year']
                    .map(
                      (period) =>
                          DropdownMenuItem(value: period, child: Text(period)),
                    )
                    .toList(),
            onChanged: (value) => _filterByPeriod(value),
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentHistory() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Payment History',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (_pastPayments.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.history, size: 48, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No payment history',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ..._pastPayments
              .map((payment) => _buildHistoryCard(payment))
              .toList(),
      ],
    );
  }

  Widget _buildHistoryCard(Payment payment) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: payment.status == PaymentStatus.completed
              ? Colors.green
              : payment.status == PaymentStatus.failed
              ? Colors.red
              : Colors.orange,
          child: Icon(_getPaymentIcon(payment.type), color: Colors.white),
        ),
        title: Text(payment.description),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Paid: ${_formatDate(payment.paidAt ?? payment.createdAt)}'),
            Text('Method: ${payment.paymentMethod}'),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'RWF ${payment.amount.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getStatusColor(payment.status).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                payment.status.name.toUpperCase(),
                style: TextStyle(
                  color: _getStatusColor(payment.status),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        onTap: () => _viewPaymentDetails(payment),
      ),
    );
  }

  Widget _buildSpendingOverview() {
    final monthlyAverage = _paymentStats!['monthly_average'] as double;
    final totalSpent = _paymentStats!['total_spent'] as double;
    final thisMonth = _paymentStats!['this_month'] as double;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Spending Overview',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'This Month',
                    'RWF ${thisMonth.toStringAsFixed(0)}',
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Monthly Avg',
                    'RWF ${monthlyAverage.toStringAsFixed(0)}',
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Total Spent',
                    'RWF ${totalSpent.toStringAsFixed(0)}',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppConstants.primaryBlue,
          ),
        ),
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
      ],
    );
  }

  Widget _buildMonthlySpendingChart() {
    final monthlyData = _paymentStats!['monthly_data'] as List<dynamic>;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Monthly Spending Trend',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: monthlyData
                          .asMap()
                          .entries
                          .map(
                            (e) => FlSpot(
                              e.key.toDouble(),
                              (e.value as num).toDouble(),
                            ),
                          )
                          .toList(),
                      isCurved: true,
                      color: AppConstants.primaryBlue,
                      barWidth: 3,
                      dotData: const FlDotData(show: false),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryBreakdown() {
    final categories = _paymentStats!['categories'] as Map<String, dynamic>;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Spending by Category',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...categories.entries.map((entry) {
              final percentage =
                  (entry.value as num) /
                  categories.values.fold<num>(0, (a, b) => a + b);
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(flex: 2, child: Text(entry.key)),
                    Expanded(
                      flex: 3,
                      child: LinearProgressIndicator(
                        value: percentage.toDouble(),
                        backgroundColor: Colors.grey[300],
                        valueColor: AlwaysStoppedAnimation(
                          AppConstants.primaryBlue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('RWF ${(entry.value as num).toStringAsFixed(0)}'),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethods() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Payment Methods',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: _managePaymentMethods,
                  child: const Text('Manage'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.credit_card),
              title: const Text('**** **** **** 1234'),
              subtitle: const Text('Primary Card'),
              trailing: const Icon(Icons.check_circle, color: Colors.green),
            ),
            ListTile(
              leading: const Icon(Icons.account_balance),
              title: const Text('Mobile Money'),
              subtitle: const Text('*****6789'),
              trailing: IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getPaymentIcon(PaymentType type) {
    switch (type) {
      case PaymentType.jobPayment:
        return Icons.work;
      case PaymentType.subscription:
        return Icons.subscriptions;
      case PaymentType.bonus:
        return Icons.star;
      case PaymentType.refund:
        return Icons.money_off;
      default:
        return Icons.payment;
    }
  }

  Color _getStatusColor(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.completed:
        return Colors.green;
      case PaymentStatus.failed:
        return Colors.red;
      case PaymentStatus.pending:
        return Colors.orange;
      case PaymentStatus.cancelled:
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _filterPayments(String? type) {
    // Implement payment filtering
  }

  void _filterByPeriod(String? period) {
    // Implement period filtering
  }

  void _payNow(Payment payment) {
    // Navigate to payment screen
  }

  void _payOverdue() {
    // Handle overdue payments
  }

  void _showAllUpcoming() {
    // Show all upcoming payments
  }

  void _setupAutoPay() {
    // Navigate to auto-pay setup
  }

  void _managePaymentMethods() {
    // Navigate to payment methods management
  }

  void _viewReceipts() {
    // Navigate to receipts screen
  }

  void _viewPaymentDetails(Payment payment) {
    // Show payment details dialog
  }
}

enum PaymentType { jobPayment, subscription, bonus, refund }

enum PaymentStatus { pending, completed, failed, cancelled }
