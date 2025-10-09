import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Mail, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
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
              Política de Declaración de Privacidad
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              Protección y manejo responsable de datos personales en Time Truck
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Datos que Recopilamos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Database className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Datos que Recopilamos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Para Clientes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-blue-800">Para Clientes</h3>
                </div>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Nombre completo y datos de contacto</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Ubicación de origen y destino de la carga</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Tipo y características de la mercancía</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Información de facturación</span>
                  </li>
                </ul>
              </div>

              {/* Para Transportistas */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-green-800">Para Transportistas</h3>
                </div>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Datos personales y de contacto</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Licencia de conducir</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Información del vehículo (placas, capacidad, seguro)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Historial de servicios y calificaciones</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Uso de los Datos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Eye className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Uso de los Datos</h2>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Facilitar la conexión entre clientes y transportistas</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Mejorar nuestros servicios</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Cumplir con obligaciones legales</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Enviar notificaciones relevantes del servicio</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Compartir Información */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Compartir Información</h2>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Compartimos datos necesarios entre clientes y transportistas para completar el servicio</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>No vendemos información personal a terceros</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Podemos compartir datos con autoridades cuando sea requerido por ley</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Seguridad de Datos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Lock className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Seguridad de Datos</h2>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                Implementamos medidas técnicas y organizativas apropiadas para proteger los datos 
                personales contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </div>
          </div>

          {/* Derechos del Usuario */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Derechos del Usuario</h2>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg mb-4">
                Los usuarios tienen derecho a:
              </p>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Acceder a sus datos personales</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Rectificar información incorrecta</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Solicitar la eliminación de sus datos</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Oponerse al procesamiento de sus datos</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Solicitar la portabilidad de sus datos</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Retención de Datos */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Retención de Datos</h2>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                Los datos personales se conservan durante el tiempo necesario para cumplir con los 
                fines para los que fueron recopilados y las obligaciones legales aplicables.
              </p>
            </div>
          </div>

          {/* Contacto para Privacidad */}
          <div className="bg-black text-white rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 mr-3" />
              <h3 className="text-xl font-bold">Contacto para Privacidad</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Para ejercer sus derechos o realizar consultas sobre privacidad, contactar a:
            </p>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <a 
                href="mailto:seguridad@gmail.com" 
                className="text-white hover:text-gray-300 underline font-medium"
              >
                seguridad@gmail.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;