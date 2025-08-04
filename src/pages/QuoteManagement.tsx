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
      setDebugInfo(null);
      
      console.log('=== BUSCANDO COTIZACIONES POR NOMBRE_DADOR ===');

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Construir el nombre del dador según el tipo de persona
      const nombreDador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('🔍 Buscando cotizaciones para Nombre_Dador:', nombreDador);

      // PASO 1: Buscar cotizaciones directamente por Nombre_Dador en la tabla Cotizaciones
      const { data: cotizacionesData, error: cotizacionesError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .eq('Nombre_Dador', nombreDador)
        .order('Fecha', { ascending: false });

      if (cotizacionesError) {
        console.error('❌ Error consultando Cotizaciones:', cotizacionesError);
        setError(`Error al consultar cotizaciones: ${cotizacionesError.message}`);
        return;
      }

      console.log('📊 Cotizaciones encontradas:', cotizacionesData?.length || 0);
      console.log('📋 Datos de cotizaciones:', cotizacionesData);

      if (!cotizacionesData || cotizacionesData.length === 0) {
        console.log('⚠️ No se encontraron cotizaciones para:', nombreDador);
        
        // Verificar si existen cotizaciones con nombres similares
        const { data: allQuotes } = await supabase
          .from('Cotizaciones')
          .select('Nombre_Dador')
          .not('Nombre_Dador', 'is', null);
        
        const uniqueNames = [...new Set(allQuotes?.map(q => q.Nombre_Dador) || [])];
        
        setDebugInfo({
          step: 'SIN COTIZACIONES ENCONTRADAS',
          nombreDadorBuscado: nombreDador,
          cotizacionesEncontradas: 0,
          nombresEnSistema: uniqueNames,
          message: `No se encontraron cotizaciones para "${nombreDador}". Nombres en sistema: ${uniqueNames.join(', ')}`
        });
        
        setQuotes([]);
        return;
      }

      // PASO 2: Para cada cotización, obtener información del envío
      const quotesWithShipmentInfo = await Promise.all(
        cotizacionesData.map(async (cotizacion) => {
          const { data: envioData } = await supabase
            .from('General')
            .select('Origen, Destino, Tipo_Carga, Peso')
            .eq('id_Envio', cotizacion.id_Envio)
            .single();

          return {
            ...cotizacion,
            envio_origen: envioData?.Origen,
            envio_destino: envioData?.Destino,
            envio_tipo_carga: envioData?.Tipo_Carga,
            envio_peso: envioData?.Peso
          };
        })
      );

      console.log('✅ Cotizaciones con información de envío:', quotesWithShipmentInfo.length);

      setDebugInfo({
        step: 'COTIZACIONES ENCONTRADAS',
        nombreDadorBuscado: nombreDador,
        cotizacionesEncontradas: cotizacionesData.length,
        cotizaciones: cotizacionesData.map(c => ({
          id: c.id_Cotizaciones,
          Fecha,
          Estado: c.Estado,
          Oferta,
          Nombre_Operador,
          Nombre_Dador: c.Nombre_Dador
        })),
        message: `Se encontraron ${cotizacionesData.length} cotizaciones para "${nombreDador}"`
      });

      setQuotes(quotesWithShipmentInfo);
      
    } catch (err) {
      console.error('💥 Error inesperado:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const getOperatorName = (quote: QuoteWithOperator) => {
    if (!quote.operador_nombre) return `Operador #${quote.id_Operador}`;
    
    if (quote.operador_tipo_persona === 'Física') {
      return `${quote.operador_nombre} ${quote.operador_apellido || ''}`.trim();
    } else {
      return quote.operador_nombre; // Business name for juridical persons
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
                            {quote.Nombre_Operador || 'Operador no especificado'}
                          </div>
                        </td>

                        {/* Información del Envío */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quote.envio_origen || 'N/A'} → {quote.envio_destino || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {quote.envio_tipo_carga && `${quote.envio_tipo_carga}`}
                            {quote.envio_peso && ` • ${quote.envio_peso} Tn`}
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
                            {quote.Nombre_Dador}
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Cotizaciones para: {debugInfo?.nombreDador || 'Usuario actual'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Total encontradas: {quotes.length} | Mostrando: {filteredQuotes.length}
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
            
            {/* Debug Information */}
            {showDebug && debugInfo && (
              <div className="mt-6 bg-gray-100 border border-gray-300 rounded-lg p-4 text-left">
                <h4 className="font-bold text-gray-800 mb-3">Información de Debug:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Paso Actual:</strong> {debugInfo.step}</div>
                  <div><strong>Usuario ID:</strong> {debugInfo.userId}</div>
                  <div><strong>Nombre Usuario:</strong> {debugInfo.userName}</div>
                  <div><strong>Nombre Dador Buscado:</strong> {debugInfo.nombreDador}</div>
                  <div><strong>Cotizaciones Encontradas:</strong> {debugInfo.cotizacionesEncontradas}</div>
                  <div><strong>Mensaje:</strong> {debugInfo.message}</div>
                  
                  {debugInfo.cotizaciones && debugInfo.cotizaciones.length > 0 && (
                    <div className="mt-4">
                      <strong>Cotizaciones Encontradas:</strong>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugInfo.cotizaciones, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default QuoteManagement;