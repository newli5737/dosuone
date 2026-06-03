import { useEffect, useState } from 'react';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);

  const load = () => api.get('/admin/users').then((r) => {
    const d = r.data.data ?? r.data;
    setUsers(d.data ?? d);
  });

  useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    await api.patch(`/admin/users/${id}/status`, { is_active: active });
    load();
  };

  return (
    <div>
      <h2>Người dùng</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Email</th><th>Tên</th><th>Vai trò</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={String(u.id)}>
              <td>{String(u.email)}</td>
              <td>{String(u.full_name ?? u.fullName)}</td>
              <td>{String(u.role)}</td>
              <td>
                <button onClick={() => toggle(String(u.id), !u.is_active && !u.isActive)}>
                  {(u.is_active ?? u.isActive) ? 'Hoạt động' : 'Vô hiệu'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
