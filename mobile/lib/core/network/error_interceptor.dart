import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);
  @override
  String toString() => message;
}

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.connectionTimeout) {
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          error: ApiException('Kiểm tra kết nối mạng'),
        ),
      );
      return;
    }
    final data = err.response?.data;
    if (data is Map && data['message'] != null) {
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          response: err.response,
          error: ApiException(data['message'].toString(), err.response?.statusCode),
        ),
      );
      return;
    }
    handler.next(err);
  }
}
