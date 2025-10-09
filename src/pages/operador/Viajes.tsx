import React from 'react';

export function OperadorViajes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Viajes</h1>
        <p className="text-gray-600 mt-2">Tus viajes programados y en curso</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">No tienes viajes programados</p>
      </div>
    </div>
  );
}
