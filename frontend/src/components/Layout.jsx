import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Bar Inventory</h1>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/products">Produtos</NavLink>
          <NavLink to="/sales">Vendas</NavLink>
          <NavLink to="/reports">Relatórios</NavLink>
        </nav>
        <div className="user-info">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
