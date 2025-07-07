import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Star, User, MapPin, Package, Calendar, Clock, Truck } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface Quote {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
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
  // Datos del envío
  envio_origen?: string;
  envio_destino?: string;
  envio_tipo_carga?: string;
  envio_distancia?: number;
  envio_peso?: string;
  envio_parada_programada?: string;
  envio_fecha_retiro?: string;
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

      // Fetch quotes for shipments owned by the current user
      const { data, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select(`
          *,
          operador:Usuarios!id_Operador(
            Nombre,
            Apellido,
            Tipo_Persona,
            Telefono,
            Correo
          ),
          envio:General!id_Envio(
            Origen,
            Destino,
            Tipo_Carga,
            Distancia,
            Peso,
            Parada_Programada,
            Fecha_Retiro
          )
        `)
        .eq('id_Usuario', currentUser.profile.id_Usuario)
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching quotes:', fetchError);
        setError('Error al cargar las cotizaciones');
        return;
      }

      // Transform the data to flatten the nested objects
      const transformedQuotes = (data || []).map(quote => ({
        ...quote,
        operador_nombre: quote.operador?.Nombre,
        operador_apellido: quote.operador?.Apellido,
        operador_tipo_persona: quote.operador?.Tipo_Persona,
        operador_telefono: quote.operador?.Telefono,
        operador_correo: quote.operador?.Correo,
        envio_origen: quote.envio?.Origen,
        envio_destino: quote.envio?.Destino,
        envio_tipo_carga: quote.envio?.Tipo_Carga,
        envio_distancia: quote.envio?.Distancia,
        envio_peso: quote.envio?.Peso,
        envio_parada_programada: quote.envio?.Parada_Programada,
        envio_fecha_retiro: quote.envio?.Fecha_Retiro,
      }));

      setQuotes(transformedQuotes);
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

      // Update local state
      setQuotes(prevQuotes =>
        prevQuotes.map(quote =>
          quote.id_Cotizaciones === quoteId
            ? { ...quote, Estado: newStatus }
            : quote
        )
      );

      // Show success message
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

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'all') return true;
    return quote.Estado.toLowerCase() === filterStatus.toLowerCase();
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'precio':
        return b.Oferta - a.Oferta;
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
          <div className="space-y-4">
            {sortedQuotes.map((quote) => (
              <div 
                key={quote.id_Cotizaciones}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Operador Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {getOperatorDisplayName(quote)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.operador_tipo_persona === 'Física' ? 'Persona Física' : 'Empresa'}
                          </div>
                        </div>
                      </div>
                      {quote.operador_correo && (
                        <div className="text-sm text-gray-600 mb-1">
                          📧 {quote.operador_correo}
                        </div>
                      )}
                      {quote.operador_telefono && (
                        <div className="text-sm text-gray-600">
                          📞 {quote.operador_telefono}
                        </div>
                      )}
                    </div>
                    
                    {/* Shipment Details */}
                    <div className="lg:col-span-4">
                      <h4 className="font-medium text-gray-900 mb-3">Detalles del Envío</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-2 text-green-600" />
                          <span className="font-medium">Origen:</span>
                          <span className="ml-1">{quote.envio_origen || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-2 text-red-600" />
                          <span className="font-medium">Destino:</span>
                          <span className="ml-1">{quote.envio_destino || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Package size={16} className="mr-2 text-gray-400" />
                          <span className="font-medium">Tipo de Carga:</span>
                          <span className="ml-1">{quote.envio_tipo_carga || 'No especificado'}</span>
                        </div>
                        {quote.envio_distancia && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Truck size={16} className="mr-2 text-gray-400" />
                            <span className="font-medium">Distancia:</span>
                            <span className="ml-1">{quote.envio_distancia} km</span>
                          </div>
                        )}
                        {quote.envio_peso && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Package size={16} className="mr-2 text-gray-400" />
                            <span className="font-medium">Peso:</span>
                            <span className="ml-1">{quote.envio_peso} Tn</span>
                          </div>
                        )}
                        {quote.envio_parada_programada && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Paradas Programadas:</span>
                            <div className="mt-1 space-y-1">
                              {quote.envio_parada_programada.split('\n').map((parada, index) => (
                                <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  📍 {parada.trim()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quote Details */}
                    <div className="lg:col-span-3">
                      <h4 className="font-medium text-gray-900 mb-3">Cotización</h4>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          ${quote.Oferta.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          <Calendar size={16} className="inline mr-1" />
                          Fecha: {formatDate(quote.Fecha)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <Clock size={16} className="inline mr-1" />
                          Expira: {formatDate(quote.Vigencia)}
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                            {quote.Estado}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="lg:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-3">Acciones</h4>
                      {quote.Estado.toLowerCase() === 'pendiente' ? (
                        <div className="space-y-2">
                          <button 
                            onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'aceptar')}
                            disabled={processingQuoteId === quote.id_Cotizaciones}
                            className="w-full py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Aceptar'}
                          </button>
                          <button 
                            onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'rechazar')}
                            disabled={processingQuoteId === quote.id_Cotizaciones}
                            className="w-full py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Rechazar'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Cotización {quote.Estado.toLowerCase()}
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
                ? 'No has recibido cotizaciones aún. Los operadores logísticos podrán enviar cotizaciones para tus envíos.'
                : `No hay cotizaciones con estado "${filterStatus}".`
              }
            </p>
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