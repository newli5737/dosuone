import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/layout/responsive.dart';
import '../../../core/utils/api_json.dart';
import '../../../core/widgets/async_error_view.dart';
import '../../../core/widgets/loading_shimmer.dart';
import '../../../core/widgets/product_card.dart';
import '../../home/providers/home_provider.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  const ProductListScreen({
    super.key,
    this.categoryId,
    this.search,
    this.title = 'Sản phẩm',
    this.sort,
  });
  final String? categoryId;
  final String? search;
  final String title;
  final String? sort;

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  int _page = 1;
  late String _sort;
  final List<dynamic> _items = [];

  @override
  void initState() {
    super.initState();
    _sort = widget.sort ?? 'newest';
  }

  Map<String, String> get _params => {
    'page': '$_page',
    'limit': '20',
    if (widget.categoryId != null) 'category_id': widget.categoryId!,
    if (widget.search != null) 'search': widget.search!,
    'sort': _sort,
  };

  @override
  Widget build(BuildContext context) {
    final result = ref.watch(productsProvider(_params));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(Uri.decodeComponent(widget.title)),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: () => _showFilter(context),
          ),
        ],
      ),
      body: result.when(
        data: (res) {
          final data = res['data'];
          final items = data is Map ? (data['data'] ?? data) : data;
          final list = List<dynamic>.from(items is List ? items : []);
          if (_page == 1) _items.clear();
          _items.addAll(list);
          if (list.isEmpty && _items.isEmpty) {
            return const Center(child: Text('Không có sản phẩm'));
          }
          return GridView.builder(
            padding: screenPadding(context).copyWith(top: 16, bottom: 16),
            gridDelegate: productGridDelegate(context),
            itemCount: _items.length,
            itemBuilder: (_, i) {
              final p = normalizeProduct(Map<String, dynamic>.from(_items[i]));
              return ProductCard(
                product: p,
                onTap: () => context.push('/product/${p['slug']}'),
              );
            },
          );
        },
        loading: () => const LoadingShimmer(),
        error: (e, _) => AsyncErrorView(
          error: e,
          onRetry: () => ref.invalidate(productsProvider(_params)),
        ),
      ),
    );
  }

  void _showFilter(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(title: const Text('Mới nhất'), onTap: () => _setSort('newest')),
          ListTile(title: const Text('Giá tăng dần'), onTap: () => _setSort('price_asc')),
          ListTile(title: const Text('Giá giảm dần'), onTap: () => _setSort('price_desc')),
          ListTile(title: const Text('Đánh giá cao'), onTap: () => _setSort('rating')),
        ],
      ),
    );
  }

  void _setSort(String s) {
    setState(() { _sort = s; _page = 1; });
    ref.invalidate(productsProvider(_params));
    Navigator.pop(context);
  }
}
