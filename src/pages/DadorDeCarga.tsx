import React from 'react';
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
import ShipmentTable from '../components/ShipmentTable';
import { FileText, Truck, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for the shipments
const recentShipments = [
  {
    id: '#A0012',
    origin: 'CDMX',
    destination: 'Guadalajara',
    status: 'en-transito' as const,
    driver: {
      name: 'Mario L.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    date: '14/05/2025',
    scoring: 4.8,
  },
  {
    id: '#A0013',
    origin: 'Monterrey',
    destination: 'CDMX',
    status: 'entregado' as const,
    driver: {
      name: 'Lucía T.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    date: '13/05/2025',
    scoring: 4.5,
  },
  {
    id: '#A0014',
    origin: 'Puebla',
    destination: 'Querétaro',
    status: 'pendiente' as const,
    driver: {
      name: 'Oscar V.',
      avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    },
    date: '15/05/2025',
    scoring: 4.2,
  },
  {
    id: '#A0015',
    origin: 'Toluca',
    destination: 'León',
    status: 'en-transito' as const,
    driver: {
      name: 'Paty S.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    date: '16/05/2025',
    scoring: 4.9,
  },
];

const monthlyCargoData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Volumen de Carga (toneladas)',
      data: [120, 150, 180, 165, 190, 210, 200, 220, 195, 240, 230, 250],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
      borderRadius: 4,
    }
  ],
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
      text: 'Volumen de Carga Mensual',
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

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Envíos Solicitados" 
          value="45" 
          icon={<FileText size={24} className="text-emerald-600" />}
        />
        <StatCard 
          title="Envíos Activos" 
          value="18" 
          icon={<Truck size={24} className="text-amber-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cargo Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={monthlyCargoData} />
          </div>
        </div>

        {/* Cost per Kilometer Metric */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-[400px] flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4 inline-flex">
                <DollarSign size={32} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Costo Promedio por Kilómetro
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $2.45
              </div>
              <div className="text-sm text-gray-500 mb-4">
                MXN por km
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mes anterior:</span>
                    <span className="font-medium">$2.58</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Variación:</span>
                    <span className="font-medium text-green-600">-5.0%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Promedio anual:</span>
                    <span className="font-medium">$2.52</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Actualizado: Mayo 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <ShipmentTable shipments={recentShipments} />
    </div>
  );
};

export default Dashboard;