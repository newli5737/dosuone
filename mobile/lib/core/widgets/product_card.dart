import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../utils/api_json.dart';
import 'app_network_image.dart';
import 'price_tag.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, this.onTap});

  final Map<String, dynamic> product;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final p = normalizeProduct(product);
    final price = p['sale_price'] ?? p['price'];
    final original = p['sale_price'] != null ? p['price'] : null;
    final rating = (p['avg_rating'] as num?)?.toDouble() ?? 0;
    final reviews = p['review_count'] ?? 0;
    final hasSale = original != null;
    final thumb = p['thumbnail_url']?.toString() ?? '';

    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        final h = constraints.maxHeight;
        final bounded = h.isFinite && h > 0;

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(20),
            child: Ink(
              width: w,
              height: bounded ? h : null,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.04),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: bounded ? MainAxisSize.max : MainAxisSize.min,
                    children: [
                      // Hình ảnh tự co giãn để nhường chỗ cho Text
                      if (bounded)
                        Expanded(
                          child: _buildImage(thumb),
                        )
                      else
                        AspectRatio(
                          aspectRatio: 1,
                          child: _buildImage(thumb),
                        ),
                      
                      // Nội dung cố định chiều cao theo lượng text
                      Padding(
                        padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                        child: _CardInfo(
                          brand: p['brand']?.toString(),
                          name: p['name']?.toString() ?? '',
                          price: price,
                          originalPrice: original,
                          rating: rating,
                          reviews: reviews is int ? reviews : int.tryParse('$reviews') ?? 0,
                        ),
                      ),
                    ],
                  ),
                  
                  // Sale Badge
                  if (hasSale)
                    Positioned(
                      top: 10,
                      left: 10,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: AppColors.gradientWarm,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          child: Text(
                            'SALE',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                    ),
                    
                  // Nút giỏ hàng (FAB)
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: const BoxDecoration(
                        color: AppColors.primaryLight,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.add_shopping_cart_rounded,
                        size: 16,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildImage(String thumb) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: AppNetworkImage(url: thumb, fit: BoxFit.cover),
    );
  }
}

class _CardInfo extends StatelessWidget {
  const _CardInfo({
    required this.brand,
    required this.name,
    required this.price,
    this.originalPrice,
    required this.rating,
    required this.reviews,
  });

  final String? brand;
  final String name;
  final dynamic price;
  final dynamic originalPrice;
  final double rating;
  final int reviews;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (brand != null && brand!.isNotEmpty)
          Text(
            brand!.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
              letterSpacing: 0.8,
            ),
          ),
        const SizedBox(height: 4),
        Text(
          name,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            height: 1.3,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        PriceTag(price: price, originalPrice: originalPrice, compact: true),
        if (rating > 0)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(
              children: [
                const Icon(Icons.star_rounded, size: 14, color: AppColors.accent),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${rating.toStringAsFixed(1)} ($reviews)',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
