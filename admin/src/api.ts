import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  const payload = data.data ?? data;
  localStorage.setItem('access_token', payload.access_token);
  localStorage.setItem('refresh_token', payload.refresh_token);
  return payload.user;
}

export default api;
