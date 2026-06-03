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
      <h1 className="page-title">Tổng quan</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="label">Doanh thu tháng</div><div className="value">{formatVnd(overview.month_revenue ?? 0)}</div></div>
        <div className="stat-card"><div className="label">Đơn hôm nay</div><div className="value">{overview.today_orders ?? 0}</div></div>
        <div className="stat-card"><div className="label">SP đang bán</div><div className="value">{overview.active_products ?? 0}</div></div>
        <div className="stat-card"><div className="label">User mới (7 ngày)</div><div className="value">{overview.new_users_week ?? 0}</div></div>
      </div>
      <h3 style={{ marginBottom: 12 }}>Doanh thu 30 ngày</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={revenue}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(v) => formatVnd(Number(v ?? 0))} />
          <Line type="monotone" dataKey="revenue" stroke="#2563EB" />
        </LineChart>
      </ResponsiveContainer>
      <h3 style={{ margin: '24px 0 12px' }}>Top sản phẩm bán chạy</h3>
      <div className="table-wrap">
        <table>
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
    </div>
  );
}
