// src/pages/Subscription.tsx
import React from 'react';
import PaymentComponent from '../components/PaymentComponent';
import { useQuoteLimit } from '../hooks/useQuoteLimit';
import { CheckCircle } from 'lucide-react';

const Subscription: React.FC = () => {
  const { quotesUsed, quotesLimit, hasReachedLimit, refreshCount } = useQuoteLimit();
  
  const handleFreePlan = () => {
    // Reset the quote count for demonstration purposes
    // In a real app, this would involve backend logic to reset monthly quotas
    localStorage.removeItem('quoteCount');
    refreshCount();
    alert('¡Plan Básico activado! Tu contador de cotizaciones ha sido reiniciado.');
  };

  return (
    <div className="p-6">
      {/* Limit Warning Banner */}
      {hasReachedLimit && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Límite de Cotizaciones Alcanzado
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Has utilizado {quotesUsed} de {quotesLimit} cotizaciones gratuitas. 
                Actualiza tu plan para continuar solicitando envíos.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-6">Planes de Suscripción</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Básico - GRATIS */}
        <div className={`border rounded-lg p-6 ${hasReachedLimit ? 'bg-gray-50 border-gray-300' : 'bg-green-50'}`}>
          <h3 className="text-xl font-semibold mb-4">Plan Básico</h3>
          <p className="text-3xl font-bold mb-4 text-green-600">GRATIS</p>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Cotizaciones utilizadas</span>
              <span>{quotesUsed}/{quotesLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  hasReachedLimit ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((quotesUsed / quotesLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <ul className="mb-6">
            <li>✓ <strong>5 cotizaciones unicas</strong></li>
            <li>✓ Seguimiento básico</li>
            <li>✓ Soporte por email</li>
          </ul>
          <button 
            onClick={handleFreePlan}
            disabled={hasReachedLimit}
            className={`w-full font-bold py-2 px-4 rounded transition-colors ${
              !hasReachedLimit 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!hasReachedLimit ? 'Plan Actual' : 'Límite Alcanzado'}
          </button>
        </div>

        {/* Plan Premium */}
        <div className={`border rounded-lg p-6 ${hasReachedLimit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
          <h3 className="text-xl font-semibold mb-4">Plan Premium</h3>
          <p className="text-3xl font-bold mb-4">$10.000 <span className="text-sm">ARS/mes</span></p>
          {hasReachedLimit && (
            <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">¡Recomendado!</p>
              <p className="text-xs text-blue-700">Perfecto para empresas medianas</p>
            </div>
          )}
          <ul className="mb-6">
            <li>✓ <strong>200 cotizaciones/mes</strong></li>
            <li>✓ Seguimiento avanzado</li>
            <li>✓ Soporte prioritario</li>
            <li>✓ Reportes detallados</li>
          </ul>
          <PaymentComponent 
            title="Plan Premium Mensual"
            price={10000}
            description="Suscripción mensual Plan Premium - 200 cotizaciones"
          />
        </div>

        {/* Plan Empresarial */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Plan Empresarial</h3>
          <p className="text-3xl font-bold mb-4">$30.000 <span className="text-sm">ARS/mes</span></p>
          {hasReachedLimit && (
            <div className="mb-4 bg-purple-100 border border-purple-300 rounded-lg p-3">
              <p className="text-sm text-purple-800 font-medium">Sin límites</p>
              <p className="text-xs text-purple-700">Para empresas grandes</p>
            </div>
          )}
          <ul className="mb-6">
            <li>✓ <strong>Cotizaciones ilimitadas</strong></li>
            <li>✓ Todo del Plan Premium</li>
            <li>✓ API integración</li>
            <li>✓ Soporte dedicado</li>
            <li>✓ Gestión de equipos</li>
          </ul>
          <PaymentComponent 
            title="Plan Empresarial Mensual"
            price={30000}
            description="Suscripción mensual Plan Empresarial - Cotizaciones ilimitadas"
          />
        </div>
      </div>
    </div>
  );
};

export default Subscription;