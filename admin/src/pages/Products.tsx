import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { field, formatVnd, unwrapList } from '../utils/format';

type Filter = 'all' | 'active' | 'inactive' | 'featured' | 'low_stock' | 'on_sale';

export default function Products() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [brand, setBrand] = useState('');
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/products', { params: { limit: 200 } }),
      api.get('/categories'),
    ])
      .then(([p, c]) => {
        setProducts(unwrapList(p) as Record<string, unknown>[]);
        setCategories(unwrapList(c) as Record<string, unknown>[]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${categories.length} danh mục · ${filtered.length}/${products.length} hiển thị`}
      />

      <div className="stat-grid stat-grid-5">
        <StatCard label="Tổng SP" value={String(stats.total)} tone="indigo" />
        <StatCard label="Đang bán" value={String(stats.active)} tone="emerald" />
        <StatCard label="Nổi bật" value={String(stats.featured)} tone="blue" />
        <StatCard label="Đang giảm giá" value={String(stats.onSale)} tone="violet" />
        <StatCard label="Sắp hết hàng" value={String(stats.low)} tone="warn" hint="Kho < 10" />
      </div>

      <div className="toolbar">
        <input
          className="input input-grow"
          placeholder="Tìm tên, slug, thương hiệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">Tất cả</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Đã ẩn</option>
          <option value="featured">Nổi bật</option>
          <option value="on_sale">Đang giảm giá</option>
          <option value="low_stock">Sắp hết hàng</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Thương hiệu</th>
              <th>Giá bán</th>
              <th>Kho</th>
              <th>Lượt xem</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const price = Number(p.price ?? 0);
              const sale = field<number>(p, 'sale_price', 'salePrice');
              const thumb = field<string>(p, 'thumbnail_url', 'thumbnailUrl');
              const featured = Boolean(p.is_featured ?? p.isFeatured);
              const active = Boolean(p.is_active ?? p.isActive ?? true);
              const stock = Number(p.stock ?? 0);
              return (
                <tr key={String(p.id)} className="row-clickable" onClick={() => setSelected(p)}>
                  <td>
                    <div className="product-cell">
                      {thumb ? <img className="product-thumb" src={thumb} alt="" /> : <div className="product-thumb" />}
                      <div>
                        <div className="cell-title">{String(p.name)}</div>
                        <div className="cell-sub">{String(p.slug ?? '')}</div>
                      </div>
                    </div>
                  </td>
                  <td>{String(p.brand ?? '—')}</td>
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
                    <span className={stock < 10 ? 'badge badge-warn' : stock < 30 ? 'badge badge-info' : 'badge badge-muted'}>
                      {stock}
                    </span>
                  </td>
                  <td className="text-muted">{String(field(p, 'view_count', 'viewCount') ?? 0)}</td>
                  <td>{Number(field(p, 'avg_rating', 'avgRating') ?? 0).toFixed(1)} ★</td>
                  <td>
                    {featured && <span className="badge badge-info" style={{ marginRight: 4 }}>NB</span>}
                    <span className={active ? 'badge badge-success' : 'badge badge-danger'}>
                      {active ? 'Bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Không có sản phẩm phù hợp</div>}
      </div>

      <Modal open={!!selected} title="Chi tiết sản phẩm" onClose={() => setSelected(null)} wide>
        {selected && (
          <div className="detail-grid">
            <div className="detail-media">
              {field<string>(selected, 'thumbnail_url', 'thumbnailUrl') ? (
                <img src={field<string>(selected, 'thumbnail_url', 'thumbnailUrl')} alt="" className="detail-img" />
              ) : (
                <div className="detail-img detail-img--empty" />
              )}
            </div>
            <div className="detail-fields">
              <h3>{String(selected.name)}</h3>
              <p className="text-muted">Slug: {String(selected.slug)}</p>
              <dl className="detail-dl">
                <dt>Thương hiệu</dt><dd>{String(selected.brand ?? '—')}</dd>
                <dt>Giá gốc</dt><dd>{formatVnd(Number(selected.price ?? 0))}</dd>
                <dt>Giá sale</dt><dd>{field<number>(selected, 'sale_price', 'salePrice') != null ? formatVnd(Number(field(selected, 'sale_price', 'salePrice'))) : '—'}</dd>
                <dt>Tồn kho</dt><dd>{String(selected.stock ?? 0)}</dd>
                <dt>Lượt xem</dt><dd>{String(field(selected, 'view_count', 'viewCount') ?? 0)}</dd>
                <dt>Đánh giá</dt><dd>{Number(field(selected, 'avg_rating', 'avgRating') ?? 0).toFixed(1)} / 5</dd>
                <dt>Nổi bật</dt><dd>{Boolean(selected.is_featured ?? selected.isFeatured) ? 'Có' : 'Không'}</dd>
                <dt>Trạng thái</dt><dd>{Boolean(selected.is_active ?? selected.isActive ?? true) ? 'Đang bán' : 'Ẩn'}</dd>
              </dl>
              {String(selected.description ?? '').length > 0 && (
                <div className="detail-desc">
                  <strong>Mô tả</strong>
                  <p>{String(selected.description).slice(0, 500)}{String(selected.description).length > 500 ? '…' : ''}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
