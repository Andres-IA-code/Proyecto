import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Truck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Users,
  Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  userRole: 'dador' | 'operador' | 'broker';
}

export function Sidebar({ userRole }: SidebarProps) {
  const { signOut } = useAuth();

  const dadorLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/envios', icon: Package, label: 'Mis Envíos' },
    { to: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
    { to: '/perfil', icon: Settings, label: 'Perfil' },
  ];

  const operadorLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/marketplace', icon: Package, label: 'Marketplace' },
    { to: '/mis-cotizaciones', icon: FileText, label: 'Mis Cotizaciones' },
    { to: '/flota', icon: Truck, label: 'Mi Flota' },
    { to: '/perfil', icon: Settings, label: 'Perfil' },
  ];

  const brokerLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/marketplace', icon: Package, label: 'Marketplace' },
    { to: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
    { to: '/operadores', icon: Users, label: 'Operadores' },
    { to: '/perfil', icon: Settings, label: 'Perfil' },
  ];

  const links = userRole === 'dador' ? dadorLinks : userRole === 'operador' ? operadorLinks : brokerLinks;

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Truck className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold">ShipConnect</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
