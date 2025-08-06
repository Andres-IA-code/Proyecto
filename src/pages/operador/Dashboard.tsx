import React from 'react';
import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { supabase, getCurrentUser } from '../../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface AcceptedQuote {
  id_Cotizaciones: number;
  id_Envio: number;
  Fecha: string;
  Oferta: number;
  Nombre_Operador: string;
}

const Dashboard = () => {
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedQuotes();
  }, []);

  const fetchAcceptedQuotes = async () => {
    try {
      setChartLoading(true);
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }

      // Construir el nombre del operador según el tipo de persona
      const nombreOperador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('Buscando cotizaciones aceptadas para operador:', nombreOperador);

      // Buscar cotizaciones aceptadas del operador actual
      const { data, error } = await supabase
        .from('Cotizaciones')
        .select('id_Cotizaciones, id_Envio, Fecha, Oferta, Nombre_Operador')
        .eq('Nombre_Operador', nombreOperador)
        .eq('Estado', 'Aceptada')
        .order('Fecha', { ascending: true });

      if (error) {
        console.error('Error fetching accepted quotes:', error);
        return;
      }

      setAcceptedQuotes(data || []);
      console.log('Cotizaciones aceptadas encontradas:', data?.length || 0);
      
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setChartLoading(false);
    }
  };

  // Preparar datos para el gráfico
  const prepareChartData = () => {
    if (acceptedQuotes.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cotizaciones Aceptadas',
          data: [0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      };
    }

    // Agrupar cotizaciones por mes
    const monthlyData: { [key: string]: { count: number; total: number } } = {};
    
    acceptedQuotes.forEach(quote => {
      const date = new Date(quote.Fecha);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthLabel]) {
        monthlyData[monthLabel] = { count: 0, total: 0 };
      }
      
      monthlyData[monthLabel].count += 1;
      monthlyData[monthLabel].total += quote.Oferta || 0;
    });

    const labels = Object.keys(monthlyData);
    const counts = Object.values(monthlyData).map(data => data.count);
    const totals = Object.values(monthlyData).map(data => data.total);

    return {
      labels,
      datasets: [
        {
          label: 'Cantidad de Cotizaciones',
          data: counts,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'Ingresos Totales ($)',
          data: totals,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y1',
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Cotizaciones Aceptadas por Mes',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#374151',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Cantidad',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Ingresos ($)',
          font: {
            size: 12,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Dashboard Operativo</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <StatCard
          title="Flota Activa"
          value="42"
          icon={<Truck className="text-blue-600\" size={24} />}
          description="85% de utilización"
        />
        <StatCard
          title="Cotizaciones Aceptadas"
          value={acceptedQuotes.length.toString()}
          icon={<Truck className="text-green-600\" size={24} />}
          description="Total histórico"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${acceptedQuotes.reduce((sum, quote) => sum + (quote.Oferta || 0), 0).toLocaleString()}`}
          icon={<Truck className="text-purple-600\" size={24} />}
          description="De cotizaciones aceptadas"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-700 mb-4">Cotizaciones Aceptadas</h3>
          <div className="h-96">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Cargando datos...</p>
                </div>
              </div>
            ) : acceptedQuotes.length > 0 ? (
              <Bar options={chartOptions} data={prepareChartData()} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No hay cotizaciones aceptadas aún</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Cuando tengas cotizaciones aceptadas, aparecerán en este gráfico
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Operaciones Activas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Operación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">OP-2025-001</td>
                <td className="px-6 py-4 whitespace-nowrap">Empresa A</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">75%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;