/// API NestJS/TypeORM trả camelCase; spec mobile dùng snake_case — đọc cả hai.
dynamic jsonField(Map<String, dynamic> json, String snake, String camel) {
  if (json.containsKey(snake)) return json[snake];
  return json[camel];
}

String? jsonStr(Map<String, dynamic> json, String snake, String camel) {
  final v = jsonField(json, snake, camel);
  return v?.toString();
}

num? jsonNum(Map<String, dynamic> json, String snake, String camel) {
  final v = jsonField(json, snake, camel);
  if (v is num) return v;
  if (v != null) return num.tryParse(v.toString());
  return null;
}

Map<String, dynamic> normalizeProduct(Map<String, dynamic> raw) {
  return {
    ...raw,
    'id': jsonStr(raw, 'id', 'id'),
    'name': jsonStr(raw, 'name', 'name'),
    'slug': jsonStr(raw, 'slug', 'slug'),
    'brand': jsonStr(raw, 'brand', 'brand'),
    'description': jsonStr(raw, 'description', 'description'),
    'thumbnail_url': jsonStr(raw, 'thumbnail_url', 'thumbnailUrl'),
    'price': jsonNum(raw, 'price', 'price'),
    'sale_price': jsonNum(raw, 'sale_price', 'salePrice'),
    'stock': jsonNum(raw, 'stock', 'stock'),
    'avg_rating': jsonNum(raw, 'avg_rating', 'avgRating'),
    'review_count': jsonNum(raw, 'review_count', 'reviewCount'),
    'is_featured': jsonField(raw, 'is_featured', 'isFeatured'),
    'category_id': jsonStr(raw, 'category_id', 'categoryId'),
    'images': raw['images'],
    'specs': raw['specs'],
  };
}

Map<String, dynamic> normalizeCategory(Map<String, dynamic> raw) {
  return {
    ...raw,
    'id': jsonStr(raw, 'id', 'id'),
    'name': jsonStr(raw, 'name', 'name'),
    'slug': jsonStr(raw, 'slug', 'slug'),
    'image_url': jsonStr(raw, 'image_url', 'imageUrl'),
  };
}
