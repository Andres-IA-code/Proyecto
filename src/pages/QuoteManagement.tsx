import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Star, User, MapPin, Package, Calendar, Clock, Truck, DollarSign, AlertCircle, RefreshCw, Database, Eye, BarChart3 } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface Quote {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Eficiencia?: string;
  Comunicacion?: string;
  Estado_Unidad?: string;
  Oferta?: number;
  Fecha?: string;
  Vigencia?: string;
  Estado?: string;
  Scoring?: number;
  Valor_Cotizacion?: number;
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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
        .select(`
          id_Cotizaciones,
          id_Usuario,
          id_Envio,
          id_Operador,
          Eficiencia,
          Comunicacion,
          Estado_Unidad,
          Oferta,
          Fecha,
          Vigencia,
          Estado,
          Scoring,
          Valor_Cotizacion
        `)
        .eq('id_Usuario', currentUser.profile.id_Usuario)
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching quotes:', fetchError);
        setError(`Error al cargar las cotizaciones: ${fetchError.message}`);
        return;
      }

      console.log('Quotes found:', quotesData?.length || 0);
      console.log('Raw quotes data:', quotesData);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No especificada';
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

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
    
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

  const isQuoteExpired = (vigenciaString?: string) => {
    if (!vigenciaString) return false;
    try {
      const vigencia = new Date(vigenciaString);
      const now = new Date();
      return vigencia < now;
    } catch {
      return false;
    }
  };

  const getDaysUntilExpiry = (vigenciaString?: string) => {
    if (!vigenciaString) return 0;
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
    return quote.Estado?.toLowerCase() === filterStatus.toLowerCase();
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'precio':
        return (b.Oferta || 0) - (a.Oferta || 0);
      case 'fecha':
        if (!a.Fecha && !b.Fecha) return 0;
        if (!a.Fecha) return 1;
        if (!b.Fecha) return -1;
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
            <p className="text-gray-500 mt-1 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Todos los campos de la tabla Cotizaciones
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
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 size={16} className="mr-1 inline" />
                Tabla
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye size={16} className="mr-1 inline" />
                Tarjetas
              </button>
            </div>
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

        {/* Schema Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Esquema completo de la tabla Cotizaciones
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-blue-700">id_Cotizaciones</span>
              <div className="text-xs text-gray-600">bigint (PK)</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-green-700">id_Usuario</span>
              <div className="text-xs text-gray-600">integer (FK)</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-purple-700">id_Envio</span>
              <div className="text-xs text-gray-600">integer (FK)</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-orange-700">id_Operador</span>
              <div className="text-xs text-gray-600">integer (FK)</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-red-700">Eficiencia</span>
              <div className="text-xs text-gray-600">text</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-indigo-700">Comunicacion</span>
              <div className="text-xs text-gray-600">text</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-pink-700">Estado_Unidad</span>
              <div className="text-xs text-gray-600">text</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-yellow-700">Oferta</span>
              <div className="text-xs text-gray-600">numeric</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-teal-700">Fecha</span>
              <div className="text-xs text-gray-600">timestamptz</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-cyan-700">Vigencia</span>
              <div className="text-xs text-gray-600">timestamptz</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-lime-700">Estado</span>
              <div className="text-xs text-gray-600">text</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-amber-700">Scoring</span>
              <div className="text-xs text-gray-600">integer</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <span className="font-bold text-emerald-700">Valor_Cotizacion</span>
              <div className="text-xs text-gray-600">integer</div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {sortedQuotes.length > 0 ? (
          viewMode === 'table' ? (
            /* Vista de tabla completa */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-blue-700 font-bold">ID</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-green-700 font-bold">Usuario</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-purple-700 font-bold">Envío</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-orange-700 font-bold">Operador</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-red-700 font-bold">Eficiencia</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-indigo-700 font-bold">Comunicación</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-pink-700 font-bold">Estado Unidad</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-yellow-700 font-bold">Oferta</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-teal-700 font-bold">Fecha</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-cyan-700 font-bold">Vigencia</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-lime-700 font-bold">Estado</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-amber-700 font-bold">Scoring</span>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="text-emerald-700 font-bold">Valor</span>
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedQuotes.map((quote) => {
                    const isExpired = isQuoteExpired(quote.Vigencia);
                    
                    return (
                      <tr key={quote.id_Cotizaciones} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50' : ''}`}>
                        {/* ID Cotizaciones */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="font-bold text-blue-700">
                            #{quote.id_Cotizaciones}
                          </div>
                        </td>

                        {/* ID Usuario */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-green-700 font-medium">
                            {quote.id_Usuario}
                          </div>
                        </td>

                        {/* ID Envío */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-purple-700 font-medium">
                            #{quote.id_Envio}
                          </div>
                          <div className="text-xs text-gray-500">
                            {quote.envio_origen} → {quote.envio_destino}
                          </div>
                        </td>

                        {/* ID Operador */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-orange-700 font-medium">
                            {quote.id_Operador}
                          </div>
                          <div className="text-xs text-gray-600">
                            {getOperatorDisplayName(quote)}
                          </div>
                        </td>

                        {/* Eficiencia */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-red-700">
                            {quote.Eficiencia || 'N/A'}
                          </div>
                        </td>

                        {/* Comunicación */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-indigo-700">
                            {quote.Comunicacion || 'N/A'}
                          </div>
                        </td>

                        {/* Estado Unidad */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-pink-700">
                            {quote.Estado_Unidad || 'N/A'}
                          </div>
                        </td>

                        {/* Oferta */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-yellow-700 font-bold">
                            ${(quote.Oferta || 0).toLocaleString()}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-teal-700 font-medium">
                            {formatDate(quote.Fecha)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {quote.Fecha ? formatDateTime(quote.Fecha).split(' ')[1] : ''}
                          </div>
                        </td>

                        {/* Vigencia */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-cyan-700'}`}>
                            {formatDate(quote.Vigencia)}
                          </div>
                          <div className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                            {isExpired ? 'Expirada' : `${getDaysUntilExpiry(quote.Vigencia)} días`}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                            {quote.Estado || 'Sin estado'}
                          </span>
                        </td>

                        {/* Scoring */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-amber-700 font-medium">
                            {quote.Scoring ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                {quote.Scoring}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </td>

                        {/* Valor Cotización */}
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="text-emerald-700 font-bold">
                            {quote.Valor_Cotizacion ? `$${quote.Valor_Cotizacion.toLocaleString()}` : 'N/A'}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {quote.Estado?.toLowerCase() === 'pendiente' && !isExpired ? (
                            <div className="flex space-x-1 justify-end">
                              <button 
                                onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'aceptar')}
                                disabled={processingQuoteId === quote.id_Cotizaciones}
                                className="px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Aceptar'}
                              </button>
                              <button 
                                onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'rechazar')}
                                disabled={processingQuoteId === quote.id_Cotizaciones}
                                className="px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Rechazar'}
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              {isExpired ? 'Expirada' : `Cotización ${quote.Estado?.toLowerCase() || 'sin estado'}`}
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
            /* Vista de tarjetas */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedQuotes.map((quote) => {
                const isExpired = isQuoteExpired(quote.Vigencia);
                
                return (
                  <div key={quote.id_Cotizaciones} className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${isExpired ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-blue-700">
                            Cotización #{quote.id_Cotizaciones}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Envío #{quote.id_Envio} • Operador {quote.id_Operador}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                          {quote.Estado || 'Sin estado'}
                        </span>
                      </div>

                      {/* Campos principales */}
                      <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <div className="text-xs font-medium text-yellow-700 mb-1">OFERTA</div>
                            <div className="text-lg font-bold text-yellow-800">
                              ${(quote.Oferta || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                            <div className="text-xs font-medium text-emerald-700 mb-1">VALOR</div>
                            <div className="text-lg font-bold text-emerald-800">
                              {quote.Valor_Cotizacion ? `$${quote.Valor_Cotizacion.toLocaleString()}` : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                            <div className="text-xs font-medium text-teal-700 mb-1">FECHA</div>
                            <div className="text-sm font-medium text-teal-800">
                              {formatDate(quote.Fecha)}
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg border ${isExpired ? 'bg-red-100 border-red-300' : 'bg-cyan-50 border-cyan-200'}`}>
                            <div className={`text-xs font-medium mb-1 ${isExpired ? 'text-red-700' : 'text-cyan-700'}`}>VIGENCIA</div>
                            <div className={`text-sm font-medium ${isExpired ? 'text-red-800' : 'text-cyan-800'}`}>
                              {formatDate(quote.Vigencia)}
                            </div>
                            <div className={`text-xs ${isExpired ? 'text-red-600' : 'text-cyan-600'}`}>
                              {isExpired ? 'Expirada' : `${getDaysUntilExpiry(quote.Vigencia)} días restantes`}
                            </div>
                          </div>
                        </div>

                        {/* Campos adicionales */}
                        <div className="space-y-2">
                          {quote.Eficiencia && (
                            <div className="flex justify-between text-sm">
                              <span className="text-red-700 font-medium">Eficiencia:</span>
                              <span className="text-gray-900">{quote.Eficiencia}</span>
                            </div>
                          )}
                          {quote.Comunicacion && (
                            <div className="flex justify-between text-sm">
                              <span className="text-indigo-700 font-medium">Comunicación:</span>
                              <span className="text-gray-900">{quote.Comunicacion}</span>
                            </div>
                          )}
                          {quote.Estado_Unidad && (
                            <div className="flex justify-between text-sm">
                              <span className="text-pink-700 font-medium">Estado Unidad:</span>
                              <span className="text-gray-900">{quote.Estado_Unidad}</span>
                            </div>
                          )}
                          {quote.Scoring && (
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-700 font-medium">Scoring:</span>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span className="text-gray-900">{quote.Scoring}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Información del operador */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs font-medium text-gray-700 mb-1">OPERADOR</div>
                          <div className="text-sm font-medium text-gray-900">
                            {getOperatorDisplayName(quote)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {quote.operador_tipo_persona === 'Física' ? 'Persona Física' : 'Empresa'}
                          </div>
                        </div>

                        {/* Información del envío */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs font-medium text-gray-700 mb-1">RUTA</div>
                          <div className="text-sm text-gray-900">
                            {quote.envio_origen || 'No especificado'} → {quote.envio_destino || 'No especificado'}
                          </div>
                          {quote.envio_distancia && (
                            <div className="text-xs text-gray-600">
                              {quote.envio_distancia} km
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      {quote.Estado?.toLowerCase() === 'pendiente' && !isExpired ? (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'aceptar')}
                            disabled={processingQuoteId === quote.id_Cotizaciones}
                            className="flex-1 px-3 py-2 border border-transparent rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Aceptar'}
                          </button>
                          <button 
                            onClick={() => handleQuoteAction(quote.id_Cotizaciones, 'rechazar')}
                            disabled={processingQuoteId === quote.id_Cotizaciones}
                            className="flex-1 px-3 py-2 border border-transparent rounded text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingQuoteId === quote.id_Cotizaciones ? 'Procesando...' : 'Rechazar'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-500 py-2">
                          {isExpired ? 'Cotización expirada' : `Cotización ${quote.Estado?.toLowerCase() || 'sin estado'}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
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