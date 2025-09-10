// src/components/PaymentComponent.tsx
import React, { useState } from 'react';

interface PaymentComponentProps {
  title: string;
  price: number;
  description?: string;
  buttonText?: string;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ 
  title, 
  price, 
  description = '',
  buttonText = 'Pagar con MercadoPago'
}) => {
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
              title: title, // Ahora usa el prop
              quantity: 1,
              unit_price: price, // Ahora usa el prop
              description: description
            }
          ],
          back_urls: {
            success: `${window.location.origin}/app/subscription?status=success`,
            failure: `${window.location.origin}/app/subscription?status=failure`,
            pending: `${window.location.origin}/app/subscription?status=pending`
          },
          auto_return: 'approved'
        })
      });

      const data = await response.json();
      
      // Check for error in response
      if (data.error) {
        console.error('Payment error:', data.error);
        alert(`Error: ${data.error}`);
        return;
      }

      // Redirigir al checkout de MercadoPago
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        console.error('No se pudo obtener el link de pago:', data);
        alert('No se pudo obtener el link de pago. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al crear el pago. Por favor, verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={createPayment} 
      disabled={loading}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      {loading ? 'Procesando...' : buttonText}
    </button>
  );
};

export default PaymentComponent;