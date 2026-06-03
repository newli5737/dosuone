import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/formatters.dart';

final ordersProvider = FutureProvider.family<List<dynamic>, String?>((ref, status) async {
  final res = await ref.watch(dioProvider).get(ApiConstants.orders, queryParameters: {
    if (status != null && status.isNotEmpty) 'status': status,
  });
  final data = res.data['data'] ?? res.data;
  return List<dynamic>.from(data is Map ? (data['data'] ?? []) : data);
});

class OrderListScreen extends ConsumerWidget {
  const OrderListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Đơn hàng của tôi'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Tất cả'),
              Tab(text: 'Chờ xác nhận'),
              Tab(text: 'Đang giao'),
              Tab(text: 'Đã giao'),
              Tab(text: 'Đã hủy'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _OrderList(status: null),
            _OrderList(status: 'pending'),
            _OrderList(status: 'shipping'),
            _OrderList(status: 'delivered'),
            _OrderList(status: 'cancelled'),
          ],
        ),
      ),
    );
  }
}

class _OrderList extends ConsumerWidget {
  const _OrderList({this.status});
  final String? status;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider(status));
    return orders.when(
      data: (list) => ListView.builder(
        itemCount: list.length,
        itemBuilder: (_, i) {
          final o = list[i];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListTile(
              title: Text(o['order_code'] ?? ''),
              subtitle: Text(formatDate(DateTime.parse(o['created_at']))),
              trailing: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(formatVnd(o['total']), style: const TextStyle(fontWeight: FontWeight.bold)),
                  _StatusBadge(status: o['status']),
                ],
              ),
              onTap: () => context.push('/order/${o['id']}'),
            ),
          );
        },
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final String status;

  Color get color {
    switch (status) {
      case 'delivered': return AppColors.success;
      case 'cancelled': return AppColors.error;
      case 'shipping': return AppColors.primary;
      default: return AppColors.accent;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
      child: Text(status, style: TextStyle(color: color, fontSize: 11)),
    );
  }
}
