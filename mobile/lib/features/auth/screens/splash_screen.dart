import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_logo.dart';
import '../../../core/network/auth_interceptor.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.forward();
    _init();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    await Future.delayed(const Duration(milliseconds: 1800));
    if (!mounted) return;
    final storage = ref.read(secureStorageProvider);
    await ref.read(authProvider.notifier).checkAuth();
    if (!mounted) return;
    if (ref.read(authProvider).isAuthenticated) {
      context.go('/home');
      return;
    }
    final done = await storage.isOnboardingDone();
    if (!mounted) return;
    context.go(done ? '/home' : '/onboarding');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientPrimary),
        child: FadeTransition(
          opacity: _fade,
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AppLogo(height: 120, borderRadius: BorderRadius.all(Radius.circular(24))),
                SizedBox(height: 24),
                Text(
                  'Cửa hàng điện thoại chính hãng',
                  style: TextStyle(color: Colors.white70, fontSize: 15),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
