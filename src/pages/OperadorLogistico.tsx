import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Truck, Package, DollarSign, MapPin, Users, BarChart, Settings, MessageSquare, FileText, Bell, Star, Droplet, Calculator, FileCheck, Clock, BarChart as ChartBar, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserData {
  id_Usuario: number;
  Nombre: string;
  Apellido?: string;
  Tipo_Persona?: string;
  Rol_Operativo?: string;
  Correo?: string;
}

const OperadorLogistico: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user session from localStorage
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        console.error('No user session found');
        setLoading(false);
        return;
      }

      const session = JSON.parse(sessionData);
      const userId = session.user?.id;

      if (!userId) {
        console.error('No user ID found in session');
        setLoading(false);
        return;
      }

      // Fetch user data from Usuarios table
      const { data, error } = await supabase
        .from('Usuarios')
        .select('id_Usuario, Nombre, Apellido, Tipo_Persona, Rol_Operativo, Correo')
        .eq('id_Usuario', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    setSelectedSection(path);
    navigate(`/operador/${path === 'dashboard' ? '' : path}`);
  };

  const handleLogout = () => {
    try {
      // Clear session data from localStorage
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      console.log('Sesión cerrada exitosamente');
      
      // Redirect to landing page
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} bg-black text-white min-h-screen flex flex-col overflow-hidden`}>
          <div className="p-4">
            <h1 className="text-xl font-bold">Panel Operador</h1>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <button
              onClick={() => handleNavigation('dashboard')}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                selectedSection === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <BarChart size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleNavigation('oportunidades')}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                selectedSection === 'oportunidades' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Package size={20} />
              <span>Planificar Envío</span>
            </button>
            <button
              onClick={() => handleNavigation('cotizaciones')}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                selectedSection === 'cotizaciones' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Calculator size={20} />
              <span>Cotizaciones</span>
            </button>
            <button
              onClick={() => handleNavigation('viajes')}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                selectedSection === 'viajes' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Truck size={20} />
              <span>Gestión de Viajes</span>
            </button>
            <button
              onClick={() => handleNavigation('documentos')}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                selectedSection === 'documentos' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <FileCheck size={20} />
              <span>Gestión de Flota</span>
            </button>
            <button
              onClick={() => handleNavigation('configuracion')}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                selectedSection === 'configuracion' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <User size={20} />
              <span>Perfil</span>
            </button>
          </nav>
          
          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
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

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-0 top-[70%] transform -translate-y-1/2 bg-black text-white p-2 rounded-r-md hover:bg-gray-800 z-50 transition-all duration-300"
          style={{ left: sidebarOpen ? '256px' : '0px' }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OperadorLogistico;