import 'package:flutter/material.dart';

class AppBreakpoints {
  static const phone = 600.0;
  static const tablet = 900.0;
}

int productCrossAxisCount(BuildContext context) {
  final w = MediaQuery.sizeOf(context).width;
  if (w >= AppBreakpoints.tablet) return 3;
  return 2;
}

double productGridAspectRatio(BuildContext context) {
  final width = MediaQuery.sizeOf(context).width;
  final pad = screenPadding(context).horizontal;
  final spacing = 12.0;
  final cols = productCrossAxisCount(context);
  final cardWidth = (width - pad - spacing * (cols - 1)) / cols;
  const contentMin = 145.0;
  return cardWidth / (cardWidth * 0.52 + contentMin);
}

EdgeInsets screenPadding(BuildContext context) {
  final w = MediaQuery.sizeOf(context).width;
  return EdgeInsets.symmetric(horizontal: w > 400 ? 20 : 16);
}

SliverGridDelegate productGridDelegate(BuildContext context) {
  return SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: productCrossAxisCount(context),
    childAspectRatio: productGridAspectRatio(context),
    crossAxisSpacing: 12,
    mainAxisSpacing: 14,
  );
}

/// Chiều cao danh sách ngang trên trang chủ.
double homeProductStripHeight(BuildContext context) {
  final w = MediaQuery.sizeOf(context).width;
  return (w * 0.65).clamp(280.0, 310.0); 
}

double homeProductCardWidth(BuildContext context) {
  final w = MediaQuery.sizeOf(context).width;
  return (w * 0.45).clamp(155.0, 180.0); 
}
