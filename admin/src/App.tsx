import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import BankAccounts from './pages/BankAccounts';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="bank-accounts" element={<BankAccounts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
