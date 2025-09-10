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
      // Configurar MercadoPago directamente
      const client = new MercadoPagoConfig({
        accessToken: 'TEST-tu-access-token-aqui', // ← Pon tu token aquí
      });

      const preference = new Preference(client);

      const response = await preference.create({
        body: {
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
        }
      });

      // Redirigir al checkout de MercadoPago
      window.open(response.init_point, '_blank');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error al crear el pago. Verifica las credenciales.');
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