import React from 'react';
import { ArrowLeft, Building, MapPin, Phone, Mail, Shield, Copyright } from 'lucide-react';
import { Link } from 'react-router-dom';

const Legal: React.FC = () => {
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
              Aviso Legal
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              Información legal y términos de uso de la plataforma Time Truck
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Información General */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Building className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Información General</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-800">Denominación de la Empresa:</span>
                  </div>
                  <p className="text-gray-700 ml-7">Time Truck</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-800">Email:</span>
                  </div>
                  <p className="text-gray-700 ml-7">
                    <a href="mailto:timetruck@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                      timetruck@gmail.com
                    </a>
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-800">Domicilio:</span>
                  </div>
                  <p className="text-gray-700 ml-7">[DIRECCIÓN COMPLETA]</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-800">Teléfono:</span>
                  </div>
                  <p className="text-gray-700 ml-7">
                    <a href="tel:[NÚMERO DE CONTACTO]" className="text-blue-600 hover:text-blue-800 underline">
                      [NÚMERO DE CONTACTO]
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Objeto del Sitio Web y Aplicación */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Objeto del Sitio Web y Aplicación</h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                Esta plataforma digital tiene como objetivo conectar a personas y empresas que requieren 
                servicios de transporte de carga con conductores profesionales de camiones debidamente registrados.
              </p>
            </div>
          </div>

          {/* Responsabilidad */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Responsabilidad</h2>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <ul className="space-y-4 text-gray-800">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>La empresa actúa únicamente como intermediario entre clientes y transportistas</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>No somos propietarios de los vehículos ni empleamos directamente a los conductores</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Los usuarios son responsables de verificar las credenciales y seguros correspondientes</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>La empresa no se hace responsable por daños, pérdidas o retrasos en el transporte</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Propiedad Intelectual */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Copyright className="h-8 w-8 text-black mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Propiedad Intelectual</h2>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                Todos los contenidos, marcas, logotipos y elementos gráficos son propiedad exclusiva de 
                <strong className="text-black"> Time Truck</strong> y están protegidos por las leyes de 
                propiedad intelectual vigentes.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-black text-white rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>timetruck@gmail.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>[NÚMERO DE CONTACTO]</span>
              </div>
            </div>
            <div className="mt-4 text-gray-300 text-sm">
              Para consultas legales o información adicional, no dudes en contactarnos.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Legal;