// src/components/PaymentComponent.tsx
import React, { useState } from 'react';

const PaymentComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const createPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-mercadopago-preference`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: 'Plan Premium Mensual',
              quantity: 1,
              unit_price: 10000
            }
          ],
          back_urls: {
            success: `${window.location.origin}/success`,
            failure: `${window.location.origin}/failure`,
            pending: `${window.location.origin}/pending`
          }
        })
      });

      const data = await response.json();

      // Redirigir al checkout de MercadoPago
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        console.error('No se pudo obtener el link de pago');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={createPayment} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Creando pago...' : 'Pagar con MercadoPago'}
      </button>
    </div>
  );
};

export default PaymentComponent;