import { useEffect, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { field, unwrapList } from '../utils/format';

const BANK_CODES = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'TPB', name: 'TPBank' },
];

const emptyForm = {
  bank_name: '',
  bank_code: 'VCB',
  account_number: '',
  account_holder: '',
  is_active: true,
  is_default: false,
  sort_order: 0,
};

export default function BankAccounts() {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/admin/bank-accounts')
      .then((r) => setList(unwrapList(r) as Record<string, unknown>[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      bank_name: String(row.bank_name ?? row.bankName ?? ''),
      bank_code: String(row.bank_code ?? row.bankCode ?? 'VCB'),
      account_number: String(row.account_number ?? row.accountNumber ?? ''),
      account_holder: String(row.account_holder ?? row.accountHolder ?? ''),
      is_active: Boolean(row.is_active ?? row.isActive ?? true),
      is_default: Boolean(row.is_default ?? row.isDefault ?? false),
      sort_order: Number(row.sort_order ?? row.sortOrder ?? 0),
    });
    setError('');
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.patch(`/admin/bank-accounts/${editingId}`, form);
      } else {
        await api.post('/admin/bank-accounts', form);
      }
      setModalOpen(false);
      load();
    } catch {
      setError('Lưu thất bại. Kiểm tra dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa tài khoản này?')) return;
    await api.delete(`/admin/bank-accounts/${id}`);
    load();
  };

  const previewQr = (row: Record<string, unknown>) => {
    const acc = String(row.account_number ?? row.accountNumber ?? '');
    const bank = String(row.bank_code ?? row.bankCode ?? '');
    const url = `https://qr.sepay.vn/img?acc=${encodeURIComponent(acc)}&bank=${encodeURIComponent(bank)}&amount=100000&des=DOSUONE_TEST&template=compact&download=false`;
    window.open(url, '_blank');
  };

  if (loading) return <Loading />;

  const active = list.filter((r) => Boolean(r.is_active ?? r.isActive)).length;
  const defaultAcc = list.find((r) => Boolean(r.is_default ?? r.isDefault));

  return (
    <div>
      <PageHeader
        title="Tài khoản ngân hàng"
        subtitle="STK nhận chuyển khoản · QR Sepay khi khách checkout"
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm STK
          </button>
        }
      />

      <div className="stat-grid stat-grid-3">
        <StatCard label="Tổng STK" value={String(list.length)} tone="indigo" />
        <StatCard label="Đang dùng" value={String(active)} tone="emerald" />
        <StatCard
          label="STK mặc định"
          value={defaultAcc ? String(field(defaultAcc, 'bank_code', 'bankCode') ?? '') : '—'}
          hint={defaultAcc ? String(field(defaultAcc, 'account_number', 'accountNumber') ?? '') : 'Chưa đặt'}
          tone="violet"
        />
      </div>

      <div className="panel panel-info">
        <strong>QR Sepay</strong>
        <p className="text-muted" style={{ margin: '8px 0 0' }}>
          Khi khách chọn <em>Chuyển khoản</em>, app hiển thị STK mặc định + số tiền + mã đơn + ảnh QR từ{' '}
          <code>qr.sepay.vn</code>. Mã ngân hàng dùng short name (VCB, TCB, MB…).
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngân hàng</th>
              <th>Mã Sepay</th>
              <th>Số TK</th>
              <th>Chủ TK</th>
              <th>Ưu tiên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => {
              const id = String(row.id);
              const activeRow = Boolean(row.is_active ?? row.isActive);
              const isDef = Boolean(row.is_default ?? row.isDefault);
              return (
                <tr key={id}>
                  <td><strong>{String(row.bank_name ?? row.bankName)}</strong></td>
                  <td><span className="badge badge-info">{String(row.bank_code ?? row.bankCode)}</span></td>
                  <td className="mono">{String(row.account_number ?? row.accountNumber)}</td>
                  <td>{String(row.account_holder ?? row.accountHolder)}</td>
                  <td>{Number(row.sort_order ?? row.sortOrder ?? 0)}</td>
                  <td>
                    {isDef && <span className="badge badge-info" style={{ marginRight: 4 }}>Mặc định</span>}
                    <span className={activeRow ? 'badge badge-success' : 'badge badge-danger'}>
                      {activeRow ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => previewQr(row)}>
                        QR mẫu
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>
                        Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="empty-state">Chưa có STK. Thêm ít nhất một tài khoản và đánh dấu mặc định.</div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Sửa tài khoản' : 'Thêm tài khoản'}
        onClose={() => setModalOpen(false)}
      >
        <div className="form-stack">
          <label>
            Tên ngân hàng
            <input
              className="input input-block"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              placeholder="Vietcombank"
            />
          </label>
          <label>
            Mã Sepay (bank)
            <select
              className="select input-block"
              value={form.bank_code}
              onChange={(e) => {
                const code = e.target.value;
                const b = BANK_CODES.find((x) => x.code === code);
                setForm({ ...form, bank_code: code, bank_name: b?.name ?? form.bank_name });
              }}
            >
              {BANK_CODES.map((b) => (
                <option key={b.code} value={b.code}>{b.code} — {b.name}</option>
              ))}
            </select>
          </label>
          <label>
            Số tài khoản
            <input
              className="input input-block"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
            />
          </label>
          <label>
            Chủ tài khoản
            <input
              className="input input-block"
              value={form.account_holder}
              onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
            />
          </label>
          <label>
            Thứ tự ưu tiên
            <input
              type="number"
              className="input input-block"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Đang sử dụng
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Tài khoản mặc định (dùng cho checkout)
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="button" className="btn btn-primary input-block" disabled={saving} onClick={save}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
