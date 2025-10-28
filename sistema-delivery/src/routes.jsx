import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loading } from './components/Loading';
import { AdminLayout } from './components/admin/AdminLayout';

// Páginas Admin
import { Login } from './pages/admin/Login';
import { Pedidos } from './pages/admin/Pedidos';
import { Categorias } from './pages/admin/Categorias';
import { Produtos } from './pages/admin/Produtos';
import { Dashboard } from './pages/admin/Dashboard';

// Componente para proteger rotas
function PrivateRoute({ children }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return signed ? children : <Navigate to="/admin" />;
}

// Componente para redirecionar se já estiver logado
function PublicRoute({ children }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return signed ? <Navigate to="/admin/pedidos" /> : children;
}

function Routes() {
  return (
    <RouterRoutes>
      {/* Rota do Cliente */}
      <Route path="/" element={<h1>Página do Cliente - Em breve!</h1>} />

      {/* Rota de Login Admin */}
      <Route 
        path="/admin" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Rotas Admin Protegidas com Layout */}
      <Route 
        path="/admin/*" 
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="configuracoes" element={<h2>Configurações - Em breve!</h2>} />
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </RouterRoutes>
  );
}

export default Routes;