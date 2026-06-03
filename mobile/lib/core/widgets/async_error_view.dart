import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../network/error_interceptor.dart';

class AsyncErrorView extends StatelessWidget {
  const AsyncErrorView({super.key, required this.error, this.onRetry});

  final Object error;
  final VoidCallback? onRetry;

  static String messageFrom(Object error) {
    if (error is ApiException) return error.message;
    if (error is DioException) {
      if (error.error is ApiException) return (error.error as ApiException).message;
      if (error.type == DioExceptionType.connectionError ||
          error.type == DioExceptionType.connectionTimeout) {
        return 'Không kết nối được server. Kiểm tra WiFi và IP backend.';
      }
    }
    return 'Không tải được dữ liệu. Vui lòng thử lại.';
  }

  String get _message => messageFrom(error);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.wifi_off_rounded, size: 40, color: AppColors.textMuted.withValues(alpha: 0.6)),
          const SizedBox(height: 12),
          Text(
            _message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Thử lại'),
            ),
          ],
        ],
      ),
    );
  }
}
