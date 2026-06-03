import { useEffect, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { useNotify } from '../context/NotifyContext';
import { apiErrorMessage, unwrapList } from '../utils/format';
import { slugify } from '../utils/slug';

const emptyForm = {
  name: '',
  slug: '',
  is_active: true,
};

export default function Brands() {
  const { confirm, toast } = useNotify();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/brands', { params: { all: '1' } })
      .then((r) => setList(unwrapList(r) as Record<string, unknown>[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = list.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(b.name ?? '').toLowerCase().includes(q) ||
      String(b.slug ?? '').toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      is_active: Boolean(row.is_active ?? row.isActive ?? true),
    });
    setError('');
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Nhập tên và slug');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        ...(editingId ? { is_active: form.is_active } : {}),
      };
      if (editingId) {
        await api.patch(`/brands/${editingId}`, body);
      } else {
        await api.post('/brands', body);
      }
      setModalOpen(false);
      load();
    } catch {
      setError('Lưu thất bại (slug trùng hoặc dữ liệu không hợp lệ)');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Xóa thương hiệu',
      message: `Xóa "${name}"? Chỉ xóa được khi không còn sản phẩm của hãng này.`,
      confirmLabel: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/brands/${id}`);
      toast('Đã xóa thương hiệu', 'success');
      load();
    } catch (e: unknown) {
      toast(apiErrorMessage(e, 'Không xóa được thương hiệu'), 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý thương hiệu"
        subtitle={`${filtered.length} thương hiệu`}
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm thương hiệu
          </button>
        }
      />

      <div className="toolbar">
        <input
          className="input input-grow"
          placeholder="Tìm tên, slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn btn-ghost" onClick={load}>
          Làm mới
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const id = String(b.id);
              const active = Boolean(b.is_active ?? b.isActive ?? true);
              return (
                <tr key={id}>
                  <td className="cell-title">{String(b.name)}</td>
                  <td className="mono text-muted">{String(b.slug)}</td>
                  <td>
                    <span className={active ? 'badge badge-success' : 'badge badge-danger'}>
                      {active ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(id, String(b.name))}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Chưa có thương hiệu</div>}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
        onClose={() => setModalOpen(false)}
      >
        <div className="form-stack">
          <label>
            Tên thương hiệu
            <input
              className="input input-block"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: editingId ? f.slug : slugify(name),
                }));
              }}
            />
          </label>
          <label>
            Slug (URL)
            <input
              className="input input-block mono"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            />
          </label>
          {editingId && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Hiển thị trên app
            </label>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="button" className="btn btn-primary input-block" disabled={saving} onClick={save}>
            {saving ? 'Đang lưu...' : 'Lưu thương hiệu'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
