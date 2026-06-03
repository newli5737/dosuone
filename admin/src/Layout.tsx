import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const nav = [
  { to: '/admin', label: 'Tổng quan', icon: '◉', end: true },
  { to: '/admin/categories', label: 'Danh mục', icon: '▦' },
  { to: '/admin/products', label: 'Sản phẩm', icon: '▣' },
  { to: '/admin/orders', label: 'Đơn hàng', icon: '◎' },
  { to: '/admin/users', label: 'Người dùng', icon: '◇' },
  { to: '/admin/bank-accounts', label: 'STK ngân hàng', icon: '₫' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem('admin_email');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt="DOSUONE" className="admin-brand-logo" />
          <small>Cửa hàng điện thoại</small>
        </div>
        <nav className="admin-nav">
          {nav.map((item) => {
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={active ? 'admin-nav-link active' : 'admin-nav-link'}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          {email && <div className="admin-user">{email}</div>}
          <button type="button" className="admin-logout" onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin-main admin-main--wide">
        <Outlet />
      </main>
    </div>
  );
}
