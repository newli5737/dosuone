import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_logo.dart';
import '../../../core/utils/snackbar_util.dart';
import '../../../core/utils/validators.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  String? get _redirect => GoRouterState.of(context).uri.queryParameters['redirect'];

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/profile'),
        ),
        title: const Text('Đăng nhập'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Column(
                  children: [
                    const AppLogo(height: 72, showTitle: true),
                    const SizedBox(height: 16),
                    Text(
                      'Chào mừng trở lại',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Đăng nhập để đặt hàng và theo dõi đơn',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                validator: Validators.email,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Mật khẩu',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
                validator: Validators.password,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        if (!_formKey.currentState!.validate()) return;
                        try {
                          await ref.read(authProvider.notifier).login(
                            _email.text.trim(),
                            _password.text,
                          );
                          if (context.mounted) {
                            await onAuthSuccess(context, ref, redirect: _redirect);
                          }
                        } catch (e) {
                          if (context.mounted) showErrorSnackBar(context, e);
                        }
                      },
                child: auth.isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Đăng nhập'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () {
                  final r = _redirect;
                  context.go(r != null ? '/register?redirect=$r' : '/register');
                },
                child: const Text('Tạo tài khoản mới'),
              ),
              TextButton(
                onPressed: () => context.go('/home'),
                child: const Text('Tiếp tục xem không đăng nhập'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
