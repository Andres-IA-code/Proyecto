import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { DashboardDador } from './pages/dador/DashboardDador';
import { OperadorDashboard } from './pages/operador/Dashboard';
import { OperadorOportunidades } from './pages/operador/Oportunidades';

function AppRoutes() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const getDashboard = () => {
    if (!usuario) return <Navigate to="/login" replace />;

    if (usuario.Rol_Operativo === 'operador') {
      return <OperadorDashboard />;
    }

    return <DashboardDador />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>{getDashboard()}</Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute allowedRoles={['operador', 'broker']}>
            <Layout><OperadorOportunidades /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
