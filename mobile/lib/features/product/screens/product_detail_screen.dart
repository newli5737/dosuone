import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/auth_redirect.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/api_json.dart';
import '../../../core/utils/snackbar_util.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/async_error_view.dart';
import '../../../core/widgets/price_tag.dart';
import '../../auth/providers/auth_provider.dart';
import '../../cart/providers/cart_provider.dart';
import '../../home/providers/home_provider.dart';

class ProductDetailScreen extends ConsumerWidget {
  const ProductDetailScreen({super.key, required this.slug});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(productDetailProvider(slug));

    return productAsync.when(
      data: (product) => _DetailView(product: normalizeProduct(product)),
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Sản phẩm')),
        body: AsyncErrorView(
          error: e,
          onRetry: () => ref.invalidate(productDetailProvider(slug)),
        ),
      ),
    );
  }
}

class _DetailView extends ConsumerStatefulWidget {
  const _DetailView({required this.product});
  final Map<String, dynamic> product;

  @override
  ConsumerState<_DetailView> createState() => _DetailViewState();
}

class _DetailViewState extends ConsumerState<_DetailView> {
  int _imageIndex = 0;

  List<String> get _imageUrls {
    final images = List<dynamic>.from(widget.product['images'] ?? []);
    if (images.isNotEmpty) {
      return images
          .map((e) => (e['image_url'] ?? e['imageUrl'])?.toString() ?? '')
          .where((u) => u.isNotEmpty)
          .toList();
    }
    final thumb = widget.product['thumbnail_url']?.toString();
    return thumb != null && thumb.isNotEmpty ? [thumb] : [];
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final price = p['sale_price'] ?? p['price'];
    final original = p['sale_price'] != null ? p['price'] : null;
    final rating = (p['avg_rating'] as num?)?.toDouble() ?? 0;
    final urls = _imageUrls;
    final isLoggedIn = ref.watch(authProvider).isAuthenticated;
    final galleryH = MediaQuery.sizeOf(context).width * 0.92;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          Expanded(
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  pinned: true,
                  elevation: 0,
                  backgroundColor: AppColors.surface,
                  foregroundColor: AppColors.textPrimary,
                  expandedHeight: galleryH,
                  flexibleSpace: FlexibleSpaceBar(
                    background: ColoredBox(
                      color: AppColors.surface,
                      child: urls.isEmpty
                          ? const Center(
                              child: Icon(Icons.smartphone_rounded, size: 80, color: AppColors.textMuted),
                            )
                          : Stack(
                              fit: StackFit.expand,
                              children: [
                                PageView.builder(
                                  itemCount: urls.length,
                                  onPageChanged: (i) => setState(() => _imageIndex = i),
                                  itemBuilder: (_, i) => AppNetworkImage(
                                    url: urls[i],
                                    fit: BoxFit.contain,
                                  ),
                                ),
                                if (urls.length > 1)
                                  Positioned(
                                    bottom: 16,
                                    left: 0,
                                    right: 0,
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: List.generate(urls.length, (i) {
                                        final active = i == _imageIndex;
                                        return AnimatedContainer(
                                          duration: const Duration(milliseconds: 200),
                                          width: active ? 18 : 6,
                                          height: 6,
                                          margin: const EdgeInsets.symmetric(horizontal: 3),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(4),
                                            color: active ? AppColors.primary : AppColors.cardBorder,
                                          ),
                                        );
                                      }),
                                    ),
                                  ),
                              ],
                            ),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _MainInfoCard(
                          product: p,
                          price: price,
                          original: original,
                          rating: rating,
                        ),
                        const SizedBox(height: 12),
                        _InfoSection(
                          title: 'Mô tả sản phẩm',
                          child: Text(
                            p['description']?.toString().trim().isNotEmpty == true
                                ? p['description'].toString()
                                : 'Sản phẩm chính hãng, bảo hành đầy đủ tại DOSUONE.',
                            style: const TextStyle(height: 1.6, color: AppColors.textSecondary, fontSize: 14),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _InfoSection(
                          title: 'Thông số kỹ thuật',
                          child: _SpecsList(List.from(p['specs'] ?? [])),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          _BottomBar(
            onAdd: () => _addToCart(context),
            onBuy: () async {
              await _addToCart(context);
              if (!context.mounted) return;
              if (isLoggedIn) {
                context.push('/checkout');
              } else {
                goToLogin(context, returnPath: '/checkout');
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _addToCart(BuildContext context) async {
    try {
      await ref.read(cartProvider.notifier).add(widget.product);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Đã thêm vào giỏ hàng'),
            action: SnackBarAction(
              label: 'Xem giỏ',
              onPressed: () => context.push('/cart'),
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) showErrorSnackBar(context, e);
    }
  }
}

class _MainInfoCard extends StatelessWidget {
  const _MainInfoCard({
    required this.product,
    required this.price,
    required this.original,
    required this.rating,
  });

  final Map<String, dynamic> product;
  final dynamic price;
  final dynamic original;
  final double rating;

  @override
  Widget build(BuildContext context) {
    final p = product;
    final hasSale = original != null;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasSale)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                gradient: AppColors.gradientWarm,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Đang giảm giá',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
          if (p['brand'] != null)
            Text(
              p['brand'].toString().toUpperCase(),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
                letterSpacing: 1,
              ),
            ),
          const SizedBox(height: 6),
          Text(
            p['name']?.toString() ?? '',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              height: 1.25,
              letterSpacing: -0.3,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 14),
          PriceTag(
            price: price,
            originalPrice: original,
            size: PriceTagSize.large,
            compact: false,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              ...List.generate(5, (i) => Icon(
                i < rating.round() ? Icons.star_rounded : Icons.star_outline_rounded,
                size: 20,
                color: AppColors.accent,
              )),
              const SizedBox(width: 8),
              Text(
                '${rating.toStringAsFixed(1)} · ${p['review_count'] ?? 0} đánh giá',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              'Còn ${p['stock'] ?? 0} sản phẩm · Giao nhanh 2h',
              style: const TextStyle(
                color: AppColors.success,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.onAdd, required this.onBuy});
  final VoidCallback onAdd;
  final VoidCallback onBuy;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.add_shopping_cart_rounded, size: 20),
                label: const Text('Thêm giỏ'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: onBuy,
                child: const Text('Mua ngay'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  const _InfoSection({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _SpecsList extends StatelessWidget {
  const _SpecsList(this.specs);
  final List specs;

  @override
  Widget build(BuildContext context) {
    if (specs.isEmpty) {
      return const Text('Chưa có thông số', style: TextStyle(color: AppColors.textSecondary));
    }
    return Column(
      children: specs.asMap().entries.map((e) {
        final s = e.value;
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            border: e.key < specs.length - 1
                ? const Border(bottom: BorderSide(color: AppColors.cardBorder))
                : null,
          ),
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  s['spec_key'] ?? s['specKey'] ?? '',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
              ),
              Expanded(
                flex: 3,
                child: Text(
                  s['spec_value'] ?? s['specValue'] ?? '',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
