import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_logo.dart';
import '../../../core/utils/snackbar_util.dart';
import '../../../core/utils/validators.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  String? get _redirect => GoRouterState.of(context).uri.queryParameters['redirect'];

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng ký'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/profile'),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              const Center(child: AppLogo(height: 64)),
              const SizedBox(height: 20),
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Họ và tên'),
                validator: (v) => Validators.required(v, 'Họ và tên'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _email,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: Validators.email,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Mật khẩu'),
                validator: Validators.password,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: auth.isLoading ? null : () async {
                  if (!_formKey.currentState!.validate()) return;
                  try {
                    await ref.read(authProvider.notifier).register(
                      _email.text.trim(), _password.text, _name.text.trim());
                    if (context.mounted) {
                      await onAuthSuccess(context, ref, redirect: _redirect);
                    }
                  } catch (e) {
                    if (context.mounted) showErrorSnackBar(context, e);
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                child: auth.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Đăng ký', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
