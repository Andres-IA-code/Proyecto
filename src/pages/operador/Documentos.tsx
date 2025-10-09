import React, { useState } from 'react';

const OperadorDocumentos = () => {
  const [showRemolqueForm, setShowRemolqueForm] = useState(false);
  const [showTractoresForm, setShowTractoresForm] = useState(false);
  const [showSemiForm, setShowSemiForm] = useState(false);
  const [dominioRemolque, setDominioRemolque] = useState('');
  const [dominioTractores, setDominioTractores] = useState('');
  const [dominioSemi, setDominioSemi] = useState('');

  const handleRemolqueClick = () => {
    setShowRemolqueForm(true);
    setShowTractoresForm(false);
    setShowSemiForm(false);
  };

  const handleTractoresClick = () => {
    setShowTractoresForm(true);
    setShowRemolqueForm(false);
    setShowSemiForm(false);
  };

  const handleSemiClick = () => {
    setShowSemiForm(true);
    setShowRemolqueForm(false);
    setShowTractoresForm(false);
  };

  const handleAceptarRemolque = () => {
    if (dominioRemolque.trim()) {
      console.log('Dominio Remolque ingresado:', dominioRemolque);
      // Aquí puedes agregar la lógica para guardar el dominio
      setDominioRemolque('');
      setShowRemolqueForm(false);
    }
  };

  const handleCancelarRemolque = () => {
    setDominioRemolque('');
    setShowRemolqueForm(false);
  };

  const handleAceptarTractores = () => {
    if (dominioTractores.trim()) {
      console.log('Dominio Tractores ingresado:', dominioTractores);
      // Aquí puedes agregar la lógica para guardar el dominio
      setDominioTractores('');
      setShowTractoresForm(false);
    }
  };

  const handleCancelarTractores = () => {
    setDominioTractores('');
    setShowTractoresForm(false);
  };

  const handleAceptarSemi = () => {
    if (dominioSemi.trim()) {
      console.log('Dominio Semi ingresado:', dominioSemi);
      // Aquí puedes agregar la lógica para guardar el dominio
      setDominioSemi('');
      setShowSemiForm(false);
    }
  };

  const handleCancelarSemi = () => {
    setDominioSemi('');
    setShowSemiForm(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Flota</h1>
      
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="flex space-x-8 mb-6">
            <button 
              onClick={handleTractoresClick}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-8 w-48 h-32 transition-colors duration-200 hover:shadow-md"
            >
              <img 
                src="/src/assets/remolque.png" 
                alt="Tractor" 
                className="w-8 h-8 mb-3"
              />
              <span className="text-lg font-medium text-gray-900">Tractores</span>
            </button>
            
            <button 
              onClick={handleSemiClick}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-8 w-48 h-32 transition-colors duration-200 hover:shadow-md"
            >
              <img 
                src="/src/assets/remolque (1) copy.png" 
                alt="Semi" 
                className="w-8 h-8 mb-3"
              />
              <span className="text-lg font-medium text-gray-900">Semi</span>
            </button>
            
            <button 
              onClick={handleRemolqueClick}
              className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-8 w-48 h-32 transition-colors duration-200 hover:shadow-md"
            >
              <img 
                src="/src/assets/truck_3954282 copy copy copy copy.png" 
                alt="Remolque" 
                className="w-8 h-8 mb-3"
              />
              <span className="text-lg font-medium text-gray-900">Remolque</span>
            </button>
          </div>

          {showTractoresForm && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Tractor</h3>
              
              <div className="mb-4">
                <label htmlFor="dominioTractores" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrese su Dominio
                </label>
                <input
                  type="text"
                  id="dominioTractores"
                  value={dominioTractores}
                  onChange={(e) => setDominioTractores(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: ABC123"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAceptarTractores}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Aceptar
                </button>
                <button
                  onClick={handleCancelarTractores}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {showSemiForm && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Semi</h3>
              
              <div className="mb-4">
                <label htmlFor="dominioSemi" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrese su Dominio
                </label>
                <input
                  type="text"
                  id="dominioSemi"
                  value={dominioSemi}
                  onChange={(e) => setDominioSemi(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: ABC123"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAceptarSemi}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Aceptar
                </button>
                <button
                  onClick={handleCancelarSemi}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {showRemolqueForm && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Remolque</h3>
              
              <div className="mb-4">
                <label htmlFor="dominioRemolque" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrese su Dominio
                </label>
                <input
                  type="text"
                  id="dominioRemolque"
                  value={dominioRemolque}
                  onChange={(e) => setDominioRemolque(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: ABC123"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAceptarRemolque}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Aceptar
                </button>
                <button
                  onClick={handleCancelarRemolque}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperadorDocumentos;