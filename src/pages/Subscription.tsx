// src/pages/Subscription.tsx
import React from 'react';
import PaymentComponent from '../components/PaymentComponent';

const Subscription: React.FC = () => {
  const handleFreePlan = () => {
    // Aquí puedes agregar la lógica para activar el plan gratuito
    // Por ejemplo: guardar en base de datos, actualizar estado del usuario, etc.
    alert('¡Plan Básico activado! Ahora tienes acceso a 5 cotizaciones mensuales.');
    // Opcional: redirigir al dashboard
    // window.location.href = '/app';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Planes de Suscripción</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Básico - GRATIS */}
        <div className="border rounded-lg p-6 bg-green-50">
          <h3 className="text-xl font-semibold mb-4">Plan Básico</h3>
          <p className="text-3xl font-bold mb-4 text-green-600">GRATIS</p>
          <ul className="mb-6">
            <li>✓ <strong>5 cotizaciones/mes</strong></li>
            <li>✓ Seguimiento básico</li>
            <li>✓ Soporte por email</li>
          </ul>
          <button 
            onClick={handleFreePlan}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Activar Plan Gratuito
          </button>
        </div>

        {/* Plan Premium */}
        <div className="border rounded-lg p-6 border-blue-500">
          <h3 className="text-xl font-semibold mb-4">Plan Premium</h3>
          <p className="text-3xl font-bold mb-4">$15.000 <span className="text-sm">ARS/mes</span></p>
          <ul className="mb-6">
            <li>✓ <strong>200 cotizaciones/mes</strong></li>
            <li>✓ Seguimiento avanzado</li>
            <li>✓ Soporte prioritario</li>
            <li>✓ Reportes detallados</li>
          </ul>
          <PaymentComponent 
            title="Plan Premium Mensual"
            price={15000}
            description="Suscripción mensual Plan Premium - 200 cotizaciones"
          />
        </div>

        {/* Plan Empresarial */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Plan Empresarial</h3>
          <p className="text-3xl font-bold mb-4">$30.000 <span className="text-sm">ARS/mes</span></p>
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