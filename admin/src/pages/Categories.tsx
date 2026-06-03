import { useEffect, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ImageUploader, { type UploadItem } from '../components/ImageUploader';
import { useNotify } from '../context/NotifyContext';
import { apiErrorMessage, field, unwrapList } from '../utils/format';
import { slugify } from '../utils/slug';

const emptyForm = {
  name: '',
  slug: '',
  is_active: true,
};

export default function Categories() {
  const { confirm, toast } = useNotify();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState<UploadItem[]>([]);
  const [prevImagePublicId, setPrevImagePublicId] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/categories', { params: { all: '1' } })
      .then((r) => setList(unwrapList(r) as Record<string, unknown>[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = list.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(c.name ?? '').toLowerCase().includes(q) ||
      String(c.slug ?? '').toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setGallery([]);
    setPrevImagePublicId('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    const url = String(field(row, 'image_url', 'imageUrl') ?? '');
    const pid = String(field(row, 'image_public_id', 'imagePublicId') ?? '');
    setForm({
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      is_active: Boolean(row.is_active ?? row.isActive ?? true),
    });
    setGallery(url ? [{ url, public_id: pid, localKey: pid || url }] : []);
    setPrevImagePublicId(pid);
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
      const img = gallery[0];
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        image_url: img?.url,
        image_public_id: img?.public_id || undefined,
        ...(editingId ? { is_active: form.is_active } : {}),
      };
      if (editingId && prevImagePublicId && img?.public_id !== prevImagePublicId) {
        body.delete_image_public_id = prevImagePublicId;
      }
      if (editingId) {
        await api.patch(`/categories/${editingId}`, body);
      } else {
        await api.post('/categories', body);
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
      title: 'Xóa danh mục',
      message: `Xóa "${name}"? Nếu còn sản phẩm gắn danh mục này, hệ thống tự chuyển sang "Điện thoại".`,
      confirmLabel: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      const payload = (res.data as { data?: { message?: string } })?.data ?? res.data;
      toast(String((payload as { message?: string })?.message ?? 'Đã xóa danh mục'), 'success');
      load();
    } catch (e: unknown) {
      toast(apiErrorMessage(e, 'Không xóa được danh mục'), 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý danh mục"
        subtitle={`${filtered.length} danh mục`}
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm danh mục
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
              <th>Danh mục</th>
              <th>Slug</th>
              <th>Ảnh</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const id = String(c.id);
              const active = Boolean(c.is_active ?? c.isActive ?? true);
              const img = field<string>(c, 'image_url', 'imageUrl');
              return (
                <tr key={id}>
                  <td><strong>{String(c.name)}</strong></td>
                  <td className="mono text-muted">{String(c.slug)}</td>
                  <td>
                    {img ? (
                      <img src={img} alt="" className="product-thumb" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className={active ? 'badge badge-success' : 'badge badge-danger'}>
                      {active ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(id, String(c.name))}
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
        {filtered.length === 0 && <div className="empty-state">Chưa có danh mục</div>}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
        onClose={() => setModalOpen(false)}
      >
        <div className="form-stack">
          <label>
            Tên danh mục
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
          <section className="form-section">
            <h3 className="form-section-title">Hình ảnh danh mục</h3>
            <ImageUploader label="" value={gallery} onChange={setGallery} />
          </section>
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
            {saving ? 'Đang lưu...' : 'Lưu danh mục'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
