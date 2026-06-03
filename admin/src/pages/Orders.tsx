import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import FilterTabs from '../components/FilterTabs';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { field, formatDate, formatVnd, unwrapPaginated } from '../utils/format';
import type { PaginationMeta } from '../utils/format';

const statuses = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
] as const;

const statusOptions = statuses.filter((s) => s.value !== '');

export default function Orders() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const load = (p = page, status = statusFilter) => {
    setLoading(true);
    api
      .get('/admin/orders', {
        params: {
          page: p,
          limit: 20,
          ...(status ? { status } : {}),
        },
      })
      .then((r) => {
        const { data, meta: m } = unwrapPaginated(r);
        setOrders(data);
        setMeta(m);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, statusFilter);
  }, [page, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const code = String(field(o, 'order_code', 'orderCode') ?? '').toLowerCase();
      const user = o.user as Record<string, unknown> | undefined;
      const email = String(user?.email ?? '').toLowerCase();
      const name = String(field(user ?? {}, 'full_name', 'fullName') ?? '').toLowerCase();
      return code.includes(q) || email.includes(q) || name.includes(q);
    });
  }, [orders, search]);

  const summary = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled');
    return {
      count: meta.total,
      revenue: valid.reduce((s, o) => s + Number(o.total ?? 0), 0),
      pending: orders.filter((o) => o.status === 'pending').length,
    };
  }, [orders, meta.total]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    load();
    if (selected && String(selected.id) === id) {
      setSelected({ ...selected, status });
    }
  };

  if (loading && orders.length === 0) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle={`${meta.total} đơn trong hệ thống`}
        action={
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            Làm mới
          </button>
        }
      />

      <div className="stat-grid stat-grid-3">
        <StatCard label="Tổng đơn (trang)" value={String(filtered.length)} hint={`Trang ${meta.page}/${meta.total_pages}`} tone="indigo" />
        <StatCard label="Doanh thu trang" value={formatVnd(summary.revenue)} hint="Không tính đơn hủy" tone="emerald" />
        <StatCard label="Chờ xử lý (trang)" value={String(summary.pending)} tone="amber" />
      </div>

      <FilterTabs
        tabs={statuses.map((s) => ({
          key: s.value,
          label: s.label,
          count: s.value === statusFilter ? filtered.length : undefined,
        }))}
        active={statusFilter}
        onChange={(k) => {
          setStatusFilter(k);
          setPage(1);
        }}
      />

      <div className="toolbar">
        <input
          className="input input-grow"
          placeholder="Tìm mã đơn, email, tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const id = String(o.id);
              const code = field<string>(o, 'order_code', 'orderCode') ?? id.slice(0, 8);
              const status = String(o.status ?? 'pending');
              const created = field<string>(o, 'created_at', 'createdAt');
              const user = o.user as Record<string, unknown> | undefined;
              const items = (o.items as Record<string, unknown>[] | undefined) ?? [];
              const customer = field<string>(user ?? {}, 'full_name', 'fullName') ?? '—';
              const email = String(user?.email ?? '—');

              return (
                <tr key={id} className="row-clickable" onClick={() => setSelected(o)}>
                  <td><strong className="mono">{code}</strong></td>
                  <td>
                    <div className="cell-title">{customer}</div>
                    <div className="cell-sub">{email}</div>
                  </td>
                  <td className="text-muted">{items.length} mặt hàng</td>
                  <td><strong>{formatVnd(Number(o.total ?? 0))}</strong></td>
                  <td>
                    <div>{String(field(o, 'payment_method', 'paymentMethod') ?? '—')}</div>
                    <div className="cell-sub">{String(field(o, 'payment_status', 'paymentStatus') ?? '')}</div>
                  </td>
                  <td><StatusBadge status={status} /></td>
                  <td className="text-muted">{formatDate(created)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="select"
                      value={status}
                      onChange={(e) => updateStatus(id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Không có đơn hàng</div>}
      </div>

      <Pagination meta={meta} onPage={setPage} />

      <Modal open={!!selected} title="Chi tiết đơn hàng" onClose={() => setSelected(null)} wide>
        {selected && <OrderDetail order={selected} onStatusChange={updateStatus} />}
      </Modal>
    </div>
  );
}

function OrderDetail({
  order,
  onStatusChange,
}: {
  order: Record<string, unknown>;
  onStatusChange: (id: string, status: string) => void;
}) {
  const id = String(order.id);
  const items = (order.items as Record<string, unknown>[] | undefined) ?? [];
  const user = order.user as Record<string, unknown> | undefined;
  const addr = (order.shipping_address ?? order.shippingAddress) as Record<string, unknown> | undefined;
  const status = String(order.status ?? 'pending');

  return (
    <div className="order-detail">
      <div className="order-detail-head">
        <div>
          <h3 className="mono">{field<string>(order, 'order_code', 'orderCode')}</h3>
          <p className="text-muted">{formatDate(field<string>(order, 'created_at', 'createdAt'))}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="detail-grid-2">
        <div className="detail-box">
          <h4>Khách hàng</h4>
          <p><strong>{field<string>(user ?? {}, 'full_name', 'fullName') ?? '—'}</strong></p>
          <p className="text-muted">{String(user?.email ?? '')}</p>
          <p className="text-muted">{String(user?.phone ?? '—')}</p>
        </div>
        <div className="detail-box">
          <h4>Thanh toán</h4>
          <p>PT: {String(field(order, 'payment_method', 'paymentMethod') ?? '—')}</p>
          <p>TT: {String(field(order, 'payment_status', 'paymentStatus') ?? '—')}</p>
        </div>
        <div className="detail-box detail-box--wide">
          <h4>Địa chỉ giao</h4>
          {addr ? (
            <p>
              {String(addr.recipient_name ?? addr.recipientName ?? '')} · {String(addr.phone ?? '')}<br />
              {String(addr.address_line ?? addr.addressLine ?? addr.street ?? '')}<br />
              {[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
            </p>
          ) : (
            <p className="text-muted">—</p>
          )}
        </div>
      </div>

      <h4>Sản phẩm trong đơn</h4>
      <div className="table-wrap table-wrap--flat">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{String(field(it, 'product_name', 'productName') ?? '')}</td>
                <td>{String(it.quantity ?? 0)}</td>
                <td>{formatVnd(Number(field(it, 'unit_price', 'unitPrice') ?? it.price ?? 0))}</td>
                <td>{formatVnd(Number(it.total ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-totals">
        <div><span>Tạm tính</span><strong>{formatVnd(Number(order.subtotal ?? 0))}</strong></div>
        <div><span>Phí ship</span><strong>{formatVnd(Number(field(order, 'shipping_fee', 'shippingFee') ?? 0))}</strong></div>
        <div><span>Giảm giá</span><strong>{formatVnd(Number(order.discount ?? 0))}</strong></div>
        <div className="order-total-final"><span>Tổng</span><strong>{formatVnd(Number(order.total ?? 0))}</strong></div>
      </div>

      {String(order.note ?? '').length > 0 && (
        <p className="order-note"><strong>Ghi chú:</strong> {String(order.note)}</p>
      )}

      <div className="toolbar" style={{ marginTop: 16 }}>
        <label className="toolbar-label">Đổi trạng thái</label>
        <select
          className="select"
          value={status}
          onChange={(e) => onStatusChange(id, e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
