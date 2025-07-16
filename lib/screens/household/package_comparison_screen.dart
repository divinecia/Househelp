import 'package:flutter/material.dart';

class PackageComparisonScreen extends StatefulWidget {
  const PackageComparisonScreen({Key? key}) : super(key: key);

  @override
  State<PackageComparisonScreen> createState() =>
      _PackageComparisonScreenState();
}

class _PackageComparisonScreenState extends State<PackageComparisonScreen> {
  int selectedPackageIndex = 0;

  final List<Package> packages = [
    Package(
      name: 'Basic Clean',
      price: 50,
      duration: '2 hours',
      features: [
        'Living room cleaning',
        'Kitchen cleaning',
        'Bathroom cleaning',
        'Basic dusting',
      ],
      isPopular: false,
    ),
    Package(
      name: 'Deep Clean',
      price: 120,
      duration: '4 hours',
      features: [
        'All Basic Clean services',
        'Bedroom cleaning',
        'Window cleaning',
        'Appliance cleaning',
        'Floor mopping',
        'Detailed dusting',
      ],
      isPopular: true,
    ),
    Package(
      name: 'Premium Care',
      price: 200,
      duration: '6 hours',
      features: [
        'All Deep Clean services',
        'Laundry service',
        'Ironing',
        'Refrigerator cleaning',
        'Oven cleaning',
        'Organizing services',
        'Pet area cleaning',
      ],
      isPopular: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compare Packages'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.teal,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Column(
              children: [
                const Text(
                  'Choose the perfect cleaning package for your home',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: FractionallySizedBox(
                    widthFactor: (selectedPackageIndex + 1) / packages.length,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: PageView.builder(
              itemCount: packages.length,
              onPageChanged: (index) {
                setState(() {
                  selectedPackageIndex = index;
                });
              },
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: _buildPackageCard(packages[index], index),
                );
              },
            ),
          ),
          _buildBottomNavigation(),
        ],
      ),
    );
  }

  Widget _buildPackageCard(Package package, int index) {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: package.isPopular
            ? const BorderSide(color: Colors.orange, width: 2)
            : BorderSide.none,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  package.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (package.isPopular)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'POPULAR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '\$${package.price}',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Colors.teal,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '/ ${package.duration}',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text(
              'What\'s included:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: package.features.length,
                itemBuilder: (context, featureIndex) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.check_circle,
                          color: Colors.teal,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            package.features[featureIndex],
                            style: const TextStyle(fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              packages.length,
              (index) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: index == selectedPackageIndex
                      ? Colors.teal
                      : Colors.grey[300],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              if (selectedPackageIndex > 0)
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      // Navigate to previous package or go back
                      if (selectedPackageIndex > 0) {
                        setState(() {
                          selectedPackageIndex--;
                        });
                      }
                    },
                    child: const Text('Previous'),
                  ),
                ),
              if (selectedPackageIndex > 0) const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: () {
                    _selectPackage(packages[selectedPackageIndex]);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'Select ${packages[selectedPackageIndex].name}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              if (selectedPackageIndex < packages.length - 1)
                const SizedBox(width: 16),
              if (selectedPackageIndex < packages.length - 1)
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      setState(() {
                        selectedPackageIndex++;
                      });
                    },
                    child: const Text('Next'),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _selectPackage(Package package) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Confirm Selection'),
          content: Text(
            'You have selected ${package.name} for \$${package.price}.\n\nWould you like to proceed with booking?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Navigate to booking screen or process selection
                _proceedWithBooking(package);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
              ),
              child: const Text('Book Now'),
            ),
          ],
        );
      },
    );
  }

  void _proceedWithBooking(Package package) {
    // TODO: Navigate to booking screen with selected package
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Proceeding with ${package.name} booking...'),
        backgroundColor: Colors.teal,
      ),
    );
  }
}

class Package {
  final String name;
  final int price;
  final String duration;
  final List<String> features;
  final bool isPopular;

  Package({
    required this.name,
    required this.price,
    required this.duration,
    required this.features,
    this.isPopular = false,
  });
}
