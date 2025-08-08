import React from 'react';
import { useEffect, useState } from 'react';
import { Truck, DollarSign, CheckCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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

interface DashboardItem {
  id: string;
  type: 'stat' | 'chart';
  component: React.ReactNode;
}

const Dashboard = () => {
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);

  useEffect(() => {
    fetchAcceptedQuotes();
  }, []);

  useEffect(() => {
    // Initialize dashboard items after data is loaded
    if (!chartLoading) {
      initializeDashboardItems();
    }
  }, [chartLoading, acceptedQuotes]);

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
      setChartLoading(false);
    }
  };

  const initializeDashboardItems = () => {
    const items: DashboardItem[] = [
      {
        id: 'stats',
        type: 'stat',
        component: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Cotizaciones Aceptadas"
              value={acceptedQuotes.length.toString()}
              icon={<CheckCircle className="text-green-600" size={24} />}
              description="Total histórico"
            />
            <StatCard
              title="Ingresos Totales"
              value={`$${acceptedQuotes.reduce((sum, quote) => sum + (quote.Oferta || 0), 0).toLocaleString()}`}
              icon={<DollarSign className="text-purple-600" size={24} />}
              description="De cotizaciones aceptadas"
            />
          </div>
        )
      },
      {
        id: 'chart',
        type: 'chart',
        component: (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-700 mb-4">Cotizaciones Aceptadas por Mes</h3>
            <div className="h-96">
              {acceptedQuotes.length > 0 ? (
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
        )
      }
    ];

    setDashboardItems(items);
  };

  // Preparar datos para el gráfico
  const prepareChartData = () => {
    if (acceptedQuotes.length === 0) {
      return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          {
            label: 'Cantidad de Cotizaciones',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y',
          },
          {
            label: 'Ingresos Totales ($)',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y1',
          }
        ]
      };
    }

    // Agrupar cotizaciones por mes
    const monthlyData: { [key: number]: { count: number; total: number } } = {};
    
    acceptedQuotes.forEach((quote) => {
      const date = new Date(quote.Fecha);
      const month = date.getMonth(); // 0-11
      
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, total: 0 };
      }
      
      monthlyData[month].count += 1;
      monthlyData[month].total += quote.Oferta || 0;
    });

    // Crear arrays de 12 meses con los datos
    const monthlyCounts = [];
    const monthlyTotals = [];
    for (let i = 0; i < 12; i++) {
      monthlyCounts.push(monthlyData[i]?.count || 0);
      monthlyTotals.push(monthlyData[i]?.total || 0);
    }

    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Cantidad de Cotizaciones',
          data: monthlyCounts,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'Ingresos Totales ($)',
          data: monthlyTotals,
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(dashboardItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardItems(items);
  };

  if (chartLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Dashboard Operativo</h1>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {dashboardItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'transform rotate-2 shadow-2xl scale-105' 
                          : 'hover:shadow-lg'
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                      }}
                    >
                      <div className={`relative ${
                        snapshot.isDragging 
                          ? 'bg-blue-50 border-2 border-blue-300 rounded-lg' 
                          : ''
                      }`}>
                        {/* Drag indicator */}
                        <div className={`absolute top-2 right-2 opacity-0 transition-opacity ${
                          snapshot.isDragging ? 'opacity-100' : 'group-hover:opacity-100'
                        }`}>
                          <div className="flex flex-col space-y-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="group">
                          {item.component}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Dashboard;