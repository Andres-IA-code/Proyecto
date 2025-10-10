import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, TrendingUp, Truck } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="h-14 w-14 mr-3 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <span className="text-xl font-bold">Time Truck</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/solutions" className="text-gray-600 hover:text-black">Soluciones</Link>
              <Link to="/about" className="text-gray-600 hover:text-black">Nosotros</Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-white bg-black hover:bg-gray-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16">
        <div className="relative bg-black overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">Gestion de negocios de Carga</span>
                    <span className="block text-gray-500">Transformación en Logistica</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Plataforma integral de logística conectando directamente sin intermediarios. Optimiza tus envíos, reduce costos y mejora la eficiencia en tiempo real.
                  </p>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-black sm:text-4xl">
              Útil para tu negocio
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Nuestras tecnologías mejoran la eficiencia del negocio y la seguridad del conductor.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-black rounded-md shadow-lg">
                        <Clock className="h-8 w-8 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-black tracking-tight">20% menos mundanidad</h3>
                    <p className="mt-5 text-base text-gray-500">
                      La automatización de procesos te permite enfocarte en otras tareas
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-black rounded-md shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-black tracking-tight">50% menos accidentes</h3>
                    <p className="mt-5 text-base text-gray-500">
                      El análisis del comportamiento de conducción mejora la seguridad vial
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-black rounded-md shadow-lg">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-black tracking-tight">30% reducción en costos</h3>
                    <p className="mt-5 text-base text-gray-500">
                      La optimización de rutas contribuye a una menor tasa de combustible
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Time Truck Copyright 2025. Todos los derechos reservados.
            </p>
            <div className="mt-2 flex justify-center items-center space-x-4 text-xs text-gray-400">
              <Link to="/legal" className="hover:text-gray-600 transition-colors">
                Aviso Legal
              </Link>
              <span>|</span>
              <Link to="/privacy" className="hover:text-gray-600 transition-colors">
                Política de Declaración de Privacidad
              </Link>
              <span>|</span>
              <Link to="/terms" className="hover:text-gray-600 transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;