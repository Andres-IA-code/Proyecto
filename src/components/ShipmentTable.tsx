import React from 'react';
import { MoreVertical, Mail, Star } from 'lucide-react';

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'solicitado' | 'cotizado' | 'activo' | 'fin';
  driver: {
    name: string;
    avatar: string;
  };
  date: string;
  scoring?: number;
}

interface ShipmentTableProps {
  shipments: Shipment[];
  title?: string;
  showViewAll?: boolean;
}

const statusStyles = {
  'solicitado': 'bg-blue-100 text-blue-800',
  'cotizado': 'bg-yellow-100 text-yellow-800',
  'activo': 'bg-green-100 text-green-800',
  'fin': 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  'solicitado': 'Solicitados',
  'cotizado': 'Cotizado',
  'activo': 'Activo',
  'fin': 'Fin',
};

const ShipmentTable: React.FC<ShipmentTableProps> = ({ 
  shipments, 
  title = "Envíos recientes", 
  showViewAll = true 
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">ID Envío</th>
              <th className="px-6 py-3">Origen</th>
              <th className="px-6 py-3">Destino</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Scoring</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {shipment.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {shipment.origin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {shipment.destination}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      statusStyles[shipment.status]
                    }`}
                  >
                    {statusLabels[shipment.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {shipment.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {shipment.scoring !== undefined ? (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{shipment.scoring.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShipmentTable;