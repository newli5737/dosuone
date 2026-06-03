import 'package:flutter/material.dart';

/// Logo thương hiệu (assets/images/logo.png).
class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.height = 40, this.borderRadius});

  final double height;
  final BorderRadius? borderRadius;

  static const assetPath = 'assets/images/logo.png';

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.circular(12),
      child: Image.asset(
        assetPath,
        height: height,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => Icon(Icons.storefront_rounded, size: height * 0.8),
      ),
    );
  }
}
