import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class LoyaltyDashboardScreen extends StatefulWidget {
  const LoyaltyDashboardScreen({Key? key}) : super(key: key);

  @override
  State<LoyaltyDashboardScreen> createState() => _LoyaltyDashboardScreenState();
}

class _LoyaltyDashboardScreenState extends State<LoyaltyDashboardScreen> {
  int currentPoints = 1250;
  int totalEarned = 3400;
  String currentTier = "Silver";
  int pointsToNextTier = 250;

  final List<Map<String, dynamic>> recentActivities = [
    {
      'title': 'Completed Deep Cleaning',
      'points': '+50',
      'date': '2 hours ago',
      'icon': Icons.cleaning_services,
    },
    {
      'title': 'Perfect Week Attendance',
      'points': '+100',
      'date': 'Yesterday',
      'icon': Icons.calendar_today,
    },
    {
      'title': 'Client Feedback Bonus',
      'points': '+25',
      'date': '3 days ago',
      'icon': Icons.star,
    },
    {
      'title': 'Quick Response Bonus',
      'points': '+15',
      'date': '1 week ago',
      'icon': Icons.flash_on,
    },
  ];

  final List<Map<String, dynamic>> availableRewards = [
    {
      'title': 'Extra Day Off',
      'points': 500,
      'description': 'Get an additional paid day off',
      'icon': Icons.beach_access,
      'available': true,
    },
    {
      'title': 'Cash Bonus',
      'points': 1000,
      'description': '\$50 cash bonus',
      'icon': Icons.attach_money,
      'available': true,
    },
    {
      'title': 'Training Course',
      'points': 750,
      'description': 'Professional development course',
      'icon': Icons.school,
      'available': true,
    },
    {
      'title': 'Premium Tools',
      'points': 1500,
      'description': 'High-quality cleaning equipment',
      'icon': Icons.build,
      'available': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Loyalty Dashboard'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildPointsOverview(),
            const SizedBox(height: 24),
            _buildTierProgress(),
            const SizedBox(height: 24),
            _buildRecentActivity(),
            const SizedBox(height: 24),
            _buildAvailableRewards(),
          ],
        ),
      ),
    );
  }

  Widget _buildPointsOverview() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue[600]!, Colors.blue[800]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'Current Points',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            currentPoints.toString(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 48,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Total Earned', totalEarned.toString()),
              _buildStatItem('Current Tier', currentTier),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildTierProgress() {
    double progress = (currentPoints % 1500) / 1500;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tier Progress',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.amber[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    currentTier,
                    style: TextStyle(
                      color: Colors.amber[800],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(Colors.amber[600]!),
            ),
            const SizedBox(height: 8),
            Text(
              '$pointsToNextTier points to Gold tier',
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Activity',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: recentActivities.length,
          itemBuilder: (context, index) {
            final activity = recentActivities[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.green[100],
                  child: Icon(activity['icon'], color: Colors.green[600]),
                ),
                title: Text(activity['title']),
                subtitle: Text(activity['date']),
                trailing: Text(
                  activity['points'],
                  style: TextStyle(
                    color: Colors.green[600],
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildAvailableRewards() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Available Rewards',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 0.8,
          ),
          itemCount: availableRewards.length,
          itemBuilder: (context, index) {
            final reward = availableRewards[index];
            final canAfford = currentPoints >= reward['points'];
            final isAvailable = reward['available'] && canAfford;

            return Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: InkWell(
                onTap: isAvailable ? () => _redeemReward(reward) : null,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        reward['icon'],
                        size: 40,
                        color: isAvailable ? Colors.blue[600] : Colors.grey,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        reward['title'],
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isAvailable ? Colors.black : Colors.grey,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        reward['description'],
                        style: TextStyle(
                          fontSize: 12,
                          color: isAvailable ? Colors.grey[600] : Colors.grey,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isAvailable
                              ? Colors.blue[100]
                              : Colors.grey[200],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${reward['points']} pts',
                          style: TextStyle(
                            color: isAvailable ? Colors.blue[800] : Colors.grey,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  void _redeemReward(Map<String, dynamic> reward) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Redeem ${reward['title']}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(reward['icon'], size: 64, color: Colors.blue[600]),
              const SizedBox(height: 16),
              Text(reward['description']),
              const SizedBox(height: 16),
              Text(
                'Cost: ${reward['points']} points',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  currentPoints -= reward['points'] as int;
                });
                Navigator.of(context).pop();
                HapticFeedback.lightImpact();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${reward['title']} redeemed successfully!'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              child: const Text('Redeem'),
            ),
          ],
        );
      },
    );
  }
}
