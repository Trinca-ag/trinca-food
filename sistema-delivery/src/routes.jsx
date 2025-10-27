import { Routes as RouterRoutes, Route } from 'react-router-dom';

function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<h1>Página do Cliente - Em breve!</h1>} />
      <Route path="/admin/*" element={<h1>Área Admin - Em breve!</h1>} />
    </RouterRoutes>
  );
}

export default Routes;