import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final notificationsProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ref.watch(dioProvider).get(ApiConstants.notifications);
  final data = res.data['data'] ?? res.data;
  return List<dynamic>.from(data is Map ? (data['data'] ?? []) : data);
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: () async {
              await ref.read(dioProvider).patch('${ApiConstants.notifications}/read-all');
              ref.invalidate(notificationsProvider);
            },
          ),
        ],
      ),
      body: notifications.when(
        data: (list) => ListView.builder(
          itemCount: list.length,
          itemBuilder: (_, i) {
            final n = list[i];
            return ListTile(
              title: Text(n['title'] ?? '', style: TextStyle(
                fontWeight: n['is_read'] == true ? FontWeight.normal : FontWeight.bold)),
              subtitle: Text(n['body'] ?? ''),
              trailing: n['is_read'] != true ? const Icon(Icons.circle, size: 8, color: Colors.blue) : null,
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
