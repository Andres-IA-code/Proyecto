import React, { useState } from 'react';
import { MessageSquare, CheckCircle, Clock, Phone, MessageCircle, Camera, User } from 'lucide-react';

const shipmentDetails = {
  id: '#A0012',
  status: 'en-transito',
  origin: 'CDMX',
  destination: 'Guadalajara',
  pickupTime: '14/05/2025 08:30',
  estimatedDelivery: '14/05/2025 18:45',
  currentLocation: 'Querétaro',
  distance: {
    total: 550,
    completed: 330,
    remaining: 220,
  },
  driver: {
    name: 'Mario López',
    phone: '+52 55 1234 5678',
    rating: 4.8,
  },
  vehicle: {
    type: 'Camión 3.5 ton',
    plate: 'XYZ-123-AB',
  },
  timeline: [
    {
      time: '14/05/2025 08:30',
      status: 'Solicitada',
      location: 'CDMX',
      completed: true,
    },
    {
      time: '14/05/2025 09:15',
      status: 'Cotizado',
      location: 'CDMX',
      completed: true,
    },
    {
      time: '14/05/2025 12:45',
      status: 'Activo',
      location: 'Querétaro',
      completed: true,
    },
    {
      time: '14/05/2025 13:30',
      status: 'Fin',
      location: 'Querétaro',
      completed: true,
    }
  ],
};

const ShipmentTracking: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('details');
  const completionPercentage = Math.round((shipmentDetails.distance.completed / shipmentDetails.distance.total) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seguimiento de Envío {shipmentDetails.id}</h1>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  En Tránsito
                </span>
                <span className="ml-2 text-gray-500">
                  Actualizado: hace 15 minutos
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-gray-500 mr-2">ETA:</span>
              <span className="font-medium">{shipmentDetails.estimatedDelivery}</span>
            </div>
          </div>
        </div>

        <div className="border-b">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                selectedTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('details')}
            >
              Detalles
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                selectedTab === 'documents'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('documents')}
            >
              Documentos
            </button>
          </div>
        </div>

        {selectedTab === 'details' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Detalles del Envío</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">ID Envío:</div>
                    <div>{shipmentDetails.id}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Origen:</div>
                    <div>{shipmentDetails.origin}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Destino:</div>
                    <div>{shipmentDetails.destination}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Recogida:</div>
                    <div>{shipmentDetails.pickupTime}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Entrega estimada:</div>
                    <div>{shipmentDetails.estimatedDelivery}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-gray-500">Distancia total:</div>
                    <div>{shipmentDetails.distance.total} km</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-3">Información del Operador Logístico</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{shipmentDetails.driver.name}</div>
                      <div className="text-sm text-gray-500">{shipmentDetails.vehicle.type}</div>
                      <div className="text-sm text-gray-500">Placa: {shipmentDetails.vehicle.plate}</div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mb-4">
                    <button className="flex-1 flex items-center justify-center py-1.5 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700">
                      <Phone size={14} className="mr-2" />
                      Llamar
                    </button>
                    <button className="flex-1 flex items-center justify-center py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <MessageCircle size={14} className="mr-2" />
                      Mensaje
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    <strong>Nota:</strong> El conductor recibirá una notificación si lo contacta.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3">Timeline del Envío</h3>
              <div className="border-l-2 border-gray-200 ml-3">
                {shipmentDetails.timeline.map((event, index) => (
                  <div key={index} className="relative mb-6 ml-6">
                    <div className="absolute -left-8 mt-1">
                      <div className={`h-4 w-4 rounded-full ${
                        event.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{event.status}</div>
                      <div className="text-gray-500">{event.time} - {event.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'documents' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
                <Camera size={36} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Documentos de Entrega</h3>
              <p className="mt-1 text-sm text-gray-500">
                Los documentos estarán disponibles cuando el envío sea entregado.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Una vez completada la entrega, aquí podrá ver:
                </p>
                <ul className="mt-2 text-sm text-gray-500 space-y-1">
                  <li>• Comprobante de entrega firmado</li>
                  <li>• Fotos de la mercancía entregada</li>
                  <li>• Guía de remisión</li>
                  <li>• Documentos adicionales</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <Clock size={20} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Actualización automática cada 5 minutos</span>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium">
              Actualizar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;