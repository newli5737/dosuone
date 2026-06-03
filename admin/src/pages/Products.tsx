import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { field, formatVnd, unwrapList, unwrapPaginated } from '../utils/format';
import { slugify } from '../utils/slug';

type Filter = 'all' | 'active' | 'inactive' | 'featured' | 'low_stock' | 'on_sale';

const emptyProductForm = {
  category_id: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  sale_price: '',
  stock: '0',
  brand: '',
  thumbnail_url: '',
  is_featured: false,
  is_active: true,
};

export default function Products() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [brand, setBrand] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/products', { params: { limit: 500, include_inactive: true } }),
      api.get('/categories', { params: { all: '1' } }),
    ])
      .then(([p, c]) => {
        const { data } = unwrapPaginated(p);
        setProducts(data);
        setCategories(unwrapList(c) as Record<string, unknown>[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const categoryName = (id: string) => {
    const cat = categories.find((c) => String(c.id) === id);
    return cat ? String(cat.name) : '—';
  };

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const b = String(p.brand ?? '').trim();
      if (b) set.add(b);
    }
    return [...set].sort();
  }, [products]);

  const stats = useMemo(() => {
    const active = products.filter((p) => Boolean(p.is_active ?? p.isActive ?? true)).length;
    const featured = products.filter((p) => Boolean(p.is_featured ?? p.isFeatured)).length;
    const low = products.filter((p) => Number(p.stock ?? 0) < 10).length;
    const onSale = products.filter((p) => {
      const sale = field<number>(p, 'sale_price', 'salePrice');
      return sale != null && sale < Number(p.price ?? 0);
    }).length;
    return { total: products.length, active, featured, low, onSale };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const name = String(p.name ?? '').toLowerCase();
      const slug = String(p.slug ?? '').toLowerCase();
      const b = String(p.brand ?? '').toLowerCase();
      if (q && !name.includes(q) && !b.includes(q) && !slug.includes(q)) return false;
      if (brand && String(p.brand ?? '') !== brand) return false;
      const active = Boolean(p.is_active ?? p.isActive ?? true);
      const featured = Boolean(p.is_featured ?? p.isFeatured);
      const stock = Number(p.stock ?? 0);
      const sale = field<number>(p, 'sale_price', 'salePrice');
      const onSale = sale != null && sale < Number(p.price ?? 0);
      if (filter === 'active' && !active) return false;
      if (filter === 'inactive' && active) return false;
      if (filter === 'featured' && !featured) return false;
      if (filter === 'low_stock' && stock >= 10) return false;
      if (filter === 'on_sale' && !onSale) return false;
      return true;
    });
  }, [products, search, filter, brand]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyProductForm,
      category_id: categories[0] ? String(categories[0].id) : '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Record<string, unknown>) => {
    setEditingId(String(p.id));
    setForm({
      category_id: String(p.category_id ?? p.categoryId ?? ''),
      name: String(p.name ?? ''),
      slug: String(p.slug ?? ''),
      description: String(p.description ?? ''),
      price: String(p.price ?? ''),
      sale_price: field(p, 'sale_price', 'salePrice') != null ? String(field(p, 'sale_price', 'salePrice')) : '',
      stock: String(p.stock ?? 0),
      brand: String(p.brand ?? ''),
      thumbnail_url: String(field(p, 'thumbnail_url', 'thumbnailUrl') ?? ''),
      is_featured: Boolean(p.is_featured ?? p.isFeatured),
      is_active: Boolean(p.is_active ?? p.isActive ?? true),
    });
    setError('');
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.category_id || !form.name.trim() || !form.slug.trim() || !form.price) {
      setError('Chọn danh mục, nhập tên, slug và giá');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        category_id: form.category_id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        brand: form.brand.trim() || undefined,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        is_featured: form.is_featured,
      };
      if (form.sale_price !== '') body.sale_price = Number(form.sale_price);
      if (editingId) {
        body.is_active = form.is_active;
        await api.patch(`/products/${editingId}`, body);
      } else {
        await api.post('/products', body);
      }
      setModalOpen(false);
      load();
    } catch {
      setError('Lưu thất bại (slug trùng, thiếu danh mục hoặc dữ liệu sai)');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      alert('Không xóa được sản phẩm');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${filtered.length}/${products.length} sản phẩm`}
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm sản phẩm
          </button>
        }
      />

      <div className="stat-grid stat-grid-5">
        <StatCard label="Tổng SP" value={String(stats.total)} tone="indigo" />
        <StatCard label="Đang bán" value={String(stats.active)} tone="emerald" />
        <StatCard label="Nổi bật" value={String(stats.featured)} tone="blue" />
        <StatCard label="Giảm giá" value={String(stats.onSale)} tone="violet" />
        <StatCard label="Sắp hết" value={String(stats.low)} tone="warn" />
      </div>

      <div className="toolbar">
        <input
          className="input input-grow"
          placeholder="Tìm tên, slug, thương hiệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Thương hiệu</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">Tất cả</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Đã ẩn</option>
          <option value="featured">Nổi bật</option>
          <option value="on_sale">Giảm giá</option>
          <option value="low_stock">Sắp hết hàng</option>
        </select>
        <button type="button" className="btn btn-ghost" onClick={load}>Làm mới</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>TT</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const id = String(p.id);
              const price = Number(p.price ?? 0);
              const sale = field<number>(p, 'sale_price', 'salePrice');
              const thumb = field<string>(p, 'thumbnail_url', 'thumbnailUrl');
              const catId = String(p.category_id ?? p.categoryId ?? '');
              const active = Boolean(p.is_active ?? p.isActive ?? true);
              const featured = Boolean(p.is_featured ?? p.isFeatured);
              return (
                <tr key={id}>
                  <td>
                    <div className="product-cell">
                      {thumb ? <img className="product-thumb" src={thumb} alt="" /> : <div className="product-thumb" />}
                      <div>
                        <div className="cell-title">{String(p.name)}</div>
                        <div className="cell-sub mono">{String(p.slug)}</div>
                      </div>
                    </div>
                  </td>
                  <td>{categoryName(catId)}</td>
                  <td>
                    {sale != null ? (
                      <>
                        <div className="price-sale">{formatVnd(sale)}</div>
                        <div className="price-old">{formatVnd(price)}</div>
                      </>
                    ) : (
                      <div className="price-sale">{formatVnd(price)}</div>
                    )}
                  </td>
                  <td>
                    <span className={Number(p.stock) < 10 ? 'badge badge-warn' : 'badge badge-muted'}>
                      {String(p.stock ?? 0)}
                    </span>
                  </td>
                  <td>
                    {featured && <span className="badge badge-info" style={{ marginRight: 4 }}>NB</span>}
                    <span className={active ? 'badge badge-success' : 'badge badge-danger'}>
                      {active ? 'Bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                        Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(id, String(p.name))}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Không có sản phẩm</div>}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <div className="form-grid">
          <label>
            Danh mục *
            <select
              className="select input-block"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">— Chọn —</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
              ))}
            </select>
          </label>
          <label>
            Thương hiệu
            <input
              className="input input-block"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Apple, Samsung..."
            />
          </label>
          <label className="form-span-2">
            Tên sản phẩm *
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
          <label className="form-span-2">
            Slug *
            <input
              className="input input-block mono"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            />
          </label>
          <label>
            Giá gốc (VND) *
            <input
              type="number"
              className="input input-block"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label>
            Giá sale (để trống nếu không)
            <input
              type="number"
              className="input input-block"
              value={form.sale_price}
              onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
            />
          </label>
          <label>
            Tồn kho
            <input
              type="number"
              className="input input-block"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </label>
          <label className="form-span-2">
            URL ảnh thumbnail
            <input
              className="input input-block"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            />
          </label>
          {form.thumbnail_url && (
            <div className="form-span-2">
              <img src={form.thumbnail_url} alt="" className="form-preview-img" />
            </div>
          )}
          <label className="form-span-2">
            Mô tả
            <textarea
              className="input input-block textarea"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />
            Sản phẩm nổi bật
          </label>
          {editingId && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Đang bán trên app
            </label>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="button" className="btn btn-primary input-block" style={{ marginTop: 12 }} disabled={saving} onClick={save}>
          {saving ? 'Đang lưu...' : editingId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </button>
      </Modal>
    </div>
  );
}
