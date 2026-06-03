import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _onboardingKey = 'onboarding_done';

  final _storage = const FlutterSecureStorage();

  Future<String?> getAccessToken() => _storage.read(key: _accessKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshKey);

  Future<void> saveTokens(String access, String refresh) async {
    await _storage.write(key: _accessKey, value: access);
    await _storage.write(key: _refreshKey, value: refresh);
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
  }

  Future<bool> isOnboardingDone() async {
    final v = await _storage.read(key: _onboardingKey);
    return v == 'true';
  }

  Future<void> setOnboardingDone() =>
      _storage.write(key: _onboardingKey, value: 'true');
}
