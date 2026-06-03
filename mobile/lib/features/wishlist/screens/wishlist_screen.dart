import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/layout/responsive.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/widgets/async_error_view.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/product_card.dart';
import 'package:go_router/go_router.dart';

final wishlistProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ref.watch(dioProvider).get(ApiConstants.wishlist);
  return List<dynamic>.from(res.data['data'] ?? res.data);
});

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlist = ref.watch(wishlistProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Yêu thích')),
      body: wishlist.when(
        data: (products) => products.isEmpty
            ? const EmptyState(message: 'Chưa có sản phẩm yêu thích', icon: Icons.favorite_border)
            : GridView.builder(
                padding: screenPadding(context).copyWith(top: 12, bottom: 12),
                gridDelegate: productGridDelegate(context),
                itemCount: products.length,
                itemBuilder: (_, i) => ProductCard(
                  product: Map<String, dynamic>.from(products[i]),
                  onTap: () => context.push('/product/${products[i]['slug']}'),
                ),
              ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => AsyncErrorView(
          error: e,
          onRetry: () => ref.invalidate(wishlistProvider),
        ),
      ),
    );
  }
}
