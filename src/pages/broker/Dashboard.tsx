import React from 'react';
import { BarChart2, Users, Truck, ShoppingBag, TrendingUp, Star } from 'lucide-react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Ejecutivo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Volumen Procesado"
          value="1,250 tn"
          icon={<TrendingUp className="text-blue-600\" size={24} />}
          description="+12% vs mes anterior"
        />
        <StatCard
          title="Margen Promedio"
          value="18.5%"
          icon={<BarChart2 className="text-green-600\" size={24} />}
          description="Meta: 15%"
        />
        <StatCard
          title="Satisfacción Cliente"
          value="4.8/5"
          icon={<Star className="text-yellow-500\" size={24} />}
          description="Basado en 230 operaciones"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tendencias del Mercado">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            Gráfico de tendencias del mercado
          </div>
        </ChartCard>
        <ChartCard title="Análisis de Rentabilidad">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            Gráfico de análisis de rentabilidad
          </div>
        </ChartCard>
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
                  Ruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">#OP1234</td>
                <td className="px-6 py-4 whitespace-nowrap">Empresa A</td>
                <td className="px-6 py-4 whitespace-nowrap">CDMX - MTY</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    En Tránsito
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">22%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;