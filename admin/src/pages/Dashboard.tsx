import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [overview, setOverview] = useState<Record<string, number>>({});
  const [revenue, setRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.get('/admin/stats/overview').then((r) => setOverview(r.data.data ?? r.data));
    api.get('/admin/stats/revenue?period=30d').then((r) => setRevenue(r.data.data ?? r.data));
    api.get('/admin/stats/top-products').then((r) => setTopProducts(r.data.data ?? r.data));
  }, []);

  const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card title="Doanh thu tháng" value={formatVnd(overview.month_revenue ?? 0)} />
        <Card title="Đơn hôm nay" value={String(overview.today_orders ?? 0)} />
        <Card title="SP đang bán" value={String(overview.active_products ?? 0)} />
        <Card title="User mới (7 ngày)" value={String(overview.new_users_week ?? 0)} />
      </div>
      <h3>Doanh thu 30 ngày</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={revenue}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(v) => formatVnd(Number(v ?? 0))} />
          <Line type="monotone" dataKey="revenue" stroke="#2563EB" />
        </LineChart>
      </ResponsiveContainer>
      <h3>Top sản phẩm bán chạy</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Tên</th><th>Đã bán</th><th>Doanh thu</th></tr>
        </thead>
        <tbody>
          {topProducts.map((p, i) => (
            <tr key={i}>
              <td>{String(p.product_name)}</td>
              <td>{String(p.sold)}</td>
              <td>{formatVnd(Number(p.revenue))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ color: '#64748B', fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 8 }}>{value}</div>
    </div>
  );
}
