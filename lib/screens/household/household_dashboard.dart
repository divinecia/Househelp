import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:househelp/utils/app_router.dart';
import '../../constants/app_constants.dart';
import '../../services/job_service.dart';
import '../../services/referral_service.dart';
import '../../models/job_model.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/error_widget.dart';
import '../messaging/conversations_screen.dart';
import 'post_job_screen.dart';
import 'find_workers_screen.dart';
import 'household_jobs_screen.dart';
import 'household_profile_screen.dart';
import 'dart:math';

class HouseholdDashboard extends StatefulWidget {
  final String userId;

  const HouseholdDashboard({Key? key, required this.userId}) : super(key: key);

  @override
  State<HouseholdDashboard> createState() => _HouseholdDashboardState();
}

class _HouseholdDashboardState extends State<HouseholdDashboard> {
  int _selectedIndex = 0;
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    try {
      setState(() => _isLoading = true);

      final futures = await Future.wait([
        JobService.getJobStatistics(
          userId: widget.userId,
          userType: 'household',
        ),
        ReferralService.getLoyaltyAnalytics(widget.userId),
        JobService.getHouseholdJobs(widget.userId, limit: 5),
      ]);

      setState(() {
        _dashboardData = {
          'jobStats': futures[0],
          'loyaltyStats': futures[1],
          'recentJobs': futures[2],
        };
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading dashboard: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Household Dashboard'),
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.message),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    ConversationsScreen(userId: widget.userId),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    HouseholdProfileScreen(userId: widget.userId),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading ? const LoadingWidget() : _buildDashboardContent(),
      bottomNavigationBar: _buildBottomNavigation(),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PostJobScreen(userId: widget.userId),
                ),
              ),
              backgroundColor: AppConstants.primaryBlue,
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }

  Widget _buildDashboardContent() {
    if (_dashboardData == null) {
      return const CustomErrorWidget(message: 'Failed to load dashboard data');
    }

    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return FindWorkersScreen(userId: widget.userId);
      case 2:
        return HouseholdJobsScreen(userId: widget.userId);
      case 3:
        return HouseholdProfileScreen(userId: widget.userId);
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildHomeTab() {
    final jobStats = _dashboardData!['jobStats'] as Map<String, dynamic>;
    final loyaltyStats =
        _dashboardData!['loyaltyStats'] as Map<String, dynamic>;
    final recentJobs = _dashboardData!['recentJobs'] as List<Job>;

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeCard(),
            const SizedBox(height: 16),
            _buildStatsCards(jobStats, loyaltyStats),
            const SizedBox(height: 24),
            _buildSpendingChart(jobStats),
            const SizedBox(height: 24),
            _buildRecentJobs(recentJobs),
            const SizedBox(height: 24),
            _buildQuickActions(),
            const SizedBox(height: 24),
            _buildServicePackages(),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            colors: [AppConstants.primaryBlue, AppConstants.lightBlue],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Welcome to HouseHelp',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Find reliable domestic help for your home',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.home, color: Colors.white, size: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(
    Map<String, dynamic> jobStats,
    Map<String, dynamic> loyaltyStats,
  ) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Posted Jobs',
            (jobStats['total_jobs'] ?? 0).toString(),
            Icons.work,
            Colors.blue,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Completed',
            (jobStats['completed_jobs'] ?? 0).toString(),
            Icons.check_circle,
            Colors.green,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Loyalty Points',
            (loyaltyStats['total_points'] ?? 0).toString(),
            Icons.star,
            Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpendingChart(Map<String, dynamic> jobStats) {
    // Add null safety for spending data
    final spendingData = jobStats['monthly_spending'] as List<dynamic>? ?? [];

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Monthly Spending',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppConstants.primaryBlue,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: spendingData.isEmpty
                  ? Center(
                      child: Text(
                        'No spending data available',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    )
                  : BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: 100000,
                        barTouchData: BarTouchData(enabled: false),
                        titlesData: const FlTitlesData(show: false),
                        borderData: FlBorderData(show: false),
                        barGroups: _generateBarGroups(spendingData),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  List<BarChartGroupData> _generateBarGroups(List<dynamic> spendingData) {
    return List.generate(
      min(spendingData.length, 6),
      (index) => BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: (spendingData[index] as num?)?.toDouble() ?? 0,
            color: AppConstants.primaryBlue,
          ),
        ],
      ),
    );
  }

  Widget _buildRecentJobs(List<Job> jobs) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Jobs',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppConstants.primaryBlue,
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() => _selectedIndex = 2),
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (jobs.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(Icons.work_outline, size: 48, color: Colors.grey[400]),
                    const SizedBox(height: 8),
                    Text(
                      'No jobs posted yet',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              PostJobScreen(userId: widget.userId),
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.primaryBlue,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Post Your First Job'),
                    ),
                  ],
                ),
              )
            else
              ...jobs.take(3).map((job) => _buildJobCard(job)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildJobCard(Job job) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getStatusColor(job.status),
          child: Icon(
            _getServiceIcon(job.serviceType),
            color: Colors.white,
            size: 20,
          ),
        ),
        title: Text(
          job.title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${job.serviceType.name} • ${job.status.name}'),
            if (job.hourlyRate != null)
              Text('RWF ${job.hourlyRate!.toStringAsFixed(0)}/hr'),
          ],
        ),
        trailing: PopupMenuButton<String>(
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view',
              child: Row(
                children: [
                  Icon(Icons.visibility),
                  SizedBox(width: 8),
                  Text('View Details'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'applications',
              child: Row(
                children: [
                  Icon(Icons.people),
                  SizedBox(width: 8),
                  Text('View Applications'),
                ],
              ),
            ),
            if (job.status == JobStatus.pending)
              const PopupMenuItem(
                value: 'cancel',
                child: Row(
                  children: [
                    Icon(Icons.cancel, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Cancel Job', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
          ],
          onSelected: (value) => _handleJobAction(job, value),
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppConstants.primaryBlue,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildQuickActionButton(
                  'Post Job',
                  Icons.add_circle,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          PostJobScreen(userId: widget.userId),
                    ),
                  ),
                ),
                _buildQuickActionButton(
                  'Find Workers',
                  Icons.search,
                  () => setState(() => _selectedIndex = 1),
                ),
                _buildQuickActionButton(
                  'My Profile',
                  Icons.person,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          HouseholdProfileScreen(userId: widget.userId),
                    ),
                  ),
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
        Text(
          label,
          style: const TextStyle(fontSize: 12),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildServicePackages() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Popular Service Packages',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppConstants.primaryBlue,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 180,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildServicePackageCard(
                    'Basic Cleaning',
                    'RWF 5,000',
                    'Sweeping, mopping, dusting',
                    Icons.cleaning_services,
                    Colors.blue,
                  ),
                  _buildServicePackageCard(
                    'Deep Cleaning',
                    'RWF 8,000',
                    'Comprehensive cleaning service',
                    Icons.cleaning_services,
                    Colors.green,
                  ),
                  _buildServicePackageCard(
                    'Cooking Service',
                    'RWF 4,500',
                    'Meal preparation and cleanup',
                    Icons.restaurant,
                    Colors.orange,
                  ),
                  _buildServicePackageCard(
                    'Childcare',
                    'RWF 6,000',
                    'Professional childcare service',
                    Icons.child_care,
                    Colors.purple,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServicePackageCard(
    String title,
    String price,
    String description,
    IconData icon,
    Color color,
  ) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                price,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppConstants.primaryBlue,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate to book service
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  child: const Text('Book Now', style: TextStyle(fontSize: 12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomNavigation() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: _selectedIndex,
      onTap: (index) => setState(() => _selectedIndex = index),
      selectedItemColor: AppConstants.primaryBlue,
      unselectedItemColor: Colors.grey,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(
          icon: Icon(Icons.search),
          label: 'Find Workers',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.work), label: 'My Jobs'),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
      ],
    );
  }

  Color _getStatusColor(JobStatus status) {
    switch (status) {
      case JobStatus.pending:
        return Colors.orange;
      case JobStatus.accepted:
        return Colors.blue;
      case JobStatus.inProgress:
        return Colors.purple;
      case JobStatus.completed:
        return Colors.green;
      case JobStatus.cancelled:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getServiceIcon(ServiceType serviceType) {
    switch (serviceType) {
      case ServiceType.cleaning:
        return Icons.cleaning_services;
      case ServiceType.cooking:
        return Icons.restaurant;
      case ServiceType.childcare:
        return Icons.child_care;
      case ServiceType.elderlyCare:
        return Icons.elderly;
      case ServiceType.gardening:
        return Icons.grass;
      case ServiceType.laundry:
        return Icons.local_laundry_service;
      case ServiceType.petCare:
        return Icons.pets;
      default:
        return Icons.work;
    }
  }

  void _handleJobAction(Job job, String action) {
    switch (action) {
      case 'view':
        // Navigate to job details
        break;
      case 'applications':
        // Navigate to applications view
        break;
      case 'cancel':
        _showCancelJobDialog(job);
        break;
    }
  }

  void _showCancelJobDialog(Job job) {
    final TextEditingController reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Job'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Are you sure you want to cancel "${job.title}"?'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Reason for cancellation',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Keep Job'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await JobService.cancelJob(
                  job.id,
                  reasonController.text.isEmpty
                      ? 'Cancelled by household'
                      : reasonController.text,
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Job cancelled successfully')),
                  );
                  _loadDashboardData();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Cancel Job'),
          ),
        ],
      ),
    );
  }
}
