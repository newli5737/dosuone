import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/error_interceptor.dart';
import '../../../core/utils/api_json.dart';

final categoriesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res = await ref.watch(dioProvider).get(ApiConstants.categories);
  final list = List<dynamic>.from(res.data['data'] ?? res.data);
  return list.map((e) => normalizeCategory(Map<String, dynamic>.from(e))).toList();
});

final featuredProductsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res = await ref.watch(dioProvider).get(ApiConstants.productsFeatured);
  final list = List<dynamic>.from(res.data['data'] ?? res.data);
  return list.map((e) => normalizeProduct(Map<String, dynamic>.from(e))).toList();
});

List<dynamic> _extractProductList(dynamic body) {
  if (body is List) return body;
  if (body is Map) {
    if (body['data'] is List) return List<dynamic>.from(body['data']);
    if (body['success'] == false) {
      throw ApiException(body['message']?.toString() ?? 'Không tải được sản phẩm');
    }
  }
  return [];
}

final newestProductsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  try {
    final res = await ref.read(dioProvider).get(
      ApiConstants.products,
      queryParameters: {'sort': 'newest', 'limit': 10},
    );
    final list = _extractProductList(res.data['data'] ?? res.data);
    return list.map((e) => normalizeProduct(Map<String, dynamic>.from(e as Map))).toList();
  } on DioException catch (e) {
    if (e.error is ApiException) throw e.error!;
    rethrow;
  }
});

final productsProvider = FutureProvider.family<Map<String, dynamic>, Map<String, String>>(
  (ref, params) async {
    final res = await ref.watch(dioProvider).get(ApiConstants.products, queryParameters: params);
    return Map<String, dynamic>.from(res.data);
  },
);

final productDetailProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, slug) async {
    final res = await ref.watch(dioProvider).get('${ApiConstants.products}/$slug');
    final raw = Map<String, dynamic>.from(res.data['data'] ?? res.data);
    final product = normalizeProduct(raw);
    if (raw['images'] is List) {
      product['images'] = (raw['images'] as List).map((img) {
        final m = Map<String, dynamic>.from(img as Map);
        return {
          ...m,
          'image_url': jsonStr(m, 'image_url', 'imageUrl'),
        };
      }).toList();
    }
    if (raw['specs'] is List) {
      product['specs'] = (raw['specs'] as List).map((s) {
        final m = Map<String, dynamic>.from(s as Map);
        return {
          ...m,
          'spec_key': jsonStr(m, 'spec_key', 'specKey'),
          'spec_value': jsonStr(m, 'spec_value', 'specValue'),
        };
      }).toList();
    }
    return product;
  },
);
