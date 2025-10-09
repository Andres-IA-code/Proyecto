import React from 'react';

export function OperadorCotizaciones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Cotizaciones</h1>
        <p className="text-gray-600 mt-2">Gestiona tus cotizaciones enviadas</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">No tienes cotizaciones pendientes</p>
      </div>
    </div>
  );
}
