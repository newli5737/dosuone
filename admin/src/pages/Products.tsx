import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ImageUploader, { type UploadItem } from '../components/ImageUploader';
import axios from 'axios';
import { field, formatVnd, parseNumberInput, unwrapData, unwrapList, unwrapPaginated } from '../utils/format';
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
  brand_id: '',
  is_featured: false,
  is_active: true,
};

export default function Products() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [brandsList, setBrandsList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState<UploadItem[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/products', { params: { limit: 500, include_inactive: true } }),
      api.get('/categories', { params: { all: '1' } }),
      api.get('/brands', { params: { all: '1' } }),
    ])
      .then(([p, c, b]) => {
        const { data } = unwrapPaginated(p);
        setProducts(data);
        setCategories(unwrapList(c) as Record<string, unknown>[]);
        setBrandsList(unwrapList(b) as Record<string, unknown>[]);
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
      const bName = String(p.brand ?? '').toLowerCase();
      const bId = String(p.brand_id ?? p.brandId ?? '');
      if (q && !name.includes(q) && !bName.includes(q) && !slug.includes(q)) return false;
      if (brandFilter && bId !== brandFilter) return false;
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
  }, [products, search, filter, brandFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyProductForm,
      category_id: categories[0] ? String(categories[0].id) : '',
    });
    setGallery([]);
    setError('');
    setModalOpen(true);
  };

  const mapGallery = (data: Record<string, unknown>): UploadItem[] => {
    const images = (data.images as Record<string, unknown>[]) ?? [];
    if (images.length) {
      return [...images]
        .sort((a, b) => Number(a.sort_order ?? a.sortOrder ?? 0) - Number(b.sort_order ?? b.sortOrder ?? 0))
        .map((img, i) => ({
          url: String(img.image_url ?? img.imageUrl ?? ''),
          public_id: String(img.cloudinary_public_id ?? img.cloudinaryPublicId ?? ''),
          localKey: String(img.id ?? `img-${i}`),
        }))
        .filter((x) => x.url);
    }
    const thumb = field<string>(data, 'thumbnail_url', 'thumbnailUrl');
    if (thumb) {
      return [{
        url: thumb,
        public_id: String(field(data, 'thumbnail_public_id', 'thumbnailPublicId') ?? ''),
        localKey: 'thumb',
      }];
    }
    return [];
  };

  const openEdit = async (p: Record<string, unknown>) => {
    const id = String(p.id);
    setEditingId(id);
    setError('');
    setModalOpen(true);
    try {
      const res = await api.get(`/products/manage/${id}`);
      const data = unwrapData(res) as Record<string, unknown>;
      setForm({
        category_id: String(data.category_id ?? data.categoryId ?? ''),
        name: String(data.name ?? ''),
        slug: String(data.slug ?? ''),
        description: String(data.description ?? ''),
        price: String(data.price ?? ''),
        sale_price: field(data, 'sale_price', 'salePrice') != null ? String(field(data, 'sale_price', 'salePrice')) : '',
        stock: String(data.stock ?? 0),
        brand_id: String(data.brand_id ?? data.brandId ?? ''),
        is_featured: Boolean(data.is_featured ?? data.isFeatured),
        is_active: Boolean(data.is_active ?? data.isActive ?? true),
      });
      setGallery(mapGallery(data));
    } catch {
      setError('Không tải chi tiết sản phẩm');
      setGallery([]);
    }
  };

  const save = async () => {
    if (!form.category_id || !form.name.trim() || !form.slug.trim() || !form.price) {
      setError('Chọn danh mục, nhập tên, slug và giá');
      return;
    }
    if (gallery.length === 0) {
      setError('Tải ít nhất 1 ảnh sản phẩm');
      return;
    }
    const price = parseNumberInput(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError('Giá gốc không hợp lệ');
      return;
    }
    let salePrice: number | undefined;
    if (form.sale_price !== '') {
      salePrice = parseNumberInput(form.sale_price);
      if (!Number.isFinite(salePrice) || salePrice < 0) {
        setError('Giá sale không hợp lệ');
        return;
      }
    }
    const stock = parseNumberInput(form.stock);
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setError('Tồn kho phải là số nguyên ≥ 0');
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
        price,
        stock,
        brand_id: form.brand_id || undefined,
        is_featured: form.is_featured,
        thumbnail_url: gallery[0].url,
        thumbnail_public_id: gallery[0].public_id || undefined,
        images: gallery.map((img, i) => ({
          image_url: img.url,
          public_id: img.public_id || undefined,
          sort_order: i,
          is_primary: i === 0,
        })),
      };
      if (salePrice !== undefined) body.sale_price = salePrice;
      if (editingId) {
        body.is_active = form.is_active;
        await api.patch(`/products/${editingId}`, body);
      } else {
        await api.post('/products', body);
      }
      setModalOpen(false);
      load();
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? String(e.response?.data?.message ?? e.response?.data?.error ?? '')
        : '';
      setError(msg || 'Lưu thất bại (slug trùng, thiếu danh mục hoặc dữ liệu sai)');
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
        <select className="select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">Thương hiệu</option>
          {brandsList.map((b) => (
            <option key={String(b.id)} value={String(b.id)}>{String(b.name)}</option>
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
        <div className="form-sections">
          <section className="form-section">
            <h3 className="form-section-title">Thông tin cơ bản</h3>
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
            <select
              className="select input-block"
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
            >
              <option value="">— Chọn —</option>
              {brandsList.map((b) => (
                <option key={String(b.id)} value={String(b.id)}>{String(b.name)}</option>
              ))}
            </select>
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
              type="text"
              inputMode="decimal"
              className="input input-block input-numeric"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label>
            Giá sale (để trống nếu không)
            <input
              type="text"
              inputMode="decimal"
              className="input input-block input-numeric"
              value={form.sale_price}
              onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
            />
          </label>
          <label>
            Tồn kho
            <input
              type="text"
              inputMode="numeric"
              className="input input-block input-numeric"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, '') })}
              placeholder="0"
            />
          </label>
          <label className="checkbox-row form-span-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />
            Hiển thị mục nổi bật
          </label>
          {editingId && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Đang bán
            </label>
          )}
            </div>
          </section>

          <section className="form-section">
            <h3 className="form-section-title">Mô tả sản phẩm</h3>
            <p className="form-section-hint">Nội dung hiển thị trên trang chi tiết sản phẩm (app khách).</p>
            <textarea
              className="input input-block textarea"
              rows={5}
              placeholder="Thông số, ưu đãi, cam kết bảo hành..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </section>

          <section className="form-section">
            <h3 className="form-section-title">Hình ảnh</h3>
            <p className="form-section-hint">Tải một hoặc nhiều ảnh. Ảnh đầu tiên là ảnh đại diện trên app.</p>
            <ImageUploader
              label=""
              multiple
              value={gallery}
              onChange={setGallery}
            />
          </section>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="button" className="btn btn-primary input-block" style={{ marginTop: 12 }} disabled={saving} onClick={save}>
          {saving ? 'Đang lưu...' : editingId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </button>
      </Modal>
    </div>
  );
}
