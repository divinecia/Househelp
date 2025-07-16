import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';
import '../../models/worker_model.dart';
import '../../models/job_model.dart';
import '../../services/worker_service.dart';
import '../../services/review_service.dart';
import '../../widgets/common/loading_widget.dart';
import '../../widgets/common/error_widget.dart';
import '../messaging/chat_screen.dart';

class WorkerProfileScreen extends StatefulWidget {
  final String workerId;
  final String? householdId;

  const WorkerProfileScreen({
    Key? key,
    required this.workerId,
    this.householdId,
  }) : super(key: key);

  @override
  State<WorkerProfileScreen> createState() => _WorkerProfileScreenState();
}

class _WorkerProfileScreenState extends State<WorkerProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Worker? _worker;
  List<Map<String, dynamic>> _reviews = [];
  bool _isLoading = true;
  bool _isBookmarked = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadWorkerData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadWorkerData() async {
    try {
      setState(() => _isLoading = true);

      final futures = await Future.wait([
        WorkerService.getWorkerProfile(widget.workerId),
        ReviewService.getWorkerReviews(widget.workerId),
        if (widget.householdId != null)
          WorkerService.isBookmarked(widget.workerId, widget.householdId!),
      ]);

      setState(() {
        _worker = futures[0] as Worker;
        _reviews = futures[1] as List<Map<String, dynamic>>;
        if (widget.householdId != null && futures.length > 2) {
          _isBookmarked = futures[2] as bool;
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error loading profile: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Worker Profile')),
        body: const LoadingWidget(),
      );
    }

    if (_worker == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Worker Profile')),
        body: const CustomErrorWidget(message: 'Worker not found'),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_worker!.fullName),
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isBookmarked ? Icons.bookmark : Icons.bookmark_border),
            onPressed: _toggleBookmark,
          ),
          IconButton(
            icon: const Icon(Icons.message),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ChatScreen(
                  conversationId: '${widget.householdId}_${widget.workerId}',
                  recipientId: widget.workerId,
                  recipientName: _worker!.fullName,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildProfileHeader(),
          _buildTabBar(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(),
                _buildServicesTab(),
                _buildReviewsTab(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomAction(),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppConstants.primaryBlue, AppConstants.lightBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 40,
                backgroundImage: _worker!.profileImage != null
                    ? NetworkImage(_worker!.profileImage!)
                    : null,
                child: _worker!.profileImage == null
                    ? Text(
                        _worker!.fullName[0].toUpperCase(),
                        style: const TextStyle(
                          fontSize: 32,
                          color: Colors.white,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _worker!.fullName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          '${_worker!.rating.toStringAsFixed(1)} (${_reviews.length} reviews)',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _worker!.location.displayAddress,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Experience', '${_worker!.experienceYears} years'),
              _buildStatItem('Jobs Done', '${_worker!.completedJobs}'),
              _buildStatItem('Response', '< 1 hour'),
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
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      child: TabBar(
        controller: _tabController,
        labelColor: AppConstants.primaryBlue,
        unselectedLabelColor: Colors.grey,
        indicatorColor: AppConstants.primaryBlue,
        tabs: const [
          Tab(text: 'Overview'),
          Tab(text: 'Services'),
          Tab(text: 'Reviews'),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSection('About', Text(_worker!.bio ?? 'No bio available')),
          const SizedBox(height: 24),
          _buildSection(
            'Skills & Specializations',
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _worker!.skills
                  .map(
                    (skill) => Chip(
                      label: Text(skill),
                      backgroundColor: AppConstants.lightBlue.withOpacity(0.2),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 24),
          _buildSection(
            'Languages',
            Wrap(
              spacing: 8,
              children: _worker!.languages
                  .map(
                    (lang) => Chip(
                      label: Text(lang),
                      backgroundColor: Colors.green.withOpacity(0.2),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 24),
          _buildSection(
            'Availability',
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Working Hours: ${_worker!.workingHours}'),
                const SizedBox(height: 8),
                Text('Available Days: ${_worker!.availableDays.join(', ')}'),
              ],
            ),
          ),
          if (_worker!.certifications.isNotEmpty) ...[
            const SizedBox(height: 24),
            _buildSection(
              'Certifications',
              Column(
                children: _worker!.certifications
                    .map(
                      (cert) => ListTile(
                        leading: const Icon(
                          Icons.verified,
                          color: Colors.green,
                        ),
                        title: Text(cert),
                        contentPadding: EdgeInsets.zero,
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildServicesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSection(
            'Service Categories',
            Column(
              children: _worker!.serviceTypes
                  .map(
                    (service) => Card(
                      child: ListTile(
                        leading: Icon(_getServiceIcon(service)),
                        title: Text(service.name),
                        subtitle: Text(
                          'Starting from RWF ${_worker!.hourlyRate}/hr',
                        ),
                        trailing: ElevatedButton(
                          onPressed: () => _bookService(service),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppConstants.primaryBlue,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Book'),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 24),
          _buildSection(
            'Package Deals',
            Column(
              children: [
                _buildPackageCard(
                  'Weekly Cleaning',
                  'RWF 15,000',
                  '3 cleaning sessions per week',
                  Icons.cleaning_services,
                ),
                _buildPackageCard(
                  'Monthly Deep Clean',
                  'RWF 25,000',
                  'Comprehensive monthly cleaning',
                  Icons.home_work,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildRatingOverview(),
          const SizedBox(height: 24),
          _buildSection(
            'Recent Reviews',
            _reviews.isEmpty
                ? const Center(child: Text('No reviews yet'))
                : Column(
                    children: _reviews
                        .map((review) => _buildReviewCard(review))
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, Widget content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppConstants.primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        content,
      ],
    );
  }

  Widget _buildPackageCard(
    String title,
    String price,
    String description,
    IconData icon,
  ) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: AppConstants.primaryBlue),
        title: Text(title),
        subtitle: Text(description),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              price,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: AppConstants.primaryBlue,
              ),
            ),
            TextButton(onPressed: () {}, child: const Text('Book')),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingOverview() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Column(
              children: [
                Text(
                  _worker!.rating.toStringAsFixed(1),
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: List.generate(
                    5,
                    (index) => Icon(
                      index < _worker!.rating.round()
                          ? Icons.star
                          : Icons.star_border,
                      color: Colors.amber,
                    ),
                  ),
                ),
                Text('${_reviews.length} reviews'),
              ],
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                children: List.generate(5, (index) {
                  final starCount = 5 - index;
                  final count = _reviews
                      .where((r) => (r['rating'] as num).round() == starCount)
                      .length;
                  final percentage = _reviews.isEmpty
                      ? 0.0
                      : count / _reviews.length;

                  return Row(
                    children: [
                      Text('$starCount'),
                      const Icon(Icons.star, size: 16, color: Colors.amber),
                      const SizedBox(width: 8),
                      Expanded(
                        child: LinearProgressIndicator(
                          value: percentage,
                          backgroundColor: Colors.grey[300],
                          valueColor: const AlwaysStoppedAnimation(
                            Colors.amber,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text('$count'),
                    ],
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(Map<String, dynamic> review) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  child: Text((review['reviewerName'] as String)[0]),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review['reviewerName'] as String,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Row(
                        children: [
                          ...List.generate(
                            5,
                            (index) => Icon(
                              index < (review['rating'] as num).round()
                                  ? Icons.star
                                  : Icons.star_border,
                              size: 16,
                              color: Colors.amber,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${DateTime.parse(review['createdAt']).day}/${DateTime.parse(review['createdAt']).month}/${DateTime.parse(review['createdAt']).year}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(review['comment'] as String),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomAction() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChatScreen(
                    conversationId: '${widget.householdId}_${widget.workerId}',
                    recipientId: widget.workerId,
                    recipientName: _worker!.fullName,
                  ),
                ),
              ),
              child: const Text('Message'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _bookWorker,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.primaryBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Book Now'),
            ),
          ),
        ],
      ),
    );
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

  void _toggleBookmark() async {
    if (widget.householdId == null) return;

    try {
      if (_isBookmarked) {
        await WorkerService.removeBookmark(
          widget.workerId,
          widget.householdId!,
        );
      } else {
        await WorkerService.addBookmark(widget.workerId, widget.householdId!);
      }
      setState(() => _isBookmarked = !_isBookmarked);
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _bookService(ServiceType serviceType) {
    // Navigate to booking screen with pre-selected service
    Navigator.pushNamed(
      context,
      '/book-job',
      arguments: {'workerId': widget.workerId, 'serviceType': serviceType},
    );
  }

  void _bookWorker() {
    // Navigate to general booking screen
    Navigator.pushNamed(
      context,
      '/book-job',
      arguments: {'workerId': widget.workerId},
    );
  }
}
