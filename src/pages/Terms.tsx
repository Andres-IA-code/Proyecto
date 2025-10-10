import React from 'react';
import { ArrowLeft, FileText, Users, Truck, Shield, DollarSign, AlertTriangle, Clock, Star, Ban, Settings, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Términos y Condiciones
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              Condiciones de uso de la plataforma Time Truck
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 1. Aceptación de los Términos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">1. Aceptación de los Términos</h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                Al utilizar nuestra aplicación, los usuarios aceptan estos términos y condiciones. 
                Si no está de acuerdo, no utilice nuestros servicios.
              </p>
            </div>
          </div>

          {/* 2. Descripción del Servicio */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">2. Descripción del Servicio</h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg mb-4">
                Proporcionamos una plataforma tecnológica que conecta:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Users className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Clientes</h3>
                  </div>
                  <p className="text-gray-700">Personas o empresas que necesitan transportar carga</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Truck className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Transportistas</h3>
                  </div>
                  <p className="text-gray-700">Conductores profesionales con vehículos comerciales registrados</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Registro y Cuenta de Usuario */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">3. Registro y Cuenta de Usuario</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Requisitos para Clientes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-blue-800">Requisitos para Clientes</h3>
                </div>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Ser mayor de edad o representante legal de empresa</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Proporcionar información veraz y actualizada</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Cumplir con las regulaciones de transporte aplicables</span>
                  </li>
                </ul>
              </div>

              {/* Requisitos para Transportistas */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Truck className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-green-800">Requisitos para Transportistas</h3>
                </div>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Licencia de conducir profesional vigente</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Seguro de responsabilidad civil y de carga</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Vehículo en condiciones óptimas y documentación al día</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Cumplir con regulaciones de transporte de carga</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Responsabilidades */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">4. Responsabilidades</h2>
            </div>
            <div className="space-y-6">
              {/* De la Plataforma */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-xl font-semibold text-purple-800">De la Plataforma</h3>
                </div>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Mantener la funcionalidad del servicio</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Facilitar la comunicación entre usuarios</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Procesar pagos de forma segura</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Proporcionar soporte técnico</span>
                  </li>
                </ul>
              </div>

              {/* De los Clientes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-blue-800">De los Clientes</h3>
                </div>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Proporcionar información precisa sobre la carga</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Embalar adecuadamente la mercancía</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Estar presente en puntos de recogida y entrega</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Pagar las tarifas acordadas</span>
                  </li>
                </ul>
              </div>

              {/* De los Transportistas */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Truck className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-green-800">De los Transportistas</h3>
                </div>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Mantener vigentes licencias y seguros</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Transportar la carga de manera segura y profesional</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Cumplir con horarios acordados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Informar sobre cualquier incidente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Tarifas y Pagos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <DollarSign className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">5. Tarifas y Pagos</h2>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Las tarifas se establecen mediante acuerdo entre cliente y transportista</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>La plataforma cobra una comisión por el servicio de intermediación</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Los pagos se procesan a través de la aplicación</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Las disputas de pago se resuelven según procedimientos establecidos</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 6. Cancelaciones y Reembolsos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Clock className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">6. Cancelaciones y Reembolsos</h2>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Las cancelaciones deben realizarse con al menos [X] horas de anticipación</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Se aplicarán cargos por cancelación según la política establecida</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Los reembolsos se procesan según las circunstancias específicas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 7. Calificaciones y Comentarios */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Star className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">7. Calificaciones y Comentarios</h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-8">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Los usuarios pueden calificar y comentar sobre los servicios</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Las calificaciones deben ser honestas y basadas en la experiencia real</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Nos reservamos el derecho de eliminar contenido inapropiado</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 8. Prohibiciones */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Ban className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">8. Prohibiciones</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg mb-4">
                Está prohibido:
              </p>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Usar la plataforma para actividades ilegales</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Transportar materiales peligrosos sin autorización</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Proporcionar información falsa</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Interferir con el funcionamiento de la aplicación</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Contactar a otros usuarios fuera de la plataforma para evadir comisiones</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 9. Limitación de Responsabilidad */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">9. Limitación de Responsabilidad</h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Actuamos como intermediario tecnológico</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>No somos responsables por daños, pérdidas o retrasos en el transporte</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Los usuarios deben contar con seguros apropiados</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Nuestra responsabilidad se limita al monto de las comisiones recibidas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 10. Suspensión y Terminación */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Ban className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">10. Suspensión y Terminación</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg mb-4">
                Podemos suspender o terminar cuentas por:
              </p>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Violación de estos términos</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Actividad fraudulenta o ilegal</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Múltiples calificaciones negativas</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Falta de documentación requerida</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 11. Modificaciones */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Settings className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">11. Modificaciones</h2>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                Nos reservamos el derecho de modificar estos términos con previo aviso. 
                Los cambios entran en vigor tras su publicación en la aplicación.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-black text-white rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 mr-3" />
              <h3 className="text-xl font-bold">Contacto Legal</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Para consultas sobre estos términos y condiciones:
            </p>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <a 
                href="mailto:timetruck@gmail.com" 
                className="text-white hover:text-gray-300 underline font-medium"
              >
                timetruck@gmail.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;