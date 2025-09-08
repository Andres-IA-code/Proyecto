import React, { useState } from 'react';
import { CreditCard, Check, Star, Shield, Clock, Users, Zap, Crown } from 'lucide-react';

const Subscription: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'enterprise'>('basic');

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'Gratis',
      period: '',
      description: 'Perfecto para pequeñas empresas que están comenzando',
      features: [
        '5 envíos por mes',
        '5 envíos por única vez',
        'Seguimiento básico',
        'Soporte por email',
        'Dashboard básico',
        'Cotizaciones ilimitadas'
      ],
      icon: <CreditCard className="h-8 w-8" />,
      color: 'blue',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$79',
      period: '/mes',
      description: 'Ideal para empresas en crecimiento con necesidades avanzadas',
      features: [
        'Hasta 200 envíos por mes',
        'Seguimiento en tiempo real',
        'Soporte prioritario 24/7',
        'Analytics avanzados',
        'API de integración',
        'Gestión de flota',
        'Reportes personalizados'
      ],
      icon: <Star className="h-8 w-8" />,
      color: 'purple',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199',
      period: '/mes',
      description: 'Solución completa para grandes operaciones logísticas',
      features: [
        'Envíos ilimitados',
        'Seguimiento avanzado con IoT',
        'Soporte dedicado',
        'Dashboard ejecutivo',
        'Integraciones personalizadas',
        'Gestión multi-flota',
        'SLA garantizado',
        'Consultoría logística'
      ],
      icon: <Crown className="h-8 w-8" />,
      color: 'gold',
      popular: false
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'text-blue-600'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        button: 'bg-purple-600 hover:bg-purple-700',
        icon: 'text-purple-600'
      },
      gold: {
        border: isSelected ? 'border-yellow-500' : 'border-gray-200',
        bg: isSelected ? 'bg-yellow-50' : 'bg-white',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        icon: 'text-yellow-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Plan Actual</h2>
            <p className="text-sm text-gray-500">Tu suscripción activa</p>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Activo
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Plan Actual</div>
                <div className="text-xl font-semibold text-gray-900">Premium</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Próxima Facturación</div>
                <div className="text-xl font-semibold text-gray-900">15 Feb 2025</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Envíos Utilizados</div>
                <div className="text-xl font-semibold text-gray-900">127/200</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Uso del Plan</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Envíos este mes</span>
              <span className="font-medium">127 de 200</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '63.5%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Planes Disponibles</h2>
          <p className="text-gray-500 mt-2">Elige el plan que mejor se adapte a tus necesidades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const colorClasses = getColorClasses(plan.color, isSelected);
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${colorClasses.border} ${colorClasses.bg}`}
                onClick={() => setSelectedPlan(plan.id as any)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 ${colorClasses.icon}`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${colorClasses.button}`}
                  >
                    {isSelected ? 'Plan Actual' : 'Seleccionar Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
};

export default Subscription;