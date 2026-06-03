import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          style: const TextStyle(fontSize: 16),
          decoration: const InputDecoration(
            hintText: 'Tìm tên máy, hãng...',
            border: InputBorder.none,
            hintStyle: TextStyle(color: AppColors.textMuted),
          ),
          onSubmitted: _search,
        ),
        actions: [
          TextButton(
            onPressed: () => _search(_controller.text),
            child: const Text('Tìm'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Gợi ý', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['iPhone 15', 'Samsung S24', 'Xiaomi 14', 'Galaxy A55', 'Pixel 8']
                .map((q) => ActionChip(
                      label: Text(q),
                      onPressed: () {
                        _controller.text = q;
                        _search(q);
                      },
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }

  void _search(String q) {
    if (q.trim().isEmpty) return;
    context.push('/products?search=${Uri.encodeComponent(q.trim())}&title=Kết quả tìm kiếm');
  }
}
