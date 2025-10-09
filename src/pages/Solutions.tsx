import React from 'react';
import { Truck, Clock, Shield, TrendingUp, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Solutions: React.FC = () => {
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
              Revolucionando la Logística
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              Plataforma integral de logística conectando directamente sin intermediarios. Optimiza tus envíos, reduce costos y mejora la eficiencia en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Nuestras Soluciones</h2>
            <p className="mt-4 text-lg text-gray-500">
              Descubre cómo nuestra plataforma transforma la gestión logística
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Conexión Directa</h3>
              <p className="mt-2 text-gray-500">
                Conectamos dadores de carga con operadores logísticos sin intermediarios, reduciendo costos y tiempos de gestión.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Tiempo Real</h3>
              <p className="mt-2 text-gray-500">
                Seguimiento en tiempo real de tus envíos y actualizaciones instantáneas del estado de tu carga.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Optimización</h3>
              <p className="mt-2 text-gray-500">
                Algoritmos avanzados para optimizar rutas y reducir costos operativos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Beneficios</h2>
            <p className="mt-4 text-lg text-gray-500">
              Ventajas que obtienes al usar nuestra plataforma
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  title: 'Reducción de Costos',
                  description: 'Elimina intermediarios y optimiza gastos operativos',
                  icon: <TrendingUp className="h-6 w-6" />,
                },
                {
                  title: 'Mayor Eficiencia',
                  description: 'Automatización de procesos y gestión simplificada',
                  icon: <Clock className="h-6 w-6" />,
                },
                {
                  title: 'Seguridad',
                  description: 'Monitoreo constante y trazabilidad completa',
                  icon: <Shield className="h-6 w-6" />,
                },
                {
                  title: 'Calidad Garantizada',
                  description: 'Operadores verificados y evaluados constantemente',
                  icon: <CheckCircle className="h-6 w-6" />,
                },
              ].map((benefit, index) => (
                <div key={index} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                    {benefit.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{benefit.title}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solutions;