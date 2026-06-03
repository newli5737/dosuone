import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/utils/api_json.dart';

const _guestCartKey = 'guest_cart_items';

class GuestCartNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  GuestCartNotifier() : super([]) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_guestCartKey);
    if (raw != null) {
      final list = jsonDecode(raw) as List;
      state = list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_guestCartKey, jsonEncode(state));
  }

  Future<void> addFromProduct(Map<String, dynamic> product, {int qty = 1}) async {
    final p = normalizeProduct(product);
    final id = p['id'] as String;
    final price = p['sale_price'] ?? p['price'];
    final idx = state.indexWhere((i) => i['product_id'] == id);
    final items = [...state];
    if (idx >= 0) {
      items[idx] = {
        ...items[idx],
        'quantity': (items[idx]['quantity'] as int) + qty,
      };
    } else {
      items.add({
        'product_id': id,
        'quantity': qty,
        'product': {
          'id': id,
          'name': p['name'],
          'slug': p['slug'],
          'thumbnail_url': p['thumbnail_url'],
          'price': p['price'],
          'sale_price': p['sale_price'],
          'effective_price': price,
          'stock': p['stock'],
        },
      });
    }
    state = items;
    await _save();
  }

  Future<void> updateQty(String productId, int qty) async {
    if (qty <= 0) {
      await remove(productId);
      return;
    }
    state = [
      for (final item in state)
        if (item['product_id'] == productId) {...item, 'quantity': qty} else item,
    ];
    await _save();
  }

  Future<void> remove(String productId) async {
    state = state.where((i) => i['product_id'] != productId).toList();
    await _save();
  }

  Future<void> clear() async {
    state = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_guestCartKey);
  }

  double get subtotal => state.fold(0.0, (sum, item) {
    final p = item['product'] as Map<String, dynamic>;
    final price = (p['effective_price'] ?? p['price'] as num).toDouble();
    return sum + price * (item['quantity'] as int);
  });
}

final guestCartProvider =
    StateNotifierProvider<GuestCartNotifier, List<Map<String, dynamic>>>(
  (ref) => GuestCartNotifier(),
);
