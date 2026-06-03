import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/providers/auth_provider.dart';
import 'guest_cart_provider.dart';

class CartState {
  final List<dynamic> items;
  final double subtotal;
  final bool isLoading;
  final bool isGuest;

  const CartState({
    this.items = const [],
    this.subtotal = 0,
    this.isLoading = false,
    this.isGuest = true,
  });
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier(this._ref, this._dio) : super(const CartState());

  final Ref _ref;
  final Dio _dio;

  bool get _isLoggedIn => _ref.read(authProvider).isAuthenticated;

  Future<void> load() async {
    if (!_isLoggedIn) {
      final guest = _ref.read(guestCartProvider);
      final sub = _ref.read(guestCartProvider.notifier).subtotal;
      state = CartState(items: guest, subtotal: sub, isGuest: true);
      return;
    }
    state = CartState(
      items: state.items,
      subtotal: state.subtotal,
      isLoading: true,
      isGuest: false,
    );
    try {
      final res = await _dio.get(ApiConstants.cart);
      final data = res.data['data'] ?? res.data;
      state = CartState(
        items: data['items'] ?? [],
        subtotal: (data['subtotal'] as num?)?.toDouble() ?? 0,
        isGuest: false,
      );
    } catch (_) {
      state = const CartState(isGuest: false);
    } finally {
      if (state.isLoading) {
        state = CartState(
          items: state.items,
          subtotal: state.subtotal,
          isGuest: false,
        );
      }
    }
  }

  Future<void> add(Map<String, dynamic> product, {int qty = 1}) async {
    if (!_isLoggedIn) {
      await _ref.read(guestCartProvider.notifier).addFromProduct(product, qty: qty);
      await load();
      return;
    }
    await _dio.post('${ApiConstants.cart}/items', data: {
      'product_id': product['id'],
      'quantity': qty,
    });
    await load();
  }

  Future<void> updateQty(String productId, int qty) async {
    if (!_isLoggedIn) {
      await _ref.read(guestCartProvider.notifier).updateQty(productId, qty);
      await load();
      return;
    }
    await _dio.patch('${ApiConstants.cart}/items/$productId', data: {'quantity': qty});
    await load();
  }

  Future<void> remove(String productId) async {
    if (!_isLoggedIn) {
      await _ref.read(guestCartProvider.notifier).remove(productId);
      await load();
      return;
    }
    await _dio.delete('${ApiConstants.cart}/items/$productId');
    await load();
  }

  /// Sau đăng nhập: đẩy giỏ khách lên server.
  Future<void> syncGuestToServer() async {
    if (!_isLoggedIn) return;
    final guest = _ref.read(guestCartProvider);
    for (final item in guest) {
      try {
        await _dio.post('${ApiConstants.cart}/items', data: {
          'product_id': item['product_id'],
          'quantity': item['quantity'],
        });
      } catch (_) {}
    }
    await _ref.read(guestCartProvider.notifier).clear();
    await load();
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(ref, ref.watch(dioProvider));
});
