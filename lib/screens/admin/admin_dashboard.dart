import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_router.dart';
import '../../widgets/admin/payment_analytics_widget.dart';
import '../../widgets/admin/emergency_reports_widget.dart';
import '../../widgets/admin/user_management_widget.dart';

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
                icon: Icon(Icons.warning),
                label: 'Emergency',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.payment),
                label: 'Payments',
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
        return const UserManagementWidget();
      case 2:
        return const EmergencyReportsWidget();
      case 3:
        return const PaymentAnalyticsWidget();
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
                      Icons.people,
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard(
                      'Active Workers',
                      '456',
                      AppConstants.workerColor,
                      Icons.work,
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
                      '312',
                      AppConstants.householdColor,
                      Icons.home,
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildStatCard(
                      'Admins',
                      '7',
                      AppConstants.adminColor,
                      Icons.admin_panel_settings_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingLarge),

              // Quick actions
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppConstants.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              Row(
                children: [
                  Expanded(
                    child: _buildActionCard(
                      'View Users',
                      Icons.people,
                      AppConstants.primaryColor,
                      () => setState(() => _selectedIndex = 1),
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildActionCard(
                      'Emergency Reports',
                      Icons.warning,
                      AppConstants.errorColor,
                      () => setState(() => _selectedIndex = 2),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingMedium),

              Row(
                children: [
                  Expanded(
                    child: _buildActionCard(
                      'Payment Analytics',
                      Icons.payment,
                      AppConstants.successColor,
                      () => setState(() => _selectedIndex = 3),
                    ),
                  ),
                  const SizedBox(width: AppConstants.paddingMedium),
                  Expanded(
                    child: _buildActionCard(
                      'Tax Reports',
                      Icons.receipt,
                      AppConstants.warningColor,
                      () {
                        // TODO: Implement tax reports view
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tax Reports coming soon'),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppConstants.paddingLarge),

              // Recent activity (sample data for now)
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
                'Emergency Report',
                'Theft reported at household in Gasabo',
                '3 hours ago',
                Icons.warning,
                AppConstants.errorColor,
              ),
              _buildActivityCard(
                'Payment Processed',
                'Service payment of RWF 25,000 processed',
                '4 hours ago',
                Icons.payment,
                AppConstants.primaryColor,
              ),
              _buildActivityCard(
                'Training Completed',
                '2 workers finished cleaning safety training',
                '5 hours ago',
                Icons.school,
                AppConstants.householdColor,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    Color color,
    IconData icon,
  ) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(
                  AppConstants.borderRadiusMedium,
                ),
              ),
              padding: const EdgeInsets.all(8),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: AppConstants.paddingMedium),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(title, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 3,
        color: color.withOpacity(0.07),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.paddingLarge),
          child: Row(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(width: AppConstants.paddingMedium),
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: color,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16),
            ],
          ),
        ),
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
    return Card(
      elevation: 1,
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingMedium),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: AppConstants.paddingMedium),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: color,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Text(
              time,
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: AppConstants.textLight),
            ),
          ],
        ),
      ),
    );
  }
}
