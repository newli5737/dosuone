import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/api_json.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/constants/app_colors.dart';

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
              if (_bankPayment(o) != null) ...[
                const SizedBox(height: 16),
                const Text('Thanh toán chuyển khoản', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _BankPaymentCard(bank: _bankPayment(o)!),
              ],
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

  Map<String, dynamic>? _bankPayment(Map<String, dynamic> o) {
    final raw = o['bank_payment'] ?? o['bankPayment'];
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return null;
  }
}

class _BankPaymentCard extends StatelessWidget {
  const _BankPaymentCard({required this.bank});
  final Map<String, dynamic> bank;

  @override
  Widget build(BuildContext context) {
    final qr = jsonStr(bank, 'qr_url', 'qrUrl') ?? '';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (qr.isNotEmpty)
              Center(child: Image.network(qr, height: 200, fit: BoxFit.contain)),
            const SizedBox(height: 12),
            Text('${jsonStr(bank, 'bank_name', 'bankName')} · ${jsonStr(bank, 'account_number', 'accountNumber')}',
                style: const TextStyle(fontWeight: FontWeight.w700)),
            Text('Chủ TK: ${jsonStr(bank, 'account_holder', 'accountHolder')}',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            Text('Nội dung: ${jsonStr(bank, 'transfer_content', 'transferContent')}',
                style: const TextStyle(fontWeight: FontWeight.w600)),
            Text('Số tiền: ${formatVnd(((bank['amount'] as num?) ?? 0).toInt())}',
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}
