import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Logo thương hiệu DOSUONE (assets/images/logo.png).
class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.height = 40,
    this.borderRadius,
    this.showTitle = false,
    this.titleColor,
  });

  final double height;
  final BorderRadius? borderRadius;
  final bool showTitle;
  final Color? titleColor;

  static const assetPath = 'assets/images/logo.png';
  static const brandName = 'DOSUONE';

  @override
  Widget build(BuildContext context) {
    final image = ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.circular(12),
      child: Image.asset(
        assetPath,
        height: height,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => Icon(Icons.storefront_rounded, size: height * 0.8),
      ),
    );

    if (!showTitle) return image;

    final color = titleColor ?? AppColors.primary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        image,
        SizedBox(width: height * 0.28),
        Text(
          brandName,
          style: TextStyle(
            color: color,
            fontSize: height * 0.42,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }
}
