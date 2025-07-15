import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_router.dart';

class HouseholdDashboard extends StatefulWidget {
  const HouseholdDashboard({super.key});

  @override
  State<HouseholdDashboard> createState() => _HouseholdDashboardState();
}

class _HouseholdDashboardState extends State<HouseholdDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Household Dashboard'),
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
                icon: Icon(Icons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.search),
                label: 'Find Workers',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.work),
                label: 'My Jobs',
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
        return _buildFindWorkersTab();
      case 2:
        return _buildMyJobsTab();
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
                'Welcome, ${authProvider.appUser?.fullName ?? 'Household'}!',
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
                    child: _buildStatCard('Active Jobs', '2', AppConstants.householdColor),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard('Completed', '8', AppConstants.successColor),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingMedium),
              
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard('Favorites', '5', AppConstants.warningColor),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard('Spent', 'RWF 120,000', AppConstants.secondaryColor),
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
                'Mary Uwimana',
                'Today, 2:00 PM',
                'In Progress',
                AppConstants.warningColor,
              ),
              _buildJobCard(
                'Cooking',
                'Jean Baptiste',
                'Tomorrow, 10:00 AM',
                'Scheduled',
                AppConstants.primaryColor,
              ),
              _buildJobCard(
                'Gardening',
                'Alice Mukamana',
                'Dec 13, 9:00 AM',
                'Completed',
                AppConstants.successColor,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFindWorkersTab() {
    return const Center(
      child: Text(
        'Find Workers Tab - Coming Soon',
        style: TextStyle(fontSize: 18),
      ),
    );
  }

  Widget _buildMyJobsTab() {
    return const Center(
      child: Text(
        'My Jobs Tab - Coming Soon',
        style: TextStyle(fontSize: 18),
      ),
    );
  }

  Widget _buildProfileTab() {
    return const Center(
      child: Text(
        'Profile Tab - Coming Soon',
        style: TextStyle(fontSize: 18),
      ),
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
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppConstants.textSecondary,
            ),
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

  Widget _buildJobCard(String title, String worker, String time, String status, Color statusColor) {
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
                  borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
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
                Icons.person,
                size: 16,
                color: AppConstants.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                worker,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppConstants.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                Icons.schedule,
                size: 16,
                color: AppConstants.textSecondary,
              ),
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