import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🍕 Admin</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin/pedidos" className="nav-item">
          <span className="nav-icon">📦</span>
          <span>Pedidos</span>
        </NavLink>

        <NavLink to="/admin/categorias" className="nav-item">
          <span className="nav-icon">📂</span>
          <span>Categorias</span>
        </NavLink>

        <NavLink to="/admin/produtos" className="nav-item">
          <span className="nav-icon">🍔</span>
          <span>Produtos</span>
        </NavLink>

        <NavLink to="/admin/dashboard" className="nav-item">
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/configuracoes" className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span>Configurações</span>
        </NavLink>
      </nav>
    </aside>
  );
}