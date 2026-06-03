import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final addressesProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ref.watch(dioProvider).get(ApiConstants.addresses);
  return List<dynamic>.from(res.data['data'] ?? res.data);
});

class AddressScreen extends ConsumerWidget {
  const AddressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(addressesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Địa chỉ')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, ref),
        child: const Icon(Icons.add),
      ),
      body: addresses.when(
        data: (list) => ListView.builder(
          itemCount: list.length,
          itemBuilder: (_, i) {
            final a = list[i];
            return ListTile(
              title: Text('${a['full_name']} - ${a['phone']}'),
              subtitle: Text('${a['address_detail']}, ${a['ward']}, ${a['district']}, ${a['province']}'),
              trailing: a['is_default'] == true ? const Chip(label: Text('Mặc định')) : null,
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    final name = TextEditingController();
    final phone = TextEditingController();
    final province = TextEditingController();
    final district = TextEditingController();
    final ward = TextEditingController();
    final detail = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Thêm địa chỉ'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Họ tên')),
              TextField(controller: phone, decoration: const InputDecoration(labelText: 'SĐT')),
              TextField(controller: province, decoration: const InputDecoration(labelText: 'Tỉnh/TP')),
              TextField(controller: district, decoration: const InputDecoration(labelText: 'Quận/Huyện')),
              TextField(controller: ward, decoration: const InputDecoration(labelText: 'Phường/Xã')),
              TextField(controller: detail, decoration: const InputDecoration(labelText: 'Địa chỉ chi tiết')),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(dioProvider).post(ApiConstants.addresses, data: {
                'full_name': name.text,
                'phone': phone.text,
                'province': province.text,
                'district': district.text,
                'ward': ward.text,
                'address_detail': detail.text,
                'is_default': true,
              });
              ref.invalidate(addressesProvider);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Lưu'),
          ),
        ],
      ),
    );
  }
}
