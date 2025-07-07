import React from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    
    // Dador de Carga routes
    if (path === '/app' || path === '/app/') {
      return { title: 'Dashboard Operativo', subtitle: 'Resumen de actividades' };
    } else if (path === '/app/quote-request') {
      return { title: 'Solicitar Viaje', subtitle: 'Crear nueva solicitud de transporte' };
    } else if (path === '/app/quotes') {
      return { title: 'Cotizaciones', subtitle: 'Gestionar cotizaciones recibidas' };
    } else if (path === '/app/tracking') {
      return { title: 'Seguimiento', subtitle: 'Rastrear envíos en tiempo real' };
    } else if (path === '/app/history') {
      return { title: 'Seguimientos', subtitle: 'Historial de envíos y facturas' };
    } else if (path === '/app/profile') {
      return { title: 'Perfil', subtitle: 'Gestionar información personal' };
    }
    
    // Operador Logístico routes
    else if (path === '/operador' || path === '/operador/') {
      return { title: 'Dashboard Operativo', subtitle: 'Panel de control del operador' };
    } else if (path === '/operador/oportunidades') {
      return { title: 'Planificar Envío', subtitle: 'Oportunidades de transporte disponibles' };
    } else if (path === '/operador/cotizaciones') {
      return { title: 'Cotizaciones', subtitle: 'Gestionar ofertas y propuestas' };
    } else if (path === '/operador/viajes') {
      return { title: 'Gestión de Viajes', subtitle: 'Administrar y monitorear viajes' };
    } else if (path === '/operador/documentos') {
      return { title: 'Gestión de Flota', subtitle: 'Gestión de vehículos y documentación' };
    } else if (path === '/operador/configuracion') {
      return { title: 'Perfil', subtitle: 'Configuración del operador logístico' };
    }
    
    // Broker Logístico routes
    else if (path === '/broker' || path === '/broker/') {
      return { title: 'Dashboard Ejecutivo', subtitle: 'Panel de control del broker' };
    } else if (path === '/broker/clientes') {
      return { title: 'Gestión de Clientes', subtitle: 'Administrar cartera de clientes' };
    } else if (path === '/broker/transportistas') {
      return { title: 'Transportistas', subtitle: 'Red de operadores logísticos' };
    } else if (path === '/broker/marketplace') {
      return { title: 'Marketplace', subtitle: 'Plataforma de intercambio comercial' };
    } else if (path === '/broker/operaciones') {
      return { title: 'Operaciones', subtitle: 'Gestión operativa integral' };
    } else if (path === '/broker/analytics') {
      return { title: 'Analytics', subtitle: 'Análisis y métricas de rendimiento' };
    } else if (path === '/broker/facturacion') {
      return { title: 'Facturación', subtitle: 'Gestión de facturación y pagos' };
    } else if (path === '/broker/configuracion') {
      return { title: 'Configuración', subtitle: 'Configuración del broker logístico' };
    }
    
    // Default fallback
    return { title: 'Dashboard', subtitle: 'Panel de control' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-4">
      </div>
    </header>
  );
};

export default Header;