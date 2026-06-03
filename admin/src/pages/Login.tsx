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
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="DOSUONE" className="login-logo-img" />
          <p>Bảng quản trị cửa hàng</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Mật khẩu
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
