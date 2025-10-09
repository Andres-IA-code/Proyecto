import React from 'react';
import { Truck, Package, FileText, Clock } from 'lucide-react';

const BrokerOperaciones = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Operaciones</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Envíos Activos</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Entregas Hoy</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Documentos Pendientes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Tiempo Promedio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">2.5 días</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Operaciones en Curso</h2>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-3">ID Operación</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Origen</th>
                <th className="pb-3">Destino</th>
                <th className="pb-3">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t">
                <td className="py-3">#OP-2024-001</td>
                <td className="py-3">Empresa A</td>
                <td className="py-3">Buenos Aires</td>
                <td className="py-3">Córdoba</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">En Tránsito</span>
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-3">#OP-2024-002</td>
                <td className="py-3">Empresa B</td>
                <td className="py-3">Rosario</td>
                <td className="py-3">Mendoza</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Cargando</span>
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-3">#OP-2024-003</td>
                <td className="py-3">Empresa C</td>
                <td className="py-3">La Plata</td>
                <td className="py-3">Tucumán</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pendiente</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrokerOperaciones;