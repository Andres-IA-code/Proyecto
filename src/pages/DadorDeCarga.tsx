import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import { CheckCircle, Truck, DollarSign } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AcceptedQuote {
  id_Cotizaciones: number;
  id_Envio: number;
  Fecha: string;
  Oferta: number;
  Nombre_Operador: string;
  Nombre_Dador: string;
  // Datos del envío desde la tabla General
  envio_peso?: string;
}

const Dashboard: React.FC = () => {
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAcceptedQuotes();
  }, []);

  const fetchAcceptedQuotes = async () => {
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

      console.log('Buscando cotizaciones aceptadas para dador:', nombreDador);

      // Buscar cotizaciones aceptadas del usuario actual
      const { data, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select(`
          *,
          General!inner(
            Peso
          )
        `)
        .eq('Nombre_Dador', nombreDador)
        .eq('Estado', 'Aceptada')
        .order('Fecha', { ascending: true });

      if (fetchError) {
        console.error('Error fetching accepted quotes:', fetchError);
        setError('Error al cargar las cotizaciones aceptadas');
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
      setError('Error inesperado al cargar las cotizaciones');
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
        display: true,
        text: 'Volumen de Carga Mensual (Cotizaciones Aceptadas)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#374151',
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
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos del dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Cotizaciones Aceptadas" 
          value={acceptedQuotes.length.toString()} 
          icon={<CheckCircle size={24} className="text-green-600" />}
          description="Total de viajes confirmados"
        />
        <StatCard 
          title="Volumen Total Transportado" 
          value={`${calculateTotalVolume().toFixed(1)} Tn`} 
          icon={<Truck size={24} className="text-blue-600" />}
          description="Carga total de cotizaciones aceptadas"
        />
        <StatCard 
          title="Inversión Total" 
          value={`$${calculateTotalRevenue().toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-purple-600" />}
          description="Monto total de cotizaciones aceptadas"
        />
      </div>

      {/* Monthly Cargo Volume Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-[400px]">
          {acceptedQuotes.length > 0 ? (
            <Bar options={chartOptions} data={prepareChartData()} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay cotizaciones aceptadas aún</p>
                <p className="text-gray-400 text-sm mt-1">
                  Cuando tengas cotizaciones aceptadas, el volumen de carga aparecerá en este gráfico
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