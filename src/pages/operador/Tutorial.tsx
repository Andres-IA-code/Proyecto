import React from 'react';
import { BarChart, Package, Calculator, Truck, User, BookOpen } from 'lucide-react';

const Tutorial: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutorial del Sistema</h1>
          <p className="text-gray-600 mt-1">Aprende a usar todas las funciones de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              El <strong>Dashboard</strong> es tu panel principal donde puedes ver un resumen completo de tu actividad.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Visualiza tus estadísticas de viajes (programados, en curso y completados)</li>
              <li>Revisa tus ingresos totales y el promedio por viaje</li>
              <li>Consulta la distancia total recorrida</li>
              <li>Accede rápidamente a tus viajes activos</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Solicitar Viajes</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              En <strong>Solicitar Viajes</strong> puedes ver todas las oportunidades de negocio disponibles.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Explora solicitudes de envío publicadas por dadores de carga</li>
              <li>Filtra las oportunidades por estado (Solicitado, Pendiente, Completado)</li>
              <li>Revisa los detalles de cada envío: origen, destino, tipo de carga</li>
              <li>Haz clic en "Cotizar" para enviar tu oferta</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <Calculator className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cotizaciones</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              En <strong>Cotizaciones</strong> administras todas tus ofertas enviadas a los clientes.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Visualiza el estado de tus cotizaciones (Pendiente, Aceptada, Rechazada)</li>
              <li>Filtra por estado para encontrar rápidamente lo que buscas</li>
              <li>Revisa los datos del cliente y contacto</li>
              <li>Ve el monto ofertado y la fecha de vigencia</li>
              <li>Las cotizaciones aceptadas se convierten automáticamente en viajes</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Gestión de Viajes</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              En <strong>Gestión de Viajes</strong> controlas el ciclo de vida completo de tus viajes.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Ve todos tus viajes organizados por estado</li>
              <li>Haz clic en "Iniciar Viaje" cuando comiences el traslado</li>
              <li>Usa "Completar Viaje" cuando hayas finalizado la entrega</li>
              <li>Los contadores se actualizan automáticamente al cambiar el estado</li>
              <li>Consulta todos los detalles del viaje: ruta, carga, programación</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-100 rounded-full p-3">
              <User className="h-6 w-6 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Perfil</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              En <strong>Perfil</strong> puedes gestionar tu información personal y empresarial.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Actualiza tus datos personales (nombre, apellido, contacto)</li>
              <li>Modifica tu dirección y ubicación</li>
              <li>Mantén tu información actualizada para mejor comunicación</li>
              <li>Revisa tu tipo de cuenta (Persona Física o Jurídica)</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Consejos Importantes</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm font-medium text-blue-800 mb-1">Responde Rápido</p>
              <p className="text-xs text-gray-600">Las cotizaciones tienen vigencia limitada. Envía tus ofertas lo antes posible para no perder oportunidades.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm font-medium text-green-800 mb-1">Actualiza Estados</p>
              <p className="text-xs text-gray-600">Mantén los estados de tus viajes actualizados. Esto ayuda a tener un seguimiento preciso y estadísticas confiables.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm font-medium text-orange-800 mb-1">Revisa Detalles</p>
              <p className="text-xs text-gray-600">Antes de cotizar, lee cuidadosamente todos los detalles del envío: peso, dimensiones, tipo de carga y fechas.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Tutorial;
