import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/snackbar_util.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  List<dynamic> _addresses = [];
  String? _addressId;
  String _payment = 'cod';
  final _note = TextEditingController();
  int _step = 0;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
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

  Future<void> _placeOrder() async {
    if (_addressId == null) {
      showErrorSnackBar(context, Exception('Vui lòng chọn địa chỉ'));
      return;
    }
    try {
      await ref.read(dioProvider).post(ApiConstants.orders, data: {
        'address_id': _addressId,
        'payment_method': _payment,
        'note': _note.text.isEmpty ? null : _note.text,
      });
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Đặt hàng thành công'),
          actions: [TextButton(onPressed: () {
            Navigator.pop(context);
            context.go('/orders');
          }, child: const Text('Xem đơn hàng'))],
        ),
      );
    } catch (e) {
      if (mounted) showErrorSnackBar(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: Stepper(
        currentStep: _step,
        onStepContinue: () {
          if (_step < 2) setState(() => _step++);
          else _placeOrder();
        },
        onStepCancel: () { if (_step > 0) setState(() => _step--); },
        steps: [
          Step(
            title: const Text('Địa chỉ'),
            content: _addresses.isEmpty
                ? const Text('Chưa có địa chỉ. Thêm tại mục Địa chỉ trong Profile.')
                : Column(
                    children: _addresses.map((a) => RadioListTile<String>(
                      value: a['id'],
                      groupValue: _addressId,
                      onChanged: (v) => setState(() => _addressId = v),
                      title: Text('${a['full_name']} - ${a['phone']}'),
                      subtitle: Text('${a['address_detail']}, ${a['ward']}, ${a['district']}, ${a['province']}'),
                    )).toList(),
                  ),
            isActive: _step >= 0,
          ),
          Step(
            title: const Text('Thanh toán'),
            content: Column(
              children: [
                RadioListTile(value: 'cod', groupValue: _payment,
                  onChanged: (v) => setState(() => _payment = v!), title: const Text('COD')),
                RadioListTile(value: 'bank_transfer', groupValue: _payment,
                  onChanged: (v) => setState(() => _payment = v!), title: const Text('Chuyển khoản')),
                RadioListTile(value: 'momo', groupValue: _payment,
                  onChanged: (v) => setState(() => _payment = v!), title: const Text('MoMo')),
              ],
            ),
            isActive: _step >= 1,
          ),
          Step(
            title: const Text('Xác nhận'),
            content: TextField(
              controller: _note,
              decoration: const InputDecoration(labelText: 'Ghi chú (tùy chọn)'),
            ),
            isActive: _step >= 2,
          ),
        ],
      ),
    );
  }
}
