import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../auth/auth_redirect.dart';

/// Khung chính: luôn giữ bottom navigation (kể cả màn đăng nhập/đăng ký).
class MainShell extends ConsumerWidget {
  const MainShell({
    super.key,
    required this.navIndex,
    required this.child,
  });

  final int navIndex;
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(authProvider).isAuthenticated;
    final location = GoRouterState.of(context).matchedLocation;
    final onAuthFlow = location == '/login' || location == '/register';

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: onAuthFlow ? 2 : navIndex,
        onDestinationSelected: (i) {
          if (i == 1 && !isLoggedIn) {
            goToLogin(context, returnPath: '/orders');
            return;
          }
          switch (i) {
            case 0:
              context.go('/home');
            case 1:
              context.go('/orders');
            case 2:
              context.go('/profile');
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Trang chủ',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded),
            label: 'Đơn hàng',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Tài khoản',
          ),
        ],
      ),
    );
  }
}
