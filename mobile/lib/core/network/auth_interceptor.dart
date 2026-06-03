import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._storage, this._dio, this._onLogout);

  final SecureStorage _storage;
  final Dio _dio;
  final VoidCallback _onLogout;
  bool _refreshing = false;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }
    if (_refreshing) return handler.next(err);

    _refreshing = true;
    try {
      final refresh = await _storage.getRefreshToken();
      if (refresh == null) {
        _onLogout();
        return handler.next(err);
      }
      final res = await _dio.post(
        ApiConstants.authRefresh,
        data: {'refresh_token': refresh},
        options: Options(headers: {}),
      );
      final data = res.data['data'] ?? res.data;
      await _storage.saveTokens(data['access_token'], data['refresh_token']);
      final opts = err.requestOptions;
      opts.headers['Authorization'] = 'Bearer ${data['access_token']}';
      final retry = await _dio.fetch(opts);
      return handler.resolve(retry);
    } catch (_) {
      await _storage.clearTokens();
      _onLogout();
      return handler.next(err);
    } finally {
      _refreshing = false;
    }
  }
}

typedef VoidCallback = void Function();

final secureStorageProvider = Provider((ref) => SecureStorage());
