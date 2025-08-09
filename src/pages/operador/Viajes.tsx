import React, { useState, useEffect } from 'react';
import { Truck, Calendar, MapPin, Clock, Package, DollarSign, AlertCircle, Filter, ChevronDown, User, Route, Weight, Play, CheckCircle, XCircle } from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';

interface Trip {
  id_Cotizaciones: number;
  id_Envio: number;
  Fecha: string;
  Vigencia: string;
  Estado: string;
  Oferta: number;
  Nombre_Operador: string;
  Nombre_Dador: string;
  // Datos del envío desde la tabla General
  envio_origen?: string;
  envio_destino?: string;
  envio_distancia?: number;
  envio_tipo_carga?: string;
  envio_peso?: string;
  envio_tipo_vehiculo?: string;
  envio_fecha_retiro?: string;
  envio_horario_retiro?: string;
  envio_observaciones?: string;
  envio_tipo_carroceria?: string;
  envio_parada_programada?: string;
  envio_dimension_largo?: number;
  envio_dimension_ancho?: number;
  envio_dimension_alto?: number;
  // Estado del viaje (derivado del estado de la cotización)
  trip_status: 'programado' | 'en-curso' | 'completado' | 'cancelado';
}

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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingTrip, setUpdatingTrip] = useState<number | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Construir el nombre del operador según el tipo de persona
      const nombreOperador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('Buscando viajes para operador:', nombreOperador);

      // Buscar todas las cotizaciones aceptadas del operador actual
      const { data, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select(`
          *,
          General!inner(
            Origen,
            Destino,
            Distancia,
            Tipo_Carga,
            Peso,
            Tipo_Vehiculo,
            Fecha_Retiro,
            Horario_Retiro,
            Observaciones,
            Tipo_Carroceria,
            Parada_Programada,
            Dimension_Largo,
            Dimension_Ancho,
            Dimension_Alto
          )
        `)
        .eq('Nombre_Operador', nombreOperador)
        .eq('Estado', 'Aceptada')
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching trips:', fetchError);
        setError('Error al cargar los viajes');
        return;
      }

      // Transformar los datos para facilitar el acceso y agregar estado del viaje
      const transformedData = (data || []).map(trip => {
        // Determinar el estado del viaje basado en la fecha de retiro
        let tripStatus: 'programado' | 'en-curso' | 'completado' | 'cancelado' = 'programado';
        
        if (trip.General?.Fecha_Retiro) {
          const fechaRetiro = new Date(trip.General.Fecha_Retiro);
          const ahora = new Date();
          const unDiaEnMs = 24 * 60 * 60 * 1000;
          
          if (fechaRetiro.getTime() < ahora.getTime() - unDiaEnMs) {
            tripStatus = 'completado';
          } else if (fechaRetiro.getTime() < ahora.getTime() + unDiaEnMs && fechaRetiro.getTime() > ahora.getTime() - unDiaEnMs) {
            tripStatus = 'en-curso';
          }
        }

        return {
          ...trip,
          envio_origen: trip.General?.Origen,
          envio_destino: trip.General?.Destino,
          envio_distancia: trip.General?.Distancia,
          envio_tipo_carga: trip.General?.Tipo_Carga,
          envio_peso: trip.General?.Peso,
          envio_tipo_vehiculo: trip.General?.Tipo_Vehiculo,
          envio_fecha_retiro: trip.General?.Fecha_Retiro,
          envio_horario_retiro: trip.General?.Horario_Retiro,
          envio_observaciones: trip.General?.Observaciones,
          envio_tipo_carroceria: trip.General?.Tipo_Carroceria,
          envio_parada_programada: trip.General?.Parada_Programada,
          envio_dimension_largo: trip.General?.Dimension_Largo,
          envio_dimension_ancho: trip.General?.Dimension_Ancho,
          envio_dimension_alto: trip.General?.Dimension_Alto,
          trip_status: tripStatus,
        };
      });

      setTrips(transformedData);
      console.log('Viajes encontrados:', transformedData.length);
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar los viajes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleStartTrip = async (tripId: number) => {
    try {
      setUpdatingTrip(tripId);
      
      // Aquí podrías actualizar el estado en la base de datos si tienes una tabla de viajes
      // Por ahora, solo actualizamos el estado local
      setTrips(prev => prev.map(trip => 
        trip.id_Cotizaciones === tripId 
          ? { ...trip, trip_status: 'en-curso' }
          : trip
      ));
      
      alert('Viaje iniciado exitosamente');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al iniciar el viaje');
    } finally {
      setUpdatingTrip(null);
    }
  };

  const handleCompleteTrip = async (tripId: number) => {
    try {
      setUpdatingTrip(tripId);
      
      setTrips(prev => prev.map(trip => 
        trip.id_Cotizaciones === tripId 
          ? { ...trip, trip_status: 'completado' }
          : trip
      ));
      
      alert('Viaje completado exitosamente');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al completar el viaje');
    } finally {
      setUpdatingTrip(null);
    }
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const calculateVolume = (largo?: number, ancho?: number, alto?: number) => {
    if (!largo || !ancho || !alto) return null;
    // Convertir de cm a m³
    return ((largo * ancho * alto) / 1000000).toFixed(2);
  };

  const getSimplifiedLocation = (fullAddress: string | undefined): string => {
    if (!fullAddress) return 'No especificado';
    
    // Extract city/locality from the full address
    const parts = fullAddress.split(',').map(part => part.trim());
    
    // Try to find the city/locality (usually the last meaningful part before province/country)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      
      // Skip common suffixes
      if (part.toLowerCase().includes('provincia') || 
          part.toLowerCase().includes('argentina') ||
          part.toLowerCase().includes('méxico') ||
          part.toLowerCase().includes('chile') ||
          part.toLowerCase().includes('colombia')) {
        continue;
      }
      
      // Return the first meaningful location found
      if (part.length > 2) {
        return part;
      }
    }
    
    // Fallback: return the first part if no city found
    return parts[0] || fullAddress;
  };

  const filteredTrips = trips.filter(trip => {
    if (filterStatus === 'all') return true;
    return trip.trip_status === filterStatus;
  });

  const getStatusCounts = () => {
    return {
      programado: trips.filter(t => t.trip_status === 'programado').length,
      enCurso: trips.filter(t => t.trip_status === 'en-curso').length,
      completado: trips.filter(t => t.trip_status === 'completado').length,
      cancelado: trips.filter(t => t.trip_status === 'cancelado').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando viajes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle size={64} className="mx-auto text-red-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar viajes</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchTrips}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Gestión de Viajes</h1>
              <p className="text-gray-500 mt-1">Seguimiento de viajes basado en cotizaciones aceptadas</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Viajes Programados</div>
                  <div className="text-xl font-semibold">{statusCounts.programado}</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">En Curso</div>
                  <div className="text-xl font-semibold">{statusCounts.enCurso}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Completados</div>
                  <div className="text-xl font-semibold">{statusCounts.completado}</div>
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
          </div>

          {/* Trips Table */}
          {filteredTrips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID/RUTA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PROGRAMACIÓN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CARGA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VEHÍCULO/CONDUCTOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ESTADO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      INGRESO
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id_Cotizaciones} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">V{trip.id_Envio.toString().padStart(3, '0')}</div>
                        <div className="text-sm text-gray-500">
                          {getSimplifiedLocation(trip.envio_origen)} → {getSimplifiedLocation(trip.envio_destino)}
                        </div>
                        <div className="text-sm text-gray-500">{trip.envio_distancia} km</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {trip.envio_fecha_retiro ? (
                            <>
                              <div className="flex items-center">
                                <Clock size={16} className="text-gray-400 mr-1" />
                                Salida: {formatDate(trip.envio_fecha_retiro)}
                              </div>
                              {trip.envio_horario_retiro && (
                                <div className="flex items-center mt-1">
                                  <Clock size={16} className="text-gray-400 mr-1" />
                                  Hora: {trip.envio_horario_retiro}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400">Fecha no especificada</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>{trip.envio_tipo_carga || 'General'}</div>
                          <div className="text-gray-500">{trip.envio_peso || '0'} Tn</div>
                          {calculateVolume(trip.envio_dimension_largo, trip.envio_dimension_ancho, trip.envio_dimension_alto) && (
                            <div className="text-gray-500">{calculateVolume(trip.envio_dimension_largo, trip.envio_dimension_ancho, trip.envio_dimension_alto)} m³</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>{trip.envio_tipo_vehiculo || 'No especificado'}</div>
                          {trip.envio_tipo_carroceria && (
                            <div className="text-gray-500">{trip.envio_tipo_carroceria}</div>
                          )}
                          <div className="text-gray-500">Conductor: Por asignar</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[trip.trip_status]}`}>
                          {statusLabels[trip.trip_status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">${trip.Oferta?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <button 
                            onClick={() => handleViewDetails(trip)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Ver detalles
                          </button>
                          {trip.trip_status === 'programado' && (
                            <button
                              onClick={() => handleStartTrip(trip.id_Cotizaciones)}
                              disabled={updatingTrip === trip.id_Cotizaciones}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {updatingTrip === trip.id_Cotizaciones ? 'Iniciando...' : 'Iniciar'}
                            </button>
                          )}
                          {trip.trip_status === 'en-curso' && (
                            <button
                              onClick={() => handleCompleteTrip(trip.id_Cotizaciones)}
                              disabled={updatingTrip === trip.id_Cotizaciones}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updatingTrip === trip.id_Cotizaciones ? 'Completando...' : 'Completar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No hay viajes disponibles
              </h3>
              <p className="text-gray-500 mb-6">
                {filterStatus === 'all' 
                  ? 'No tienes cotizaciones aceptadas que generen viajes aún.'
                  : `No hay viajes con estado "${statusLabels[filterStatus as keyof typeof statusLabels]}".`
                }
              </p>
              <button
                onClick={fetchTrips}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualizar Lista
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trip Details Modal */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles del Viaje V{selectedTrip.id_Envio.toString().padStart(3, '0')}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Cotización #{selectedTrip.id_Cotizaciones} - Cliente: {selectedTrip.Nombre_Dador}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Estado del Viaje</h3>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-2 text-sm rounded-full font-medium ${statusStyles[selectedTrip.trip_status]}`}>
                      {statusLabels[selectedTrip.trip_status]}
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Fecha de cotización</div>
                      <div className="font-medium">{formatDateTime(selectedTrip.Fecha)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Información Financiera</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      ${selectedTrip.Oferta?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Ingreso Total del Viaje</div>
                    {selectedTrip.envio_distancia && (
                      <div className="text-sm text-gray-500 mt-1">
                        ${(selectedTrip.Oferta / selectedTrip.envio_distancia).toFixed(2)} por km
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Route and Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Ruta</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-green-600 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Origen:</span>
                        <div className="text-gray-900">{selectedTrip.envio_origen || 'No especificado'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="text-red-600 mr-2" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Destino:</span>
                        <div className="text-gray-900">{selectedTrip.envio_destino || 'No especificado'}</div>
                      </div>
                    </div>
                    {selectedTrip.envio_distancia && (
                      <div className="flex items-center">
                        <Route size={16} className="text-blue-600 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Distancia:</span>
                          <div className="text-gray-900">{selectedTrip.envio_distancia} km</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Programación</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedTrip.envio_fecha_retiro && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Fecha de Retiro:</span>
                        <div className="text-gray-900">{formatDate(selectedTrip.envio_fecha_retiro)}</div>
                      </div>
                    )}
                    {selectedTrip.envio_horario_retiro && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Hora de Retiro:</span>
                        <div className="text-gray-900">{selectedTrip.envio_horario_retiro}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-700">Vigencia de Cotización:</span>
                      <div className="text-gray-900">{formatDate(selectedTrip.Vigencia)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones de Carga</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTrip.envio_tipo_carga && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo de Carga:</span>
                        <div className="text-gray-900">{selectedTrip.envio_tipo_carga}</div>
                      </div>
                    )}
                    {selectedTrip.envio_peso && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Peso:</span>
                        <div className="text-gray-900">{selectedTrip.envio_peso} Toneladas</div>
                      </div>
                    )}
                    {selectedTrip.envio_tipo_vehiculo && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo de Vehículo:</span>
                        <div className="text-gray-900">{selectedTrip.envio_tipo_vehiculo}</div>
                      </div>
                    )}
                    {selectedTrip.envio_tipo_carroceria && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo de Carrocería:</span>
                        <div className="text-gray-900">{selectedTrip.envio_tipo_carroceria}</div>
                      </div>
                    )}
                    {(selectedTrip.envio_dimension_largo || selectedTrip.envio_dimension_ancho || selectedTrip.envio_dimension_alto) && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-700">Dimensiones:</span>
                        <div className="text-gray-900">
                          {selectedTrip.envio_dimension_largo || 0} x {selectedTrip.envio_dimension_ancho || 0} x {selectedTrip.envio_dimension_alto || 0} cm
                          {calculateVolume(selectedTrip.envio_dimension_largo, selectedTrip.envio_dimension_ancho, selectedTrip.envio_dimension_alto) && (
                            <span className="ml-2 text-gray-600">
                              (Volumen: {calculateVolume(selectedTrip.envio_dimension_largo, selectedTrip.envio_dimension_ancho, selectedTrip.envio_dimension_alto)} m³)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scheduled Stops */}
              {selectedTrip.envio_parada_programada && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paradas Programadas</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedTrip.envio_parada_programada.split('\n').map((parada, index) => (
                        <div key={index} className="flex items-center">
                          <MapPin size={16} className="text-blue-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-900">{parada.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Observations */}
              {selectedTrip.envio_observaciones && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones del Cliente</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-900">{selectedTrip.envio_observaciones}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  {selectedTrip.trip_status === 'programado' && (
                    <button
                      onClick={() => {
                        handleStartTrip(selectedTrip.id_Cotizaciones);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Play size={16} className="mr-2" />
                      Iniciar Viaje
                    </button>
                  )}
                  {selectedTrip.trip_status === 'en-curso' && (
                    <button
                      onClick={() => {
                        handleCompleteTrip(selectedTrip.id_Cotizaciones);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Completar Viaje
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viajes;