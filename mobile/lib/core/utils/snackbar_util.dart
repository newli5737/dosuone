import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../network/error_interceptor.dart';

void showErrorSnackBar(BuildContext context, dynamic error) {
  String msg = 'Có lỗi xảy ra, vui lòng thử lại';
  if (error is ApiException) {
    msg = error.message;
  } else if (error is Exception) {
    msg = error.toString().replaceFirst('Exception: ', '');
  }
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: AppColors.error),
  );
}
