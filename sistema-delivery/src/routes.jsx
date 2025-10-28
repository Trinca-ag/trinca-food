import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loading } from './components/Loading';

// Páginas Admin
import { Login } from './pages/admin/Login';
import { Pedidos } from './pages/admin/Pedidos';

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

      {/* Rotas Admin */}
      <Route 
        path="/admin" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      <Route 
        path="/admin/pedidos" 
        element={
          <PrivateRoute>
            <Pedidos />
          </PrivateRoute>
        } 
      />

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </RouterRoutes>
  );
}

export default Routes;