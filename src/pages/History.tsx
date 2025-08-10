import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, RefreshCw, AlertCircle, Star } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface Cotizacion {
  id_Cotizaciones: number;
  id_Envio: number;
  Fecha: string;
  Estado: string;
  Oferta: number;
  Nombre_Operador: string;
  Nombre_Dador: string;
  // Datos del envío
  envio_origen?: string;
  envio_destino?: string;
}

const History: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Construir el nombre del dador según el tipo de persona
      const nombreDador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('Buscando cotizaciones para dador:', nombreDador);

      // Buscar todas las cotizaciones del usuario actual
      const { data, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select(`
          *,
          General!inner(
            Origen,
            Destino
          )
        `)
        .eq('Nombre_Dador', nombreDador)
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching cotizaciones:', fetchError);
        setError('Error al cargar las cotizaciones');
        return;
      }

      // Transformar los datos para facilitar el acceso
      const transformedData = (data || []).map(cotizacion => ({
        ...cotizacion,
        envio_origen: cotizacion.General?.Origen,
        envio_destino: cotizacion.General?.Destino,
      }));

      setCotizaciones(transformedData);
      console.log('Cotizaciones encontradas:', transformedData.length);
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aceptada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'aceptada':
        return 'Aceptada';
      case 'rechazada':
        return 'Cancelada';
      default:
        return status || 'Desconocido';
    }
  };

  const getSimplifiedLocation = (fullAddress: string | undefined): string => {
    if (!fullAddress) return 'No especificado';
    
    // Extract city/locality from the full address
    // Look for common patterns in addresses
    const parts = fullAddress.split(',').map(part => part.trim());
    
    // Try to find the city/locality (usually the last meaningful part before province/country)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      
      // Skip common suffixes
      if (part.toLowerCase().includes('provincia') || 
          part.toLowerCase().includes('argentina') ||
          part.toLowerCase().includes('méxico') ||
          part.toLowerCase().includes('chile') ||
          part.toLowerCase().includes('colombia')) {
        continue;
      }
      
      // Return the first meaningful location found
      if (part.length > 2) {
        return part;
      }
    }
    
    // Fallback: return the first part if no city found
    return parts[0] || fullAddress;
  };

  const prepareChartData = () => {
    // Group quotes by month
    const monthlyData: { [key: string]: { accepted: number; cancelled: number } } = {};
    
    // Initialize last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      months.push({ key: monthKey, label: monthLabel });
      monthlyData[monthKey] = { accepted: 0, cancelled: 0 };
    }

    // Count quotes by month and status
    cotizaciones.forEach(cotizacion => {
      const date = new Date(cotizacion.Fecha);
      const monthKey = date.toISOString().slice(0, 7);
      
      if (monthlyData[monthKey]) {
        if (cotizacion.Estado?.toLowerCase() === 'aceptada') {
          monthlyData[monthKey].accepted++;
        } else if (cotizacion.Estado?.toLowerCase() === 'rechazada') {
          monthlyData[monthKey].cancelled++;
        }
      }
    });

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Envíos Aceptados',
          data: months.map(m => monthlyData[m.key].accepted),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Envíos Cancelados',
          data: months.map(m => monthlyData[m.key].cancelled),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Tendencia de Envíos - Últimos 12 Meses',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#374151',
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Envíos',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Período',
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    if (filterStatus === 'all') return true;
    return cotizacion.Estado?.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial de cotizaciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle size={64} className="mx-auto text-red-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el historial</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchCotizaciones}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Envíos</h1>
      </div>

      {/* Line Chart Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="h-[400px]">
          {cotizaciones.length > 0 ? (
            <Line options={chartOptions} data={prepareChartData()} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
                <p className="text-gray-400 text-sm mt-1">
                  Cuando tengas más cotizaciones, la tendencia aparecerá aquí
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          {filteredCotizaciones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Envío
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operador Logístico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.id_Cotizaciones} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        #{cotizacion.id_Envio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {getSimplifiedLocation(cotizacion.envio_origen)} → {getSimplifiedLocation(cotizacion.envio_destino)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(cotizacion.Fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {cotizacion.Nombre_Operador || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(cotizacion.Estado)}`}>
                          {getStatusLabel(cotizacion.Estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        ${cotizacion.Oferta?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
                <Calendar size={36} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay cotizaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterStatus === 'all' 
                  ? 'No se han generado cotizaciones aún.'
                  : `No hay cotizaciones con estado "${getStatusLabel(filterStatus)}".`
                }
              </p>
            </div>
          )}

          <div className="p-6 bg-gray-50 border-t space-y-4">
            {/* Chart Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Envíos Aceptados</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {cotizaciones.filter(c => c.Estado?.toLowerCase() === 'aceptada').length}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Envíos Cancelados</span>
                </div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {cotizaciones.filter(c => c.Estado?.toLowerCase() === 'rechazada').length}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Total de Envíos</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {cotizaciones.length}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 text-center border-t pt-4">
              Mostrando {filteredCotizaciones.length} de {cotizaciones.length} cotizaciones en la tabla
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;