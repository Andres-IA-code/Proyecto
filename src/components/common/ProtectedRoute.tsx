import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('dador' | 'operador' | 'broker')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && usuario.Rol_Operativo && !allowedRoles.includes(usuario.Rol_Operativo)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
