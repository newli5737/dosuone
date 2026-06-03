import { useEffect, useState } from 'react';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.get('/products', { params: { limit: 50 } }).then((r) => {
      const d = r.data.data ?? r.data;
      setProducts(d.data ?? d);
    });
  }, []);

  return (
    <div>
      <h2>Sản phẩm</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Tên</th><th>Giá</th><th>Kho</th><th>Nổi bật</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={String(p.id)}>
              <td>{String(p.name)}</td>
              <td>{Number(p.price).toLocaleString('vi-VN')} đ</td>
              <td>{String(p.stock)}</td>
              <td>{p.is_featured || p.isFeatured ? '✓' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
