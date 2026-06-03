import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Ảnh network có header + fallback (tránh lỗi decode Unsplash/CDN trên Android).
class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.borderRadius,
    this.placeholder,
    this.errorIcon = Icons.smartphone_rounded,
  });

  final String url;
  final BoxFit fit;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final Widget? placeholder;
  final IconData errorIcon;

  static const _headers = {
    'User-Agent': 'DosuoneMobile/1.0',
    'Accept': 'image/*',
  };

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return _errorBox();
    }

    Widget img = CachedNetworkImage(
      imageUrl: url,
      httpHeaders: _headers,
      fit: fit,
      width: width,
      height: height,
      fadeInDuration: const Duration(milliseconds: 200),
      placeholder: (_, __) => placeholder ?? _placeholder(),
      errorWidget: (_, __, ___) => _errorBox(),
    );

    if (borderRadius != null) {
      img = ClipRRect(borderRadius: borderRadius!, child: img);
    }
    return img;
  }

  Widget _placeholder() {
    return Container(
      width: width,
      height: height,
      color: AppColors.primaryLight,
      child: const Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
        ),
      ),
    );
  }

  Widget _errorBox() {
    return Container(
      width: width,
      height: height,
      color: AppColors.primaryLight,
      child: Icon(errorIcon, size: 40, color: AppColors.primary.withValues(alpha: 0.5)),
    );
  }
}
