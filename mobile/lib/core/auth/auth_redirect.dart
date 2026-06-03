import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/cart/providers/cart_provider.dart';
void goToLogin(BuildContext context, {required String returnPath}) {
  context.go('/login?redirect=${Uri.encodeComponent(returnPath)}');
}

Future<void> onAuthSuccess(BuildContext context, WidgetRef ref, {String? redirect}) async {
  await ref.read(cartProvider.notifier).syncGuestToServer();
  if (!context.mounted) return;
  final target = redirect != null && redirect.isNotEmpty ? redirect : '/home';
  context.go(target);
}
