import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Tài khoản')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person_outline, size: 80, color: AppColors.textSecondary),
                const SizedBox(height: 16),
                const Text(
                  'Đăng nhập khi bạn muốn đặt hàng hoặc xem đơn của mình',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => goToLogin(context, returnPath: '/profile'),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                    child: const Text('Đăng nhập', style: TextStyle(color: Colors.white)),
                  ),
                ),
                TextButton(
                  onPressed: () => context.push('/register'),
                  child: const Text('Tạo tài khoản mới'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final user = auth.user;
    return Scaffold(
      appBar: AppBar(title: const Text('Tài khoản')),
      body: ListView(
        children: [
          const SizedBox(height: 24),
          CircleAvatar(radius: 40, child: Text((user?['full_name'] ?? 'U')[0].toUpperCase())),
          const SizedBox(height: 8),
          Center(child: Text(user?['full_name'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          Center(child: Text(user?['email'] ?? '')),
          const Divider(),
          _menuItem(Icons.receipt_long, 'Đơn hàng của tôi', () => context.push('/orders')),
          _menuItem(Icons.location_on, 'Địa chỉ', () => context.push('/address')),
          _menuItem(Icons.favorite, 'Yêu thích', () => context.push('/wishlist')),
          _menuItem(Icons.notifications, 'Thông báo', () => context.push('/notifications')),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
            onTap: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/home');
            },
          ),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(leading: Icon(icon), title: Text(title), trailing: const Icon(Icons.chevron_right), onTap: onTap);
  }
}
