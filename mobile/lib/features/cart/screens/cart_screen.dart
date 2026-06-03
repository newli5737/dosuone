import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/cart_provider.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final Set<String> _selected = {};

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(cartProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final isLoggedIn = ref.watch(authProvider).isAuthenticated;

    return Scaffold(
      appBar: AppBar(title: const Text('Giỏ hàng')),
      body: cart.isLoading
          ? const Center(child: CircularProgressIndicator())
          : cart.items.isEmpty
              ? const EmptyState(message: 'Giỏ hàng trống', icon: Icons.shopping_cart_outlined)
              : Column(
                  children: [
                    if (!isLoggedIn)
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.all(12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Bạn có thể thêm sản phẩm không cần đăng nhập. Đăng nhập khi thanh toán.',
                          style: TextStyle(fontSize: 13),
                        ),
                      ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: cart.items.length,
                        itemBuilder: (_, i) {
                          final item = cart.items[i];
                          final product = item['product'];
                          final pid = item['product_id'] as String;
                          final selected = _selected.contains(pid);
                          return ListTile(
                            leading: Checkbox(
                              value: selected,
                              onChanged: (v) => setState(() {
                                if (v == true) _selected.add(pid);
                                else _selected.remove(pid);
                              }),
                            ),
                            title: Text(product['name'] ?? ''),
                            subtitle: Text(formatVnd(product['effective_price'] ?? product['price'])),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove),
                                  onPressed: () {
                                    final q = (item['quantity'] as int) - 1;
                                    ref.read(cartProvider.notifier).updateQty(pid, q);
                                  },
                                ),
                                Text('${item['quantity']}'),
                                IconButton(
                                  icon: const Icon(Icons.add),
                                  onPressed: () {
                                    ref.read(cartProvider.notifier).updateQty(
                                      pid, (item['quantity'] as int) + 1);
                                  },
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Text('Tổng: ${formatVnd(cart.subtotal)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: cart.items.isEmpty
                                  ? null
                                  : () {
                                      if (isLoggedIn) {
                                        context.push('/checkout');
                                      } else {
                                        goToLogin(context, returnPath: '/checkout');
                                      }
                                    },
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                              child: const Text('Thanh toán', style: TextStyle(color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}
