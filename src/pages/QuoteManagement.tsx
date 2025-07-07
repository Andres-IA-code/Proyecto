import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Star, User, MapPin, Package, Calendar, Clock, Truck } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface Quote {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Valor_Cotizacion?: number;
  Oferta: number;
  Fecha: string;
  Vigencia: string;
  Estado: string;
  Scoring?: number;
  // Datos del operador
  operador_nombre?: string;
  operador_apellido?: string;
  operador_tipo_persona?: string;
  operador_telefono?: string;
  operador_correo?: string;
  // Datos del envío desde General
  envio_origen?: string;
  envio_destino?: string;
  envio_tipo_carga?: string;
  envio_distancia?: number;
  envio_peso?: string;
  envio_parada_programada?: string;
  envio_fecha_retiro?: string;
  envio_nombre_dador?: string;
}

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [sortBy, setSortBy] = useState('fecha');
  const [filterStatus, setFilterStatus] = useState('all');
  const [processingQuoteId, setProcessingQuoteId] = useState<number | null>(null);

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

      console.log('Fetching quotes for user:', currentUser.profile.id_Usuario);

      // Buscar cotizaciones donde el usuario actual es el dador de carga (id_Usuario en Cotizaciones)
      const { data: quotesData, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .eq('id_Usuario', currentUser.profile.id_Usuario)
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching quotes:', fetchError);
        setError(`Error al cargar las cotizaciones: ${fetchError.message}`);
        return;
      }

      console.log('Quotes found:', quotesData?.length || 0);

      if (!quotesData || quotesData.length === 0) {
        setQuotes([]);
        return;
      }

      // Obtener datos relacionados para cada cotización
      const quotesWithDetails = await Promise.all(
        quotesData.map(async (quote) => {
          // Obtener datos del operador logístico
          const { data: operatorData } = await supabase
            .from('Usuarios')
            .select('Nombre, Apellido, Tipo_Persona, Telefono, Correo')
            .eq('id_Usuario', quote.id_Operador)
            .single();

          // Obtener datos del envío desde la tabla General
          const { data: shipmentData } = await supabase
            .from('General')
            .select('Origen, Destino, Tipo_Carga, Distancia, Peso, Parada_Programada, Fecha_Retiro, Nombre_Dador')
            .eq('id_Envio', quote.id_Envio)
            .single();

          return {
            ...quote,
            operador_nombre: operatorData?.Nombre,
            operador_apellido: operatorData?.Apellido,
            operador_tipo_persona: operatorData?.Tipo_Persona,
            operador_telefono: operatorData?.Telefono,
            operador_correo: operatorData?.Correo,
            envio_origen: shipmentData?.Origen,
            envio_destino: shipmentData?.Destino,
            envio_tipo_carga: shipmentData?.Tipo_Carga,
            envio_distancia: shipmentData?.Distancia,
            envio_peso: shipmentData?.Peso,
            envio_parada_programada: shipmentData?.Parada_Programada,
            envio_fecha_retiro: shipmentData?.Fecha_Retiro,
            envio_nombre_dador: shipmentData?.Nombre_Dador,
          };
        })
      );

      console.log('Quotes with details:', quotesWithDetails);
      setQuotes(quotesWithDetails);
    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteAction = async (quoteId: number, action: 'aceptar' | 'rechazar') => {
    try {
      setProcessingQuoteId(quoteId);

      const newStatus = action === 'aceptar' ? 'Aceptada' : 'Rechazada';

      const { error: updateError } = await supabase
        .from('Cotizaciones')
        .update({ Estado: newStatus })
        .eq('id_Cotizaciones', quoteId);

      if (updateError) {
        console.error('Error updating quote:', updateError);
        setError(`Error al ${action} la cotización`);
        return;
      }

      // Actualizar estado local
      setQuotes(prevQuotes =>
        prevQuotes.map(quote =>
          quote.id_Cotizaciones === quoteId
            ? { ...quote, Estado: newStatus }
            : quote
        )
      );

      // Mostrar mensaje de éxito
      const actionText = action === 'aceptar' ? 'aceptada' : 'rechazada';
      alert(`Cotización ${actionText} exitosamente`);

    } catch (err) {
      console.error('Error:', err);
      setError(`Error inesperado al ${action} la cotización`);
    } finally {
      setProcessingQuoteId(null);
    }
  };

  const getOperatorDisplayName = (quote: Quote) => {
    if (quote.operador_tipo_persona === 'Física') {
      return `${quote.operador_nombre || ''} ${quote.operador_apellido || ''}`.trim();
    } else {
      return quote.operador_nombre || 'Operador no especificado';
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'aceptada':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const calculateExpirationDate = (fechaCotizacion: string) => {
    try {
      const fecha = new Date(fechaCotizacion);
      fecha.setDate(fecha.getDate() + 1); // Agregar 1 día
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'No disponible';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'all') return true;
    return quote.Estado.toLowerCase() === filterStatus.toLowerCase();
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'precio':
        return (b.Oferta || b.Valor_Cotizacion || 0) - (a.Oferta || a.Valor_Cotizacion || 0);
      case 'fecha':
        return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
      case 'operador':
        return getOperatorDisplayName(a).localeCompare(getOperatorDisplayName(b));
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando cotizaciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <button
                onClick={fetchQuotes}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Cotizaciones Recibidas</h1>
            <p className="text-gray-500 mt-1">
              Gestiona las cotizaciones de los operadores logísticos
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aceptada">Aceptadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="fecha">Ordenar por Fecha</option>
                <option value="precio">Ordenar por Precio</option>
                <option value="operador">Ordenar por Operador</option>
              </select>
            </div>
          </div>
        </div>

        {sortedQuotes.length > 0 ? (
          <div className="space-y-6">
            {sortedQuotes.map((quote) => (
              <div 
                key={quote.id_Cotizaciones}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-gray-50"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Operador Logístico Info */}
                    <div className="lg:col-span-3">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        Operador Logístico
                      </h4>
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-md">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {getOperatorDisplayName(quote)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {quote.operador_tipo_persona === 'Física' ? 'Persona Física' : 'Empresa'}
                          </div>
                        </div>
                      </div>
                      {quote.operador_correo && (
                        <div className="text-xs text-gray-600 mb-1 flex items-center">
                          <span className="mr-1">📧</span>
                          {quote.operador_correo}
                        </div>
                      )}
                      {quote.operador_telefono && (
                        <div className="text-xs text-gray-600 flex items-center">
                          <span className="mr-1">📞</span>
                          {quote.operador_telefono}
                        </div>
                      )}
                    </div>
                    
                    {/* Detalles del Viaje */}
                    <div className="lg:col-span-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        Detalles del Viaje
                      </h4>
                      <div className="space-y-3">
                        {/* Origen y Destino */}
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin size={16} className="mr-2 text-green-600" />
                            <span className="font-medium">Origen:</span>
                            <span className="ml-1 text-gray-900">{quote.envio_origen || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={16} className="mr-2 text-red-600" />
                            <span className="font-medium">Destino:</span>
                            <span className="ml-1 text-gray-900">{quote.envio_destino || 'No especificado'}</span>
                          </div>
                        </div>

                        {/* Tipo de Carga y Detalles */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-xs">
                            <span className="font-medium text-gray-500">Tipo de Carga:</span>
                            <div className="text-gray-900 font-medium">{quote.envio_tipo_carga || 'No especificado'}</div>
                          </div>
                          {quote.envio_distancia && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-500">Distancia:</span>
                              <div className="text-gray-900 font-medium">{quote.envio_distancia} km</div>
                            </div>
                          )}
                          {quote.envio_peso && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-500">Peso:</span>
                              <div className="text-gray-900 font-medium">{quote.envio_peso} Tn</div>
                            </div>
                          )}
                          {quote.envio_nombre_dador && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-500">Dador:</span>
                              <div className="text-gray-900 font-medium">{quote.envio_nombre_dador}</div>
                            </div>
                          )}
                        </div>

                        {/* Paradas Programadas */}
                        {quote.envio_parada_programada && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <span className="font-medium text-blue-800 text-xs">Paradas Programadas:</span>
                            <div className="mt-1 space-y-1">
                              {quote.envio_parada_programada.split('\n').map((parada, index) => (
                                <div key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center">
                                  <MapPin size={10} className="mr-1" />
                                  {parada.trim()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Información de la Cotización */}
                    <div className="lg:col-span-3">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        Información de Cotización
                      </h4>
                      <div className="space-y-3">
                        {/* Oferta */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">
                              ${(quote.Oferta || quote.Valor_Cotizacion || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 font-medium">Valor de la Oferta</div>
                          </div>
                        </div>

                        {/* Fechas */}
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-600">
                            <Calendar size={14} className="mr-2 text-blue-500" />
                            <div>
                              <span className="font-medium">Fecha:</span>
                              <div className="text-gray-900">{formatDate(quote.Fecha)}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Clock size={14} className="mr-2 text-orange-500" />
                            <div>
                              <span className="font-medium">Vigencia:</span>
                              <div className="text-gray-900">{formatDate(quote.Vigencia)}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Clock size={14} className="mr-2 text-red-500" />
                            <div>
                              <span className="font-medium">Expira:</span>
                              <div className="text-gray-900">{calculateExpirationDate(quote.Fecha)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Estado */}
                        <div className="text-center">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                            {quote.Estado}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        Acciones
                      </h4>
                      {quote.Estado.toLowerCase() === 'pendiente' ? (
                        <div className="space-y-3">
                          <button 
                            onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'aceptar')}
                            disabled={processingQuoteId === quote.id_Cotizaciones}
                            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                          >
                            {processingQuoteId === quote.id_Cotizaciones ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Procesando...
                              </div>
                            ) : (
                              'Aceptar'
                            )}
                          </button>
                          <button 
                            onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'rechazar')}
                            disabled={processingQuoteId === quote.id_Cotizaciones}
                            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                          >
                            {processingQuoteId === quote.id_Cotizaciones ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Procesando...
                              </div>
                            ) : (
                              'Rechazar'
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-sm text-gray-500 bg-gray-100 rounded-lg p-3">
                            Cotización {quote.Estado.toLowerCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No hay cotizaciones disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all' 
                ? 'No has recibido cotizaciones aún. Cuando los operadores logísticos envíen cotizaciones para tus envíos, aparecerán aquí.'
                : `No hay cotizaciones con estado "${filterStatus}".`
              }
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <p>Para recibir cotizaciones:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Crea una solicitud de envío</li>
                <li>Los operadores verán tu solicitud</li>
                <li>Recibirás cotizaciones aquí</li>
              </ol>
            </div>
            <button
              onClick={fetchQuotes}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Actualizar Lista
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteManagement;