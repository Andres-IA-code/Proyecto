import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Truck, Package, History, User, LogOut } from 'lucide-react';
import { supabase, getCurrentUser, signOut } from '../lib/supabase';

interface UserData {
  id_Usuario: number;
  Nombre: string;
  Apellido?: string;
  Tipo_Persona?: string;
  Rol_Operativo?: string;
  Correo?: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get current user from Supabase Auth
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('Current user loaded:', currentUser);
      setUserData(currentUser.profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Iniciando cierre de sesión...');
      
      // Sign out from Supabase Auth
      await signOut();
      
      // Clear session data from localStorage
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Clear any profile images stored locally
      if (userData?.id_Usuario) {
        localStorage.removeItem(`profileImage_${userData.id_Usuario}`);
      }
      
      console.log('Sesión cerrada exitosamente');
      
      // Redirect to landing page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Even if there's an error, still redirect to landing page
      navigate('/', { replace: true });
    }
  };

  const getDisplayName = () => {
    if (!userData) return 'Usuario';
    
    if (userData.Tipo_Persona === 'Física') {
      return `${userData.Nombre} ${userData.Apellido || ''}`.trim();
    } else {
      return userData.Nombre; // Business name for juridical persons
    }
  };

  const getDisplayRole = () => {
    if (!userData || !userData.Rol_Operativo) return 'Usuario';
    
    // Convert role to display format
    const roles = userData.Rol_Operativo.toLowerCase().split(', ');
    
    if (roles.includes('dador')) {
      return 'Dador de Carga';
    } else if (roles.includes('operador')) {
      return 'Operador Logístico';
    } else if (roles.includes('broker')) {
      return 'Broker Logístico';
    }
    
    return userData.Rol_Operativo;
  };

  const getInitials = () => {
    if (!userData) return 'U';
    
    if (userData.Tipo_Persona === 'Física') {
      const firstName = userData.Nombre?.charAt(0) || '';
      const lastName = userData.Apellido?.charAt(0) || '';
      return (firstName + lastName).toUpperCase();
    } else {
      return userData.Nombre?.charAt(0)?.toUpperCase() || 'E';
    }
  };

  const navItems = [
    { name: 'Inicio', path: '/app', icon: <Home size={20} /> },
    { name: 'Solicitar Viaje', path: '/app/quote-request', icon: <Truck size={20} /> },
    { name: 'Cotizaciones', path: '/app/quotes', icon: <Package size={20} /> },
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
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
            {userData?.Correo ? (
              <span className="text-white text-sm font-bold">
                {getInitials()}
              </span>
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            {loading ? (
              <div>
                <div className="h-4 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <div>
                <p className="font-medium text-sm truncate" title={getDisplayName()}>
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-400 truncate" title={getDisplayRole()}>
                  {getDisplayRole()}
                </p>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 flex items-center text-gray-300 hover:text-white transition-colors w-full"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;