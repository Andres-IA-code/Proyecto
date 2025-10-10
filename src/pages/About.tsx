import React from 'react';
import { ArrowLeft, Users, Lightbulb, Target, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
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
              Nosotros
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              Transformando la logística a través de la innovación tecnológica
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Nuestra Historia</h2>
            <p className="mt-4 text-lg text-gray-500">
              Cómo nació Time Truck y nuestra visión para el futuro de la logística
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                El Origen de Time Truck
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  Time Truck nació de la visión de un equipo de desarrolladores y especialistas en logística 
                  que identificaron las ineficiencias y complejidades del sector de transporte de carga en 
                  América Latina. Observamos cómo los intermediarios innecesarios, la falta de transparencia 
                  y los procesos manuales estaban limitando el potencial de crecimiento de las empresas.
                </p>
                <p>
                  Nuestro equipo fundador, con experiencia sólida en desarrollo de 
                  software y gestión logística, decidió crear una solución que revolucionara la forma en 
                  que las empresas gestionan sus operaciones de transporte. Creemos firmemente que la 
                  tecnología puede ser el catalizador para una logística más eficiente, transparente y 
                  accesible para todos.
                </p>
                <p>
                  Desde nuestros inicios, hemos estado comprometidos con la innovación constante, 
                  desarrollando herramientas que no solo simplifican los procesos logísticos, sino que 
                  también empoderan a nuestros usuarios para tomar decisiones más inteligentes y 
                  estratégicas en sus operaciones.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Innovación</h4>
                    <p className="mt-2 text-gray-600">
                      Desarrollamos soluciones tecnológicas avanzadas que transforman procesos tradicionales 
                      en experiencias digitales eficientes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Colaboración</h4>
                    <p className="mt-2 text-gray-600">
                      Creemos en el poder de conectar a las personas y empresas para crear un ecosistema 
                      logístico más fuerte y colaborativo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Precisión</h4>
                    <p className="mt-2 text-gray-600">
                      Cada línea de código que escribimos está diseñada para optimizar la precisión 
                      y confiabilidad en las operaciones logísticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white mr-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nuestra Misión</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Democratizar el acceso a soluciones logísticas avanzadas mediante el desarrollo de 
                tecnología innovadora que conecte directamente a dadores de carga con operadores 
                logísticos, eliminando intermediarios innecesarios y creando un ecosistema más 
                eficiente, transparente y rentable para todos los participantes del sector.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-black text-white mr-4">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ser la plataforma líder en América Latina para la gestión inteligente de operaciones 
                logísticas, reconocida por nuestra capacidad de transformar la industria del transporte 
                a través de la innovación tecnológica, contribuyendo al crecimiento económico sostenible 
                y al desarrollo de un sector logístico más competitivo y eficiente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology & Development Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Desarrollo y Tecnología</h2>
            <p className="mt-4 text-lg text-gray-500">
              Nuestro enfoque en la innovación tecnológica para la logística
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-black text-white mx-auto mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Plataforma Integral</h3>
              <p className="text-gray-600">
                Desarrollamos una plataforma completa que abarca desde la solicitud de envíos hasta 
                el seguimiento en tiempo real, integrando todas las necesidades logísticas en una 
                sola solución.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-black text-white mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Experiencia de Usuario</h3>
              <p className="text-gray-600">
                Nuestro equipo de desarrollo se enfoca en crear interfaces intuitivas y experiencias 
                de usuario excepcionales que simplifican procesos complejos y mejoran la productividad.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-black text-white mx-auto mb-4">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Innovación Continua</h3>
              <p className="text-gray-600">
                Mantenemos un ciclo constante de investigación y desarrollo, incorporando las últimas 
                tecnologías y metodologías para estar siempre a la vanguardia del sector logístico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Values Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Valores</h2>
            <p className="mt-4 text-lg text-gray-500">
              Los principios que guían nuestro trabajo y desarrollo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparencia</h3>
              <p className="text-gray-600 text-sm">
                Creemos en la comunicación abierta y honesta en todas nuestras relaciones comerciales 
                y desarrollo de productos.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excelencia</h3>
              <p className="text-gray-600 text-sm">
                Nos comprometemos a entregar soluciones de la más alta calidad que superen las 
                expectativas de nuestros usuarios.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agilidad</h3>
              <p className="text-gray-600 text-sm">
                Adoptamos metodologías ágiles que nos permiten adaptarnos rápidamente a los cambios 
                del mercado y las necesidades de nuestros clientes.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Impacto</h3>
              <p className="text-gray-600 text-sm">
                Buscamos generar un impacto positivo y duradero en la industria logística y en las 
                comunidades que servimos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;