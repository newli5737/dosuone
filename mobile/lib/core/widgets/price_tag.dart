import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../utils/formatters.dart';

class PriceTag extends StatelessWidget {
  const PriceTag({
    super.key,
    required this.price,
    this.originalPrice,
    this.size = PriceTagSize.medium,
    this.compact = true,
  });

  final dynamic price;
  final dynamic originalPrice;
  final PriceTagSize size;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final hasSale = originalPrice != null;
    final priceSize = size == PriceTagSize.large ? 22.0 : 14.0;
    final fmt = compact ? formatVndCompact : formatVnd;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          fmt(price is num ? price : num.parse(price.toString())),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w800,
            fontSize: priceSize,
            height: 1.1,
          ),
        ),
        if (hasSale) ...[
          const SizedBox(height: 2),
          Text(
            compact
                ? formatVndCompact(originalPrice is num ? originalPrice : num.parse(originalPrice.toString()))
                : formatVnd(originalPrice),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              decoration: TextDecoration.lineThrough,
              color: AppColors.textMuted,
              fontSize: 11,
              height: 1.1,
            ),
          ),
        ],
      ],
    );
  }
}

enum PriceTagSize { medium, large }
