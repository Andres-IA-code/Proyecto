import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, MoreVertical, Building, Phone, Mail, 
  MapPin, TrendingUp, Package, DollarSign, Star 
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  type: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  address: string;
  activeShipments: number;
  totalShipments: number;
  revenue: number;
  rating: number;
  status: 'active' | 'inactive';
  lastActivity: string;
}

const mockClients: Client[] = [
  {
    id: 'C001',
    name: 'Distribuidora Nacional S.A.',
    type: 'Mayorista',
    contact: {
      name: 'Juan Pérez',
      phone: '+52 55 1234 5678',
      email: 'juan.perez@distribuidora.com',
    },
    address: 'Av. Insurgentes Sur 1602, CDMX',
    activeShipments: 5,
    totalShipments: 128,
    revenue: 450000.00,
    rating: 4.8,
    status: 'active',
    lastActivity: '2025-05-14',
  },
  {
    id: 'C002',
    name: 'Importadora del Pacífico',
    type: 'Importador',
    contact: {
      name: 'María González',
      phone: '+52 33 8765 4321',
      email: 'maria.g@importadora.com',
    },
    address: 'Av. Vallarta 3233, Guadalajara',
    activeShipments: 3,
    totalShipments: 85,
    revenue: 280000.00,
    rating: 4.5,
    status: 'active',
    lastActivity: '2025-05-13',
  },
  {
    id: 'C003',
    name: 'Comercial del Norte',
    type: 'Distribuidor',
    contact: {
      name: 'Roberto Sánchez',
      phone: '+52 81 2345 6789',
      email: 'roberto.s@comercial.com',
    },
    address: 'Av. Constitución 2000, Monterrey',
    activeShipments: 0,
    totalShipments: 42,
    revenue: 150000.00,
    rating: 4.2,
    status: 'inactive',
    lastActivity: '2025-05-10',
  },
];

const BrokerClientes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
              <p className="text-gray-500 mt-1">Administra y monitorea tus clientes</p>
            </div>
            <button
              onClick={() => setShowClientModal(true)}
              className="mt-4 md:mt-0 px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 flex items-center text-xs"
            >
              <Plus size={16} className="mr-2" />
              Nuevo Cliente
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <div className="text-sm text-gray-500">Total Clientes</div>
                <div className="text-xl font-semibold">128</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <div className="text-sm text-gray-500">Clientes Activos</div>
                <div className="text-xl font-semibold">98</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <div className="text-sm text-gray-500">Envíos del Mes</div>
                <div className="text-xl font-semibold">456</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <div className="text-sm text-gray-500">Ingresos del Mes</div>
                <div className="text-xl font-semibold">$892K</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center text-xs">
            <Filter size={16} className="mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Envíos Activos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>{client.contact.name}</div>
                      <div className="text-gray-500">{client.contact.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{client.activeShipments}</div>
                      <div className="text-gray-500">de {client.totalShipments} totales</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">${client.revenue.toLocaleString()}</div>
                      <div className="text-gray-500">Acumulado</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1">{client.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className="text-gray-500">{selectedClient.type}</p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{selectedClient.contact.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{selectedClient.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{selectedClient.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{selectedClient.address}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Envíos Activos:</span>
                      <span className="font-medium">{selectedClient.activeShipments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Envíos:</span>
                      <span className="font-medium">{selectedClient.totalShipments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ingresos Totales:</span>
                      <span className="font-medium">${selectedClient.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{selectedClient.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Acciones Rápidas</h3>
                <div className="flex space-x-3">
                  <button className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 text-xs">
                    Ver Envíos
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-xs">
                    Editar Cliente
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-xs">
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerClientes;