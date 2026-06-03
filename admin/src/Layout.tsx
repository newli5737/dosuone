import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#1e293b', color: '#fff', padding: 16 }}>
        <h2 style={{ marginBottom: 24 }}>Dosuone</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/admin" style={{ color: '#fff' }}>Dashboard</Link>
          <Link to="/admin/products" style={{ color: '#fff' }}>Sản phẩm</Link>
          <Link to="/admin/orders" style={{ color: '#fff' }}>Đơn hàng</Link>
          <Link to="/admin/users" style={{ color: '#fff' }}>Users</Link>
        </nav>
        <button style={{ marginTop: 32 }} onClick={() => { localStorage.clear(); navigate('/'); }}>
          Đăng xuất
        </button>
      </aside>
      <main style={{ flex: 1, padding: 24, background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}
