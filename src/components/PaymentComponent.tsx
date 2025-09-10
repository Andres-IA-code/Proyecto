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
      // Tu Access Token de MercadoPago
      const ACCESS_TOKEN = process.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 'TEST-token-aqui';

      const preferenceData = {
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
        },
        auto_return: 'approved'
      };

      // Llamada directa a la API de MercadoPago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('MercadoPago API Error:', data);
        alert(`Error: ${data.message || 'Error al crear la preferencia'}`);
        return;
      }

      // Redirigir al checkout de MercadoPago
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        console.error('No se recibió init_point:', data);
        alert('Error: No se pudo obtener el link de pago');
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Verifica tu internet e intenta de nuevo.');
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