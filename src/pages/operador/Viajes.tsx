import React, { useState } from 'react';
import { Truck, Calendar, MapPin, Clock, Package, DollarSign, AlertCircle, Filter, ChevronDown } from 'lucide-react';

interface Trip {
  id: string;
  route: {
    origin: string;
    destination: string;
    distance: string;
  };
  schedule: {
    departure: string;
    arrival: string;
  };
  cargo: {
    type: string;
    weight: string;
    volume: string;
  };
  vehicle: {
    type: string;
    plate: string;
    driver: string;
  };
  status: 'programado' | 'en-curso' | 'completado' | 'cancelado';
  revenue: number;
}

const trips: Trip[] = [
  {
    id: 'V001',
    route: {
      origin: 'CDMX',
      destination: 'Guadalajara',
      distance: '550 km',
    },
    schedule: {
      departure: '15/05/2025 08:00',
      arrival: '15/05/2025 18:00',
    },
    cargo: {
      type: 'General',
      weight: '3.5 tn',
      volume: '12 m³',
    },
    vehicle: {
      type: 'Camión 3.5 tn',
      plate: 'ABC-123',
      driver: 'Juan Pérez',
    },
    status: 'programado',
    revenue: 12500.00,
  },
  {
    id: 'V002',
    route: {
      origin: 'Monterrey',
      destination: 'CDMX',
      distance: '900 km',
    },
    schedule: {
      departure: '16/05/2025 06:00',
      arrival: '16/05/2025 20:00',
    },
    cargo: {
      type: 'Refrigerado',
      weight: '2.8 tn',
      volume: '10 m³',
    },
    vehicle: {
      type: 'Camión Refrigerado',
      plate: 'XYZ-789',
      driver: 'María González',
    },
    status: 'en-curso',
    revenue: 18900.00,
  },
];

const statusStyles = {
  'programado': 'bg-blue-100 text-blue-800',
  'en-curso': 'bg-green-100 text-green-800',
  'completado': 'bg-gray-100 text-gray-800',
  'cancelado': 'bg-red-100 text-red-800',
};

const statusLabels = {
  'programado': 'Programado',
  'en-curso': 'En Curso',
  'completado': 'Completado',
  'cancelado': 'Cancelado',
};

const Viajes: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Gestión de Viajes</h1>
              <p className="text-gray-500 mt-1">Administra y monitorea todos los viajes</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filters and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Viajes Programados</div>
                  <div className="text-xl font-semibold">8</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">En Curso</div>
                  <div className="text-xl font-semibold">3</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Completados (Mes)</div>
                  <div className="text-xl font-semibold">45</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Cancelados (Mes)</div>
                  <div className="text-xl font-semibold">2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="programado">Programados</option>
                <option value="en-curso">En Curso</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Ordenar por Fecha</option>
                <option value="revenue">Ordenar por Ingreso</option>
                <option value="distance">Ordenar por Distancia</option>
              </select>
            </div>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 flex items-center text-xs">
              <Filter size={14} className="mr-2" />
              Más Filtros
              <ChevronDown size={14} className="ml-2" />
            </button>
          </div>

          {/* Trips Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID/Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo/Conductor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{trip.id}</div>
                      <div className="text-sm text-gray-500">
                        {trip.route.origin} → {trip.route.destination}
                      </div>
                      <div className="text-sm text-gray-500">{trip.route.distance}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-1" />
                          Salida: {trip.schedule.departure}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock size={16} className="text-gray-400 mr-1" />
                          Llegada: {trip.schedule.arrival}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{trip.cargo.type}</div>
                        <div className="text-gray-500">{trip.cargo.weight}</div>
                        <div className="text-gray-500">{trip.cargo.volume}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{trip.vehicle.type}</div>
                        <div className="text-gray-500">{trip.vehicle.plate}</div>
                        <div className="text-gray-500">{trip.vehicle.driver}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[trip.status]}`}>
                        {statusLabels[trip.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">${trip.revenue.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-900 text-xs">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viajes;