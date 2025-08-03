import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Star, User, MapPin, Package, Calendar, Clock, Truck, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface Quote {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Oferta: number;
  Fecha?: string;
  Vigencia?: string;
  Estado?: string;
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
      
      console.log('=== INICIANDO BÚSQUEDA DE COTIZACIONES ===');

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('❌ Usuario no autenticado');
        setError('Usuario no autenticado');
        return;
      }

      console.log('✅ Usuario autenticado:', {
        id_Usuario: currentUser.profile.id_Usuario,
        nombre: currentUser.profile.Nombre,
        email: currentUser.profile.Correo
      });

      // Primero, verificar si hay cotizaciones en la tabla
      console.log('🔍 Verificando cotizaciones en la base de datos...');
      const { data: allQuotes, error: allQuotesError } = await supabase
        .from('Cotizaciones')
        .select('*');
      
      console.log('📊 Total de cotizaciones en la base de datos:', allQuotes?.length || 0);
      if (allQuotes && allQuotes.length > 0) {
        console.log('📋 Primeras 3 cotizaciones encontradas:', allQuotes.slice(0, 3));
        console.log('👥 IDs de usuarios en cotizaciones:', [...new Set(allQuotes.map(q => q.id_Usuario))]);
      }
      
      if (allQuotesError) {
        console.error('❌ Error al verificar cotizaciones:', allQuotesError);
      }

      // Buscar cotizaciones donde el usuario actual es el dador de carga
      console.log('🎯 Buscando cotizaciones para id_Usuario:', currentUser.profile.id_Usuario);
      const { data: quotesData, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select(`
          id_Cotizaciones,
          id_Usuario,
          id_Envio,
          id_Operador,
          Fecha,
          Vigencia,
          Estado,
          Scoring,
          Oferta
        `)
        .eq('id_Usuario', currentUser.profile.id_Usuario)
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('❌ Error al buscar cotizaciones:', fetchError);
        setError(`Error al cargar las cotizaciones: ${fetchError.message}`);
        return;
      }

      console.log('✅ Cotizaciones encontradas para este usuario:', quotesData?.length || 0);
      if (quotesData && quotesData.length > 0) {
        console.log('📋 Cotizaciones del usuario:', quotesData);
      } else {
        console.log('⚠️ No se encontraron cotizaciones para id_Usuario:', currentUser.profile.id_Usuario);
      }

      if (!quotesData || quotesData.length === 0) {
        console.log('📝 Estableciendo array vacío de cotizaciones');
        setQuotes([]);
        return;
      }

      console.log('🔄 Obteniendo datos relacionados...');
      // Obtener datos relacionados para cada cotización
      const quotesWithDetails = await Promise.all(
        quotesData.map(async (quote) => {
          console.log(`📤 Procesando cotización ${quote.id_Cotizaciones}...`);
          
          // Obtener datos del operador logístico
          const { data: operatorData } = await supabase
            .from('Usuarios')
            .select('Nombre, Apellido, Tipo_Persona, Telefono, Correo')
            .eq('id_Usuario', quote.id_Operador)
            .single();
          
          console.log(`👤 Operador para cotización ${quote.id_Cotizaciones}:`, operatorData);

          // Obtener datos del envío desde la tabla General
          const { data: shipmentData } = await supabase
            .from('General')
            .select('Origen, Destino, Tipo_Carga, Distancia, Peso, Parada_Programada, Fecha_Retiro, Nombre_Dador')
            .eq('id_Envio', quote.id_Envio)
            .single();
          
          console.log(`📦 Envío para cotización ${quote.id_Cotizaciones}:`, shipmentData);

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

      console.log('✅ Cotizaciones con detalles completos:', quotesWithDetails);
      setQuotes(quotesWithDetails);
      
    } catch (err) {
      console.error('💥 Error inesperado:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
      console.log('=== FIN DE BÚSQUEDA DE COTIZACIONES ===');
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

  const isQuoteExpired = (vigenciaString: string) => {
    try {
      const vigencia = new Date(vigenciaString);
      const now = new Date();
      return vigencia < now;
    } catch {
      return false;
    }
  };

  const getDaysUntilExpiry = (vigenciaString: string) => {
    try {
      const vigencia = new Date(vigenciaString);
      const now = new Date();
      const diffTime = vigencia.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'all') return true;
    return quote.Estado.toLowerCase() === filterStatus.toLowerCase();
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'precio':
        return (b.Oferta || 0) - (a.Oferta || 0);
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
      {/* Header con filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cotizaciones Recibidas</h1>
            <p className="text-gray-500 mt-1">
              Campos de la tabla Cotizaciones: Fecha, Vigencia, Estado y Oferta
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchQuotes}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <RefreshCw size={16} className="mr-2" />
              Actualizar
            </button>
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

        {/* Tabla de campos específicos solicitados */}
        {sortedQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oferta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedQuotes.map((quote) => {
                  const isExpired = isQuoteExpired(quote.Vigencia);
                  const daysUntilExpiry = getDaysUntilExpiry(quote.Vigencia);
                  
                  return (
                    <tr key={quote.id_Cotizaciones} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50' : ''}`}>
                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(quote.Fecha)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(quote.Fecha).split(' ')[1]}
                        </div>
                      </td>

                      {/* Vigencia */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(quote.Vigencia)}
                        </div>
                        <div className={`text-xs ${isExpired ? 'text-red-500' : daysUntilExpiry <= 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {isExpired ? (
                            <div className="flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expirada
                            </div>
                          ) : daysUntilExpiry === 0 ? (
                            'Expira hoy'
                          ) : daysUntilExpiry === 1 ? (
                            'Expira mañana'
                          ) : (
                            `${daysUntilExpiry} días restantes`
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quote.Estado)}`}>
                          {quote.Estado}
                        </span>
                      </td>

                      {/* Oferta */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(quote.Oferta || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Valor total
                        </div>
                      </td>

                      {/* Operador */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getOperatorDisplayName(quote)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {quote.operador_tipo_persona === 'Física' ? 'Persona Física' : 'Empresa'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Ruta */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-green-500 mr-1" />
                            <span className="font-medium">{quote.envio_origen || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 text-red-500 mr-1" />
                            <span className="font-medium">{quote.envio_destino || 'No especificado'}</span>
                          </div>
                        </div>
                        {quote.envio_distancia && (
                          <div className="text-xs text-gray-500 mt-1">
                            {quote.envio_distancia} km
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {quote.Estado.toLowerCase() === 'pendiente' && !isExpired ? (
                          <div className="flex space-x-2 justify-end">
                            <button 
                              onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'aceptar')}
                              disabled={processingQuoteId === quote.id_Cotizaciones}
                              className="px-3 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Aceptar'}
                            </button>
                            <button 
                              onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'rechazar')}
                              disabled={processingQuoteId === quote.id_Cotizaciones}
                              className="px-3 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Rechazar'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {isExpired ? 'Expirada' : `Cotización ${quote.Estado.toLowerCase()}`}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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