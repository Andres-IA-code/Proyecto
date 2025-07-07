import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Package, Truck, Route, User, Filter, Search, RefreshCw, Plus } from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';

interface Opportunity {
  id_Envio?: number;
  id_envio?: number;
  id?: number;
  id_Usuario: number;
  Estado?: string;
  Origen?: string;
  Destino?: string;
  Distancia?: number;
  Tipo_Carga?: string;
  Tipo_Vehiculo?: string;
  Tipo_Envio?: string;
  Necesidades_Especiales?: string;
  Operador?: string;
  Oferta?: number;
  Peso?: string;
  Dimension_Largo?: number;
  Dimension_Ancho?: number;
  Dimension_Alto?: number;
  Horario_Retiro?: string;
  Observaciones?: string;
  Costos?: string;
  Tipo_Carroceria?: string;
  Tiempo_Estimado_Operacion?: string;
  Parada_Programada?: string;
  Nombre_Dador?: string;
  Fecha_Retiro?: string;
}

const OperadorOportunidades: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Advanced search filters
  const [advancedFilters, setAdvancedFilters] = useState({
    origen: '',
    destino: '',
    tipoCarga: '',
    tipoVehiculo: '',
    pesoMin: '',
    pesoMax: '',
    distanciaMin: '',
    distanciaMax: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Fetch opportunities from General table where Estado is 'Pendiente' or similar
      const { data, error: fetchError } = await supabase
        .from('General')
        .select('*')
        .neq('id_Usuario', currentUser.id_Usuario) // Exclude own shipments
        .in('Estado', ['Pendiente', 'Activo', 'Disponible'])
        .order('Fecha_Retiro', { ascending: true });

      if (fetchError) {
        console.error('Error fetching opportunities:', fetchError);
        setError('Error al cargar las oportunidades');
        return;
      }

      setOpportunities(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado al cargar las oportunidades');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setQuoteAmount('');
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async () => {
    if (!selectedOpportunity || !quoteAmount.trim()) return;

    try {
      setIsSubmittingQuote(true);

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      const quoteData = {
        id_Usuario: currentUser.id_Usuario,
        id_Envio: selectedOpportunity.id_Envio || selectedOpportunity.id_envio || selectedOpportunity.id,
        Oferta: parseFloat(quoteAmount),
        Fecha: new Date().toISOString(),
        Vigencia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        Estado: 'Pendiente',
        Scoring: null
      };

      const { error: insertError } = await supabase
        .from('Cotizaciones')
        .insert([quoteData]);

      if (insertError) {
        console.error('Error submitting quote:', insertError);
        setError('Error al enviar la cotización');
        return;
      }

      // Close modal and refresh
      setShowQuoteModal(false);
      setSelectedOpportunity(null);
      setQuoteAmount('');
      
      // Show success message (you might want to add a toast notification here)
      alert('Cotización enviada exitosamente');
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado al enviar la cotización');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleCancelQuote = () => {
    setShowQuoteModal(false);
    setSelectedOpportunity(null);
    setQuoteAmount('');
  };

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      origen: '',
      destino: '',
      tipoCarga: '',
      tipoVehiculo: '',
      pesoMin: '',
      pesoMax: '',
      distanciaMin: '',
      distanciaMax: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    // Basic search
    const matchesSearch = !searchTerm || 
      (opportunity.Origen?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.Destino?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.Tipo_Carga?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.Nombre_Dador?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter type
    const matchesFilter = filterType === 'all' || 
      (filterType === 'urgente' && opportunity.Estado === 'Urgente') ||
      (filterType === 'normal' && opportunity.Estado !== 'Urgente');

    // Advanced filters
    let matchesAdvanced = true;
    if (showAdvancedSearch) {
      if (advancedFilters.origen && !opportunity.Origen?.toLowerCase().includes(advancedFilters.origen.toLowerCase())) {
        matchesAdvanced = false;
      }
      if (advancedFilters.destino && !opportunity.Destino?.toLowerCase().includes(advancedFilters.destino.toLowerCase())) {
        matchesAdvanced = false;
      }
      if (advancedFilters.tipoCarga && !opportunity.Tipo_Carga?.toLowerCase().includes(advancedFilters.tipoCarga.toLowerCase())) {
        matchesAdvanced = false;
      }
      if (advancedFilters.tipoVehiculo && !opportunity.Tipo_Vehiculo?.toLowerCase().includes(advancedFilters.tipoVehiculo.toLowerCase())) {
        matchesAdvanced = false;
      }
      if (advancedFilters.pesoMin && opportunity.Peso) {
        const peso = parseFloat(opportunity.Peso);
        if (peso < parseFloat(advancedFilters.pesoMin)) {
          matchesAdvanced = false;
        }
      }
      if (advancedFilters.pesoMax && opportunity.Peso) {
        const peso = parseFloat(opportunity.Peso);
        if (peso > parseFloat(advancedFilters.pesoMax)) {
          matchesAdvanced = false;
        }
      }
      if (advancedFilters.distanciaMin && opportunity.Distancia) {
        if (opportunity.Distancia < parseFloat(advancedFilters.distanciaMin)) {
          matchesAdvanced = false;
        }
      }
      if (advancedFilters.distanciaMax && opportunity.Distancia) {
        if (opportunity.Distancia > parseFloat(advancedFilters.distanciaMax)) {
          matchesAdvanced = false;
        }
      }
    }

    return matchesSearch && matchesFilter && matchesAdvanced;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando oportunidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Oportunidades de Negocio
              </h1>
              <p className="text-gray-600">
                Encuentra y cotiza envíos disponibles en el marketplace
              </p>
            </div>
            <button
              onClick={fetchOpportunities}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} className="mr-2" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por origen, destino, tipo de carga o dador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los envíos</option>
              <option value="urgente">Urgentes</option>
              <option value="normal">Normales</option>
            </select>

            {/* Advanced Search Toggle */}
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                showAdvancedSearch
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} className="inline mr-2" />
              Filtros Avanzados
            </button>
          </div>

          {/* Advanced Search Panel */}
          {showAdvancedSearch && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                  <input
                    type="text"
                    value={advancedFilters.origen}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, origen: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ciudad de origen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                  <input
                    type="text"
                    value={advancedFilters.destino}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, destino: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ciudad de destino"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carga</label>
                  <input
                    type="text"
                    value={advancedFilters.tipoCarga}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, tipoCarga: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Granos, Combustible"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo</label>
                  <input
                    type="text"
                    value={advancedFilters.tipoVehiculo}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, tipoVehiculo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Camión, Trailer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso Mín. (Tn)</label>
                  <input
                    type="number"
                    value={advancedFilters.pesoMin}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, pesoMin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso Máx. (Tn)</label>
                  <input
                    type="number"
                    value={advancedFilters.pesoMax}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, pesoMax: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distancia Mín. (km)</label>
                  <input
                    type="number"
                    value={advancedFilters.distanciaMin}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, distanciaMin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distancia Máx. (km)</label>
                  <input
                    type="number"
                    value={advancedFilters.distanciaMax}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, distanciaMax: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearAdvancedSearch}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredOpportunities.length} de {opportunities.length} oportunidades
          </p>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div
                key={opportunity.id_Envio || opportunity.id_envio || opportunity.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Envío #{opportunity.id_Envio || opportunity.id_envio || opportunity.id}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={16} className="mr-1" />
                        {opportunity.Nombre_Dador || 'Dador no especificado'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      opportunity.Estado === 'Urgente'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {opportunity.Estado || 'Disponible'}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center mb-4">
                    <MapPin size={16} className="text-blue-600 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {opportunity.Origen || 'No especificado'}
                        </span>
                        <Route size={16} className="mx-2 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {opportunity.Destino || 'No especificado'}
                        </span>
                      </div>
                      {opportunity.Distancia && (
                        <p className="text-xs text-gray-500 mt-1">
                          {opportunity.Distancia} km
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {opportunity.Tipo_Carga && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Package size={16} className="mr-2 text-gray-400" />
                        <span>{opportunity.Tipo_Carga}</span>
                        {opportunity.Peso && (
                          <span className="ml-2 text-gray-500">({opportunity.Peso} Tn)</span>
                        )}
                      </div>
                    )}
                    {opportunity.Tipo_Vehiculo && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck size={16} className="mr-2 text-gray-400" />
                        <span>{opportunity.Tipo_Vehiculo}</span>
                      </div>
                    )}
                    {opportunity.Fecha_Retiro && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>
                          {new Date(opportunity.Fecha_Retiro).toLocaleDateString('es-AR')}
                        </span>
                        {opportunity.Horario_Retiro && (
                          <span className="ml-2 text-gray-500">
                            a las {opportunity.Horario_Retiro}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  {(opportunity.Observaciones || opportunity.Necesidades_Especiales) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">Observaciones:</p>
                      <p className="text-xs text-gray-600">
                        {opportunity.Observaciones || opportunity.Necesidades_Especiales}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleQuoteOpportunity(opportunity)}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Enviar Cotización
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No hay oportunidades disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              No se encontraron envíos disponibles en este momento. Intenta ajustar los filtros o vuelve más tarde.
            </p>
            <button
              onClick={fetchOpportunities}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Actualizar Lista
            </button>
          </div>
        )}

      {filteredOpportunities.length === 0 && opportunities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Filter size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No se encontraron resultados
          </h3>
          <p className="text-gray-500 mb-6">
            No hay registros que coincidan con los criterios de búsqueda especificados.
          </p>
          <button
            onClick={() => {
              if (showAdvancedSearch) {
                clearAdvancedSearch();
              } else {
                setSearchTerm('');
              }
              setFilterType('all');
            }}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Enviar Cotización
              </h3>
              
              {/* Opportunity Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Detalles del Envío</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>ID:</strong> #{selectedOpportunity.id_Envio || selectedOpportunity.id_envio || selectedOpportunity.id}</div>
                  <div><strong>Dador:</strong> {selectedOpportunity.Nombre_Dador || 'No especificado'}</div>
                  <div><strong>Ruta:</strong> {selectedOpportunity.Origen || 'No especificado'} → {selectedOpportunity.Destino || 'No especificado'}</div>
                  <div><strong>Tipo de Carga:</strong> {selectedOpportunity.Tipo_Carga || 'No especificado'}</div>
                  {selectedOpportunity.Peso && (
                    <div><strong>Peso:</strong> {selectedOpportunity.Peso} Tn</div>
                  )}
                  {selectedOpportunity.Distancia && (
                    <div><strong>Distancia:</strong> {selectedOpportunity.Distancia} km</div>
                  )}
                </div>
              </div>

              {/* Quote Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de la Cotización *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isSubmittingQuote}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingrese el monto total de su cotización en pesos
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelQuote}
                  disabled={isSubmittingQuote}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitQuote}
                  disabled={isSubmittingQuote || !quoteAmount.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmittingQuote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Cotización'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperadorOportunidades;