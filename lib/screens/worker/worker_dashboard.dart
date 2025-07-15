import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_router.dart';

class WorkerDashboard extends StatefulWidget {
  const WorkerDashboard({super.key});

  @override
  State<WorkerDashboard> createState() => _WorkerDashboardState();
}

class _WorkerDashboardState extends State<WorkerDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Worker Dashboard'),
            actions: [
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () async {
                  await authProvider.signOut();
                  if (context.mounted) {
                    NavigationHelper.goToWelcome(context);
                  }
                },
              ),
            ],
          ),
          body: _getBodyWidget(),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
              BottomNavigationBarItem(icon: Icon(Icons.work), label: 'Jobs'),
              BottomNavigationBarItem(
                icon: Icon(Icons.schedule),
                label: 'Schedule',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _getBodyWidget() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return _buildJobsTab();
      case 2:
        return _buildScheduleTab();
      case 3:
        return _buildProfileTab();
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildHomeTab() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(AppConstants.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome message
              Text(
                'Welcome, ${authProvider.appUser?.fullName ?? 'Worker'}!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppConstants.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              // Quick stats
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Active Jobs',
                      '3',
                      AppConstants.workerColor,
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard(
                      'Completed',
                      '15',
                      AppConstants.successColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Rating',
                      '4.8',
                      AppConstants.warningColor,
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard(
                      'Earnings',
                      'RWF 50,000',
                      AppConstants.secondaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingLarge),

              // Recent jobs
              Text(
                'Recent Jobs',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppConstants.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              _buildJobCard(
                'House Cleaning',
                'Kigali, Gasabo',
                'Today, 2:00 PM',
                'In Progress',
                AppConstants.warningColor,
              ),
              _buildJobCard(
                'Cooking',
                'Kigali, Nyarugenge',
                'Tomorrow, 10:00 AM',
                'Scheduled',
                AppConstants.primaryColor,
              ),
              _buildJobCard(
                'Gardening',
                'Kigali, Kicukiro',
                'Dec 15, 9:00 AM',
                'Completed',
                AppConstants.successColor,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildJobsTab() {
    return const Center(
      child: Text('Jobs Tab - Coming Soon', style: TextStyle(fontSize: 18)),
    );
  }

  Widget _buildScheduleTab() {
    return const Center(
      child: Text('Schedule Tab - Coming Soon', style: TextStyle(fontSize: 18)),
    );
  }

  Widget _buildProfileTab() {
    return const Center(
      child: Text('Profile Tab - Coming Soon', style: TextStyle(fontSize: 18)),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: AppConstants.backgroundColor,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        boxShadow: [
          BoxShadow(
            color: AppConstants.accentColor.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppConstants.textSecondary),
          ),
          const SizedBox(height: AppConstants.paddingSmall),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard(
    String title,
    String location,
    String time,
    String status,
    Color statusColor,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppConstants.paddingMedium),
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: AppConstants.backgroundColor,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        boxShadow: [
          BoxShadow(
            color: AppConstants.accentColor.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppConstants.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppConstants.paddingSmall,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusSmall,
                  ),
                ),
                child: Text(
                  status,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppConstants.paddingSmall),
          Row(
            children: [
              Icon(
                Icons.location_on,
                size: 16,
                color: AppConstants.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                location,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppConstants.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(Icons.schedule, size: 16, color: AppConstants.textSecondary),
              const SizedBox(width: 4),
              Text(
                time,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppConstants.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}