import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
  const [email, setEmail] = useState('admin@dosuone.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Tài khoản không có quyền admin');
        return;
      }
      navigate('/admin');
    } catch {
      setError('Đăng nhập thất bại. Kiểm tra API và tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <span className="login-logo">DOSUONE</span>
          <p>Quản trị cửa hàng điện thoại</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Mật khẩu
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 45%, #3730a3 100%);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          overflow: hidden;
        }
        .login-header {
          padding: 32px 28px 24px;
          text-align: center;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
        }
        .login-logo {
          display: block;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .login-header p {
          margin: 8px 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .login-form {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .login-error {
          margin: 0;
          color: var(--danger);
          font-size: 13px;
        }
        .login-submit {
          width: 100%;
          margin-top: 4px;
          padding: 14px;
        }
      `}</style>
    </div>
  );
}
