import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_logo.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/home'),
        ),
        title: const Text('Tài khoản'),
      ),
      body: !auth.isAuthenticated ? const _GuestBody() : _LoggedInBody(user: auth.user),
    );
  }
}

class _GuestBody extends StatelessWidget {
  const _GuestBody();
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Center(child: AppLogo(height: 80)),
        const SizedBox(height: 20),
        const Text(
          'Đăng nhập khi bạn muốn đặt hàng hoặc xem đơn của mình',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 15),
        ),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => goToLogin(context, returnPath: '/profile'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: const Text('Đăng nhập', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
        const SizedBox(height: 8),
        OutlinedButton(
          onPressed: () => context.go('/register?redirect=${Uri.encodeComponent('/profile')}'),
          child: const Text('Tạo tài khoản mới'),
        ),
        const SizedBox(height: 32),
        _menuCard(context, Icons.shopping_bag_outlined, 'Giỏ hàng', () => context.push('/cart')),
        _menuCard(context, Icons.search_rounded, 'Tìm sản phẩm', () => context.push('/search')),
        _menuCard(context, Icons.home_rounded, 'Về trang chủ', () => context.go('/home')),
      ],
    );
  }

  Widget _menuCard(BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

class _LoggedInBody extends ConsumerWidget {
  const _LoggedInBody({required this.user});
  final Map<String, dynamic>? user;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = user?['full_name']?.toString() ?? 'Khách';
    final email = user?['email']?.toString() ?? '';

    return ListView(
      children: [
        const SizedBox(height: 16),
        Center(
          child: CircleAvatar(
            radius: 44,
            backgroundColor: AppColors.primaryLight,
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : 'U',
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        ),
        Center(child: Text(email, style: const TextStyle(color: AppColors.textSecondary))),
        const SizedBox(height: 8),
        const Divider(),
        _menuItem(Icons.receipt_long, 'Đơn hàng của tôi', () => context.go('/orders')),
        _menuItem(Icons.location_on, 'Địa chỉ giao hàng', () => context.push('/address')),
        _menuItem(Icons.favorite, 'Yêu thích', () => context.push('/wishlist')),
        _menuItem(Icons.notifications, 'Thông báo', () => context.push('/notifications')),
        _menuItem(Icons.shopping_cart_outlined, 'Giỏ hàng', () => context.push('/cart')),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout, color: Colors.red),
          title: const Text('Đăng xuất', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600)),
          onTap: () async {
            await ref.read(authProvider.notifier).logout();
            if (context.mounted) context.go('/home');
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _menuItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
