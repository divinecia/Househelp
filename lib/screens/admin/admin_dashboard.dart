import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_router.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Admin Dashboard'),
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
              BottomNavigationBarItem(
                icon: Icon(Icons.dashboard),
                label: 'Overview',
              ),
              BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Users'),
              BottomNavigationBarItem(
                icon: Icon(Icons.report),
                label: 'Reports',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.settings),
                label: 'Settings',
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
        return _buildOverviewTab();
      case 1:
        return _buildUsersTab();
      case 2:
        return _buildReportsTab();
      case 3:
        return _buildSettingsTab();
      default:
        return _buildOverviewTab();
    }
  }

  Widget _buildOverviewTab() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(AppConstants.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome message
              Text(
                'Welcome, ${authProvider.appUser?.fullName ?? 'Admin'}!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: AppConstants.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              // Platform stats
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Total Users',
                      '1,234',
                      AppConstants.primaryColor,
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard(
                      'Active Workers',
                      '456',
                      AppConstants.workerColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Households',
                      '678',
                      AppConstants.householdColor,
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard(
                      'Jobs Today',
                      '89',
                      AppConstants.warningColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingLarge),

              // Recent activity
              Text(
                'Recent Activity',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppConstants.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              _buildActivityCard(
                'New Worker Registration',
                'Mary Uwimana registered as a house cleaner',
                '2 hours ago',
                Icons.person_add,
                AppConstants.successColor,
              ),
              _buildActivityCard(
                'Job Completed',
                'Jean Baptiste completed a cooking job',
                '4 hours ago',
                Icons.check_circle,
                AppConstants.primaryColor,
              ),
              _buildActivityCard(
                'Verification Pending',
                'Alice Mukamana submitted documents for verification',
                '6 hours ago',
                Icons.pending,
                AppConstants.warningColor,
              ),
              _buildActivityCard(
                'Payment Processed',
                'Payment of RWF 25,000 processed successfully',
                '1 day ago',
                Icons.payment,
                AppConstants.secondaryColor,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildUsersTab() {
    return const Center(
      child: Text(
        'Users Management - Coming Soon',
        style: TextStyle(fontSize: 18),
      ),
    );
  }

  Widget _buildReportsTab() {
    return const Center(
      child: Text('Reports - Coming Soon', style: TextStyle(fontSize: 18)),
    );
  }

  Widget _buildSettingsTab() {
    return const Center(
      child: Text('Settings - Coming Soon', style: TextStyle(fontSize: 18)),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
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

  Widget _buildActivityCard(
    String title,
    String description,
    String time,
    IconData icon,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppConstants.paddingMedium),
      padding: const EdgeInsets.all(AppConstants.paddingMedium),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusLarge),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(
                AppConstants.borderRadiusLarge,
              ),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: AppConstants.paddingMedium),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: AppConstants.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.textLight,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
