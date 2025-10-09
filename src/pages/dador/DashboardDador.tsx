import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { Package, FileText, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardDador() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    totalEnvios: 0,
    enCotizacion: 0,
    enProgreso: 0,
    completados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario) {
      loadStats();
    }
  }, [usuario]);

  const loadStats = async () => {
    try {
      const { data: envios } = await supabase
        .from('General')
        .select('Estado')
        .eq('id_Usuario', usuario?.id_Usuario);

      if (envios) {
        setStats({
          totalEnvios: envios.length,
          enCotizacion: envios.filter(e => e.Estado === 'Solicitado').length,
          enProgreso: envios.filter(e => e.Estado === 'En Progreso').length,
          completados: envios.filter(e => e.Estado === 'Completado').length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Bienvenido, {usuario?.Nombre}
        </h1>
        <p className="text-slate-600 mt-2">Panel de Control - Dador de Carga</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Envíos</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalEnvios}</p>
            </div>
            <Package className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Solicitados</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.enCotizacion}</p>
            </div>
            <FileText className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">En Progreso</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.enProgreso}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completados</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completados}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/envios/nuevo"
            className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
          >
            <Package className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-slate-800">Crear Nuevo Envío</h3>
            <p className="text-sm text-slate-600 mt-1">Publica una nueva carga para cotizar</p>
          </Link>

          <Link
            to="/cotizaciones"
            className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
          >
            <FileText className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-slate-800">Ver Cotizaciones</h3>
            <p className="text-sm text-slate-600 mt-1">Revisa las ofertas recibidas</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
