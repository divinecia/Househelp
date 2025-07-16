import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../constants/app_constants.dart';
import '../../services/emergency_service.dart';
import '../../models/emergency_model.dart';

class EmergencyReportsWidget extends StatefulWidget {
  const EmergencyReportsWidget({super.key});

  @override
  State<EmergencyReportsWidget> createState() => _EmergencyReportsWidgetState();
}

class _EmergencyReportsWidgetState extends State<EmergencyReportsWidget> {
  List<EmergencyReport> _reports = [];
  bool _isLoading = true;
  EmergencyStatus? _selectedStatus;
  EmergencyType? _selectedType;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final reports = await EmergencyService.getEmergencyReports(
        status: _selectedStatus,
        type: _selectedType,
      );

      setState(() {
        _reports = reports;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to load reports: ${e.toString()}'),
          backgroundColor: AppConstants.errorColor,
        ),
      );
    }
  }

  Future<void> _updateReportStatus(
    String reportId,
    EmergencyStatus status,
  ) async {
    try {
      await EmergencyService.updateEmergencyReportStatus(
        reportId: reportId,
        status: status,
      );
      _loadReports();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Report status updated successfully'),
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

  Future<void> _callEmergencyNumber(String phoneNumber) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    try {
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        throw 'Could not launch $phoneNumber';
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not make call: ${e.toString()}'),
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
                  'Emergency Reports',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppConstants.primaryColor,
                  ),
                ),
                Row(
                  children: [
                    _buildFilterDropdown(),
                    const SizedBox(width: AppConstants.paddingSmall),
                    IconButton(
                      icon: const Icon(Icons.refresh),
                      onPressed: _loadReports,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: AppConstants.paddingMedium),
            _buildQuickStats(),
            const SizedBox(height: AppConstants.paddingMedium),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_reports.isEmpty)
              const Center(child: Text('No emergency reports found'))
            else
              Expanded(
                child: ListView.builder(
                  itemCount: _reports.length,
                  itemBuilder: (context, index) {
                    final report = _reports[index];
                    return _buildReportCard(report);
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterDropdown() {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.filter_list),
      onSelected: (String value) {
        if (value.startsWith('status_')) {
          final statusName = value.substring(7);
          setState(() {
            _selectedStatus = EmergencyStatus.values.firstWhere(
              (s) => s.name == statusName,
              orElse: () => EmergencyStatus.pending,
            );
          });
        } else if (value.startsWith('type_')) {
          final typeName = value.substring(5);
          setState(() {
            _selectedType = EmergencyType.values.firstWhere(
              (t) => t.name == typeName,
              orElse: () => EmergencyType.other,
            );
          });
        } else if (value == 'clear') {
          setState(() {
            _selectedStatus = null;
            _selectedType = null;
          });
        }
        _loadReports();
      },
      itemBuilder: (BuildContext context) => [
        const PopupMenuItem(value: 'clear', child: Text('Clear Filters')),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: 'status_pending',
          child: Text('Status: Pending'),
        ),
        const PopupMenuItem(
          value: 'status_inProgress',
          child: Text('Status: In Progress'),
        ),
        const PopupMenuItem(
          value: 'status_resolved',
          child: Text('Status: Resolved'),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: 'type_appIssue',
          child: Text('Type: App Issue'),
        ),
        const PopupMenuItem(value: 'type_theft', child: Text('Type: Theft')),
        const PopupMenuItem(
          value: 'type_assault',
          child: Text('Type: Assault'),
        ),
        const PopupMenuItem(
          value: 'type_medical',
          child: Text('Type: Medical'),
        ),
      ],
    );
  }

  Widget _buildQuickStats() {
    final totalReports = _reports.length;
    final pendingReports = _reports
        .where((r) => r.status == EmergencyStatus.pending)
        .length;
    final appIssues = _reports.where((r) => r.isAppIssue).length;
    final criminalIssues = _reports.where((r) => r.isCriminalIssue).length;

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Total',
            totalReports.toString(),
            AppConstants.primaryColor,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: _buildStatCard(
            'Pending',
            pendingReports.toString(),
            AppConstants.warningColor,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: _buildStatCard(
            'App Issues',
            appIssues.toString(),
            AppConstants.secondaryColor,
          ),
        ),
        const SizedBox(width: AppConstants.paddingSmall),
        Expanded(
          child: _buildStatCard(
            'Criminal',
            criminalIssues.toString(),
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

  Widget _buildReportCard(EmergencyReport report) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppConstants.paddingSmall),
      child: ExpansionTile(
        leading: _buildTypeIcon(report.type),
        title: Text(
          '${report.type.name.toUpperCase()} - ${report.id.substring(0, 8)}',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              report.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _buildStatusChip(report.status),
                const SizedBox(width: AppConstants.paddingSmall),
                Text(
                  'Created: ${report.createdAt.toString().substring(0, 16)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(AppConstants.paddingMedium),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (report.location != null)
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Location: ${report.location!.latitude.toStringAsFixed(6)}, ${report.location!.longitude.toStringAsFixed(6)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                if (report.emergencyContact != null)
                  Row(
                    children: [
                      const Icon(Icons.phone, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Emergency Contact: ${report.emergencyContact}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      IconButton(
                        icon: const Icon(Icons.call, size: 16),
                        onPressed: () =>
                            _callEmergencyNumber(report.emergencyContact!),
                      ),
                    ],
                  ),
                if (report.isangeCaseId != null)
                  Row(
                    children: [
                      const Icon(Icons.case_outlined, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'ISANGE Case: ${report.isangeCaseId}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                const SizedBox(height: AppConstants.paddingMedium),
                Row(
                  children: [
                    if (report.isAppIssue)
                      ElevatedButton.icon(
                        onPressed: () => _updateReportStatus(
                          report.id,
                          EmergencyStatus.inProgress,
                        ),
                        icon: const Icon(Icons.start),
                        label: const Text('Start Review'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppConstants.primaryColor,
                        ),
                      ),
                    if (report.isCriminalIssue)
                      ElevatedButton.icon(
                        onPressed: () => _callEmergencyNumber(
                          AppConstants.emergencyGenderViolence,
                        ),
                        icon: const Icon(Icons.call),
                        label: const Text('Call ISANGE'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppConstants.errorColor,
                        ),
                      ),
                    const SizedBox(width: AppConstants.paddingSmall),
                    ElevatedButton.icon(
                      onPressed: () => _updateReportStatus(
                        report.id,
                        EmergencyStatus.resolved,
                      ),
                      icon: const Icon(Icons.check),
                      label: const Text('Resolve'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.successColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeIcon(EmergencyType type) {
    IconData iconData;
    Color color;

    switch (type) {
      case EmergencyType.medical:
        iconData = Icons.medical_services;
        color = AppConstants.errorColor;
        break;
      case EmergencyType.fire:
        iconData = Icons.local_fire_department;
        color = AppConstants.warningColor;
        break;
      case EmergencyType.theft:
        iconData = Icons.security;
        color = AppConstants.errorColor;
        break;
      case EmergencyType.assault:
        iconData = Icons.warning;
        color = AppConstants.errorColor;
        break;
      case EmergencyType.appIssue:
        iconData = Icons.bug_report;
        color = AppConstants.secondaryColor;
        break;
      default:
        iconData = Icons.report;
        color = AppConstants.accentColor;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
      ),
      child: Icon(iconData, color: color, size: 20),
    );
  }

  Widget _buildStatusChip(EmergencyStatus status) {
    Color color;
    switch (status) {
      case EmergencyStatus.pending:
        color = AppConstants.warningColor;
        break;
      case EmergencyStatus.inProgress:
        color = AppConstants.primaryColor;
        break;
      case EmergencyStatus.resolved:
        color = AppConstants.successColor;
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
        status.name.toUpperCase(),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
