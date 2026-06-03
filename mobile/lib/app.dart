import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/auth/auth_routes.dart';
import 'core/theme/app_theme.dart';
import 'features/address/screens/address_screen.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/onboarding_screen.dart';
import 'features/auth/screens/profile_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/cart/screens/cart_screen.dart';
import 'features/home/screens/home_screen.dart';
import 'features/notification/screens/notifications_screen.dart';
import 'features/order/screens/checkout_screen.dart';
import 'features/order/screens/order_detail_screen.dart';
import 'features/order/screens/order_list_screen.dart';
import 'features/product/screens/product_detail_screen.dart';
import 'features/product/screens/product_list_screen.dart';
import 'features/product/screens/search_screen.dart';
import 'features/wishlist/screens/wishlist_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final path = state.matchedLocation;
      if (!auth.isAuthenticated && requiresAuth(path)) {
        final redirect = Uri.encodeComponent(state.matchedLocation);
        return '/login?redirect=$redirect';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(
        path: '/products',
        builder: (_, state) => ProductListScreen(
          categoryId: state.uri.queryParameters['category_id'],
          search: state.uri.queryParameters['search'],
          title: state.uri.queryParameters['title'] ?? 'Sản phẩm',
          sort: state.uri.queryParameters['sort'],
        ),
      ),
      GoRoute(
        path: '/product/:slug',
        builder: (_, state) => ProductDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
      GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
      GoRoute(path: '/checkout', builder: (_, __) => const CheckoutScreen()),
      GoRoute(path: '/orders', builder: (_, __) => const OrderListScreen()),
      GoRoute(
        path: '/order/:id',
        builder: (_, state) => OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/address', builder: (_, __) => const AddressScreen()),
      GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
    ],
  );
});

class DosuoneApp extends ConsumerWidget {
  const DosuoneApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Dosuone',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
