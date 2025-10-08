import 'package:flutter/material.dart';

class LeaveScreen extends StatelessWidget {
  const LeaveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Leave Balance',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  _LeaveBalanceRow('Annual Leave', 15, 21),
                  _LeaveBalanceRow('Sick Leave', 10, 14),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              // Navigate to apply leave form
            },
            icon: const Icon(Icons.add),
            label: const Text('Apply for Leave'),
          ),
          const SizedBox(height: 16),
          Text(
            'Leave Applications',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Leave applications will be displayed here',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LeaveBalanceRow extends StatelessWidget {
  final String type;
  final int remaining;
  final int total;

  const _LeaveBalanceRow(this.type, this.remaining, this.total);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(type),
          Text(
            '$remaining / $total days',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
