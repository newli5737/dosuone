import 'package:intl/intl.dart';

final vndFormatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

String formatVnd(num value) => vndFormatter.format(value);

/// Giá gọn cho card hẹp — tránh overflow (vd: 8,99 tr).
String formatVndCompact(num value) {
  if (value >= 1000000000) {
    return '${(value / 1000000000).toStringAsFixed(1)} tỷ';
  }
  if (value >= 1000000) {
    final m = value / 1000000;
    final s = m == m.roundToDouble()
        ? m.toInt().toString()
        : m.toStringAsFixed(1).replaceAll('.', ',');
    return '$s tr';
  }
  if (value >= 1000) {
    return '${(value / 1000).toStringAsFixed(0)}k';
  }
  return formatVnd(value);
}

String formatDate(DateTime date) =>
    DateFormat('dd/MM/yyyy HH:mm').format(date);
