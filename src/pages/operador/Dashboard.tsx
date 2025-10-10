import React from 'react';
import { Truck } from 'lucide-react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';

const Dashboard = () => {
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
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Rendimiento Operativo">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            Gráfico de rendimiento operativo
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