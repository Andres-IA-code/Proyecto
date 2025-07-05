import React from 'react';
import { BarChart2, TrendingUp, DollarSign, Users, Package, Clock } from 'lucide-react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';

const BrokerAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-gray-500 mt-1">Análisis y métricas de rendimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ingresos Mensuales"
          value="$245,680"
          icon={<DollarSign className="text-green-600\" size={24} />}
          description="+18% vs mes anterior"
        />
        <StatCard
          title="Volumen de Carga"
          value="1,250 tn"
          icon={<Package className="text-blue-600\" size={24} />}
          description="+12% vs mes anterior"
        />
        <StatCard
          title="Tiempo Promedio"
          value="24.5 hrs"
          icon={<Clock className="text-purple-600\" size={24} />}
          description="Tiempo de entrega"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tendencia de Ingresos">
          <div className="h-full flex items-center justify-center">
            <BarChart2 size={100} className="text-gray-300" />
          </div>
        </ChartCard>
        
        <ChartCard title="Distribución por Tipo de Carga">
          <div className="h-full flex items-center justify-center">
            <TrendingUp size={100} className="text-gray-300" />
          </div>
        </ChartCard>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Métricas de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Satisfacción del Cliente</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{ width: '92%' }}></div>
                </div>
              </div>
              <span className="ml-3 text-lg font-medium">92%</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Entregas a Tiempo</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: '88%' }}></div>
                </div>
              </div>
              <span className="ml-3 text-lg font-medium">88%</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Utilización de Flota</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-purple-500 rounded" style={{ width: '85%' }}></div>
                </div>
              </div>
              <span className="ml-3 text-lg font-medium">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Análisis Detallado</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Margen Operativo</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">24.5%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">22%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    +2.5%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TrendingUp size={16} className="text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Costo por Kilómetro</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">$1.85</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">$2.00</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    -7.5%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TrendingUp size={16} className="text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Tiempo de Respuesta</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">4.2 hrs</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">4.0 hrs</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    +5%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TrendingUp size={16} className="text-yellow-500 transform rotate-45" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrokerAnalytics;