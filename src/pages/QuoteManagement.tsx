import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface QuoteWithOperator {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Fecha: string;
  Vigencia: string;
  Estado: string;
  Oferta: number;
  // Datos del operador
  operador_nombre?: string;
  operador_apellido?: string;
  operador_tipo_persona?: string;
  // Datos del envío
  envio_origen?: string;
  envio_destino?: string;
}

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteWithOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('=== DEBUG COMPLETO DE COTIZACIONES ===');

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Construir el nombre del dador según el tipo de persona
      const nombreDador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('🔍 Buscando cotizaciones para:', nombreDador);
     console.log('👤 Datos del usuario actual:', {
       Nombre: currentUser.profile.Nombre,
       Apellido: currentUser.profile.Apellido,
       Tipo_Persona: currentUser.profile.Tipo_Persona,
       nombreDadorCalculado: nombreDador
     });

      // 1. MOSTRAR TODOS LOS REGISTROS DE COTIZACIONES
      console.log('📋 === CONSULTANDO TODOS LOS REGISTROS ===');
      const { data: allCotizaciones, error: allError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .order('Fecha', { ascending: false });

      if (allError) {
        console.error('❌ Error consultando todas las cotizaciones:', allError);
        setError(`Error al consultar cotizaciones: ${allError.message}`);
        return;
      }

      console.log('📊 TOTAL de cotizaciones en la tabla:', allCotizaciones?.length || 0);
      console.log('📋 TODOS los registros:', allCotizaciones);
      
      if (allCotizaciones && allCotizaciones.length > 0) {
        console.log('📝 Nombres de dadores únicos:', [...new Set(allCotizaciones.map(c => c.Nombre_Dador))]);
        console.log('🔍 Buscando coincidencias para:', nombreDador);
        
        // Filtrar manualmente para ver qué pasa
        const matchingQuotes = allCotizaciones.filter(quote => {
          const matches = quote.Nombre_Dador === nombreDador;
          console.log(`🔍 "${quote.Nombre_Dador}" === "${nombreDador}" ? ${matches}`);
          return matches;
        });
        
        console.log('✅ Cotizaciones que coinciden:', matchingQuotes.length);
        setQuotes(matchingQuotes);
      } else {
        console.log('❌ No hay cotizaciones en la tabla');
        setQuotes([]);
      }
      
      // 2. MOSTRAR INFORMACIÓN DETALLADA DE DEBUG
      setDebugInfo({
        totalCotizaciones: allCotizaciones?.length || 0,
        nombreBuscado: nombreDador,
        nombresEnTabla: allCotizaciones ? [...new Set(allCotizaciones.map(c => c.Nombre_Dador))] : [],
        cotizacionesCompletas: allCotizaciones || []
      });
      
    } catch (err) {
      console.error('💥 Error inesperado:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllCotizaciones = () => {
    // Mostrar TODAS las cotizaciones sin filtro
    if (debugInfo?.cotizacionesCompletas) {
      setQuotes(debugInfo.cotizacionesCompletas);
    }
  };

  const handleTestExactMatch = () => {
    // Probar búsqueda con "Andres Consiglio" exactamente
    const testQuotes = debugInfo?.cotizacionesCompletas?.filter((quote: any) => 
      quote.Nombre_Dador === "Andres Consiglio"
    ) || [];
    setQuotes(testQuotes);
    console.log('🧪 Test con "Andres Consiglio":', testQuotes.length, 'encontradas');
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
    switch (status?.toLowerCase()) {
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
    return quote.Estado?.toLowerCase() === filterStatus.toLowerCase();
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
      {/* Header */}
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
            {debugInfo && (
              <>
                <button
                  onClick={handleShowAllCotizaciones}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Mostrar Todas ({debugInfo.totalCotizaciones})
                </button>
                <button
                  onClick={handleTestExactMatch}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  Test "Andres Consiglio"
                </button>
              </>
            )}
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
        </div>

        {/* Debug Info Panel */}
        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-800 mb-2">🔍 Información de Debug</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Total cotizaciones en tabla:</strong> {debugInfo.totalCotizaciones}</div>
              <div><strong>Nombre buscado:</strong> "{debugInfo.nombreBuscado}"</div>
              <div><strong>Nombres en tabla:</strong> {debugInfo.nombresEnTabla.join(', ')}</div>
              <div><strong>Cotizaciones mostradas:</strong> {quotes.length}</div>
            </div>
          </div>
        )}

        {/* Mostrar cotizaciones */}
        {filteredQuotes.length > 0 ? (
          <div className="space-y-4">
            {/* Tabla simplificada de cotizaciones */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Cotización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oferta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre_Operador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Envío
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vigencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre_Dador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => {
                    return (
                      <tr key={quote.id_Cotizaciones} className="hover:bg-gray-50">
                        {/* ID Cotización */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{quote.id_Cotizaciones}
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateTime(quote.Fecha)}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                            {quote.Estado || 'Pendiente'}
                          </span>
                        </td>

                        {/* Oferta */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-green-600">
                            ${(quote.Oferta || 0).toLocaleString('es-AR')}
                          </div>
                        </td>

                        {/* Nombre_Operador - Campo directo de tabla Cotizaciones */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quote.Nombre_Operador || 'No especificado'}
                          </div>
                        </td>

                        {/* ID Envío */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            #{quote.id_Envio}
                          </div>
                        </td>

                        {/* Vigencia */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(quote.Vigencia)}
                          </div>
                        </td>

                        {/* Nombre_Dador - Campo directo de tabla Cotizaciones */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {quote.Nombre_Dador || 'No especificado'}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumen */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ✅ Cotizaciones encontradas: {quotes.length}
                  </p>
                  <p className="text-xs text-green-600">
                    Filtro aplicado: {filterStatus === 'all' ? 'Todos los estados' : filterStatus} | Mostrando: {filteredQuotes.length}
                  </p>
                </div>
              </div>
            </div>
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
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Para recibir cotizaciones:</p>
              <ol className="text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                <li>1. Crea una solicitud de envío</li>
                <li>2. Los operadores verán tu solicitud</li>
                <li>3. Recibirás cotizaciones aquí</li>
              </ol>
              <div className="mt-6">
                <button
                  onClick={fetchQuotes}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Actualizar Lista
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteManagement;