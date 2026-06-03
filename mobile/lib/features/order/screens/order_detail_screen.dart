import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/formatters.dart';

final orderDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ref.watch(dioProvider).get('${ApiConstants.orders}/$id');
  return Map<String, dynamic>.from(res.data['data'] ?? res.data);
});

class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(orderDetailProvider(orderId));
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết đơn hàng')),
      body: order.when(
        data: (o) {
          final items = List<dynamic>.from(o['items'] ?? []);
          final addr = o['shipping_address'] as Map? ?? {};
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('Mã: ${o['order_code']}', style: const TextStyle(fontWeight: FontWeight.bold)),
              Text('Trạng thái: ${o['status']}'),
              const Divider(),
              const Text('Địa chỉ giao hàng', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('${addr['full_name']} - ${addr['phone']}'),
              Text('${addr['address_detail']}, ${addr['ward']}, ${addr['district']}, ${addr['province']}'),
              const Divider(),
              const Text('Sản phẩm'),
              ...items.map((i) => ListTile(
                title: Text(i['product_name'] ?? ''),
                subtitle: Text('x${i['quantity']}'),
                trailing: Text(formatVnd(i['total'])),
              )),
              const Divider(),
              Text('Tổng: ${formatVnd(o['total'])}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              if (o['status'] == 'pending')
                ElevatedButton(
                  onPressed: () async {
                    await ref.read(dioProvider).patch('${ApiConstants.orders}/$orderId/cancel');
                    ref.invalidate(orderDetailProvider(orderId));
                  },
                  child: const Text('Hủy đơn'),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
