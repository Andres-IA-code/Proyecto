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
  const [filterCargoType, setFilterCargoType] = useState('all');
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);


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

      // Check if user has a valid id_Usuario from profile
      if (!currentUser.profile?.id_Usuario || currentUser.profile.id_Usuario === undefined) {
        setError('Perfil de usuario incompleto. Por favor, complete su perfil antes de continuar.');
        return;
      }

      // Fetch opportunities from General table where Estado is 'Pendiente' or similar
      let query = supabase
        .from('General')
        .select('*')
        .neq('id_Usuario', currentUser.profile.id_Usuario); // Exclude own shipments
      
      // If not showing all records, filter by specific states
      if (!showAllRecords) {
        query = query.in('Estado', ['Pendiente', 'Activo', 'Disponible']);
      }
      
      const { data, error: fetchError } = await query.order('Fecha_Retiro', { ascending: true });

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

      // Preparar todos los datos posibles para la cotización
      const quoteData = {
        // IDs y referencias principales
        id_Usuario: currentUser.profile.id_Usuario,
        id_Envio: selectedOpportunity.id_Envio || selectedOpportunity.id_envio || selectedOpportunity.id,
        id_Operador: currentUser.profile.id_Usuario, // El operador que cotiza
        
        // Datos de la cotización
        Oferta: parseFloat(quoteAmount),
        Fecha: new Date().toISOString(),
        Vigencia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        Estado: 'Pendiente'
      };

      console.log('Guardando cotización con datos completos:', quoteData);
      const { error: insertError } = await supabase
        .from('Cotizaciones')
        .insert([quoteData]);

      if (insertError) {
        console.error('Error submitting quote:', insertError);
        setError(`Error al enviar la cotización: ${insertError.message}`);
        return;
      }

      // Close modal and refresh
      setShowQuoteModal(false);
      setSelectedOpportunity(null);
      setQuoteAmount('');
      
      // Show success message with more details
      alert(`¡Cotización enviada exitosamente!\n\nMonto: $${parseFloat(quoteAmount).toLocaleString()}\nEnvío: ${selectedOpportunity.Origen} → ${selectedOpportunity.Destino}\nVigencia: 7 días`);
      
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


  const filteredOpportunities = opportunities.filter(opportunity => {
    // Basic search
    const matchesSearch = !searchTerm || 
      (opportunity.Origen?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.Destino?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.Tipo_Carga?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.Nombre_Dador?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by cargo type
    const matchesFilter = filterCargoType === 'all' || 
      opportunity.Tipo_Carga?.toLowerCase() === filterCargoType.toLowerCase();


    return matchesSearch && matchesFilter;
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Oportunidades de Negocio
            </h1>
            <p className="text-gray-600">
              Encuentra y cotiza envíos disponibles en el marketplace
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Cargo Type Filter Dropdown */}
            <select
              value={filterCargoType}
              onChange={(e) => setFilterCargoType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los tipos de carga</option>
              <option value="general">General</option>
              <option value="refrigerada">Refrigerada</option>
              <option value="sobredimensionada">Sobredimensionada</option>
              <option value="peligrosa">Peligrosa</option>
            </select>

            {/* Show All Records Checkbox */}
            <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="showAllRecords"
                checked={showAllRecords}
                onChange={(e) => setShowAllRecords(e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showAllRecords" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Mostrar todos los registros
              </label>
            </div>
          </div>

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
                    {opportunity.Tipo_Carroceria && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">Carrocería:</span>
                        <span className="ml-1">{opportunity.Tipo_Carroceria}</span>
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
                    {opportunity.Parada_Programada && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Paradas:</span>
                          <div className="ml-1 space-y-1">
                            {opportunity.Parada_Programada.split('\n').map((parada, index) => (
                              <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {parada.trim()}
                              </div>
                            ))}
                          </div>
                        </div>
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
                setFilterCargoType('all');
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
    </div>
  );
};

export default OperadorOportunidades;