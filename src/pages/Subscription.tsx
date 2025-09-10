// src/pages/Subscription.tsx
import React from 'react';
import PaymentComponent from '../components/PaymentComponent';

const Subscription: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Planes de Suscripción</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Básico */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Plan Básico</h3>
          <p className="text-3xl font-bold mb-4">$5.000 <span className="text-sm">ARS/mes</span></p>
          <ul className="mb-6">
            <li>✓ 10 cotizaciones/mes</li>
            <li>✓ Seguimiento básico</li>
            <li>✓ Soporte por email</li>
          </ul>
          <PaymentComponent 
            title="Plan Básico Mensual"
            price={5000}
            description="Suscripción mensual Plan Básico"
          />
        </div>

        {/* Plan Premium */}
        <div className="border rounded-lg p-6 border-blue-500">
          <h3 className="text-xl font-semibold mb-4">Plan Premium</h3>
          <p className="text-3xl font-bold mb-4">$15.000 <span className="text-sm">ARS/mes</span></p>
          <ul className="mb-6">
            <li>✓ Cotizaciones ilimitadas</li>
            <li>✓ Seguimiento avanzado</li>
            <li>✓ Soporte prioritario</li>
          </ul>
          <PaymentComponent 
            title="Plan Premium Mensual"
            price={15000}
            description="Suscripción mensual Plan Premium"
          />
        </div>

        {/* Plan Empresarial */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Plan Empresarial</h3>
          <p className="text-3xl font-bold mb-4">$30.000 <span className="text-sm">ARS/mes</span></p>
          <ul className="mb-6">
            <li>✓ Todo del Premium</li>
            <li>✓ API integración</li>
            <li>✓ Soporte dedicado</li>
          </ul>
          <PaymentComponent 
            title="Plan Empresarial Mensual"
            price={30000}
            description="Suscripción mensual Plan Empresarial"
          />
        </div>
      </div>
    </div>
  );
};

export default Subscription;