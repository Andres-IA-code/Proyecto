import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { Truck, FileText, DollarSign, MapPin } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export function OperadorDashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    cotizacionesEnviadas: 0,
    cotizacionesAceptadas: 0,
    ingresosEstimados: 0,
    vehiculosActivos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario) {
      loadStats();
    }
  }, [usuario]);

  const loadStats = async () => {
    try {
      const { data: cotizaciones } = await supabase
        .from('Cotizaciones')
        .select('Estado, Oferta')
        .eq('id_Operador', usuario?.id_Usuario);

      const { data: flota } = await supabase
        .from('Flota')
        .select('id_Flota')
        .eq('id_Usuario', usuario?.id_Usuario);

      if (cotizaciones) {
        const aceptadas = cotizaciones.filter(c => c.Estado === 'Aceptada');
        const ingresos = aceptadas.reduce((sum, c) => sum + (Number(c.Oferta) || 0), 0);

        setStats({
          cotizacionesEnviadas: cotizaciones.length,
          cotizacionesAceptadas: aceptadas.length,
          ingresosEstimados: ingresos,
          vehiculosActivos: flota?.length || 0,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {usuario?.Nombre}
        </h1>
        <p className="text-gray-600 mt-2">Panel de Control - Operador Logístico</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cotizaciones Enviadas"
          value={stats.cotizacionesEnviadas.toString()}
          icon={<FileText size={24} className="text-blue-600" />}
        />
        <StatCard
          title="Cotizaciones Aceptadas"
          value={stats.cotizacionesAceptadas.toString()}
          icon={<MapPin size={24} className="text-green-600" />}
        />
        <StatCard
          title="Ingresos Estimados"
          value={`$${stats.ingresosEstimados.toLocaleString()}`}
          icon={<DollarSign size={24} className="text-emerald-600" />}
        />
        <StatCard
          title="Vehículos Activos"
          value={stats.vehiculosActivos.toString()}
          icon={<Truck size={24} className="text-indigo-600" />}
        />
      </div>
    </div>
  );
}
