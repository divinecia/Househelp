import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';
import '../../models/job_model.dart';
import '../../models/worker_model.dart';
import '../../services/job_service.dart';
import '../../services/worker_service.dart';
import '../../widgets/common/loading_widget.dart';

class UrgentBookingScreen extends StatefulWidget {
  final String userId;

  const UrgentBookingScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<UrgentBookingScreen> createState() => _UrgentBookingScreenState();
}

class _UrgentBookingScreenState extends State<UrgentBookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _budgetController = TextEditingController();

  ServiceType? _selectedService;
  UrgencyLevel _urgencyLevel = UrgencyLevel.asap;
  DateTime? _preferredTime;
  List<Worker> _nearbyWorkers = [];
  bool _isLoading = false;
  bool _autoMatch = true;

  @override
  void initState() {
    super.initState();
    _loadNearbyWorkers();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  Future<void> _loadNearbyWorkers() async {
    try {
      final workers = await WorkerService.getNearbyWorkers(
        widget.userId,
        radius: 5,
      );
      setState(() => _nearbyWorkers = workers);
    } catch (e) {
      // Handle error silently or show message
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Urgent Booking'),
        backgroundColor: Colors.red[600],
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const LoadingWidget()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildUrgencyAlert(),
                    const SizedBox(height: 24),
                    _buildServiceSelection(),
                    const SizedBox(height: 24),
                    _buildJobDetails(),
                    const SizedBox(height: 24),
                    _buildUrgencyOptions(),
                    const SizedBox(height: 24),
                    _buildTimeSelection(),
                    const SizedBox(height: 24),
                    _buildBudgetSection(),
                    const SizedBox(height: 24),
                    _buildWorkerMatching(),
                    const SizedBox(height: 24),
                    _buildNearbyWorkers(),
                    const SizedBox(height: 32),
                    _buildSubmitButton(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildUrgencyAlert() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red[200]!),
      ),
      child: Row(
        children: [
          Icon(Icons.warning, color: Colors.red[600], size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Urgent Service Request',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.red[800],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Urgent bookings may have higher rates and limited availability',
                  style: TextStyle(color: Colors.red[700], fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Service Type *',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ServiceType.values.map((service) {
            final isSelected = _selectedService == service;
            return FilterChip(
              label: Text(service.name),
              selected: isSelected,
              onSelected: (selected) {
                setState(() => _selectedService = selected ? service : null);
              },
              selectedColor: AppConstants.primaryBlue.withOpacity(0.2),
              checkmarkColor: AppConstants.primaryBlue,
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildJobDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Job Details',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _titleController,
          decoration: const InputDecoration(
            labelText: 'Job Title *',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.title),
          ),
          validator: (value) =>
              value?.isEmpty ?? true ? 'Please enter a job title' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _descriptionController,
          decoration: const InputDecoration(
            labelText: 'Description *',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.description),
            hintText: 'Describe what you need help with...',
          ),
          maxLines: 3,
          validator: (value) =>
              value?.isEmpty ?? true ? 'Please enter a description' : null,
        ),
      ],
    );
  }

  Widget _buildUrgencyOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Urgency Level',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...UrgencyLevel.values.map((level) {
          return RadioListTile<UrgencyLevel>(
            title: Text(_getUrgencyTitle(level)),
            subtitle: Text(_getUrgencyDescription(level)),
            value: level,
            groupValue: _urgencyLevel,
            onChanged: (value) => setState(() => _urgencyLevel = value!),
            activeColor: AppConstants.primaryBlue,
          );
        }).toList(),
      ],
    );
  }

  Widget _buildTimeSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Preferred Time',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        InkWell(
          onTap: _selectDateTime,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[400]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.access_time),
                const SizedBox(width: 12),
                Text(
                  _preferredTime != null
                      ? '${_preferredTime!.day}/${_preferredTime!.month}/${_preferredTime!.year} at ${_preferredTime!.hour}:${_preferredTime!.minute.toString().padLeft(2, '0')}'
                      : 'Select preferred time',
                ),
                const Spacer(),
                const Icon(Icons.arrow_forward_ios, size: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBudgetSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Budget',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _budgetController,
          decoration: const InputDecoration(
            labelText: 'Budget (RWF)',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.attach_money),
            hintText: 'Enter your budget',
          ),
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.orange[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.orange[200]!),
          ),
          child: Row(
            children: [
              Icon(Icons.info, color: Colors.orange[600], size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Urgent bookings may have a 20-50% surcharge',
                  style: TextStyle(color: Colors.orange[800], fontSize: 12),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildWorkerMatching() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Worker Matching',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        SwitchListTile(
          title: const Text('Auto-match with available workers'),
          subtitle: const Text(
            'We\'ll find the best available workers for you',
          ),
          value: _autoMatch,
          onChanged: (value) => setState(() => _autoMatch = value),
          activeColor: AppConstants.primaryBlue,
        ),
      ],
    );
  }

  Widget _buildNearbyWorkers() {
    if (_nearbyWorkers.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Available Workers Nearby',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _nearbyWorkers.length,
            itemBuilder: (context, index) {
              final worker = _nearbyWorkers[index];
              return Container(
                width: 100,
                margin: const EdgeInsets.only(right: 12),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundImage: worker.profileImage != null
                              ? NetworkImage(worker.profileImage!)
                              : null,
                          child: worker.profileImage == null
                              ? Text(worker.fullName[0])
                              : null,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          worker.fullName.split(' ').first,
                          style: const TextStyle(fontSize: 12),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.star,
                              size: 12,
                              color: Colors.amber,
                            ),
                            Text(
                              worker.rating.toStringAsFixed(1),
                              style: const TextStyle(fontSize: 10),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _submitUrgentBooking,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red[600],
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(
          _urgencyLevel == UrgencyLevel.asap
              ? 'Request Immediate Help'
              : 'Submit Urgent Request',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  String _getUrgencyTitle(UrgencyLevel level) {
    switch (level) {
      case UrgencyLevel.asap:
        return 'ASAP (Within 1 hour)';
      case UrgencyLevel.today:
        return 'Today (Within 4 hours)';
      case UrgencyLevel.tomorrow:
        return 'Tomorrow';
      default:
        return 'Within 24 hours';
    }
  }

  String _getUrgencyDescription(UrgencyLevel level) {
    switch (level) {
      case UrgencyLevel.asap:
        return 'Highest priority, 50% surcharge';
      case UrgencyLevel.today:
        return 'High priority, 30% surcharge';
      case UrgencyLevel.tomorrow:
        return 'Medium priority, 20% surcharge';
      default:
        return 'Standard priority, 10% surcharge';
    }
  }

  Future<void> _selectDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 7)),
    );

    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (time != null) {
        setState(() {
          _preferredTime = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Future<void> _submitUrgentBooking() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedService == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a service type')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final job = Job(
        id: '',
        title: _titleController.text,
        description: _descriptionController.text,
        serviceType: _selectedService!,
        status: JobStatus.pending,
        householdId: widget.userId,
        hourlyRate: double.tryParse(_budgetController.text),
        urgencyLevel: _urgencyLevel,
        preferredStartTime: _preferredTime,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        location: null, // Will be set by service
      );

      await JobService.createUrgentJob(job, autoMatch: _autoMatch);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Urgent booking request submitted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

enum UrgencyLevel { asap, today, tomorrow, within24h }
