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
      
      console.log('=== INICIANDO BÚSQUEDA DE COTIZACIONES ===');

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('❌ No hay usuario autenticado');
        setError('Usuario no autenticado');
        return;
      }

      console.log('👤 Usuario autenticado:', {
        id_Usuario: currentUser.profile.id_Usuario,
        nombre: currentUser.profile.Nombre,
        tipoPersona: currentUser.profile.Tipo_Persona,
        rol: currentUser.profile.Rol_Operativo
      });

      // PASO 1: Verificar envíos del usuario en tabla General
      console.log('📦 PASO 1: Buscando envíos del usuario...');
      const { data: userShipments, error: shipmentsError } = await supabase
        .from('General')
        .select('id_Envio, Origen, Destino, Estado, Nombre_Dador')
        .eq('id_Usuario', currentUser.profile.id_Usuario);


      if (shipmentsError) {
        console.error('❌ Error en PASO 1:', shipmentsError);
        setError(`Error al cargar los envíos: ${shipmentsError.message}`);
        return;
      }

      console.log('✅ PASO 1 completado:', {
        totalEnvios: userShipments?.length || 0,
        envios: userShipments
      });
      
      if (!userShipments || userShipments.length === 0) {
        console.log('⚠️ RESULTADO: No hay envíos para este usuario');
        setDebugInfo({
          step: 'PASO 1',
          userId: currentUser.profile.id_Usuario,
          userName: currentUser.profile.Nombre,
          userShipments: [],
          totalShipments: 0,
          message: 'No se encontraron envíos para este usuario. Debe crear un envío primero.'
        });
        setQuotes([]);
        return;
      }

      const shipmentIds = userShipments.map(s => s.id_Envio);
      console.log('🔍 IDs de envíos extraídos:', shipmentIds);

      // PASO 2: Buscar TODAS las cotizaciones para estos envíos (sin joins complejos)
      console.log('💰 PASO 2: Buscando cotizaciones para estos envíos...');
      const { data: quotesData, error: quotesError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .in('id_Envio', shipmentIds);

      if (quotesError) {
        console.error('❌ Error en PASO 2:', quotesError);
        setError(`Error al cargar las cotizaciones: ${quotesError.message}`);
        return;
      }

      console.log('✅ PASO 2 completado:', {
        totalCotizaciones: quotesData?.length || 0,
        cotizaciones: quotesData
      });

      if (!quotesData || quotesData.length === 0) {
        console.log('⚠️ RESULTADO: No hay cotizaciones para estos envíos');
        setDebugInfo({
          step: 'PASO 2',
          userId: currentUser.profile.id_Usuario,
          userName: currentUser.profile.Nombre,
          userShipments,
          totalShipments: userShipments.length,
          shipmentIds,
          quotesData: [],
          totalQuotes: 0,
          message: 'Se encontraron envíos pero no hay cotizaciones para ellos. Los operadores aún no han cotizado.'
        });
        setQuotes([]);
        return;
      }

      // PASO 3: Obtener información adicional del operador para cada cotización
      console.log('👥 PASO 3: Obteniendo información de operadores...');
      const quotesWithOperatorInfo = await Promise.all(
        quotesData.map(async (quote) => {
          // Buscar información del operador
          const { data: operatorData } = await supabase
            .from('Usuarios')
            .select('Nombre, Apellido, Tipo_Persona')
            .eq('id_Usuario', quote.id_Operador)
            .single();

          // Buscar información del envío
          const envioInfo = userShipments.find(envio => envio.id_Envio === quote.id_Envio);

          return {
            ...quote,
            operador_nombre: operatorData?.Nombre,
            operador_apellido: operatorData?.Apellido,
            operador_tipo_persona: operatorData?.Tipo_Persona,
            envio_origen: envioInfo?.Origen,
            envio_destino: envioInfo?.Destino,
            envio_nombre_dador: envioInfo?.Nombre_Dador
          };
        })
      );

      console.log('✅ PASO 3 completado:', {
        cotizacionesConInfo: quotesWithOperatorInfo.length
      });

      // Guardar información completa de debug
      setDebugInfo({
        step: 'COMPLETADO',
        userId: currentUser.profile.id_Usuario,
        userName: currentUser.profile.Nombre,
        userRole: currentUser.profile.Rol_Operativo,
        userShipments,
        totalShipments: userShipments.length,
        shipmentIds,
        quotesData,
        totalQuotes: quotesData.length,
        quotesWithOperatorInfo,
        message: `Se encontraron ${quotesData.length} cotizaciones para ${userShipments.length} envíos`
      });

      setQuotes(quotesWithOperatorInfo);
      
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
            {/* Tabla de cotizaciones */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Cotización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Vigencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Oferta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operador Logístico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruta del Envío
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Envío
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Operador
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => {
                    const isExpired = isQuoteExpired(quote.Vigencia);
                    const daysUntilExpiry = getDaysUntilExpiry(quote.Vigencia);
                    
                    return (
                      <tr key={quote.id_Cotizaciones} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50' : ''}`}>
                        {/* ID Cotización */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{quote.id_Cotizaciones}
                          </div>
                          <div className="text-xs text-gray-500">
                            Envío: #{quote.id_Envio}
                          </div>
                        </td>

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
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                            {quote.Estado || 'Sin estado'}
                          </span>
                        </td>

                        {/* Oferta */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            ${(quote.Oferta || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500">
                            Monto total
                          </div>
                        </td>

                        {/* Operador Logístico */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quote.Nombre_Operador || 'Operador no especificado'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: #{quote.id_Operador}
                          </div>
                        </td>

                        {/* Ruta del Envío */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quote.envio_origen || 'N/A'} → {quote.envio_destino || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Envío #{quote.id_Envio}
                          </div>
                        </td>

                        {/* ID Envío */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            #{quote.id_Envio}
                          </div>
                        </td>

                        {/* ID Operador */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            #{quote.id_Operador}
                          </div>
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
                    Total de cotizaciones encontradas: {quotes.length}
                  </p>
                  <p className="text-xs text-blue-600">
                    Mostrando {filteredQuotes.length} cotizaciones con filtro actual
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
                  onClick={() => setShowDebug(!showDebug)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm mr-2"
                >
                  {showDebug ? 'Ocultar' : 'Mostrar'} Info Debug
                </button>
              </div>
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
                  <div><strong>Rol:</strong> {debugInfo.userRole}</div>
                  <div><strong>Total Envíos:</strong> {debugInfo.totalShipments}</div>
                  <div><strong>Cotizaciones Encontradas:</strong> {debugInfo.totalQuotes}</div>
                  <div><strong>Mensaje:</strong> {debugInfo.message}</div>
                  
                  {debugInfo.shipmentIds && (
                    <div className="mt-4">
                      <strong>IDs de Envíos:</strong>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugInfo.shipmentIds, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {debugInfo.userShipments && debugInfo.userShipments.length > 0 && (
                    <div className="mt-4">
                      <strong>Envíos del Usuario:</strong>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugInfo.userShipments, null, 2)}
                      </pre>
                    </div>
                  )}

                  {debugInfo.quotesData && debugInfo.quotesData.length > 0 && (
                    <div className="mt-4">
                      <strong>Cotizaciones Encontradas:</strong>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(debugInfo.quotesData, null, 2)}
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
  );
};

export default QuoteManagement;