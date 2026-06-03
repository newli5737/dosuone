import { useEffect, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { field, formatDate, formatVnd, unwrapPaginated } from '../utils/format';
import type { PaginationMeta } from '../utils/format';

export default function Customers() {
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = (p = page, q = search) => {
    setLoading(true);
    api
      .get('/admin/customers', { params: { page: p, limit: 20, search: q.trim() || undefined } })
      .then((r) => {
        const { data, meta: m } = unwrapPaginated(r);
        setCustomers(data);
        setMeta(m);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, search);
  }, [page]);

  const onSearch = () => {
    setPage(1);
    load(1, search);
  };

  const stats = {
    total: meta.total,
    withOrders: customers.filter((c) => Number(c.order_count ?? c.orderCount ?? 0) > 0).length,
  };

  if (loading && customers.length === 0) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý khách hàng"
        subtitle="Khách được lưu tự động khi đặt hàng trên app"
        action={
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            Làm mới
          </button>
        }
      />

      <div className="stat-grid stat-grid-2">
        <StatCard label="Tổng khách hàng" value={String(stats.total)} tone="emerald" />
        <StatCard label="Trang hiện tại" value={String(customers.length)} hint="theo bộ lọc" tone="indigo" />
      </div>

      <div className="toolbar">
        <input
          className="input input-grow"
          placeholder="Tìm tên, SĐT, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <button type="button" className="btn btn-primary" onClick={onSearch}>
          Tìm
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Đơn hàng</th>
              <th>Tổng mua</th>
              <th>Mua gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const id = String(c.id);
              const last = field<string>(c, 'last_order_at', 'lastOrderAt');
              return (
                <tr key={id}>
                  <td>
                    <div className="cell-title">{String(c.full_name ?? c.fullName ?? '—')}</div>
                    <div className="cell-sub mono">{id.slice(0, 8)}…</div>
                  </td>
                  <td>{String(c.phone ?? '—')}</td>
                  <td>{String(c.email ?? '—')}</td>
                  <td>{String(c.order_count ?? c.orderCount ?? 0)}</td>
                  <td>{formatVnd(Number(c.total_spent ?? c.totalSpent ?? 0))}</td>
                  <td className="text-muted">{formatDate(last)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && <div className="empty-state">Chưa có khách hàng (chờ đơn đầu tiên)</div>}
      </div>

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
