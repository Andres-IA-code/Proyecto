import React from 'react';
import { useEffect, useState } from 'react';
import { Truck, DollarSign, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  // Datos del envío desde la tabla General
  envio_peso?: string;
}

const Dashboard = () => {
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedQuotes();
  }, []);

  const fetchAcceptedQuotes = async () => {
    try {
      setLoading(true);
      
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
        .select(`
          id_Cotizaciones,
          id_Envio,
          Fecha,
          Oferta,
          Nombre_Operador,
          General!inner(
            Peso
          )
        `)
        .eq('Nombre_Operador', nombreOperador)
        .eq('Estado', 'Aceptada')
        .order('Fecha', { ascending: true });

      if (error) {
        console.error('Error fetching accepted quotes:', error);
        return;
      }

      // Transformar los datos para facilitar el acceso
      const transformedData = (data || []).map(quote => ({
        ...quote,
        envio_peso: quote.General?.Peso,
      }));

      setAcceptedQuotes(transformedData);
      console.log('Cotizaciones aceptadas encontradas:', transformedData.length);
      
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para el gráfico basado en cotizaciones aceptadas
  const prepareChartData = () => {
    if (acceptedQuotes.length === 0) {
      return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'Volumen de Carga (toneladas)',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      };
    }

    // Agrupar cotizaciones por mes y sumar el peso
    const monthlyData: { [key: number]: number } = {};
    
    acceptedQuotes.forEach(quote => {
      const date = new Date(quote.Fecha);
      const month = date.getMonth(); // 0-11
      const peso = parseFloat(quote.envio_peso || '0');
      
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      
      monthlyData[month] += peso;
    });

    // Crear array de 12 meses con los datos
    const monthlyVolumes = [];
    for (let i = 0; i < 12; i++) {
      monthlyVolumes.push(monthlyData[i] || 0);
    }

    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Volumen de Carga (toneladas)',
        data: monthlyVolumes,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Toneladas',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const calculateTotalVolume = () => {
    return acceptedQuotes.reduce((total, quote) => {
      const peso = parseFloat(quote.envio_peso || '0');
      return total + peso;
    }, 0);
  };

  const calculateTotalRevenue = () => {
    return acceptedQuotes.reduce((total, quote) => {
      return total + (quote.Oferta || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando datos del dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Operativo</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cotizaciones Aceptadas */}
        <div className="bg-white rounded-lg shadow p-6 flex items-start">
          <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="font-bold text-2xl">{acceptedQuotes.length}</div>
            <div className="text-gray-500 text-sm">Cotizaciones Aceptadas</div>
            <div className="text-xs text-gray-400 mt-1">Total histórico</div>
          </div>
        </div>

        {/* Ingresos Totales */}
        <div className="bg-white rounded-lg shadow p-6 flex items-start">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="font-bold text-2xl">${calculateTotalRevenue().toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Ingresos Totales</div>
            <div className="text-xs text-gray-400 mt-1">De cotizaciones aceptadas</div>
          </div>
        </div>

        {/* Volumen Total Transportado */}
        <div className="bg-white rounded-lg shadow p-6 flex items-start">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
            <Truck size={24} />
          </div>
          <div>
            <div className="font-bold text-2xl">{calculateTotalVolume().toFixed(1)} Tn</div>
            <div className="text-gray-500 text-sm">Volumen Total Transportado</div>
            <div className="text-xs text-gray-400 mt-1">Carga total transportada</div>
          </div>
        </div>
      </div>

      {/* Monthly Cargo Volume Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-700 mb-4">Volumen de Carga Mensual (Cotizaciones Aceptadas)</h3>
        <div className="h-96">
          {acceptedQuotes.length > 0 ? (
            <Bar options={chartOptions} data={prepareChartData()} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay cotizaciones aceptadas aún</p>
                <p className="text-gray-400 text-sm mt-1">
                  Cuando tengas cotizaciones aceptadas, el volumen aparecerá en este gráfico
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;