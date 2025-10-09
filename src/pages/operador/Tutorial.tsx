import React from 'react';
import { Home, Truck, Package, History, CreditCard, User, BookOpen, RotateCcw } from 'lucide-react';

const Tutorial: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutorial del Sistema</h1>
          <p className="text-gray-600 mt-1">Guía completa de todas las funciones de la plataforma</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-2">Bienvenido a tu Panel de Operador Logístico</h2>
        <p className="text-blue-800 text-sm leading-relaxed">
          Esta plataforma te permite gestionar todas tus operaciones de transporte de carga de forma simple y eficiente.
          A continuación te explicamos cada sección del menú para que aproveches al máximo todas las herramientas disponibles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Inicio</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              Tu <strong>panel principal</strong> con toda la información clave de tu negocio.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Visualiza estadísticas en tiempo real de tus operaciones</li>
              <li>Consulta cotizaciones aceptadas y sus montos totales</li>
              <li>Revisa el volumen de carga transportado</li>
              <li>Analiza gráficos de volumen mensual de carga</li>
              <li>Accede rápidamente a la información más importante</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Solicitar Viaje</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              Encuentra y accede a <strong>oportunidades de transporte</strong> disponibles.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Explora solicitudes de envío publicadas por clientes</li>
              <li>Filtra oportunidades por estado y características</li>
              <li>Revisa detalles completos: ruta, carga, fechas y condiciones</li>
              <li>Envía cotizaciones con tus tarifas personalizadas</li>
              <li>Respeta los límites de tu plan de suscripción</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cotizaciones</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              Administra todas tus <strong>ofertas de servicio</strong> enviadas a los clientes.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Visualiza el estado de cada cotización enviada</li>
              <li>Filtra por: Pendiente, Aceptada o Rechazada</li>
              <li>Consulta datos del cliente y contacto</li>
              <li>Revisa montos ofertados y fechas de vigencia</li>
              <li>Las cotizaciones aceptadas se convierten automáticamente en viajes</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <RotateCcw className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Historial</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              Gestiona el <strong>ciclo completo de tus viajes</strong> aceptados.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Ve todos tus viajes organizados por estado</li>
              <li>Inicia viajes cuando comiences el traslado</li>
              <li>Marca viajes como completados al finalizar la entrega</li>
              <li>Los contadores se actualizan en tiempo real</li>
              <li>Consulta información detallada de cada viaje</li>
              <li>Accede a datos de contacto del cliente</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-100 rounded-full p-3">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Suscripción</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p className="text-sm leading-relaxed">
              Administra tu <strong>plan y pagos</strong> en la plataforma.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Consulta tu plan actual y características incluidas</li>
              <li>Revisa el límite de cotizaciones disponibles</li>
              <li>Cambia o mejora tu plan de suscripción</li>
              <li>Realiza pagos de forma segura con MercadoPago</li>
              <li>Accede al historial de tus transacciones</li>
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
              Mantén actualizada tu <strong>información de contacto</strong> y datos empresariales.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-2">
              <li>Actualiza tus datos personales o de empresa</li>
              <li>Modifica información de contacto (teléfono, email)</li>
              <li>Edita tu dirección y ubicación</li>
              <li>Consulta tu tipo de cuenta (Persona Física o Jurídica)</li>
              <li>Mantén tu perfil completo para mejor comunicación</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm border border-green-200 p-6 mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Flujo de Trabajo Recomendado</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
              <p className="text-sm font-bold text-gray-900">Busca Oportunidades</p>
            </div>
            <p className="text-xs text-gray-600 ml-11">
              Ve a "Solicitar Viaje" y explora las solicitudes disponibles. Filtra por ubicación, tipo de carga y fechas que te convengan.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
              <p className="text-sm font-bold text-gray-900">Envía tu Cotización</p>
            </div>
            <p className="text-xs text-gray-600 ml-11">
              Analiza los detalles del envío y envía tu mejor oferta. Asegúrate de calcular costos, distancia y tiempos correctamente.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
              <p className="text-sm font-bold text-gray-900">Monitorea tus Cotizaciones</p>
            </div>
            <p className="text-xs text-gray-600 ml-11">
              Revisa el estado de tus cotizaciones en la sección "Cotizaciones". Responde rápido si el cliente te contacta.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
              <p className="text-sm font-bold text-gray-900">Gestiona tus Viajes</p>
            </div>
            <p className="text-xs text-gray-600 ml-11">
              Una vez aceptada tu cotización, ve a "Historial" para iniciar el viaje y marcarlo como completado al finalizar.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">5</div>
              <p className="text-sm font-bold text-gray-900">Revisa tu Dashboard</p>
            </div>
            <p className="text-xs text-gray-600 ml-11">
              Analiza tus estadísticas en "Inicio" para conocer tu rendimiento y planificar el crecimiento de tu negocio.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-bold text-blue-800 mb-2">Responde Rápido</p>
          <p className="text-xs text-gray-600">
            Las cotizaciones tienen vigencia limitada. Envía tus ofertas lo antes posible para no perder oportunidades de negocio.
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-bold text-green-800 mb-2">Mantén Actualizado</p>
          <p className="text-xs text-gray-600">
            Actualiza los estados de tus viajes en tiempo real. Esto mejora tu reputación y facilita el seguimiento de tus operaciones.
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-bold text-orange-800 mb-2">Lee los Detalles</p>
          <p className="text-xs text-gray-600">
            Antes de cotizar, revisa cuidadosamente peso, dimensiones, tipo de carga, fechas y requisitos especiales del envío.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
