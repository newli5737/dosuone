import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import { field, formatDate, formatVnd, unwrapData, unwrapList } from '../utils/format';

const STATUS_ORDER = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

export default function Dashboard() {
  const [overview, setOverview] = useState<Record<string, unknown>>({});
  const [revenue, setRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<Record<string, unknown>[]>([]);
  const [lowStock, setLowStock] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats/overview'),
      api.get('/admin/stats/revenue?period=30d'),
      api.get('/admin/stats/top-products'),
      api.get('/admin/stats/low-stock?limit=8'),
      api.get('/admin/orders', { params: { limit: 15 } }),
    ])
      .then(([o, r, t, ls, ord]) => {
        setOverview(unwrapData(o) as Record<string, unknown>);
        setRevenue(unwrapList(r) as { date: string; revenue: number }[]);
        setTopProducts(unwrapList(t) as Record<string, unknown>[]);
        setLowStock(unwrapList(ls) as Record<string, unknown>[]);
        setOrders(unwrapList(ord) as Record<string, unknown>[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const ordersByStatus = (overview.orders_by_status ?? {}) as Record<string, number>;
  const statusChart = useMemo(
    () =>
      STATUS_ORDER.filter((s) => ordersByStatus[s] != null).map((s) => ({
        status: s,
        count: ordersByStatus[s],
      })),
    [ordersByStatus],
  );

  const revenue7d = useMemo(
    () => revenue.slice(-7).reduce((s, d) => s + Number(d.revenue ?? 0), 0),
    [revenue],
  );

  if (loading) return <Loading />;

  const stats = [
    { label: 'Doanh thu tháng', value: formatVnd(Number(overview.month_revenue ?? 0)), hint: 'Đơn không hủy', tone: 'indigo', icon: '₫' },
    { label: 'Doanh thu hôm nay', value: formatVnd(Number(overview.today_revenue ?? 0)), hint: 'Trong ngày', tone: 'violet', icon: '◆' },
    { label: 'Doanh thu 7 ngày', value: formatVnd(revenue7d), hint: 'Biểu đồ', tone: 'blue', icon: '▣' },
    { label: 'Đơn chờ xử lý', value: String(overview.pending_orders ?? 0), hint: `Tổng ${overview.total_orders ?? 0} đơn`, tone: 'amber', icon: '◎' },
    { label: 'Đơn hôm nay', value: String(overview.today_orders ?? 0), hint: 'Mới tạo', tone: 'slate', icon: '+' },
    { label: 'Sản phẩm đang bán', value: String(overview.active_products ?? 0), hint: `${overview.featured_products ?? 0} nổi bật`, tone: 'emerald', icon: '▣' },
    { label: 'Sắp hết hàng', value: String(overview.low_stock_products ?? 0), hint: 'Kho < 10', tone: 'warn', icon: '!' },
    { label: 'Người dùng', value: String(overview.total_users ?? 0), hint: `+${overview.new_users_week ?? 0} tuần này`, tone: 'indigo', icon: '◇' },
  ];

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        subtitle={`Cập nhật ${formatDate(new Date().toISOString())}`}
        action={
          <div className="quick-actions">
            <Link to="/admin/orders" className="btn btn-primary btn-sm">Xem đơn hàng</Link>
            <Link to="/admin/products" className="btn btn-ghost btn-sm">Quản lý SP</Link>
            <Link to="/admin/bank-accounts" className="btn btn-ghost btn-sm">STK ngân hàng</Link>
          </div>
        }
      />

      <div className="stat-grid stat-grid-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="dashboard-row">
        <div className="panel panel-grow">
          <h2 className="panel-title">Doanh thu 30 ngày</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(Number(v) / 1e6).toFixed(0)}tr`} />
              <Tooltip formatter={(v) => formatVnd(Number(v ?? 0))} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel panel-side">
          <h2 className="panel-title">Đơn theo trạng thái</h2>
          {statusChart.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>Chưa có đơn</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChart} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="status" width={72} tick={{ fontSize: 10 }} tickFormatter={(s) => {
                  const m: Record<string, string> = { pending: 'Chờ', confirmed: 'Xác nhận', shipping: 'Giao', delivered: 'Xong', cancelled: 'Hủy' };
                  return m[s] ?? s;
                }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-row dashboard-row-3">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="link-sm">Xem tất cả →</Link>
          </div>
          <div className="table-wrap table-wrap--flat">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Tổng</th>
                  <th>TT</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => {
                  const user = o.user as Record<string, unknown> | undefined;
                  const name = field<string>(user ?? {}, 'full_name', 'fullName') ?? '—';
                  return (
                    <tr key={String(o.id)}>
                      <td><strong>{field<string>(o, 'order_code', 'orderCode') ?? '—'}</strong></td>
                      <td className="text-muted">{name}</td>
                      <td>{formatVnd(Number(o.total ?? 0))}</td>
                      <td><StatusBadge status={String(o.status ?? 'pending')} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Top bán chạy</h2>
          </div>
          <ol className="top-list">
            {topProducts.map((p, i) => (
              <li key={i} className="top-list-item">
                <span className="top-rank">{i + 1}</span>
                <div className="top-info">
                  <div className="top-name">{String(p.product_name ?? '')}</div>
                  <div className="top-meta">{String(p.sold ?? 0)} sp · {formatVnd(Number(p.revenue ?? 0))}</div>
                </div>
              </li>
            ))}
            {topProducts.length === 0 && <div className="empty-state">Chưa có dữ liệu</div>}
          </ol>
        </div>

        <div className="panel panel-alert">
          <div className="panel-head">
            <h2 className="panel-title">Cảnh báo tồn kho</h2>
            <Link to="/admin/products" className="link-sm">Kho hàng →</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="alert-ok">✓ Không có sản phẩm sắp hết hàng</p>
          ) : (
            <ul className="alert-list">
              {lowStock.map((p) => (
                <li key={String(p.id)} className="alert-list-item">
                  <span className="alert-name">{String(p.name)}</span>
                  <span className="badge badge-warn">Còn {String(p.stock)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Tóm tắt vận hành</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Sản phẩm ẩn</span>
            <strong>{String(overview.inactive_products ?? 0)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đơn đã giao</span>
            <strong>{String(ordersByStatus.delivered ?? 0)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đơn đã hủy</span>
            <strong>{String(ordersByStatus.cancelled ?? 0)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đang giao</span>
            <strong>{String(ordersByStatus.shipping ?? 0)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
