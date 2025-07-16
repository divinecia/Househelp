import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';
import '../../services/supabase_service.dart';
import '../../models/user_model.dart';

class UserManagementWidget extends StatefulWidget {
  const UserManagementWidget({super.key});

  @override
  State<UserManagementWidget> createState() => _UserManagementWidgetState();
}

class _UserManagementWidgetState extends State<UserManagementWidget> {
  List<Map<String, dynamic>> _users = [];
  bool _isLoading = true;
  String? _selectedUserType;
  String? _selectedStatus;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      var query = SupabaseService.client.from('users').select();

      if (_selectedUserType != null) {
        query = query.eq('user_type', _selectedUserType);
      }

      if (_selectedStatus != null) {
        query = query.eq('status', _selectedStatus);
      }

      if (_searchQuery.isNotEmpty) {
        query = query.or(
          'full_name.ilike.%$_searchQuery%,email.ilike.%$_searchQuery%',
        );
      }

      final response = await query
          .order('created_at', ascending: false)
          .limit(100);

      setState(() {
        _users = List<Map<String, dynamic>>.from(response);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load users: ${e.toString()}'),
          backgroundColor: AppConstants.errorColor,
        ),
      );
    }
  }

  Future<void> _updateUserStatus(String userId, String newStatus) async {
    try {
      await SupabaseService.updateUserProfile(
        userId: userId,
        data: {'status': newStatus},
      );
      _loadUsers();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('User status updated successfully'),
          backgroundColor: AppConstants.successColor,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update status: ${e.toString()}'),
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
                  'User Management',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppConstants.primaryColor,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadUsers,
                ),
              ],
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            _buildFilters(),
            const SizedBox(height: AppConstants.paddingMedium),
            _buildUserStats(),
            const SizedBox(height: AppConstants.paddingMedium),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_users.isEmpty)
              const Center(child: Text('No users found'))
            else
              Expanded(
                child: ListView.builder(
                  itemCount: _users.length,
                  itemBuilder: (context, index) {
                    final user = _users[index];
                    return _buildUserCard(user);
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      children: [
        // Search bar
        TextField(
          controller: _searchController,
          decoration: const InputDecoration(
            hintText: 'Search by name or email...',
            prefixIcon: Icon(Icons.search),
            border: OutlineInputBorder(),
          ),
          onChanged: (value) {
            setState(() {
              _searchQuery = value;
            });
            // Debounce the search
            Future.delayed(const Duration(milliseconds: 500), () {
              if (_searchQuery == value) {
                _loadUsers();
              }
            });
          },
        ),
        const SizedBox(height: AppConstants.paddingMedium),
        // Filter dropdowns
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _selectedUserType,
                decoration: const InputDecoration(
                  labelText: 'User Type',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('All Types')),
                  DropdownMenuItem(
                    value: AppConstants.userTypeWorker,
                    child: const Text('Workers'),
                  ),
                  DropdownMenuItem(
                    value: AppConstants.userTypeHousehold,
                    child: const Text('Households'),
                  ),
                  DropdownMenuItem(
                    value: AppConstants.userTypeAdmin,
                    child: const Text('Admins'),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedUserType = value;
                  });
                  _loadUsers();
                },
              ),
            ),
            const SizedBox(width: AppConstants.paddingMedium),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _selectedStatus,
                decoration: const InputDecoration(
                  labelText: 'Status',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: null, child: Text('All Statuses')),
                  DropdownMenuItem(value: 'active', child: Text('Active')),
                  DropdownMenuItem(value: 'pending', child: Text('Pending')),
                  DropdownMenuItem(
                    value: 'suspended',
                    child: Text('Suspended'),
                  ),
                  DropdownMenuItem(value: 'inactive', child: Text('Inactive')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedStatus = value;
                  });
                  _loadUsers();
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildUserStats() {
    final totalUsers = _users.length;
    final activeUsers = _users.where((u) => u['status'] == 'active').length;
    final pendingUsers = _users.where((u) => u['status'] == 'pending').length;
    final suspendedUsers = _users
        .where((u) => u['status'] == 'suspended')
        .length;

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Total',
            totalUsers.toString(),
            AppConstants.primaryColor,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: _buildStatCard(
            'Active',
            activeUsers.toString(),
            AppConstants.successColor,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: _buildStatCard(
            'Pending',
            pendingUsers.toString(),
            AppConstants.warningColor,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: _buildStatCard(
            'Suspended',
            suspendedUsers.toString(),
            AppConstants.errorColor,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.paddingSmall),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: AppConstants.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final userType = user['user_type'] as String;
    final status = user['status'] as String;
    final isEmailVerified = user['is_email_verified'] as bool? ?? false;
    final isPhoneVerified = user['is_phone_verified'] as bool? ?? false;

    return Card(
      margin: const EdgeInsets.only(bottom: AppConstants.paddingSmall),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getUserTypeColor(userType),
          child: Text(
            userType.substring(0, 1).toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          user['full_name'] ?? 'Unknown',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user['email'] ?? 'No email'),
            if (user['phone_number'] != null) Text(user['phone_number']),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildStatusChip(status),
                const SizedBox(width: AppConstants.paddingSmall),
                _buildUserTypeChip(userType),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                if (isEmailVerified)
                  const Icon(
                    Icons.email,
                    color: AppConstants.successColor,
                    size: 16,
                  )
                else
                  const Icon(
                    Icons.email_outlined,
                    color: AppConstants.errorColor,
                    size: 16,
                  ),
                const SizedBox(width: 4),
                if (isPhoneVerified)
                  const Icon(
                    Icons.phone,
                    color: AppConstants.successColor,
                    size: 16,
                  )
                else
                  const Icon(
                    Icons.phone_outlined,
                    color: AppConstants.errorColor,
                    size: 16,
                  ),
                const SizedBox(width: AppConstants.paddingSmall),
                Text(
                  'Joined: ${DateTime.parse(user['created_at']).toString().substring(0, 10)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (String value) {
            switch (value) {
              case 'activate':
                _updateUserStatus(user['id'], 'active');
                break;
              case 'suspend':
                _updateUserStatus(user['id'], 'suspended');
                break;
              case 'deactivate':
                _updateUserStatus(user['id'], 'inactive');
                break;
              case 'view_profile':
                _showUserProfile(user);
                break;
            }
          },
          itemBuilder: (BuildContext context) => [
            if (status != 'active')
              const PopupMenuItem(
                value: 'activate',
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: AppConstants.successColor),
                    SizedBox(width: 8),
                    Text('Activate'),
                  ],
                ),
              ),
            if (status != 'suspended')
              const PopupMenuItem(
                value: 'suspend',
                child: Row(
                  children: [
                    Icon(Icons.block, color: AppConstants.errorColor),
                    SizedBox(width: 8),
                    Text('Suspend'),
                  ],
                ),
              ),
            if (status != 'inactive')
              const PopupMenuItem(
                value: 'deactivate',
                child: Row(
                  children: [
                    Icon(Icons.remove_circle, color: AppConstants.accentColor),
                    SizedBox(width: 8),
                    Text('Deactivate'),
                  ],
                ),
              ),
            const PopupMenuItem(
              value: 'view_profile',
              child: Row(
                children: [
                  Icon(Icons.person, color: AppConstants.primaryColor),
                  SizedBox(width: 8),
                  Text('View Profile'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status) {
      case 'active':
        color = AppConstants.successColor;
        break;
      case 'pending':
        color = AppConstants.warningColor;
        break;
      case 'suspended':
        color = AppConstants.errorColor;
        break;
      default:
        color = AppConstants.accentColor;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConstants.paddingSmall,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status.toUpperCase(),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildUserTypeChip(String userType) {
    final color = _getUserTypeColor(userType);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConstants.paddingSmall,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        userType.toUpperCase(),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getUserTypeColor(String userType) {
    switch (userType) {
      case AppConstants.userTypeWorker:
        return AppConstants.workerColor;
      case AppConstants.userTypeHousehold:
        return AppConstants.householdColor;
      case AppConstants.userTypeAdmin:
        return AppConstants.adminColor;
      default:
        return AppConstants.accentColor;
    }
  }

  void _showUserProfile(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(user['full_name'] ?? 'User Profile'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildProfileRow('Email', user['email'] ?? 'Not provided'),
              _buildProfileRow('Phone', user['phone_number'] ?? 'Not provided'),
              _buildProfileRow('User Type', user['user_type'] ?? 'Unknown'),
              _buildProfileRow('Status', user['status'] ?? 'Unknown'),
              _buildProfileRow(
                'Email Verified',
                (user['is_email_verified'] as bool? ?? false) ? 'Yes' : 'No',
              ),
              _buildProfileRow(
                'Phone Verified',
                (user['is_phone_verified'] as bool? ?? false) ? 'Yes' : 'No',
              ),
              _buildProfileRow(
                'Language',
                user['preferred_language'] ?? 'Not set',
              ),
              _buildProfileRow(
                'Joined',
                DateTime.parse(user['created_at']).toString().substring(0, 16),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: Text(value, style: Theme.of(context).textTheme.bodyMedium),
          ),
        ],
      ),
    );
  }
}
