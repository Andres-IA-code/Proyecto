import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Package, Truck, Route, User, Filter, Search, RefreshCw, Plus } from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';

interface Opportunity {
  id_Envio?: number;
  Nombre_Dador?: string;
  Origen?: string;
  Destino?: string;
  Fecha_Retiro?: string;
  Horario_Retiro?: string;
  Tipo_Carga?: string;
  Tipo_Vehiculo?: string;
  Tipo_Envio?: string;
  Parada_Programada?: string;
  Estado?: string;
  Peso?: string;
  Distancia?: number;
  Tipo_Carroceria?: string;
  Observaciones?: string;
  Tipo_Planificacion?: string;
  Necesidades_Especiales?: string;
  Operador?: string;
  Oferta?: number;
  Dimension_Largo?: number;
  Dimension_Ancho?: number;
  Dimension_Alto?: number;
  Costos?: string;
  Tiempo_Estimado_Operacion?: string;
  id_Usuario?: number;
  // Campos alternativos en minúsculas
  id_envio?: number;
  nombre_dador?: string;
  origen?: string;
  destino?: string;
  fecha_retiro?: string;
  horario_retiro?: string;
  tipo_carga?: string;
  tipo_vehiculo?: string;
  tipo_envio?: string;
  parada_programada?: string;
  estado?: string;
  peso?: string;
  distancia?: number;
  tipo_carroceria?: string;
  observaciones?: string;
  tipo_planificacion?: string;
  necesidades_especiales?: string;
  operador?: string;
  oferta?: number;
  dimension_largo?: number;
  dimension_ancho?: number;
  dimension_alto?: number;
  costos?: string;
  tiempo_estimado_operacion?: string;
  id_usuario?: number;
  // Campos genéricos
  id?: number;
  [key: string]: any; // Para campos dinámicos
}

const OperadorOportunidades: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAllRecords, setShowAllRecords] = useState(true);
  const [insertingTestData, setInsertingTestData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [workingTableName, setWorkingTableName] = useState<string>('');
  const [tableColumns, setTableColumns] = useState<string[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, [showAllRecords]);

  const diagnosticSupabase = async () => {
    try {
      console.log('🔍 Iniciando diagnóstico simplificado...');
      
      // MÉTODO SIMPLIFICADO: Solo nombres sin comillas dobles
      const possibleNames = [
        'General',           // Pascal case (más probable)
        'general',           // minúsculas
        'Envios',            // Pascal case
        'envios',            // minúsculas
        'Oportunidades',     // Pascal case
        'oportunidades',     // minúsculas
        'Transporte',        // Pascal case
        'transporte',        // minúsculas
        'GENERAL',           // mayúsculas
        'ENVIOS',            // mayúsculas
        'shipments',         // inglés
        'orders',            // órdenes
        'requests'           // solicitudes
      ];
      
      console.log('🔍 Probando nombres simples (sin comillas dobles)...');
      
      for (let i = 0; i < possibleNames.length; i++) {
        const tableName = possibleNames[i];
        
        try {
          console.log(`🔍 [${i + 1}/${possibleNames.length}] Probando: ${tableName}`);
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error && data !== null) {
            console.log(`✅ ¡TABLA ENCONTRADA!: "${tableName}"`);
            console.log('📋 Datos de muestra:', data[0]);
            
            // Obtener las columnas del primer registro
            const columns = data[0] ? Object.keys(data[0]) : [];
            console.log(`📋 Columnas detectadas (${columns.length}):`, columns.slice(0, 10), columns.length > 10 ? '...' : '');
            
            // Identificar columnas importantes
            const importantColumns = {
              id: columns.find(col => 
                col.toLowerCase().includes('id_envio') || 
                col.toLowerCase() === 'id' ||
                col === 'id_Envio' || 
                col === 'id_envio'
              ),
              user: columns.find(col => 
                col.toLowerCase().includes('id_usuario') || 
                col.toLowerCase().includes('user') ||
                col === 'id_Usuario' || 
                col === 'id_usuario'
              ),
              origin: columns.find(col => 
                col.toLowerCase().includes('origen') ||
                col === 'Origen' || 
                col === 'origen'
              ),
              destination: columns.find(col => 
                col.toLowerCase().includes('destino') ||
                col === 'Destino' || 
                col === 'destino'
              ),
              status: columns.find(col => 
                col.toLowerCase().includes('estado') ||
                col === 'Estado' || 
                col === 'estado'
              )
            };
            
            console.log('🎯 Columnas importantes identificadas:', importantColumns);
            
            return { 
              tableName, 
              sample: data[0], 
              columns: columns,
              importantColumns,
              method: 'simple_names_success',
              attempts: i + 1
            };
          }
        } catch (e) {
          // Silenciar errores de "tabla no existe" para limpiar la consola
          if (!e.message?.includes('does not exist') && !e.message?.includes('42P01')) {
            console.log(`⚠️ Error inesperado en "${tableName}":`, e.message);
          }
        }
      }
      
      // Si llegamos aquí, no se encontró ninguna tabla
      console.log('❌ No se encontró ninguna tabla compatible');
      
      return { 
        error: 'No se encontró tabla compatible con nombres simples',
        method: 'simple_names_failed',
        totalAttempts: possibleNames.length
      };
      
    } catch (error) {
      console.error('❌ Error crítico en diagnóstico:', error);
      return { error: error.message || error };
    }
  };

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo(null);
      
      console.log('🔍 Iniciando diagnóstico y carga de datos...');
      
      // PASO 1: Ejecutar diagnóstico
      const diagnostic = await diagnosticSupabase();
      console.log('📋 Resultado del diagnóstico:', diagnostic);
      
      setDebugInfo(diagnostic);
      
      // PASO 2: Si encontramos una tabla, usarla
      if (diagnostic?.tableName) {
        setWorkingTableName(diagnostic.tableName);
        setTableColumns(diagnostic.columns || []);
        
        console.log(`✅ Usando tabla: "${diagnostic.tableName}"`);
        
        let query = supabase
          .from(diagnostic.tableName)
          .select('*');
        
        if (!showAllRecords) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            // Intentar diferentes nombres de columna para el usuario
            const userColumns = ['id_Usuario', 'id_usuario', 'user_id', 'usuario_id'];
            
            for (const col of userColumns) {
              if (diagnostic.columns?.includes(col)) {
                const userId = currentUser?.profile?.id_Usuario || currentUser?.id;
                query = query.eq(col, userId);
                console.log(`🔍 Filtrando por ${col} = ${userId}`);
                break;
              }
            }
          }
        }
        
        // Intentar ordenar por diferentes columnas posibles (SIN comillas dobles)
        const idColumns = ['id_Envio', 'id_envio', 'id', 'envio_id'];
        for (const col of idColumns) {
          if (diagnostic.columns?.includes(col)) {
            query = query.order(col, { ascending: false });
            console.log(`📊 Ordenando por: ${col}`);
            break;
          }
        }
        
        query = query.limit(100);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('❌ Error al cargar datos:', error);
          setError(`Error: ${error.message}`);
          return;
        }
        
        console.log('✅ Datos cargados:', data?.length || 0, 'registros');
        
        if (data && data.length > 0) {
          console.log('📋 Primer registro:', data[0]);
          
          // Normalizar los datos para que funcionen con la interfaz existente
          const normalizedData = data.map(item => ({
            // Intentar mapear campos con diferentes nombres
            id_Envio: item.id_Envio || item.id_envio || item.id || 0,
            Nombre_Dador: item.Nombre_Dador || item.nombre_dador || item.dador || '',
            Origen: item.Origen || item.origen || item.origin || '',
            Destino: item.Destino || item.destino || item.destination || '',
            Fecha_Retiro: item.Fecha_Retiro || item.fecha_retiro || item.pickup_date || '',
            Horario_Retiro: item.Horario_Retiro || item.horario_retiro || item.pickup_time || '',
            Tipo_Carga: item.Tipo_Carga || item.tipo_carga || item.cargo_type || '',
            Tipo_Vehiculo: item.Tipo_Vehiculo || item.tipo_vehiculo || item.vehicle_type || '',
            Tipo_Envio: item.Tipo_Envio || item.tipo_envio || item.shipment_type || '',
            Parada_Programada: item.Parada_Programada || item.parada_programada || item.stops || '',
            Estado: item.Estado || item.estado || item.status || '',
            Peso: item.Peso || item.peso || item.weight || '',
            Distancia: item.Distancia || item.distancia || item.distance || 0,
            Tipo_Carroceria: item.Tipo_Carroceria || item.tipo_carroceria || item.body_type || '',
            Observaciones: item.Observaciones || item.observaciones || item.notes || '',
            id_Usuario: item.id_Usuario || item.id_usuario || item.user_id || 0,
            // Mantener todos los campos originales también
            ...item
          }));
          
          setOpportunities(normalizedData);
        } else {
          console.log('📋 No hay registros en la tabla');
          setOpportunities([]);
        }
        
      } else {
        // No se encontró tabla compatible
        setError(`No se encontró tabla compatible. Tablas disponibles: ${diagnostic?.availableTables?.join(', ') || 'ninguna'}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const insertTestData = async () => {
    try {
      setInsertingTestData(true);
      
      if (!workingTableName) {
        alert('Error: No se ha identificado una tabla válida');
        return;
      }
      
      // Get current user to use as id_Usuario
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert('Error: No se pudo obtener el usuario actual');
        return;
      }

      // Determinar qué columnas usar basándose en las disponibles
      const userIdColumn = tableColumns.includes('id_Usuario') ? 'id_Usuario' : 
                          tableColumns.includes('id_usuario') ? 'id_usuario' : 
                          tableColumns.includes('user_id') ? 'user_id' : 'id_Usuario';
      
      const userId = currentUser?.profile?.id_Usuario || currentUser?.id || 1;

      const testData = [
        {
          [userIdColumn]: userId,
          Estado: 'Solicitado',
          Origen: 'Ciudad de México, CDMX',
          Destino: 'Guadalajara, Jalisco',
          Distancia: 550,
          Tipo_Carga: 'Carga General',
          Tipo_Planificacion: 'Normal',
          Tipo_Vehiculo: 'N2',
          Tipo_Envio: 'Express',
          Peso: '2.5',
          Dimension_Largo: 300,
          Dimension_Ancho: 200,
          Dimension_Alto: 150,
          Fecha_Retiro: '2025-01-15T08:30:00+00:00',
          Horario_Retiro: '08:30:00',
          Observaciones: 'Carga frágil, manejar con cuidado',
          Tiempo_Estimado_Operacion: '24 horas',
          Parada_Programada: 'Parada 1: Querétaro, Qro\nParada 2: León, Gto',
          Nombre_Dador: 'Distribuidora Central S.A.',
          Tipo_Carroceria: 'Furgón'
        },
        {
          [userIdColumn]: userId,
          Estado: 'Solicitado',
          Origen: 'Monterrey, Nuevo León',
          Destino: 'Ciudad de México, CDMX',
          Distancia: 920,
          Tipo_Carga: 'Carga Refrigerada',
          Tipo_Planificacion: 'Urgente',
          Tipo_Vehiculo: 'N3',
          Tipo_Envio: 'Normal',
          Peso: '8.2',
          Dimension_Largo: 600,
          Dimension_Ancho: 250,
          Dimension_Alto: 250,
          Fecha_Retiro: '2025-01-16T14:00:00+00:00',
          Horario_Retiro: '14:00:00',
          Observaciones: 'Mantener cadena de frío',
          Tiempo_Estimado_Operacion: '2 días',
          Parada_Programada: null,
          Nombre_Dador: 'Comercial del Norte',
          Tipo_Carroceria: 'Tanque Cisterna'
        }
      ];

      console.log('📝 Insertando datos de prueba en tabla:', workingTableName, testData);

      const { data, error } = await supabase
        .from(workingTableName)
        .insert(testData)
        .select();

      if (error) {
        console.error('❌ Error insertando datos de prueba:', error);
        alert(`Error al insertar datos de prueba: ${error.message}`);
        return;
      }

      console.log('✅ Datos de prueba insertados exitosamente:', data);
      alert('¡Datos de prueba insertados exitosamente! Recargando...');
      
      // Reload the data
      await loadOpportunities();
      
    } catch (error: any) {
      console.error('💥 Error insertando datos de prueba:', error);
      alert(`Error inesperado: ${error.message}`);
    } finally {
      setInsertingTestData(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = 
      opportunity.Origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.Destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.Nombre_Dador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.Tipo_Carga?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      if (filterType === 'all') return true;
      
      const cargoType = opportunity.Tipo_Carga?.toLowerCase() || '';
      
      // Mapear los valores del filtro a posibles variaciones en los datos
      switch (filterType) {
        case 'general':
          return cargoType.includes('general') || cargoType.includes('seca') || cargoType === 'carga general';
        case 'refrigerada':
          return cargoType.includes('refrigerad') || cargoType.includes('frio') || cargoType.includes('congelad');
        case 'peligrosa':
          return cargoType.includes('peligros') || cargoType.includes('quimic') || cargoType.includes('toxico');
        case 'sobredimensionada':
          return cargoType.includes('sobredimension') || cargoType.includes('especial') || cargoType.includes('grande');
        case 'liquida':
          return cargoType.includes('liquid') || cargoType.includes('tanque') || cargoType.includes('cisterna');
        case 'graneles':
          return cargoType.includes('granel') || cargoType.includes('solido') || cargoType.includes('mineral');
        case 'contenedores':
          return cargoType.includes('contenedor') || cargoType.includes('container') || cargoType.includes('fcl') || cargoType.includes('lcl');
        case 'vehiculos':
          return cargoType.includes('vehiculo') || cargoType.includes('auto') || cargoType.includes('carro') || cargoType.includes('moto');
        case 'maquinaria':
          return cargoType.includes('maquinaria') || cargoType.includes('equipo') || cargoType.includes('industrial');
        default:
          return cargoType.includes(filterType.toLowerCase());
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'No especificada';
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
          return `${timeParts[0]}:${timeParts[1]}`;
        }
        return timeString;
      }
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'solicitado':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'cotizado':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'activo':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'fin':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'express':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'urgente':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'planificado':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleQuoteOpportunity = (opportunityId: number) => {
    console.log('Cotizar oportunidad:', opportunityId);
    alert(`Funcionalidad de cotización para envío #${opportunityId} - En desarrollo`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Planificar Envío</h1>
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3 text-gray-500">
                <RefreshCw className="animate-spin" size={24} />
                <span className="text-lg">Diagnosticando base de datos y cargando datos...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Planificar Envío</h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar datos</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={loadOpportunities}
                    className="bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium text-red-800 transition-colors"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Planificar Envío</h1>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por origen, destino, dador o tipo de carga..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos los tipos de carga</option>
            <option value="general">Carga General</option>
            <option value="refrigerada">Carga Refrigerada</option>
            <option value="peligrosa">Carga Peligrosa</option>
            <option value="sobredimensionada">Carga Sobredimensionada</option>
            <option value="liquida">Carga Líquida</option>
            <option value="graneles">Graneles</option>
            <option value="contenedores">Contenedores</option>
            <option value="vehiculos">Vehículos</option>
            <option value="maquinaria">Maquinaria</option>
          </select>
          <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="showAll"
              checked={showAllRecords}
              onChange={(e) => setShowAllRecords(e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showAll" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Mostrar todos los registros
            </label>
          </div>
        </div>
      </div>

      {/* Opportunities Cards */}
      {opportunities.length > 0 ? (
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity, index) => (
            <div key={opportunity.id_Envio || index} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* ID / Dador */}
                  <div className="lg:col-span-2">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID / DADOR</div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            Envío #{opportunity.id_Envio || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <User size={10} className="mr-1" />
                            {opportunity.Nombre_Dador || 'No especificado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estado y Paradas Programadas (Columna combinada) */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {/* Estado */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">ESTADO</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(opportunity.Estado)}`}>
                          {opportunity.Estado || 'Sin estado'}
                        </span>
                      </div>
                      
                      {/* Paradas Programadas */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">PARADAS PROGRAMADAS</div>
                        <div className="space-y-1">
                          {opportunity.Parada_Programada ? (
                            <div className="space-y-1">
                              {opportunity.Parada_Programada.split('\n').map((stop, index) => (
                                <div key={index} className="flex items-start justify-center text-blue-600">
                                  <MapPin size={10} className="mr-1 flex-shrink-0 mt-1" />
                                  <span className="text-xs break-words text-center">{stop}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-gray-400">
                              <MapPin size={12} className="mr-1 flex-shrink-0" />
                              <span className="text-xs">Sin paradas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Origen - Destino */}
                  <div className="lg:col-span-3">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ORIGEN - DESTINO</div>
                      <div className="space-y-2">
                        <div className="flex items-start text-green-600">
                          <MapPin size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium break-words">{opportunity.Origen || 'No especificado'}</span>
                        </div>
                        <div className="flex items-start text-red-600">
                          <MapPin size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium break-words">{opportunity.Destino || 'No especificado'}</span>
                        </div>
                        {opportunity.Distancia && (
                          <div className="flex items-center text-gray-500">
                            <Route size={12} className="mr-2 flex-shrink-0" />
                            <span className="text-xs">{opportunity.Distancia} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="lg:col-span-2">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">FECHA Y HORA RETIRO</div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <Calendar size={14} className="mr-2 flex-shrink-0" />
                          <span className="text-sm">{formatDate(opportunity.Fecha_Retiro)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock size={14} className="mr-2 flex-shrink-0" />
                          <span className="text-sm">{formatTime(opportunity.Horario_Retiro)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Carga */}
                  <div className="lg:col-span-2">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">TIPO DE CARGA</div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Package size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium">{opportunity.Tipo_Carga || 'No especificado'}</span>
                        </div>
                        {opportunity.Peso && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Peso:</span> {opportunity.Peso} Tn
                          </div>
                        )}
                        {opportunity.Tipo_Carroceria && (
                          <div className="text-xs text-blue-600 font-medium">
                            <span className="text-gray-500">Carrocería:</span> {opportunity.Tipo_Carroceria}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="lg:col-span-1">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ACCIONES</div>
                      <div>
                        <button
                          onClick={() => handleQuoteOpportunity(opportunity.id_Envio || 0)}
                          className="w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap text-center"
                        >
                          Cotizar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay registros en la tabla {workingTableName || 'detectada'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {showAllRecords 
              ? 'No hay ningún registro en la tabla de la base de datos.'
              : 'No hay solicitudes de envío en estado "Solicitado" en este momento.'
            }
          </p>
          <p className="text-sm text-gray-400">
            Sugerencia: Activa "Mostrar todos los registros" para ver si hay datos con otros estados
          </p>
        </div>
      )}

      {filteredOpportunities.length === 0 && opportunities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Filter size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No se encontraron resultados
          </h3>
          <p className="text-gray-500 mb-6">
            No hay registros que coincidan con los filtros aplicados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default OperadorOportunidades;