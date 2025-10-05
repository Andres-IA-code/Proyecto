import React, { useState, useEffect } from 'react';
import PaymentComponent from '../../components/PaymentComponent';
import { useOperadorQuoteLimit } from '../../hooks/useOperadorQuoteLimit';
import { CheckCircle, CreditCard, Star, Truck, Package, BarChart } from 'lucide-react';

type PlanType = 'basic' | 'premium' | 'enterprise' | null;

const OperadorSuscripcion: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const { quotesUsed, quotesLimit, hasReachedLimit, refreshCount } = useOperadorQuoteLimit();

  useEffect(() => {
    // Load selected plan from localStorage
    const savedPlan = localStorage.getItem('selectedPlan') as PlanType;
    if (savedPlan) {
      setSelectedPlan(savedPlan);
    }

    // Set up polling to refresh count every 5 seconds
    const intervalId = setInterval(() => {
      refreshCount();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [refreshCount]);

  const handlePlanSelection = (plan: PlanType) => {
    setSelectedPlan(plan);
    if (plan) {
      localStorage.setItem('selectedPlan', plan);
    } else {
      localStorage.removeItem('selectedPlan');
    }
  };

  const getQuotesLimit = () => {
    switch (selectedPlan) {
      case 'basic':
        return 5;
      case 'premium':
        return 200;
      case 'enterprise':
        return null; // Unlimited
      default:
        return 0;
    }
  };

  const getUsageDisplay = () => {
    const limit = getQuotesLimit();
    if (limit === null) {
      return 'Ilimitado';
    }
    return `${quotesUsed}/${limit}`;
  };

  const getUsagePercentage = () => {
    const limit = getQuotesLimit();
    if (limit === null) {
      return 75; // Show 75% for Enterprise as example
    }
    if (limit === 0) return 0;
    return Math.min((quotesUsed / limit) * 100, 100);
  };

  const handleFreePlan = () => {
    // Reset the quote count for demonstration purposes
    // In a real app, this would involve backend logic to reset monthly quotas
    localStorage.removeItem('operadorQuoteCount');
    refreshCount();
    alert('¡Plan Básico activado! Tu contador de cotizaciones ha sido reiniciado.');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planes de Suscripción</h1>
        <p className="text-gray-600 mt-1">Gestiona tu plan como operador logístico</p>
      </div>

      {/* Current Plan Status */}
      {selectedPlan && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Plan Actual: {selectedPlan === 'basic' ? 'Básico' : selectedPlan === 'premium' ? 'Premium' : 'Enterprise'}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Cotizaciones utilizadas: {getUsageDisplay()}
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-32 bg-blue-200 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-blue-800">
                {selectedPlan === 'enterprise' ? '∞' : `${Math.round(getUsagePercentage())}%`}
              </span>
            </div>
          </div>
        </div>
      )}

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
                Has utilizado {quotesUsed} de {getQuotesLimit()} cotizaciones disponibles. 
                Actualiza tu plan para continuar enviando cotizaciones.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Básico - GRATIS */}
        <div className={`border rounded-lg p-6 transition-all ${
          selectedPlan === 'basic' 
            ? 'border-green-500 bg-green-50 shadow-lg' 
            : hasReachedLimit && selectedPlan !== 'basic'
              ? 'bg-gray-50 border-gray-300' 
              : 'border-gray-300 hover:border-green-400 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Plan Básico</h3>
            {selectedPlan === 'basic' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Activo
              </span>
            )}
          </div>
          <p className="text-3xl font-bold mb-4 text-green-600">GRATIS</p>

          <div className="mb-4 bg-white rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Cotizaciones aceptadas</span>
              <span className="text-lg font-bold text-green-600">{quotesUsed}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  hasReachedLimit ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${getUsagePercentage()}%` }}
              ></div>
            </div>
            {hasReachedLimit && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                Has alcanzado el límite de cotizaciones
              </p>
            )}
          </div>

          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span><strong>5 cotizaciones únicas</strong></span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Seguimiento básico</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Soporte por email</span>
            </li>
          </ul>
          {selectedPlan === 'basic' && (
            <h3 className="w-full text-center font-bold py-2 px-4 rounded bg-green-500 text-white">
              Plan Actual
            </h3>
          )}
        </div>

        {/* Plan Premium */}
        <div className={`border rounded-lg p-6 transition-all ${
          selectedPlan === 'premium' 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : hasReachedLimit && selectedPlan !== 'premium'
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Plan Premium</h3>
            {selectedPlan === 'premium' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Activo
              </span>
            )}
          </div>
          <p className="text-3xl font-bold mb-4">$10.000 <span className="text-sm">ARS/mes</span></p>
          
          {hasReachedLimit && selectedPlan !== 'premium' && (
            <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">¡Recomendado!</p>
              <p className="text-xs text-blue-700">Perfecto para operadores medianos</p>
            </div>
          )}

          {selectedPlan === 'premium' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Cotizaciones utilizadas</span>
                <span>{getUsageDisplay()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span><strong>200 cotizaciones/mes</strong></span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>Seguimiento avanzado</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>Soporte prioritario</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>Reportes detallados</span>
            </li>
          </ul>
          
          {selectedPlan === 'premium' ? (
            <h3 className="w-full text-center font-bold py-2 px-4 rounded bg-blue-500 text-white">
              Plan Actual
            </h3>
          ) : (
            <PaymentComponent
              title="Plan Premium Mensual - Operador"
              price={10000}
              description="Suscripción mensual Plan Premium para Operador Logístico - 200 cotizaciones"
              buttonText="Suscribirse a Premium"
            />
          )}
        </div>

        {/* Plan Enterprise */}
        <div className={`border rounded-lg p-6 transition-all ${
          selectedPlan === 'enterprise' 
            ? 'border-purple-500 bg-purple-50 shadow-lg' 
            : 'border-gray-300 hover:border-purple-400 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Plan Enterprise</h3>
            {selectedPlan === 'enterprise' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                Activo
              </span>
            )}
          </div>
          <p className="text-3xl font-bold mb-4">$30.000 <span className="text-sm">ARS/mes</span></p>
          
          {hasReachedLimit && selectedPlan !== 'enterprise' && (
            <div className="mb-4 bg-purple-100 border border-purple-300 rounded-lg p-3">
              <p className="text-sm text-purple-800 font-medium">Sin límites</p>
              <p className="text-xs text-purple-700">Para operadores grandes</p>
            </div>
          )}

          {selectedPlan === 'enterprise' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Cotizaciones utilizadas</span>
                <span>Ilimitado</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          )}
          
          <ul className="mb-6 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
              <span><strong>Cotizaciones ilimitadas</strong></span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
              <span>Todo del Plan Premium</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
              <span>API integración</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
              <span>Soporte dedicado</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
              <span>Gestión de equipos</span>
            </li>
          </ul>
          
          {selectedPlan === 'enterprise' ? (
            <h3 className="w-full text-center font-bold py-2 px-4 rounded bg-purple-500 text-white">
              Plan Actual
            </h3>
          ) : (
            <PaymentComponent
              title="Plan Enterprise Mensual - Operador"
              price={30000}
              description="Suscripción mensual Plan Enterprise para Operador Logístico - Cotizaciones ilimitadas"
              buttonText="Suscribirse a Enterprise"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OperadorSuscripcion;