import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/api_json.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/snackbar_util.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  List<dynamic> _addresses = [];
  Map<String, dynamic>? _bankPreview;
  String? _addressId;
  String _payment = 'cod';
  final _note = TextEditingController();
  int _step = 0;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
    _loadBankPreview();
  }

  Future<void> _loadAddresses() async {
    try {
      final res = await ref.read(dioProvider).get(ApiConstants.addresses);
      final data = List<dynamic>.from(res.data['data'] ?? res.data);
      setState(() {
        _addresses = data;
        final defaultAddr = data.cast<Map>().where((a) => a['is_default'] == true);
        _addressId = (defaultAddr.isNotEmpty ? defaultAddr.first : (data.isNotEmpty ? data.first : null))?['id']?.toString();
      });
    } catch (_) {}
  }

  Future<void> _loadBankPreview() async {
    try {
      final res = await ref.read(dioProvider).get(ApiConstants.bankAccountsCheckout);
      final body = res.data['data'] ?? res.data;
      if (body != null && body is Map) {
        setState(() => _bankPreview = Map<String, dynamic>.from(body));
      }
    } catch (_) {}
  }

  Future<void> _placeOrder() async {
    if (_addressId == null) {
      showErrorSnackBar(context, Exception('Vui lòng chọn địa chỉ'));
      return;
    }
    try {
      final res = await ref.read(dioProvider).post(ApiConstants.orders, data: {
        'address_id': _addressId,
        'payment_method': _payment,
        'note': _note.text.isEmpty ? null : _note.text,
      });
      if (!mounted) return;
      final raw = res.data['data'] ?? res.data;
      final order = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
      final bank = order['bank_payment'] ?? order['bankPayment'];
      if (_payment == 'bank_transfer' && bank is Map) {
        _showBankPaymentDialog(Map<String, dynamic>.from(bank), order);
      } else {
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) showErrorSnackBar(context, e);
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Đặt hàng thành công'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.go('/orders');
            },
            child: const Text('Xem đơn hàng'),
          ),
        ],
      ),
    );
  }

  void _showBankPaymentDialog(Map<String, dynamic> bank, Map<String, dynamic> order) {
    final qrUrl = jsonStr(bank, 'qr_url', 'qrUrl') ?? '';
    final amount = (bank['amount'] as num?) ?? (order['total'] as num?) ?? 0;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Chuyển khoản để hoàn tất'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (qrUrl.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(qrUrl, height: 220, fit: BoxFit.contain),
                ),
              const SizedBox(height: 16),
              _infoRow('Ngân hàng', jsonStr(bank, 'bank_name', 'bankName') ?? ''),
              _infoRow('Số TK', jsonStr(bank, 'account_number', 'accountNumber') ?? ''),
              _infoRow('Chủ TK', jsonStr(bank, 'account_holder', 'accountHolder') ?? ''),
              _infoRow('Số tiền', formatVnd(amount.toInt())),
              _infoRow('Nội dung CK', jsonStr(bank, 'transfer_content', 'transferContent') ?? ''),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.go('/orders');
            },
            child: const Text('Đã hiểu'),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: Stepper(
        currentStep: _step,
        onStepContinue: () {
          if (_step < 2) {
            setState(() => _step++);
          } else {
            _placeOrder();
          }
        },
        onStepCancel: () {
          if (_step > 0) setState(() => _step--);
        },
        steps: [
          Step(
            title: const Text('Địa chỉ'),
            content: _addresses.isEmpty
                ? const Text('Chưa có địa chỉ. Thêm tại mục Tài khoản → Địa chỉ.')
                : Column(
                    children: _addresses.map((a) {
                      final id = a['id']?.toString();
                      return RadioListTile<String>(
                        value: id!,
                        groupValue: _addressId,
                        onChanged: (v) => setState(() => _addressId = v),
                        title: Text('${a['full_name'] ?? a['fullName']} - ${a['phone']}'),
                        subtitle: Text(
                          '${a['address_detail'] ?? a['addressDetail']}, ${a['ward']}, ${a['district']}, ${a['province']}',
                        ),
                      );
                    }).toList(),
                  ),
            isActive: _step >= 0,
          ),
          Step(
            title: const Text('Thanh toán'),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                RadioListTile<String>(
                  value: 'cod',
                  groupValue: _payment,
                  onChanged: (v) => setState(() => _payment = v!),
                  title: const Text('COD — Thanh toán khi nhận'),
                ),
                RadioListTile<String>(
                  value: 'bank_transfer',
                  groupValue: _payment,
                  onChanged: (v) => setState(() => _payment = v!),
                  title: const Text('Chuyển khoản ngân hàng'),
                  subtitle: _bankPreview != null
                      ? Text(
                          '${_bankPreview!['bank_name'] ?? _bankPreview!['bankName']} · ${_bankPreview!['account_number'] ?? _bankPreview!['accountNumber']}',
                          style: const TextStyle(fontSize: 12),
                        )
                      : const Text('Cần admin cấu hình STK', style: TextStyle(color: AppColors.sale, fontSize: 12)),
                ),
                RadioListTile<String>(
                  value: 'momo',
                  groupValue: _payment,
                  onChanged: (v) => setState(() => _payment = v!),
                  title: const Text('Ví MoMo'),
                ),
              ],
            ),
            isActive: _step >= 1,
          ),
          Step(
            title: const Text('Xác nhận'),
            content: TextField(
              controller: _note,
              decoration: const InputDecoration(labelText: 'Ghi chú (tùy chọn)'),
              maxLines: 2,
            ),
            isActive: _step >= 2,
          ),
        ],
      ),
    );
  }
}
