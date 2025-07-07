Here's the fixed version with the missing closing brackets added:

```typescript
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Package, Truck, Route, User, Filter, Search, RefreshCw, Plus } from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';

// [Previous interface and code remains the same until the filtered opportunities section]

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
```