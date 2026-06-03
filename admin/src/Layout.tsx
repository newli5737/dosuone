import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const nav = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/orders', label: 'Đơn hàng' },
  { to: '/admin/users', label: 'Người dùng' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>DOSUONE</span>
          <small>Admin</small>
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
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="btn btn-ghost admin-logout"
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
        >
          Đăng xuất
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
        }
        .admin-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #0f172a;
          color: #e2e8f0;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
        }
        .admin-brand span {
          display: block;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .admin-brand small {
          color: #94a3b8;
          font-size: 12px;
        }
        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 28px;
          flex: 1;
        }
        .admin-nav-link {
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 500;
          color: #94a3b8;
        }
        .admin-nav-link:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .admin-nav-link.active {
          background: #4f46e5;
          color: #fff;
        }
        .admin-logout {
          width: 100%;
          color: #94a3b8 !important;
          border-color: #334155 !important;
        }
        .admin-main {
          flex: 1;
          padding: 28px 32px;
          overflow-x: auto;
        }
        @media (max-width: 768px) {
          .admin-shell { flex-direction: column; }
          .admin-sidebar { width: 100%; }
        }
      `}</style>
    </div>
  );
}
