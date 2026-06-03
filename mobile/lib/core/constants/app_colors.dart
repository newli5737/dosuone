import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF6366F1); // More vibrant Indigo
  static const primaryDark = Color(0xFF312E81);
  static const primaryLight = Color(0xFFEEF2FF);
  
  static const accent = Color(0xFFF43F5E); // Vibrant Rose for CTA/badges
  static const accentLight = Color(0xFFFDA4AF);
  
  static const sale = Color(0xFFF43F5E);
  static const success = Color(0xFF10B981);
  static const error = Color(0xFFE11D48);
  
  static const background = Color(0xFFF4F4F9); // Slightly cooler light gray
  static const surface = Color(0xFFFFFFFF);
  static const cardBorder = Color(0xFFF1F5F9);
  
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF475569);
  static const textMuted = Color(0xFF94A3B8);

  // Premium Gradients
  static const gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF818CF8), Color(0xFF4F46E5), Color(0xFF3730A3)],
  );

  static const gradientWarm = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFCA5A5), Color(0xFFF43F5E), Color(0xFFBE123C)],
  );

  static const gradientDark = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E293B), Color(0xFF0F172A), Color(0xFF020617)],
  );

  // Glassmorphism Helpers
  static final glassBackgroundLight = Colors.white.withValues(alpha: 0.7);
  static final glassBackgroundDark = Colors.black.withValues(alpha: 0.2);
  static final glassBorderLight = Colors.white.withValues(alpha: 0.4);
}
