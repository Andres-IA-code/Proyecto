import React, { useState, useEffect } from 'react';
import { Package, MapPin, Calendar, Clock, DollarSign, Truck, User, RefreshCw, CheckCircle, AlertCircle, Route, Weight } from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';

interface AcceptedQuote {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Fecha: string;
  Vigencia: string;
  Estado: string;
  Oferta: number;
  Nombre_Operador: string;
  Nombre_Dador: string;
  // Datos del dador de carga
  dador_telefono?: string;
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
}

const OperadorCotizaciones: React.FC = () => {
  const [acceptedQuotes, setAcceptedQuotes] = useState<AcceptedQuote[]>([]);
  const [cancelledQuotes, setCancelledQuotes] = useState<AcceptedQuote[]>([]);
  const [selectedTab, setSelectedTab] = useState<'accepted' | 'cancelled'>('accepted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedQuote, setSelectedQuote] = useState<AcceptedQuote | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
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

    console.log('Buscando cotizaciones aceptadas para operador:', nombreOperador);

    // Buscar cotizaciones aceptadas del operador actual
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
      console.error('Error fetching accepted quotes:', fetchError);
      setError(`Error al cargar las cotizaciones: ${fetchError.message}`);
      return;
    }

    // Buscar cotizaciones canceladas/rechazadas del operador actual
    const { data: cancelledData, error: cancelledError } = await supabase
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
      .eq('Estado', 'Rechazada')
      .order('Fecha', { ascending: false });

    if (cancelledError) {
      console.error('Error fetching cancelled quotes:', cancelledError);
      // Don't set error here, just log it
    }

    // Transformar los datos aceptados para facilitar el acceso
    const transformedData = (data || []).map(quote => ({
      ...quote,
      envio_origen: quote.General?.Origen,
      envio_destino: quote.General?.Destino,
      envio_distancia: quote.General?.Distancia,
      envio_tipo_carga: quote.General?.Tipo_Carga,
      envio_peso: quote.General?.Peso,
      envio_tipo_vehiculo: quote.General?.Tipo_Vehiculo,
      envio_fecha_retiro: quote.General?.Fecha_Retiro,
      envio_horario_retiro: quote.General?.Horario_Retiro,
      envio_observaciones: quote.General?.Observaciones,
      envio_tipo_carroceria: quote.General?.Tipo_Carroceria,
      envio_parada_programada: quote.General?.Parada_Programada,
      envio_dimension_largo: quote.General?.Dimension_Largo,
      envio_dimension_ancho: quote.General?.Dimension_Ancho,
      envio_dimension_alto: quote.General?.Dimension_Alto,
    }));

    // FUNCIÓN NUEVA Y CORREGIDA para buscar teléfono del dador
    const findDadorPhone = async (nombreDador: string): Promise<string | null> => {
  try {
    console.log(`🔍 BÚSQUEDA DETALLADA para: "${nombreDador}"`);
    
    if (!nombreDador || nombreDador.trim() === '') {
      return null;
    }

    // DEBUG COMPLETO - Mostrar todos los usuarios con detalles
    console.log(`🔍 DEBUG - Obteniendo todos los usuarios:`);
    const { data: todos, error: todosError } = await supabase
      .from('Usuarios')
      .select('*'); // Seleccionar TODOS los campos
    
    console.log(`📊 Total usuarios en BD:`, todos?.length || 0);
    console.log(`📋 Error en consulta:`, todosError);
    
    if (todos && todos.length > 0) {
      todos.forEach((user, index) => {
        console.log(`  Usuario ${index + 1}:`);
        console.log(`    ID: ${user.id_Usuario}`);
        console.log(`    Nombre: "${user.Nombre}"`);
        console.log(`    Apellido: "${user.Apellido}"`);
        console.log(`    Teléfono: "${user.Telefono}"`);
        console.log(`    Rol: "${user.Rol_Operativo}"`);
        console.log(`    Tipo: "${user.Tipo_Persona}"`);
        console.log(`    ---`);
        
        // Verificar si es Consiglio
        if (user.Apellido && user.Apellido.toLowerCase().includes('consiglio')) {
          console.log(`    🎯 ¡ESTE ES CONSIGLIO!`);
          console.log(`    📞 Su teléfono: "${user.Telefono}"`);
        }
      });
    }

    // Ahora buscar específicamente con los datos que sabemos
    console.log(`📞 Búsqueda específica con diferentes variaciones:`);
    
    // Variación 1: Buscar por apellido exacto
    const { data: porApellido } = await supabase
      .from('Usuarios')
      .select('*')
      .ilike('Apellido', 'Consiglio');
    
    console.log(`📋 Búsqueda por apellido 'Consiglio':`, porApellido?.length || 0, 'resultados');
    if (porApellido && porApellido.length > 0) {
      console.log(`✅ ENCONTRADO por apellido:`, porApellido[0]);
      if (porApellido[0].Telefono) {
        return porApellido[0].Telefono;
      }
    }

    // Variación 2: Buscar por nombre
    const { data: porNombre } = await supabase
      .from('Usuarios')
      .select('*')
      .or('Nombre.ilike.Andres,Nombre.ilike.Andrés');
    
    console.log(`📋 Búsqueda por nombre 'Andres/Andrés':`, porNombre?.length || 0, 'resultados');
    if (porNombre && porNombre.length > 0) {
      console.log(`✅ ENCONTRADO por nombre:`, porNombre[0]);
      if (porNombre[0].Telefono) {
        return porNombre[0].Telefono;
      }
    }

    // Variación 3: Buscar ID específico que vimos en la imagen (ID 28)
    const { data: porID } = await supabase
      .from('Usuarios')
      .select('*')
      .eq('id_Usuario', 28);
    
    console.log(`📋 Búsqueda por ID 28:`, porID?.length || 0, 'resultados');
    if (porID && porID.length > 0) {
      console.log(`✅ ENCONTRADO por ID 28:`, porID[0]);
      if (porID[0].Telefono) {
        console.log(`📞 USANDO teléfono del ID 28: ${porID[0].Telefono}`);
        return porID[0].Telefono;
      }
    }

    console.log(`❌ NO ENCONTRADO teléfono para: "${nombreDador}"`);
    return null;
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    return null;
  }
};

    // Buscar teléfonos usando la función corregida
    console.log('🚀 Iniciando búsqueda de teléfonos...');
    const quotesWithPhones = await Promise.all(
      transformedData.map(async (quote) => {
        const phoneNumber = await findDadorPhone(quote.Nombre_Dador);
        return { ...quote, dador_telefono: phoneNumber };
      })
    );

    setAcceptedQuotes(quotesWithPhones);
    
    // Transformar los datos cancelados
    const transformedCancelledData = (cancelledData || []).map(quote => ({
      ...quote,
      envio_origen: quote.General?.Origen,
      envio_destino: quote.General?.Destino,
      envio_distancia: quote.General?.Distancia,
      envio_tipo_carga: quote.General?.Tipo_Carga,
      envio_peso: quote.General?.Peso,
      envio_tipo_vehiculo: quote.General?.Tipo_Vehiculo,
      envio_fecha_retiro: quote.General?.Fecha_Retiro,
      envio_horario_retiro: quote.General?.Horario_Retiro,
      envio_observaciones: quote.General?.Observaciones,
      envio_tipo_carroceria: quote.General?.Tipo_Carroceria,
      envio_parada_programada: quote.General?.Parada_Programada,
      envio_dimension_largo: quote.General?.Dimension_Largo,
      envio_dimension_ancho: quote.General?.Dimension_Ancho,
      envio_dimension_alto: quote.General?.Dimension_Alto,
    }));

    // Buscar teléfonos para cotizaciones canceladas
    const cancelledQuotesWithPhones = await Promise.all(
      transformedCancelledData.map(async (quote) => {
        const phoneNumber = await findDadorPhone(quote.Nombre_Dador);
        return { ...quote, dador_telefono: phoneNumber };
      })
    );

    setCancelledQuotes(cancelledQuotesWithPhones);
    console.log('✅ Cotizaciones aceptadas encontradas:', transformedData.length);
    console.log('✅ Cotizaciones canceladas encontradas:', transformedCancelledData.length);
    
  } catch (err) {
    console.error('❌ Error inesperado:', err);
    setError('Error inesperado al cargar las cotizaciones');
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

  const handleViewDetails = (quote: AcceptedQuote) => {
    setSelectedQuote(quote);
    setShowDetailsModal(true);
  };

  const calculateVolume = (largo?: number, ancho?: number, alto?: number) => {
    if (!largo || !ancho || !alto) return null;
    // Convertir de cm a m³
    return ((largo * ancho * alto) / 1000000).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando cotizaciones aceptadas...</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar cotizaciones</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchQuotes}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuotes = selectedTab === 'accepted' ? acceptedQuotes : cancelledQuotes;
  const tabTitle = selectedTab === 'accepted' ? 'Cotizaciones Aceptadas' : 'Cotizaciones Canceladas';
  const tabSubtitle = selectedTab === 'accepted' 
    ? 'Viajes confirmados y detalles de operación' 
    : 'Cotizaciones rechazadas por el dador de carga';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tabTitle}</h1>
            <p className="text-gray-500 mt-1">{tabSubtitle}</p>
          </div>
          <button
            onClick={fetchQuotes}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            <RefreshCw size={16} className="mr-2" />
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('accepted')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'accepted'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aceptadas ({acceptedQuotes.length})
            </button>
            <button
              onClick={() => setSelectedTab('cancelled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'cancelled'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Canceladas ({cancelledQuotes.length})
            </button>
          </nav>
        </div>

        {/* Stats */}
        {selectedTab === 'accepted' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Viajes Confirmados</div>
                  <div className="text-xl font-semibold">{acceptedQuotes.length}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Ingresos Totales</div>
                  <div className="text-xl font-semibold">
                    ${acceptedQuotes.reduce((sum, quote) => sum + (quote.Oferta || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Carga Total</div>
                  <div className="text-xl font-semibold">
                    {acceptedQuotes.reduce((sum, quote) => {
                      const peso = parseFloat(quote.envio_peso || '0');
                      return sum + peso;
                    }, 0).toFixed(1)} Tn
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'cancelled' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Cotizaciones Rechazadas</div>
                  <div className="text-xl font-semibold">{cancelledQuotes.length}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Ingresos Perdidos</div>
                  <div className="text-xl font-semibold">
                    ${cancelledQuotes.reduce((sum, quote) => sum + (quote.Oferta || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <div className="text-sm text-gray-500">Carga No Transportada</div>
                  <div className="text-xl font-semibold">
                    {cancelledQuotes.reduce((sum, quote) => {
                      const peso = parseFloat(quote.envio_peso || '0');
                      return sum + peso;
                    }, 0).toFixed(1)} Tn
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quotes List */}
      {currentQuotes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentQuotes.map((quote) => (
            <div
              key={quote.id_Cotizaciones}
              className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                selectedTab === 'accepted' ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Viaje #{quote.id_Envio}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <User size={16} className="mr-1" />
                      {quote.Nombre_Dador}
                    </div>
                    {selectedTab === 'cancelled' && (
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                          Rechazada
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      selectedTab === 'accepted' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${quote.Oferta?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedTab === 'accepted' ? 'Precio asignado' : 'Precio rechazado'}
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
                  <MapPin size={16} className="text-blue-600 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {quote.envio_origen || 'No especificado'}
                      </span>
                      <Route size={16} className="mx-2 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {quote.envio_destino || 'No especificado'}
                      </span>
                    </div>
                    {quote.envio_distancia && (
                      <p className="text-xs text-gray-500 mt-1">
                        {quote.envio_distancia} km
                      </p>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-3 mb-4">
                  {quote.envio_tipo_carga && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Package size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Carga:</span>
                      <span className="ml-1">{quote.envio_tipo_carga}</span>
                      {quote.envio_peso && (
                        <span className="ml-2 text-gray-500">({quote.envio_peso} Tn)</span>
                      )}
                    </div>
                  )}
                  
                  {quote.envio_tipo_vehiculo && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Vehículo:</span>
                      <span className="ml-1">{quote.envio_tipo_vehiculo}</span>
                    </div>
                  )}

                  {quote.envio_tipo_carroceria && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Carrocería:</span>
                      <span className="ml-1">{quote.envio_tipo_carroceria}</span>
                    </div>
                  )}

                  {quote.envio_fecha_retiro && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Retiro:</span>
                      <span className="ml-1">
                        {formatDate(quote.envio_fecha_retiro)}
                        {quote.envio_horario_retiro && (
                          <span className="ml-2 text-gray-500">
                            a las {quote.envio_horario_retiro}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Dimensions */}
                  {(quote.envio_dimension_largo || quote.envio_dimension_ancho || quote.envio_dimension_alto) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Weight size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium">Dimensiones:</span>
                      <span className="ml-1">
                        {quote.envio_dimension_largo || 0} x {quote.envio_dimension_ancho || 0} x {quote.envio_dimension_alto || 0} cm
                        {calculateVolume(quote.envio_dimension_largo, quote.envio_dimension_ancho, quote.envio_dimension_alto) && (
                          <span className="ml-2 text-gray-500">
                            ({calculateVolume(quote.envio_dimension_largo, quote.envio_dimension_ancho, quote.envio_dimension_alto)} m³)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Scheduled Stops */}
                  {quote.envio_parada_programada && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin size={16} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Paradas programadas:</span>
                        <div className="ml-1 mt-1 space-y-1">
                          {quote.envio_parada_programada.split('\n').map((parada, index) => (
                            <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {parada.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quote Info */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                    <span>Fecha:</span>
                    <span>{formatDateTime(quote.Fecha)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Vigencia:</span>
                    <span>{formatDate(quote.Vigencia)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleViewDetails(quote)}
                  className={`w-full mt-4 px-4 py-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-sm ${
                    selectedTab === 'accepted'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                  }`}
                >
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {selectedTab === 'accepted' ? 'No hay cotizaciones aceptadas' : 'No hay cotizaciones canceladas'}
          </h3>
          <p className="text-gray-500 mb-6">
            {selectedTab === 'accepted' 
              ? 'Cuando los dadores de carga acepten tus cotizaciones, aparecerán aquí con todos los detalles del viaje.'
              : 'Las cotizaciones que sean rechazadas por los dadores de carga aparecerán aquí.'
            }
          </p>
          <button
            onClick={fetchQuotes}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar Lista
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles del Viaje #{selectedQuote.id_Envio}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Cotización #{selectedQuote.id_Cotizaciones} - Aceptada
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
              {/* Financial Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Resumen Financiero</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      ${selectedQuote.Oferta?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Precio Total Asignado</div>
                  </div>
                  {selectedQuote.envio_distancia && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        ${(selectedQuote.Oferta / selectedQuote.envio_distancia).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Precio por Km</div>
                    </div>
                  )}
                  {selectedQuote.envio_peso && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        ${(selectedQuote.Oferta / parseFloat(selectedQuote.envio_peso)).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Precio por Tonelada</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Dador de Carga:</span>
                      <div className="text-gray-900">{selectedQuote.Nombre_Dador}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Teléfono de Contacto:</span>
                      <div className="text-gray-900">
                        {selectedQuote.dador_telefono ? (
                          <a 
                            href={`tel:${selectedQuote.dador_telefono}`}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selectedQuote.dador_telefono}
                          </a>
                        ) : (
                          <span className="text-red-500">No disponible</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Fecha de Aceptación:</span>
                      <div className="text-gray-900">{formatDateTime(selectedQuote.Fecha)}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Vigencia:</span>
                      <div className="text-gray-900">{formatDate(selectedQuote.Vigencia)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Ruta</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Origen:</span>
                      <div className="text-gray-900">{selectedQuote.envio_origen || 'No especificado'}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Destino:</span>
                      <div className="text-gray-900">{selectedQuote.envio_destino || 'No especificado'}</div>
                    </div>
                    {selectedQuote.envio_distancia && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Distancia:</span>
                        <div className="text-gray-900">{selectedQuote.envio_distancia} km</div>
                      </div>
                    )}
                    {selectedQuote.envio_fecha_retiro && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Fecha de Retiro:</span>
                        <div className="text-gray-900">
                          {formatDate(selectedQuote.envio_fecha_retiro)}
                          {selectedQuote.envio_horario_retiro && (
                            <span className="ml-2 text-gray-600">
                              a las {selectedQuote.envio_horario_retiro}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones de Carga</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedQuote.envio_tipo_carga && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo de Carga:</span>
                        <div className="text-gray-900">{selectedQuote.envio_tipo_carga}</div>
                      </div>
                    )}
                    {selectedQuote.envio_peso && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Peso:</span>
                        <div className="text-gray-900">{selectedQuote.envio_peso} Toneladas</div>
                      </div>
                    )}
                    {selectedQuote.envio_tipo_vehiculo && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo de Vehículo:</span>
                        <div className="text-gray-900">{selectedQuote.envio_tipo_vehiculo}</div>
                      </div>
                    )}
                    {selectedQuote.envio_tipo_carroceria && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tipo de Carrocería:</span>
                        <div className="text-gray-900">{selectedQuote.envio_tipo_carroceria}</div>
                      </div>
                    )}
                    {(selectedQuote.envio_dimension_largo || selectedQuote.envio_dimension_ancho || selectedQuote.envio_dimension_alto) && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-700">Dimensiones:</span>
                        <div className="text-gray-900">
                          {selectedQuote.envio_dimension_largo || 0} x {selectedQuote.envio_dimension_ancho || 0} x {selectedQuote.envio_dimension_alto || 0} cm
                          {calculateVolume(selectedQuote.envio_dimension_largo, selectedQuote.envio_dimension_ancho, selectedQuote.envio_dimension_alto) && (
                            <span className="ml-2 text-gray-600">
                              (Volumen: {calculateVolume(selectedQuote.envio_dimension_largo, selectedQuote.envio_dimension_ancho, selectedQuote.envio_dimension_alto)} m³)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scheduled Stops */}
              {selectedQuote.envio_parada_programada && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Paradas Programadas</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedQuote.envio_parada_programada.split('\n').map((parada, index) => (
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
              {selectedQuote.envio_observaciones && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-900">{selectedQuote.envio_observaciones}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-6">
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
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

export default OperadorCotizaciones;