import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Truck, Package, Map, History, User, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Inicio', path: '/app', icon: <Home size={20} /> },
    { name: 'Solicitar Envío', path: '/app/quote-request', icon: <Truck size={20} /> },
    { name: 'Cotizaciones', path: '/app/quotes', icon: <Package size={20} /> },
    { name: 'Seguimiento', path: '/app/tracking', icon: <Map size={20} /> },
    { name: 'Historial', path: '/app/history', icon: <History size={20} /> },
    { name: 'Perfil', path: '/app/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="bg-[#0F172A] text-white w-60 flex-shrink-0 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Panel Dador</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 ${
                    isActive ? 'bg-white text-[#0F172A]' : 'hover:bg-white/10'
                  } transition-colors`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-3">
            <p className="font-medium">Juan Gómez</p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
        <button className="mt-4 flex items-center text-gray-300 hover:text-white transition-colors">
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;