import 'package:flutter/material.dart';
import '../../constants/app_constants.dart';

class HouseholdRegistrationScreen extends StatefulWidget {
  const HouseholdRegistrationScreen({super.key});

  @override
  State<HouseholdRegistrationScreen> createState() =>
      _HouseholdRegistrationScreenState();
}

class _HouseholdRegistrationScreenState
    extends State<HouseholdRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  String _fullName = '';
  String _email = '';
  String _phone = '';

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      _formKey.currentState?.save();
      // TODO: Implement registration logic
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Household registered!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Household')),
      body: Padding(
        padding: const EdgeInsets.all(AppConstants.paddingLarge),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Text(
                'Household Registration',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: AppConstants.paddingLarge),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Full Name'),
                validator: (val) =>
                    val == null || val.isEmpty ? 'Enter name' : null,
                onSaved: (val) => _fullName = val ?? '',
              ),
              const SizedBox(height: AppConstants.paddingMedium),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Enter email' : null,
                onSaved: (val) => _email = val ?? '',
              ),
              const SizedBox(height: AppConstants.paddingMedium),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Phone'),
                keyboardType: TextInputType.phone,
                validator: (val) =>
                    val == null || val.isEmpty ? 'Enter phone' : null,
                onSaved: (val) => _phone = val ?? '',
              ),
              const SizedBox(height: AppConstants.paddingLarge),
              ElevatedButton(onPressed: _submit, child: const Text('Register')),
            ],
          ),
        ),
      ),
    );
  }
}
