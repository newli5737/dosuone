import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import FilterTabs from '../components/FilterTabs';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { field, formatDate, unwrapPaginated } from '../utils/format';
import type { PaginationMeta } from '../utils/format';

export default function Users() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const load = (p = page) => {
    setLoading(true);
    api
      .get('/admin/users', { params: { page: p, limit: 20 } })
      .then((r) => {
        const { data, meta: m } = unwrapPaginated(r);
        setUsers(data);
        setMeta(m);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const email = String(u.email ?? '').toLowerCase();
      const name = String(field(u, 'full_name', 'fullName') ?? '').toLowerCase();
      const phone = String(u.phone ?? '').toLowerCase();
      if (q && !email.includes(q) && !name.includes(q) && !phone.includes(q)) return false;
      if (roleFilter === 'admin' && u.role !== 'admin') return false;
      if (roleFilter === 'customer' && u.role !== 'customer') return false;
      const active = Boolean(u.is_active ?? u.isActive ?? true);
      if (statusFilter === 'active' && !active) return false;
      if (statusFilter === 'locked' && active) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === 'admin').length;
    const active = users.filter((u) => Boolean(u.is_active ?? u.isActive ?? true)).length;
    return { admins, customers: users.length - admins, active, locked: users.length - active };
  }, [users]);

  const toggle = async (id: string, active: boolean) => {
    await api.patch(`/admin/users/${id}/status`, { is_active: active });
    load();
  };

  if (loading && users.length === 0) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`${meta.total} tài khoản đăng ký`}
        action={
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            Làm mới
          </button>
        }
      />

      <div className="stat-grid stat-grid-4">
        <StatCard label="Tổng (trang)" value={String(users.length)} hint={`${meta.total} toàn hệ thống`} tone="indigo" />
        <StatCard label="Admin" value={String(stats.admins)} tone="blue" />
        <StatCard label="Khách hàng" value={String(stats.customers)} tone="emerald" />
        <StatCard label="Đang khóa" value={String(stats.locked)} tone="warn" />
      </div>

      <FilterTabs
        tabs={[
          { key: 'all', label: 'Tất cả' },
          { key: 'customer', label: 'Khách' },
          { key: 'admin', label: 'Admin' },
        ]}
        active={roleFilter}
        onChange={setRoleFilter}
      />

      <div className="toolbar">
        <input
          className="input input-grow"
          placeholder="Tìm email, tên, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Họ tên</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const id = String(u.id);
              const active = Boolean(u.is_active ?? u.isActive ?? true);
              const created = field<string>(u, 'created_at', 'createdAt');
              return (
                <tr key={id}>
                  <td>
                    <div className="cell-title">{String(u.email)}</div>
                    <div className="cell-sub mono">{id.slice(0, 8)}…</div>
                  </td>
                  <td>{String(field(u, 'full_name', 'fullName') ?? '—')}</td>
                  <td>{String(u.phone ?? '—')}</td>
                  <td>
                    <span className={u.role === 'admin' ? 'badge badge-info' : 'badge badge-muted'}>
                      {u.role === 'admin' ? 'Admin' : 'Khách'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(created)}</td>
                  <td>
                    <span className={active ? 'badge badge-success' : 'badge badge-danger'}>
                      {active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`btn btn-sm ${active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggle(id, !active)}
                    >
                      {active ? 'Khóa TK' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Không có người dùng</div>}
      </div>

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
