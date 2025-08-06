import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, Calendar, FileText, ChevronDown, Star } from 'lucide-react';

const shipmentHistory = [
  {
    id: '#A0010',
    origin: 'CDMX',
    destination: 'Monterrey',
    date: '10/05/2025',
    status: 'entregado',
    cost: 6200.50,
    transporter: 'Express Logistics',
    rating: 5,
  },
  {
    id: '#A0009',
    origin: 'Guadalajara',
    destination: 'CDMX',
    date: '05/05/2025',
    status: 'entregado',
    cost: 4800.00,
    transporter: 'TransportesMex S.A.',
    rating: 4,
  },
  {
    id: '#A0008',
    origin: 'CDMX',
    destination: 'Puebla',
    date: '28/04/2025',
    status: 'entregado',
    cost: 2500.75,
    transporter: 'Rápido Envíos',
    rating: 3,
  },
  {
    id: '#A0007',
    origin: 'Monterrey',
    destination: 'Guadalajara',
    date: '20/04/2025',
    status: 'cancelado',
    cost: 5100.00,
    transporter: 'Express Logistics',
    rating: null,
  },
  {
    id: '#A0006',
    origin: 'CDMX',
    destination: 'Querétaro',
    date: '15/04/2025',
    status: 'entregado',
    cost: 1950.25,
    transporter: 'TransportesMex S.A.',
    rating: 5,
  },
];

const statusStyles = {
  'entregado': 'bg-green-100 text-green-800',
  'cancelado': 'bg-red-100 text-red-800',
};

const statusLabels = {
  'entregado': 'Entregado',
  'cancelado': 'Cancelado',
};

const History: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [selectedTab, setSelectedTab] = useState('shipments');

  const handleViewDetails = (shipmentId: string) => {
    navigate('/app/tracking');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Calendar size={14} className="mr-2" />
                Período
                <ChevronDown size={14} className="ml-2" />
              </button>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter size={14} className="mr-2" />
                Filtrar
              </button>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Download size={14} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="border-b">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                selectedTab === 'shipments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('shipments')}
            >
              Envíos
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                selectedTab === 'invoices'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('invoices')}
            >
              Facturas
            </button>
          </div>
        </div>

        {selectedTab === 'shipments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Envío
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transportista
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipmentHistory.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {shipment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {shipment.origin} → {shipment.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {shipment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {shipment.transporter}
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
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      ${shipment.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shipment.rating !== null ? (
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < shipment.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetails(shipment.id)}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Factura
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transportista
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    F-2025-042
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    10/05/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    Express Logistics
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    $6,200.50
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Pagada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-900 text-xs">
                      <FileText size={14} className="mr-1" />
                      Descargar PDF
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    F-2025-041
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    05/05/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    TransportesMex S.A.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    $4,800.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Pagada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-900 text-xs">
                      <FileText size={14} className="mr-1" />
                      Descargar PDF
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    F-2025-040
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    28/04/2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    Rápido Envíos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    $2,500.75
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Pagada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-900 text-xs">
                      <FileText size={14} className="mr-1" />
                      Descargar PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;