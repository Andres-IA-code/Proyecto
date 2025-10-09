import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { usuario } = useAuth();

  if (!usuario || !usuario.Rol_Operativo) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={usuario.Rol_Operativo} />
      <div className="ml-64 flex-1">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
