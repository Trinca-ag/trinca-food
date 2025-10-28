import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/admin');
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      
      <div className="admin-content">
        <header className="admin-header">
          <div className="header-right">
            <span className="user-email">👤 {user?.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}