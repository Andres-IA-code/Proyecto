import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`fixed top-0 left-0 h-full transition-all duration-500 ease-in-out ${
            sidebarOpen ? 'w-60' : 'w-0'
          } bg-[#0F172A] text-white flex flex-col overflow-hidden z-50`}
        >
          <Sidebar />
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-[70%] transform -translate-y-1/2 bg-black text-white p-2 rounded-r-md hover:bg-gray-800 z-[100] transition-all duration-500 ease-in-out"
          style={{ left: sidebarOpen ? '240px' : '0px' }}
          aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-60' : 'ml-0'} transition-all duration-500 ease-in-out`}>
          <Header />
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;