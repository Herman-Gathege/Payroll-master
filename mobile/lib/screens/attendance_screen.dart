import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _isClockedIn = false;
  DateTime? _clockInTime;

  void _handleClockIn() {
    setState(() {
      _isClockedIn = true;
      _clockInTime = DateTime.now();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Clocked in successfully')),
    );
  }

  void _handleClockOut() {
    setState(() {
      _isClockedIn = false;
      _clockInTime = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Clocked out successfully')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text(
                    DateFormat('EEEE, MMMM d, y').format(DateTime.now()),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    DateFormat('HH:mm:ss').format(DateTime.now()),
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 24),
                  if (_isClockedIn && _clockInTime != null)
                    Column(
                      children: [
                        Text(
                          'Clocked in at ${DateFormat('HH:mm').format(_clockInTime!)}',
                          style: const TextStyle(color: Colors.green),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ElevatedButton.icon(
                    onPressed: _isClockedIn ? _handleClockOut : _handleClockIn,
                    icon: Icon(_isClockedIn ? Icons.logout : Icons.login),
                    label: Text(_isClockedIn ? 'Clock Out' : 'Clock In'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor:
                          _isClockedIn ? Colors.red : Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 48,
                        vertical: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Attendance History',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Attendance records will be displayed here',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
