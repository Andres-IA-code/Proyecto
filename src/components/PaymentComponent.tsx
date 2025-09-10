// src/components/PaymentComponent.tsx
import React, { useState } from 'react';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const PaymentComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');

  // Configurar MercadoPago
  const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-3418322195445818-090922-a36386c142316bf9f3b9e994eaef5870-2678265045' // Reemplaza con tu token
  });

  const preference = new Preference(client);

  const createPayment = async () => {
    setLoading(true);
    try {
      const response = await preference.create({
        body: {
          items: [
            {
              title: 'Mi producto',
              quantity: 1,
              unit_price: 100
            }
          ],
          back_urls: {
            success: `${window.location.origin}/success`,
            failure: `${window.location.origin}/failure`,
            pending: `${window.location.origin}/pending`
          },
          auto_return: 'approved'
        }
      });

      // Redirigir al checkout de MercadoPago
      window.open(response.init_point, '_blank');
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