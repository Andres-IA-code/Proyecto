import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface QuoteWithOperator {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Fecha: string;
  Vigencia: string;
  Estado: string;
  Oferta: number;
  // Datos del operador
  operador_nombre?: string;
  operador_apellido?: string;
  operador_tipo_persona?: string;
  // Datos del envío
  envio_origen?: string;
  envio_destino?: string;
}

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteWithOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Construir el nombre del dador según el tipo de persona
      const nombreDador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      // Buscar cotizaciones del usuario actual por nombre del dador
      const { data: quotesByName, error: nameError } = await supabase
        .from('Cotizaciones')
        .select('*')
        .or(`Nombre_Dador.eq.${nombreDador},Nombre_Dador.eq.Andrés Consiglio,Nombre_Dador.ilike.%Andres%,Nombre_Dador.ilike.%Andrés%`)
        .order('Fecha', { ascending: false });
      
      if (nameError) {
        console.error('Error fetching quotes:', nameError);
        setError('Error al cargar las cotizaciones');
        return;
      }

      setQuotes(quotesByName || []);
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'aceptada':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const isQuoteExpired = (vigenciaString: string) => {
    try {
      const vigencia = new Date(vigenciaString);
      const now = new Date();
      return vigencia < now;
    } catch {
      return false;
    }
  };

  const getDaysUntilExpiry = (vigenciaString: string) => {
    try {
      const vigencia = new Date(vigenciaString);
      const now = new Date();
      const diffTime = vigencia.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'all') return true;
    return quote.Estado?.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando cotizaciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 mt-1">Gestiona las cotizaciones recibidas para tus envíos</p>
                {error}
              </div>
              <button
                onClick={fetchQuotes}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <RefreshCw size={16} className="mr-2" />
              Actualizar
            </button>
            {debugInfo && (
              <>
                <button
                  onClick={handleShowAllCotizaciones}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Mostrar Todas ({debugInfo.totalCotizaciones})
                </button>
                <button
                  onClick={handleTestExactMatch}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  Test "Andres Consiglio"
                </button>
              </>
            )}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aceptada">Aceptadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        {filteredQuotes.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Cotización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oferta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vigencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => {
                    return (
                      <tr key={quote.id_Cotizaciones} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{quote.id_Cotizaciones}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateTime(quote.Fecha)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quote.Nombre_Operador || 'No especificado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                            {quote.Estado || 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-green-600">
                            ${(quote.Oferta || 0).toLocaleString('es-AR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(quote.Vigencia)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No hay cotizaciones disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all' 
                ? 'No has recibido cotizaciones aún. Cuando los operadores logísticos envíen cotizaciones para tus envíos, aparecerán aquí.'
                : `No hay cotizaciones con estado "${filterStatus}".`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteManagement;