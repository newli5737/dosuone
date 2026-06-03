const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'badge-warn' },
  confirmed: { label: 'Đã xác nhận', className: 'badge-info' },
  shipping: { label: 'Đang giao', className: 'badge-info' },
  delivered: { label: 'Hoàn thành', className: 'badge-success' },
  cancelled: { label: 'Đã hủy', className: 'badge-danger' },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, className: 'badge-muted' };
  return <span className={`badge ${s.className}`}>{s.label}</span>;
}
