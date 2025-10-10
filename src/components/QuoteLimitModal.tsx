import React from 'react';
import { AlertTriangle, CreditCard, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuoteLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotesUsed: number;
  quotesLimit: number;
}

const QuoteLimitModal: React.FC<QuoteLimitModalProps> = ({
  isOpen,
  onClose,
  quotesUsed,
  quotesLimit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Límite de Cotizaciones Alcanzado
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Has utilizado <strong>{quotesUsed} de {quotesLimit}</strong> cotizaciones disponibles en tu plan gratuito.
            </p>
            <p className="text-gray-600">
              Para continuar solicitando envíos, necesitas actualizar tu suscripción a un plan premium.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">Beneficios de los Planes Premium:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Plan Premium:</strong> 200 cotizaciones/mes</li>
              <li>• <strong>Plan Enterprise:</strong> Cotizaciones ilimitadas</li>
              <li>• Seguimiento avanzado y reportes detallados</li>
              <li>• Soporte prioritario</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <Link
              to="/app/subscription"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              onClick={onClose}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Planes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteLimitModal;