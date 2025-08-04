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
  const [allQuotes, setAllQuotes] = useState<QuoteWithOperator[]>([]);
  const [displayMode, setDisplayMode] = useState<'user' | 'all' | 'test'>('user');
  const [authDebug, setAuthDebug] = useState<any>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('=== ANÁLISIS COMPLETO DE COTIZACIONES ===');

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // VERIFICAR CONTEXTO DE AUTENTICACIÓN
      console.log('🔐 === VERIFICANDO AUTENTICACIÓN ===');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Usuario autenticado:', authUser?.email, authUser?.id);
      console.log('❌ Error de auth:', authError);
      
      setAuthDebug({
        authUser: authUser,
        authError: authError,
        profileUser: currentUser.profile
      });

      // Construir el nombre del dador según el tipo de persona
      const nombreDador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('👤 Usuario actual:', {
        id_Usuario: currentUser.profile.id_Usuario,
        Nombre: currentUser.profile.Nombre,
        Apellido: currentUser.profile.Apellido,
        nombreCompleto: nombreDador
      });

      // PASO 1: Verificar estructura de datos en Cotizaciones
      console.log('📊 === VERIFICANDO ESTRUCTURA DE DATOS ===');
      
      // Intentar con diferentes métodos de consulta
      console.log('🔍 Método 1: Consulta normal con usuario autenticado');
      const { data: allCotizacionesNormal, error: normalError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .order('id_Cotizaciones', { ascending: false });
      
      console.log('📊 Cotizaciones con consulta normal:', allCotizacionesNormal?.length || 0);
      console.log('❌ Error consulta normal:', normalError);
      
      // Método 2: Usar RPC para bypass de RLS si es necesario
      console.log('🔍 Método 2: Intentando consulta directa');
      let allCotizaciones = allCotizacionesNormal;
      let allError = normalError;
      
      // Si la consulta normal falla, intentar con una consulta más específica
      if (!allCotizaciones || allCotizaciones.length === 0) {
        console.log('🔄 Intentando consulta alternativa...');
        const { data: altData, error: altError } = await supabase
          .from('Cotizaciones')
          .select('id_Cotizaciones, id_Usuario, id_Envio, id_Operador, Fecha, Vigencia, Estado, Oferta, Nombre_Operador, Nombre_Dador')
          .limit(100);
        
        allCotizaciones = altData;
        allError = altError;
        console.log('📊 Cotizaciones con consulta alternativa:', altData?.length || 0);
        console.log('❌ Error consulta alternativa:', altError);
      }

      if (allError) {
        console.error('❌ Error obteniendo todas las cotizaciones:', allError);
      } else {
        console.log('📋 Total cotizaciones en tabla:', allCotizaciones?.length || 0);
        
        // Analizar la estructura de datos
        if (allCotizaciones && allCotizaciones.length > 0) {
          console.log('🔍 Estructura de primera cotización:', allCotizaciones[0]);
          
          // Verificar qué id_Usuario tienen las cotizaciones
          const usuariosEnCotizaciones = [...new Set(allCotizaciones.map(c => c.id_Usuario))];
          console.log('👥 IDs de usuarios en cotizaciones:', usuariosEnCotizaciones);
          
          // Verificar nombres de dadores
          const nombresEnCotizaciones = [...new Set(allCotizaciones.map(c => c.Nombre_Dador))];
          console.log('📝 Nombres de dadores en cotizaciones:', nombresEnCotizaciones);
          
          // Buscar cotizaciones que podrían ser del usuario actual
          const cotizacionesPorNombre = allCotizaciones.filter(c => 
            c.Nombre_Dador && c.Nombre_Dador.toLowerCase().includes('andres')
          );
          console.log('🎯 Cotizaciones que contienen "andres":', cotizacionesPorNombre);
        }
      }

      // PASO 2: Buscar cotizaciones del usuario actual
      console.log('🔍 === BUSCANDO COTIZACIONES DEL USUARIO ===');
      
      let quotesToShow: any[] = [];
      
      // Método 1: Por Nombre_Dador (búsqueda insensible a acentos)
      console.log('🔍 Método 1: Búsqueda por nombre con variaciones');
      const { data: quotesByName, error: nameError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .or(`Nombre_Dador.eq.${nombreDador},Nombre_Dador.eq.Andrés Consiglio,Nombre_Dador.ilike.%Andres%,Nombre_Dador.ilike.%Andrés%`)
        .order('Fecha', { ascending: false });
      
      console.log('📊 Cotizaciones por nombre (con variaciones):', quotesByName?.length || 0);
      console.log('❌ Error búsqueda por nombre:', nameError);
      
      // Método 2: Búsqueda específica para "Andrés Consiglio" (con acento)
      console.log('🔍 Método 2: Búsqueda específica con acento');
      const { data: quotesByAccentedName, error: accentError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .eq('Nombre_Dador', 'Andrés Consiglio')
        .order('Fecha', { ascending: false });
      
      console.log('📊 Cotizaciones por "Andrés Consiglio" (con acento):', quotesByAccentedName?.length || 0);
      console.log('❌ Error búsqueda con acento:', accentError);
      
      // Método 3: Búsqueda usando textSearch (insensible a acentos)
      console.log('🔍 Método 3: Búsqueda con textSearch');
      const { data: quotesByTextSearch, error: textSearchError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .textSearch('Nombre_Dador', 'Andres | Andrés', { type: 'websearch' })
        .order('Fecha', { ascending: false });
      
      console.log('📊 Cotizaciones por textSearch:', quotesByTextSearch?.length || 0);
      console.log('❌ Error textSearch:', textSearchError);
      
      // Método 4: Búsqueda flexible por nombre (sin acentos)
      console.log('🔍 Método 4: Búsqueda flexible con ilike');
      const { data: quotesByFlexibleName, error: flexibleError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .or(`Nombre_Dador.ilike.%Andres%,Nombre_Dador.ilike.%Andrés%`)
        .order('Fecha', { ascending: false });
      
      console.log('📊 Cotizaciones por búsqueda flexible:', quotesByFlexibleName?.length || 0);
      console.log('❌ Error búsqueda flexible:', flexibleError);
      
      // Método 5: Como operador (cotizaciones que he enviado)
      console.log('🔍 Método 5: Como operador');
      const { data: quotesAsOperator, error: operatorError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .eq('id_Operador', currentUser.profile.id_Usuario)
        .order('Fecha', { ascending: false });

      console.log('📊 Cotizaciones como operador:', quotesAsOperator?.length || 0);
      console.log('❌ Error como operador:', operatorError);

      // Método 6: Por id_Usuario (como respaldo)
      console.log('🔍 Método 6: Por id_Usuario');
      const { data: quotesByUserId, error: userIdError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .eq('id_Usuario', currentUser.profile.id_Usuario)
        .order('Fecha', { ascending: false });
      
      console.log('📊 Cotizaciones por id_Usuario:', quotesByUserId?.length || 0);
      console.log('❌ Error por id_Usuario:', userIdError);
      
      // Determinar qué cotizaciones mostrar (prioridad actualizada)
      if (quotesByName && quotesByName.length > 0) {
        console.log('✅ Mostrando cotizaciones por nombre (con variaciones)');
        quotesToShow = quotesByName;
      } else if (quotesByAccentedName && quotesByAccentedName.length > 0) {
        console.log('✅ Mostrando cotizaciones por "Andrés Consiglio" (con acento)');
        quotesToShow = quotesByAccentedName;
      } else if (quotesByTextSearch && quotesByTextSearch.length > 0) {
        console.log('✅ Mostrando cotizaciones por textSearch');
        quotesToShow = quotesByTextSearch;
      } else if (quotesByFlexibleName && quotesByFlexibleName.length > 0) {
        console.log('✅ Mostrando cotizaciones por búsqueda flexible');
        quotesToShow = quotesByFlexibleName;
      } else if (quotesByUserId && quotesByUserId.length > 0) {
        console.log('✅ Mostrando cotizaciones por id_Usuario');
        quotesToShow = quotesByUserId;
      } else if (quotesAsOperator && quotesAsOperator.length > 0) {
        console.log('✅ Mostrando cotizaciones como operador');
        quotesToShow = quotesAsOperator;
      } else {
        console.log('❌ No se encontraron cotizaciones');
        quotesToShow = [];
      }

      setQuotes(quotesToShow);
      
      // Guardar todas las cotizaciones para el botón "Mostrar Todas"
      if (allCotizaciones) {
        setAllQuotes(allCotizaciones);
      }
      
      // Información de debug
      setDebugInfo({
        totalCotizaciones: allCotizaciones?.length || 0,
        nombreBuscado: nombreDador,
        idUsuario: currentUser.profile.id_Usuario,
        authUser: authUser?.email,
        authUserId: authUser?.id,
        cotizacionesPorId: quotesByUserId?.length || 0,
        cotizacionesPorNombreVariaciones: quotesByName?.length || 0,
        cotizacionesPorNombreConAcento: quotesByAccentedName?.length || 0,
        cotizacionesPorTextSearch: quotesByTextSearch?.length || 0,
        cotizacionesPorNombreFlexible: quotesByFlexibleName?.length || 0,
        cotizacionesComoOperador: quotesAsOperator?.length || 0,
        nombresEnTabla: allCotizaciones ? [...new Set(allCotizaciones.map(c => c.Nombre_Dador))] : [],
        usuariosEnTabla: allCotizaciones ? [...new Set(allCotizaciones.map(c => c.id_Usuario))] : [],
        cotizacionesCompletas: allCotizaciones || [],
        errores: {
          normalError,
          nameError,
          accentError,
          textSearchError,
          flexibleError,
          operatorError,
          userIdError
        }
      });
      
    } catch (err) {
      console.error('💥 Error inesperado:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllCotizaciones = () => {
    setDisplayMode('all');
    setQuotes(allQuotes);
  };

  const handleTestExactMatch = () => {
    setDisplayMode('test');
    // Buscar específicamente "Andrés Consiglio" con acento
    const testQuotes = allQuotes.filter(quote => 
      quote.Nombre_Dador === 'Andrés Consiglio'
    );
    setQuotes(testQuotes);
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

  // Determinar qué cotizaciones mostrar según el modo de visualización
  let quotesToDisplay: QuoteWithOperator[] = [];
  
  if (displayMode === 'all') {
    quotesToDisplay = allQuotes;
  } else if (displayMode === 'test') {
    quotesToDisplay = allQuotes.filter(quote => 
      quote.Nombre_Dador?.toLowerCase().includes('andres consiglio')
    );
  } else {
    quotesToDisplay = quotes;
  }

  const filteredQuotes = quotesToDisplay.filter(quote => {
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
              <div><strong>Usuario autenticado:</strong> {debugInfo.authUser} (ID: {debugInfo.authUserId})</div>
              <div><strong>ID Usuario perfil:</strong> {debugInfo.idUsuario}</div>
              <div><strong>Nombres en tabla:</strong> {debugInfo.nombresEnTabla.join(', ')}</div>
              <div><strong>IDs de usuarios en tabla:</strong> {debugInfo.usuariosEnTabla.join(', ')}</div>
              <div><strong>Cotizaciones mostradas:</strong> {quotes.length}</div>
              
              {/* Mostrar errores si los hay */}
              {debugInfo.errores && Object.entries(debugInfo.errores).some(([_, error]) => error) && (
                <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                  <strong>Errores encontrados:</strong>
                  {Object.entries(debugInfo.errores).map(([method, error]) => 
                    error ? <div key={method}>• {method}: {error.message}</div> : null
                  )}
                </div>
              )}
            </div>
            
            {/* Botón para mostrar datos completos */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              {showDebug ? 'Ocultar' : 'Mostrar'} datos completos
            </button>
            
            {showDebug && debugInfo.cotizacionesCompletas && (
              <div className="mt-4 p-3 bg-white border rounded max-h-60 overflow-y-auto">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(debugInfo.cotizacionesCompletas, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Auth Debug Info */}
        {authDebug && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-yellow-800 mb-2">🔐 Estado de Autenticación</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <div><strong>Email autenticado:</strong> {authDebug.authUser?.email || 'No disponible'}</div>
              <div><strong>Auth User ID:</strong> {authDebug.authUser?.id || 'No disponible'}</div>
              <div><strong>Profile User ID:</strong> {authDebug.profileUser?.id_Usuario || 'No disponible'}</div>
              <div><strong>Error de autenticación:</strong> {authDebug.authError ? 'SÍ' : 'NO'}</div>
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