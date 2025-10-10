import React, { useState } from 'react';
import { Filter, ChevronDown, Star, User } from 'lucide-react';

interface Quote {
  id: string;
  transporterId: string;
  transporter: {
    name: string;
    rating: number;
    verified: boolean;
  };
  shipment: {
    origin: string;
    destination: string;
    distance: string;
    cargo: string;
    weight: string;
  };
  price: number;
  deliveryTime: string;
  createdAt: string;
  expiresAt: string;
}

const quotes: Quote[] = [
  {
    id: 'Q1001',
    transporterId: 'T001',
    transporter: {
      name: 'TransportesMex S.A.',
      rating: 4.8,
      verified: true,
    },
    shipment: {
      origin: 'CDMX',
      destination: 'Guadalajara',
      distance: '550 km',
      cargo: 'Carga General',
      weight: '1,200 kg',
    },
    price: 4850.00,
    deliveryTime: '24 horas',
    createdAt: '12/05/2025',
    expiresAt: '14/05/2025',
  },
  {
    id: 'Q1002',
    transporterId: 'T002',
    transporter: {
      name: 'Express Logistics',
      rating: 4.5,
      verified: true,
    },
    shipment: {
      origin: 'CDMX',
      destination: 'Guadalajara',
      distance: '550 km',
      cargo: 'Carga General',
      weight: '1,200 kg',
    },
    price: 5100.00,
    deliveryTime: '20 horas',
    createdAt: '12/05/2025',
    expiresAt: '14/05/2025',
  },
  {
    id: 'Q1003',
    transporterId: 'T003',
    transporter: {
      name: 'Rápido Envíos',
      rating: 4.2,
      verified: false,
    },
    shipment: {
      origin: 'CDMX',
      destination: 'Guadalajara',
      distance: '550 km',
      cargo: 'Carga General',
      weight: '1,200 kg',
    },
    price: 4500.00,
    deliveryTime: '28 horas',
    createdAt: '12/05/2025',
    expiresAt: '14/05/2025',
  },
];

const QuoteManagement: React.FC = () => {
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('price');

  const toggleQuoteSelection = (quoteId: string) => {
    if (selectedQuotes.includes(quoteId)) {
      setSelectedQuotes(selectedQuotes.filter(id => id !== quoteId));
    } else {
      setSelectedQuotes([...selectedQuotes, quoteId]);
    }
  };

  const isQuoteSelected = (quoteId: string) => selectedQuotes.includes(quoteId);

  const handleQuoteAction = (action: string, quoteId: string) => {
    console.log(`${action} quote ${quoteId}`);
    // Here you would implement the actual logic for each action
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Cotizaciones Recibidas</h1>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter size={16} className="mr-2" />
                Filtrar
                <ChevronDown size={16} className="ml-2" />
              </button>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="price">Ordenar por Precio</option>
                <option value="rating">Ordenar por Rating</option>
                <option value="deliveryTime">Ordenar por Tiempo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {quotes.map((quote) => (
            <div 
              key={quote.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                isQuoteSelected(quote.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                {/* Transporter Info */}
                <div className="p-4 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {quote.transporter.name}
                      {quote.transporter.verified && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star size={14} className="fill-current" />
                      <span className="ml-1">{quote.transporter.rating}</span>
                    </div>
                  </div>
                </div>
                
                {/* Shipment Details */}
                <div className="p-4 md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">Origen - Destino</div>
                      <div>{quote.shipment.origin} - {quote.shipment.destination}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Distancia</div>
                      <div>{quote.shipment.distance}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Tipo de Carga</div>
                      <div>{quote.shipment.cargo}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Peso</div>
                      <div>{quote.shipment.weight}</div>
                    </div>
                  </div>
                </div>
                
                {/* Price and Time */}
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="flex flex-col h-full justify-center">
                    <div className="text-gray-500 text-sm">Precio:</div>
                    <div className="font-bold text-xl">${quote.price.toFixed(2)}</div>
                    <div className="text-gray-500 text-sm mt-2">Tiempo de entrega:</div>
                    <div>{quote.deliveryTime}</div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-4 flex flex-col justify-center">
                  <div className="space-y-2 mb-3">
                    <button 
                      onClick={() => handleQuoteAction('accept', quote.id)}
                      className="w-full py-1.5 px-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Aceptar
                    </button>
                    <button 
                      onClick={() => handleQuoteAction('reject', quote.id)}
                      className="w-full py-1.5 px-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 text-center">
                    Expira: {quote.expiresAt}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Panel (Visible when multiple quotes are selected) */}
      {selectedQuotes.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Comparación de Cotizaciones</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transportista
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo de Entrega
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes
                  .filter(quote => selectedQuotes.includes(quote.id))
                  .map(quote => (
                    <tr key={`compare-${quote.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="font-medium">{quote.transporter.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ${quote.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {quote.deliveryTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-yellow-500">
                          <Star size={16} className="fill-current" />
                          <span className="ml-1">{quote.transporter.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleQuoteAction('accept', quote.id)}
                            className="px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                          >
                            Aceptar
                          </button>
                          <button 
                            onClick={() => handleQuoteAction('reject', quote.id)}
                            className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteManagement;