import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../constants/app_constants.dart';
import '../../services/job_service.dart';
import '../../services/training_service.dart';
import '../../services/referral_service.dart';
import '../../models/job_model.dart';
import '../../models/training_model.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/error_widget.dart';
import '../messaging/conversations_screen.dart';
import 'available_jobs_screen.dart';
import 'my_jobs_screen.dart';
import 'worker_profile_screen.dart';
import 'worker_training_screen.dart';
import 'worker_earnings_screen.dart';

class WorkerDashboard extends StatefulWidget {
  final String userId;

  const WorkerDashboard({Key? key, required this.userId}) : super(key: key);

  @override
  State<WorkerDashboard> createState() => _WorkerDashboardState();
}

class _WorkerDashboardState extends State<WorkerDashboard> {
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
        JobService.getJobStatistics(userId: widget.userId, userType: 'worker'),
        TrainingService.getTrainingStatistics(widget.userId),
        ReferralService.getLoyaltyAnalytics(widget.userId),
        JobService.getWorkerJobs(widget.userId, limit: 5),
        JobService.getAvailableJobs(widget.userId, limit: 10),
      ]);

      setState(() {
        _dashboardData = {
          'jobStats': futures[0],
          'trainingStats': futures[1],
          'loyaltyStats': futures[2],
          'recentJobs': futures[3],
          'availableJobs': futures[4],
        };
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading dashboard: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Dashboard'),
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.message),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ConversationsScreen(userId: widget.userId),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => WorkerProfileScreen(userId: widget.userId),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const LoadingWidget()
          : _buildDashboardContent(),
      bottomNavigationBar: _buildBottomNavigation(),
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
        return AvailableJobsScreen(userId: widget.userId);
      case 2:
        return MyJobsScreen(userId: widget.userId);
      case 3:
        return WorkerTrainingScreen(userId: widget.userId);
      case 4:
        return WorkerEarningsScreen(userId: widget.userId);
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildHomeTab() {
    final jobStats = _dashboardData!['jobStats'] as Map<String, dynamic>;
    final trainingStats = _dashboardData!['trainingStats'] as Map<String, dynamic>;
    final loyaltyStats = _dashboardData!['loyaltyStats'] as Map<String, dynamic>;
    final recentJobs = _dashboardData!['recentJobs'] as List<Job>;
    final availableJobs = _dashboardData!['availableJobs'] as List<Job>;

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeCard(),
            const SizedBox(height: 16),
            _buildStatsCards(jobStats, trainingStats, loyaltyStats),
            const SizedBox(height: 24),
            _buildEarningsChart(jobStats),
            const SizedBox(height: 24),
            _buildRecentJobs(recentJobs),
            const SizedBox(height: 24),
            _buildAvailableJobs(availableJobs),
            const SizedBox(height: 24),
            _buildQuickActions(),
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
                  Text(
                    'Welcome back!',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ready to find your next job?',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.work,
              color: Colors.white,
              size: 48,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(Map<String, dynamic> jobStats, Map<String, dynamic> trainingStats, Map<String, dynamic> loyaltyStats) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Jobs Completed',
            jobStats['completed_jobs'].toString(),
            Icons.check_circle,
            Colors.green,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Total Earnings',
            'RWF ${jobStats['total_earnings'].toStringAsFixed(0)}',
            Icons.attach_money,
            Colors.blue,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Rating',
            jobStats['average_rating'].toStringAsFixed(1),
            Icons.star,
            Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
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
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningsChart(Map<String, dynamic> jobStats) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Monthly Earnings',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppConstants.primaryBlue,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(show: false),
                  titlesData: FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: [
                        const FlSpot(0, 50000),
                        const FlSpot(1, 75000),
                        const FlSpot(2, 60000),
                        const FlSpot(3, 85000),
                        const FlSpot(4, 95000),
                        const FlSpot(5, 110000),
                      ],
                      isCurved: true,
                      color: AppConstants.primaryBlue,
                      barWidth: 3,
                      dotData: FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppConstants.primaryBlue.withOpacity(0.1),
                      ),
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
                  child: Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (jobs.isEmpty)
              Center(
                child: Text(
                  'No recent jobs',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              )
            else
              ...jobs.take(3).map((job) => _buildJobCard(job)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailableJobs(List<Job> jobs) {
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
                  'Available Jobs',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppConstants.primaryBlue,
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() => _selectedIndex = 1),
                  child: Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (jobs.isEmpty)
              Center(
                child: Text(
                  'No available jobs',
                  style: TextStyle(color: Colors.grey[600]),
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
        trailing: job.status == JobStatus.pending
            ? ElevatedButton(
                onPressed: () => _applyForJob(job),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryBlue,
                ),
                child: const Text('Apply'),
              )
            : Chip(
                label: Text(job.status.name),
                backgroundColor: _getStatusColor(job.status).withOpacity(0.1),
                side: BorderSide(color: _getStatusColor(job.status)),
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
                  'Update Profile',
                  Icons.person,
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => WorkerProfileScreen(userId: widget.userId),
                    ),
                  ),
                ),
                _buildQuickActionButton(
                  'View Training',
                  Icons.school,
                  () => setState(() => _selectedIndex = 3),
                ),
                _buildQuickActionButton(
                  'Earnings',
                  Icons.attach_money,
                  () => setState(() => _selectedIndex = 4),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton(String label, IconData icon, VoidCallback onPressed) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConstants.lightBlue,
            shape: const CircleBorder(),
            padding: const EdgeInsets.all(16),
          ),
          child: Icon(icon, color: Colors.white),
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

  Widget _buildBottomNavigation() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: _selectedIndex,
      onTap: (index) => setState(() => _selectedIndex = index),
      selectedItemColor: AppConstants.primaryBlue,
      unselectedItemColor: Colors.grey,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.work),
          label: 'Jobs',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.assignment),
          label: 'My Jobs',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.school),
          label: 'Training',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.attach_money),
          label: 'Earnings',
        ),
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

  void _applyForJob(Job job) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Apply for ${job.title}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Are you sure you want to apply for this job?'),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Your message',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await JobService.applyForJob(
                  jobId: job.id,
                  workerId: widget.userId,
                  message: 'I am interested in this job',
                  proposedRate: job.hourlyRate ?? 0,
                  availableDate: DateTime.now().add(const Duration(days: 1)),
                );
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Application submitted successfully!')),
                );
                _loadDashboardData();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: $e')),
                );
              }
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }
}
