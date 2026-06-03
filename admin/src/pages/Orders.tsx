import { useEffect, useState } from 'react';
import api from '../api';

const statuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);

  const load = () => api.get('/admin/orders').then((r) => {
    const d = r.data.data ?? r.data;
    setOrders(d.data ?? d);
  });

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h2>Đơn hàng</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Mã</th><th>Tổng</th><th>Trạng thái</th><th>Cập nhật</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={String(o.id)}>
              <td>{String(o.order_code ?? o.orderCode)}</td>
              <td>{Number(o.total).toLocaleString('vi-VN')} đ</td>
              <td>{String(o.status)}</td>
              <td>
                <select value={String(o.status)} onChange={(e) => updateStatus(String(o.id), e.target.value)}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
