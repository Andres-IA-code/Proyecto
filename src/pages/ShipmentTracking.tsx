import React, { useState, useEffect } from 'react';
import { Package, MapPin, Calendar, Clock, Truck, RefreshCw, FileText, Route } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface Shipment {
  id_Envio: number;
  id_Usuario: number;
  Estado: string;
  Origen: string;
  Destino: string;
  Distancia: number;
  Tipo_Carga: string;
  Tipo_Vehiculo: string;
  Peso: string;
  Dimension_Largo: number;
  Dimension_Ancho: number;
  Dimension_Alto: number;
  Horario_Retiro: string;
  Observaciones: string;
  Tipo_Carroceria: string;
  Tiempo_Estimado_Operacion: string;
  Parada_Programada: string;
  Nombre_Dador: string;
  Fecha_Retiro: string;
  Email: string;
}

const ShipmentTracking: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError('');

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      console.log('Fetching shipments for user:', currentUser.profile.id_Usuario);

      const { data, error: fetchError } = await supabase
        .from('General')
        .select('*')
        .eq('id_Usuario', currentUser.profile.id_Usuario)
        .order('Fecha_Retiro', { ascending: false });

      if (fetchError) {
        console.error('Error fetching shipments:', fetchError);
        setError('Error al cargar las solicitudes de envío');
        return;
      }

      console.log('Shipments found:', data?.length || 0);
      setShipments(data || []);

    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pendiente') || statusLower.includes('solicitado') || statusLower.includes('disponible')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower.includes('activo') || statusLower.includes('proceso') || statusLower.includes('tránsito')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (statusLower.includes('completado') || statusLower.includes('entregado') || statusLower.includes('finalizado')) {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('cancelado') || statusLower.includes('rechazado')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const filteredShipments = shipments.filter(shipment => {
    if (filterStatus === 'all') return true;
    return shipment.Estado?.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes de envío...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={fetchShipments}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Envío</h1>
          <p className="text-gray-600 mt-1">Gestiona y da seguimiento a todas tus solicitudes</p>
        </div>
        <button
          onClick={fetchShipments}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={20} className="mr-2" />
          Actualizar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos</option>
            <option value="solicitado">Solicitado</option>
            <option value="pendiente">Pendiente</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <span className="text-sm text-gray-600">
            Mostrando {filteredShipments.length} de {shipments.length} solicitudes
          </span>
        </div>
      </div>

      {filteredShipments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredShipments.map((shipment) => (
            <div
              key={shipment.id_Envio}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Envío #{shipment.id_Envio}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Creado: {formatDate(shipment.Fecha_Retiro)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.Estado)}`}>
                    {shipment.Estado || 'Pendiente'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin size={18} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {shipment.Origen}
                        </span>
                        <Route size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {shipment.Destino}
                        </span>
                      </div>
                      {shipment.Distancia && (
                        <p className="text-xs text-gray-500 mt-1">
                          {shipment.Distancia} km
                        </p>
                      )}
                    </div>
                  </div>

                  {shipment.Tipo_Carga && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Package size={16} className="mr-3 text-gray-400" />
                      <span>{shipment.Tipo_Carga}</span>
                      {shipment.Peso && (
                        <span className="ml-2 text-gray-500">({shipment.Peso} Tn)</span>
                      )}
                    </div>
                  )}

                  {shipment.Tipo_Vehiculo && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck size={16} className="mr-3 text-gray-400" />
                      <span>{shipment.Tipo_Vehiculo}</span>
                    </div>
                  )}

                  {shipment.Tipo_Carroceria && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck size={16} className="mr-3 text-gray-400" />
                      <span className="font-medium">Carrocería:</span>
                      <span className="ml-1">{shipment.Tipo_Carroceria}</span>
                    </div>
                  )}

                  {shipment.Fecha_Retiro && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-3 text-gray-400" />
                      <span>{formatDate(shipment.Fecha_Retiro)}</span>
                      {shipment.Horario_Retiro && (
                        <span className="ml-2 text-gray-500">a las {shipment.Horario_Retiro}</span>
                      )}
                    </div>
                  )}

                  {shipment.Tiempo_Estimado_Operacion && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-3 text-gray-400" />
                      <span>Tiempo estimado: {shipment.Tiempo_Estimado_Operacion}</span>
                    </div>
                  )}

                  {shipment.Parada_Programada && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin size={16} className="mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Paradas programadas:</span>
                        <div className="ml-1 space-y-1 mt-1">
                          {shipment.Parada_Programada.split('\n').map((parada, index) => (
                            <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {parada.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {shipment.Observaciones && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start">
                        <FileText size={16} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Observaciones:</p>
                          <p className="text-xs text-gray-600">{shipment.Observaciones}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {(shipment.Dimension_Largo || shipment.Dimension_Ancho || shipment.Dimension_Alto) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Dimensiones de la carga:</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {shipment.Dimension_Largo && (
                        <span>Largo: {shipment.Dimension_Largo}m</span>
                      )}
                      {shipment.Dimension_Ancho && (
                        <span>Ancho: {shipment.Dimension_Ancho}m</span>
                      )}
                      {shipment.Dimension_Alto && (
                        <span>Alto: {shipment.Dimension_Alto}m</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay solicitudes de envío
          </h3>
          <p className="text-gray-500 mb-6">
            {filterStatus === 'all'
              ? 'Aún no has creado ninguna solicitud de envío. Comienza creando tu primera solicitud.'
              : `No hay solicitudes con estado "${filterStatus}".`
            }
          </p>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Ver todas las solicitudes
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShipmentTracking;
