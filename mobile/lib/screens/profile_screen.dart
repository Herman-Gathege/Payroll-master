import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:hr_mobile/providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 60,
            child: Icon(Icons.person, size: 60),
          ),
          const SizedBox(height: 16),
          Text(
            user?.username ?? 'User',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            user?.email ?? '',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey,
                ),
          ),
          const SizedBox(height: 32),
          _ProfileMenuItem(
            icon: Icons.person,
            title: 'Personal Information',
            onTap: () {},
          ),
          _ProfileMenuItem(
            icon: Icons.receipt,
            title: 'Payslips',
            onTap: () {},
          ),
          _ProfileMenuItem(
            icon: Icons.document_scanner,
            title: 'Documents',
            onTap: () {},
          ),
          _ProfileMenuItem(
            icon: Icons.settings,
            title: 'Settings',
            onTap: () {},
          ),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text(
              'Logout',
              style: TextStyle(color: Colors.red),
            ),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Logout'),
                  content: const Text('Are you sure you want to logout?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        authProvider.logout();
                        Navigator.of(context).pushReplacementNamed('/login');
                      },
                      child: const Text('Logout'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
