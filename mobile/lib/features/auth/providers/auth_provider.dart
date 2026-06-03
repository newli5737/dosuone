import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/auth_interceptor.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_storage.dart';

class AuthState {
  final Map<String, dynamic>? user;
  final bool isLoading;
  final bool isAuthenticated;

  const AuthState({this.user, this.isLoading = false, this.isAuthenticated = false});

  AuthState copyWith({Map<String, dynamic>? user, bool? isLoading, bool? isAuthenticated}) =>
      AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._dio, this._storage) : super(const AuthState());

  final Dio _dio;
  final SecureStorage _storage;

  Future<bool> checkAuth() async {
    final token = await _storage.getAccessToken();
    if (token == null) return false;
    try {
      final res = await _dio.get(ApiConstants.authMe);
      final user = res.data['data'] ?? res.data;
      state = AuthState(user: Map<String, dynamic>.from(user), isAuthenticated: true);
      return true;
    } catch (_) {
      await _storage.clearTokens();
      return false;
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.post(ApiConstants.authLogin, data: {
        'email': email,
        'password': password,
      });
      final data = res.data['data'] ?? res.data;
      await _storage.saveTokens(data['access_token'], data['refresh_token']);
      state = AuthState(
        user: Map<String, dynamic>.from(data['user']),
        isAuthenticated: true,
      );
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> register(String email, String password, String fullName) async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.post(ApiConstants.authRegister, data: {
        'email': email,
        'password': password,
        'full_name': fullName,
      });
      final data = res.data['data'] ?? res.data;
      await _storage.saveTokens(data['access_token'], data['refresh_token']);
      state = AuthState(
        user: Map<String, dynamic>.from(data['user']),
        isAuthenticated: true,
      );
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.authLogout);
    } catch (_) {}
    await _storage.clearTokens();
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(dio, storage);
});
