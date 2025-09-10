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

 // src/components/PaymentComponent.tsx
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
            title: title,
            quantity: 1,
            unit_price: price,
            description: description
          }
        ],
        back_urls: {
          success: `${window.location.origin}/app/subscription?status=success`,
          failure: `${window.location.origin}/app/subscription?status=failure`,
          pending: `${window.location.origin}/app/subscription?status=pending`
        }
      })
    });

    const data = await response.json();
    
    if (data.init_point) {
      window.open(data.init_point, '_blank');
    } else {
      console.error('Error:', data);
      alert('Error al crear el pago');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
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