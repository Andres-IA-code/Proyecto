import React, { useState, useEffect } from 'react';
import { Truck, Calendar, MapPin, Clock, Package, DollarSign, AlertCircle, Filter, ChevronDown, User, Route, Weight, Play, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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
  'programado': 'bg-blue-100 text-blue-800 border-blue-200',
  'en-curso': 'bg-green-100 text-green-800 border-green-200',
  'completado': 'bg-gray-100 text-gray-800 border-gray-200',
  'cancelado': 'bg-red-100 text-red-800 border-red-200',
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
        // Determinar el estado del viaje basado en el estado de la base de datos
        let tripStatus: 'programado' | 'en-curso' | 'completado' | 'cancelado' = 'programado';
        
        // Usar el estado de la tabla General para determinar el estado del viaje
        const estadoGeneral = trip.General?.Estado?.toLowerCase();
        
        switch (estadoGeneral) {
          case 'en curso':
          case 'en_curso':
          case 'activo':
            tripStatus = 'en-curso';
            break;
          case 'completado':
          case 'finalizado':
          case 'entregado':
            tripStatus = 'completado';
            break;
          case 'cancelado':
          case 'rechazado':
            tripStatus = 'cancelado';
            break;
          default:
            tripStatus = 'programado';
            break;
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

  const formatTime = (timeString: string) => {
    try {
      return timeString.slice(0, 5); // HH:MM format
    } catch {
      return timeString;
    }
  };

  const handleStartTrip = async (tripId: number) => {
    try {
      setUpdatingTrip(tripId);
      
      // Encontrar el viaje y actualizar su estado en la base de datos
      const tripToUpdate = trips.find(t => t.id_Cotizaciones === tripId);
      if (!tripToUpdate) {
        alert('Error: No se encontró el viaje');
        return;
      }
      
      const { error: updateError } = await supabase
        .from('General')
        .update({ Estado: 'En Curso' })
        .eq('id_Envio', tripToUpdate.id_Envio);

      if (updateError) {
        console.error('Error updating trip status:', updateError);
        alert('Error al iniciar el viaje');
        return;
      }

      // Actualizar el estado local para reflejar el cambio inmediatamente
      setTrips(prev => prev.map(trip => 
        trip.id_Cotizaciones === tripId 
          ? { ...trip, trip_status: 'en-curso' }
          : trip
      ));
      
      console.log(`✅ Viaje ${tripToUpdate.id_Envio} iniciado exitosamente`);
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
      
      // Encontrar el viaje y actualizar su estado en la base de datos
      const tripToUpdate = trips.find(t => t.id_Cotizaciones === tripId);
      if (!tripToUpdate) {
        alert('Error: No se encontró el viaje');
        return;
      }
      
      const { error: updateError } = await supabase
        .from('General')
        .update({ Estado: 'Completado' })
        .eq('id_Envio', tripToUpdate.id_Envio);

      if (updateError) {
        console.error('Error updating trip status:', updateError);
        alert('Error al completar el viaje');
        return;
      }

      // Actualizar el estado local para reflejar el cambio inmediatamente
      setTrips(prev => prev.map(trip => 
        trip.id_Cotizaciones === tripId 
          ? { ...trip, trip_status: 'completado' }
          : trip
      ));
      
      console.log(`✅ Viaje ${tripToUpdate.id_Envio} completado exitosamente`);
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
    return ((largo * ancho * alto) / 1000000).toFixed(2);
  };

  const getSimplifiedLocation = (fullAddress: string | undefined): string => {
    if (!fullAddress) return 'No especificado';
    
    const parts = fullAddress.split(',').map(part => part.trim());
    
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      
      if (part.toLowerCase().includes('provincia') || 
          part.toLowerCase().includes('argentina') ||
          part.toLowerCase().includes('méxico') ||
          part.toLowerCase().includes('chile') ||
          part.toLowerCase().includes('colombia')) {
        continue;
      }
      
      if (part.length > 2) {
        return part;
      }
    }
    
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Viajes</h1>
          <p className="text-gray-600 mt-1">Seguimiento y control de viajes activos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrips}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw size={16} className="mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards - Horizontal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Viajes Programados</p>
              <p className="text-3xl font-bold">{statusCounts.programado}</p>
              <p className="text-blue-100 text-xs mt-1">Listos para iniciar</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">En Curso</p>
              <p className="text-3xl font-bold">{statusCounts.enCurso}</p>
              <p className="text-green-100 text-xs mt-1">Viajes activos</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Truck className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Completados</p>
              <p className="text-3xl font-bold">{statusCounts.completado}</p>
              <p className="text-gray-100 text-xs mt-1">Este mes</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Filtrar por estado:</span>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados ({trips.length})</option>
            <option value="programado">Programados ({statusCounts.programado})</option>
            <option value="en-curso">En Curso ({statusCounts.enCurso})</option>
            <option value="completado">Completados ({statusCounts.completado})</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id_Cotizaciones}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        V{trip.id_Envio.toString().padStart(3, '0')}
                      </h3>
                      <p className="text-sm text-gray-600">{trip.Nombre_Dador}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium border ${statusStyles[trip.trip_status]}`}>
                      {statusLabels[trip.trip_status]}
                    </span>
                    <div className="text-lg font-bold text-green-600 mt-1">
                      ${trip.Oferta?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {getSimplifiedLocation(trip.envio_origen)}
                      </span>
                    </div>
                    <Route size={16} className="text-gray-400" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getSimplifiedLocation(trip.envio_destino)}
                      </span>
                      <MapPin size={16} className="text-red-600" />
                    </div>
                  </div>
                  {trip.envio_distancia && (
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {trip.envio_distancia} km
                      </span>
                    </div>
                  )}
                </div>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-gray-600">Carga:</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {trip.envio_tipo_carga || 'General'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {trip.envio_peso || '0'} Tn
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-600">Programación:</span>
                    </div>
                    {trip.envio_fecha_retiro ? (
                      <>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(trip.envio_fecha_retiro)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trip.envio_horario_retiro ? formatTime(trip.envio_horario_retiro) : 'Hora no especificada'}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400">No programado</div>
                    )}
                  </div>
                </div>

                {/* Vehicle and Body Type */}
                {(trip.envio_tipo_vehiculo || trip.envio_tipo_carroceria) && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={14} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Especificaciones del Vehículo</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {trip.envio_tipo_vehiculo && (
                        <div className="text-sm text-blue-700">
                          <span className="font-medium">Tipo:</span> {trip.envio_tipo_vehiculo}
                        </div>
                      )}
                      {trip.envio_tipo_carroceria && (
                        <div className="text-sm text-blue-700">
                          <span className="font-medium">Carrocería:</span> {trip.envio_tipo_carroceria}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scheduled Stops */}
                {trip.envio_parada_programada && (
                  <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Paradas Programadas</span>
                    </div>
                    <div className="space-y-1">
                      {trip.envio_parada_programada.split('\n').slice(0, 2).map((parada, index) => (
                        <div key={index} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          {parada.trim()}
                        </div>
                      ))}
                      {trip.envio_parada_programada.split('\n').length > 2 && (
                        <div className="text-xs text-yellow-600">
                          +{trip.envio_parada_programada.split('\n').length - 2} paradas más
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(trip)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Ver Detalles
                  </button>
                  
                  {trip.trip_status === 'programado' && (
                    <button
                      onClick={() => handleStartTrip(trip.id_Cotizaciones)}
                      disabled={updatingTrip === trip.id_Cotizaciones}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      {updatingTrip === trip.id_Cotizaciones ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <Play size={14} className="mr-1" />
                          Iniciar
                        </>
                      )}
                    </button>
                  )}
                  
                  {trip.trip_status === 'en-curso' && (
                    <button
                      onClick={() => handleCompleteTrip(trip.id_Cotizaciones)}
                      disabled={updatingTrip === trip.id_Cotizaciones}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      {updatingTrip === trip.id_Cotizaciones ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Completando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} className="mr-1" />
                          Completar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Truck size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay viajes disponibles</h3>
          <p className="text-gray-600 mb-6">
            {filterStatus === 'all' 
              ? 'No tienes viajes asignados en este momento.'
              : `No hay viajes con estado "${statusLabels[filterStatus as keyof typeof statusLabels] || filterStatus}".`
            }
          </p>
          <button
            onClick={fetchTrips}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw size={16} className="mr-2 inline" />
            Actualizar
          </button>
        </div>
      )}

      {/* Trip Details Modal */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
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
                  className="text-gray-400 hover:text-gray-500 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Estado del Viaje</h3>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 text-sm rounded-full font-medium border ${statusStyles[selectedTrip.trip_status]}`}>
                      {statusLabels[selectedTrip.trip_status]}
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Cotización creada</div>
                      <div className="font-medium">{formatDate(selectedTrip.Fecha)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Información Financiera</h3>
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
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-green-600 mt-1" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Origen:</span>
                        <div className="text-gray-900 text-sm">{selectedTrip.envio_origen || 'No especificado'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-red-600 mt-1" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Destino:</span>
                        <div className="text-gray-900 text-sm">{selectedTrip.envio_destino || 'No especificado'}</div>
                      </div>
                    </div>
                    {selectedTrip.envio_distancia && (
                      <div className="flex items-center gap-3">
                        <Route size={16} className="text-blue-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Distancia:</span>
                          <div className="text-gray-900 text-sm">{selectedTrip.envio_distancia} km</div>
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
                        <div className="text-gray-900">{formatTime(selectedTrip.envio_horario_retiro)}</div>
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

              {/* Scheduled Stops (Full List) */}
              {selectedTrip.envio_parada_programada && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paradas Programadas</h3>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedTrip.envio_parada_programada.split('\n').map((parada, index) => (
                        <div key={index} className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded">
                          <span className="font-medium">Parada {index + 1}:</span> {parada.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Observations */}
              {selectedTrip.envio_observaciones && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedTrip.envio_observaciones}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
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
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
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
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Completar Viaje
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viajes;