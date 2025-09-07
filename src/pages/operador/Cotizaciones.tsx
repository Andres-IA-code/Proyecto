import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, Clock, MapPin, Package, Truck, User, Phone, 
  Mail, Star, Filter, RefreshCw, AlertCircle, X, CheckCircle, XCircle 
} from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';

interface Quote {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number;
  id_Operador: number;
  Fecha: string;
  Vigencia: string;
  Estado: string;
  Scoring: number;
  Oferta: number;
  Nombre_Operador: string;
  Nombre_Dador: string;
  // Datos del envío desde la tabla General
  envio_origen?: string;
  envio_destino?: string;
  envio_peso?: string;
  envio_tipo_carga?: string;
  envio_observaciones?: string;
  envio_fecha_retiro?: string;
  envio_horario_retiro?: string;
  envio_parada_programada?: string;
  envio_tipo_vehiculo?: string;
  envio_tipo_carroceria?: string;
  envio_dimension_largo?: number;
  envio_dimension_ancho?: number;
  envio_dimension_alto?: number;
  envio_distancia?: number;
}

interface PhoneDisplayProps {
  dadorName: string;
}

const PhoneDisplay: React.FC<PhoneDisplayProps> = ({ dadorName }) => {
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findPhone = async () => {
      try {
        setLoading(true);
        console.log('🔍 Buscando teléfono para dador:', dadorName);

        if (!dadorName || dadorName.trim() === '') {
          console.log('❌ Nombre del dador vacío');
          setPhone('No disponible');
          setLoading(false);
          return;
        }

        // Estrategia 1: Búsqueda exacta por nombre completo
        console.log('📞 Estrategia 1: Búsqueda exacta por nombre completo');
        let { data: usuarios, error } = await supabase
          .from('Usuarios')
          .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
          .eq('Nombre', dadorName.trim())
          .not('Telefono', 'is', null)
          .neq('Telefono', '')
          .neq('Telefono', '+54 9 ');

        console.log('📋 Resultados estrategia 1:', usuarios);

        if (error) {
          console.error('❌ Error en estrategia 1:', error);
        }

        // Si no encontró nada, intentar separar nombre y apellido
        if (!usuarios || usuarios.length === 0) {
          console.log('📞 Estrategia 2: Búsqueda por nombre y apellido separados');
          const nameParts = dadorName.trim().split(' ');
          
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            console.log('🔍 Buscando:', { firstName, lastName });
            
            const { data: usuarios2, error: error2 } = await supabase
              .from('Usuarios')
              .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
              .eq('Nombre', firstName)
              .eq('Apellido', lastName)
              .not('Telefono', 'is', null)
              .neq('Telefono', '')
              .neq('Telefono', '+54 9 ');

            console.log('📋 Resultados estrategia 2:', usuarios2);
            usuarios = usuarios2;
            error = error2;
          }
        }

        // Si aún no encontró nada, búsqueda flexible
        if (!usuarios || usuarios.length === 0) {
          console.log('📞 Estrategia 3: Búsqueda flexible con ILIKE');
          const { data: usuarios3, error: error3 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${dadorName.trim()}%,Apellido.ilike.%${dadorName.trim()}%`)
            .not('Telefono', 'is', null)
            .neq('Telefono', '')
            .neq('Telefono', '+54 9 ');

          console.log('📋 Resultados estrategia 3:', usuarios3);
          usuarios = usuarios3;
          error = error3;
        }

        if (error) {
          console.error('❌ Error buscando teléfono:', error);
          setPhone('Error al buscar');
          setLoading(false);
          return;
        }

        if (!usuarios || usuarios.length === 0) {
          console.log('❌ No se encontró usuario con teléfono para:', dadorName);
          
          // Diagnóstico: buscar si existe el usuario sin filtrar por teléfono
          const { data: allUsers, error: diagError } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Telefono, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${dadorName.trim()}%,Apellido.ilike.%${dadorName.trim()}%`);
          
          if (diagError) {
            console.error('❌ Error en diagnóstico:', diagError);
          } else {
            console.log('🔍 Usuarios encontrados (sin filtro de teléfono):', allUsers);
          }
          
          setPhone('No registrado');
          setLoading(false);
          return;
        }

        // Priorizar usuarios con rol "dador"
        const dadorUsers = usuarios.filter(u => 
          u.Rol_Operativo?.toLowerCase().includes('dador')
        );

        const selectedUser = dadorUsers.length > 0 ? dadorUsers[0] : usuarios[0];
        
        console.log('✅ Usuario seleccionado:', selectedUser);
        console.log('📞 Teléfono encontrado:', selectedUser.Telefono);

        setPhone(selectedUser.Telefono || 'No registrado');

      } catch (error) {
        console.error('❌ Error inesperado buscando teléfono:', error);
        setPhone('Error');
      } finally {
        setLoading(false);
      }
    };

    findPhone();
  }, [dadorName]);

  if (loading) {
    return <span className="text-gray-500">Buscando...</span>;
  }

  if (!phone || phone === 'No registrado' || phone === 'Error' || phone === 'Error al buscar') {
    return <span className="text-gray-500">No disponible</span>;
  }

  return (
    <a 
      href={`tel:${phone}`} 
      className="text-blue-600 hover:text-blue-800 underline"
      title={`Llamar a ${phone}`}
    >
      {phone}
    </a>
  );
};

interface EmailDisplayProps {
  dadorName: string;
}

const EmailDisplay: React.FC<EmailDisplayProps> = ({ dadorName }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findEmail = async () => {
      try {
        setLoading(true);
        console.log('📧 Buscando email para dador:', dadorName);

        if (!dadorName || dadorName.trim() === '') {
          console.log('❌ Nombre del dador vacío');
          setEmail('No disponible');
          setLoading(false);
          return;
        }

        // Primero, buscar en todas las tablas posibles para email
        console.log('📧 Estrategia 1: Búsqueda exacta por nombre completo en tabla Usuarios');
        let { data: usuarios, error } = await supabase
          .from('Usuarios')
          .select('id_Usuario, Correo, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
          .eq('Nombre', dadorName.trim());

        console.log('📋 Resultados estrategia 1 (todos los usuarios):', usuarios);

        // Filtrar solo usuarios con email válido
        if (usuarios && usuarios.length > 0) {
          usuarios = usuarios.filter(u => {
            const email = u.Correo;
            return email && email.trim() !== '' && email.includes('@');
          });
          console.log('📧 Usuarios con email válido:', usuarios);
        }

        // Estrategia 2: Búsqueda por nombre y apellido separados
        if (!usuarios || usuarios.length === 0) {
          console.log('📧 Estrategia 2: Búsqueda por nombre y apellido separados');
          const nameParts = dadorName.trim().split(' ');
          
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            console.log('🔍 Buscando por partes:', { firstName, lastName });
            
            const { data: usuarios2, error: error2 } = await supabase
              .from('Usuarios')
              .select('id_Usuario, Correo, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
              .eq('Nombre', firstName)
              .eq('Apellido', lastName);

            if (usuarios2) {
              usuarios = usuarios2.filter(u => {
                const email = u.Correo;
                return email && email.trim() !== '' && email.includes('@');
              });
            }
            console.log('📋 Resultados estrategia 2:', usuarios);
          }
        }

        // Estrategia 3: Búsqueda flexible con ILIKE
        if (!usuarios || usuarios.length === 0) {
          console.log('📧 Estrategia 3: Búsqueda flexible con ILIKE');
          const { data: usuarios3, error: error3 } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Correo, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${dadorName.trim()}%,Apellido.ilike.%${dadorName.trim()}%`);

          if (usuarios3) {
            usuarios = usuarios3.filter(u => {
              const email = u.Correo;
              return email && email.trim() !== '' && email.includes('@');
            });
          }
          console.log('📋 Resultados estrategia 3:', usuarios);
        }

        if (error) {
          console.error('❌ Error buscando email:', error);
          setEmail('Error al buscar');
          setLoading(false);
          return;
        }

        if (!usuarios || usuarios.length === 0) {
          console.log('❌ No se encontró usuario con email para:', dadorName);
          
          // Diagnóstico: buscar si existe el usuario sin filtrar por email
          const { data: allUsers, error: diagError } = await supabase
            .from('Usuarios')
            .select('id_Usuario, Correo, Nombre, Apellido, Tipo_Persona, Rol_Operativo')
            .or(`Nombre.ilike.%${dadorName.trim()}%,Apellido.ilike.%${dadorName.trim()}%`);
          
          if (diagError) {
            console.error('❌ Error en diagnóstico:', diagError);
          } else {
            console.log('🔍 Usuarios encontrados (sin filtro de email):', allUsers);
            console.log('🔍 Campos de email disponibles:', allUsers?.map(u => ({
              nombre: u.Nombre,
              apellido: u.Apellido,
              correo: u.Correo
            })));
          }
          
          setEmail('No registrado');
          setLoading(false);
          return;
        }

        // Priorizar usuarios con rol "dador"
        const dadorUsers = usuarios.filter(u => 
          u.Rol_Operativo?.toLowerCase().includes('dador')
        );

        const selectedUser = dadorUsers.length > 0 ? dadorUsers[0] : usuarios[0];
        
        console.log('✅ Usuario seleccionado para email:', selectedUser);
        
        // Obtener el email del campo disponible
        const foundEmail = selectedUser.Correo || null;
        console.log('📧 Email encontrado:', foundEmail);

        setEmail(foundEmail || 'No registrado');

      } catch (error) {
        console.error('❌ Error inesperado buscando email:', error);
        setEmail('Error');
      } finally {
        setLoading(false);
      }
    };

    findEmail();
  }, [dadorName]);

  if (loading) {
    return <span className="text-gray-500">Buscando...</span>;
  }

  if (!email || email === 'No registrado' || email === 'Error' || email === 'Error al buscar') {
    return <span className="text-gray-500">No disponible</span>;
  }

  return (
    <a 
      href={`mailto:${email}`} 
      className="text-blue-600 hover:text-blue-800 underline"
      title={`Enviar email a ${email}`}
    >
      {email}
    </a>
  );
};

const OperadorCotizaciones: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

      // Construir el nombre del operador según el tipo de persona
      const nombreOperador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      console.log('Buscando cotizaciones para operador:', nombreOperador);

      // Buscar cotizaciones del operador actual
      const { data, error: fetchError } = await supabase
        .from('Cotizaciones')
        .select(`
          *,
          General!inner(
            Origen,
            Destino,
            Peso,
            Tipo_Carga,
            Observaciones,
            Fecha_Retiro,
            Horario_Retiro,
            Parada_Programada,
            Tipo_Vehiculo,
            Tipo_Carroceria,
            Dimension_Largo,
            Dimension_Ancho,
            Dimension_Alto,
            Distancia
          )
        `)
        .eq('Nombre_Operador', nombreOperador)
        .order('Fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching quotes:', fetchError);
        setError('Error al cargar las cotizaciones');
        return;
      }

      // Transformar los datos para facilitar el acceso
      const transformedData = (data || []).map(quote => ({
        ...quote,
        envio_origen: quote.General?.Origen,
        envio_destino: quote.General?.Destino,
        envio_peso: quote.General?.Peso,
        envio_tipo_carga: quote.General?.Tipo_Carga,
        envio_observaciones: quote.General?.Observaciones,
        envio_fecha_retiro: quote.General?.Fecha_Retiro,
        envio_horario_retiro: quote.General?.Horario_Retiro,
        envio_parada_programada: quote.General?.Parada_Programada,
        envio_tipo_vehiculo: quote.General?.Tipo_Vehiculo,
        envio_tipo_carroceria: quote.General?.Tipo_Carroceria,
        envio_dimension_largo: quote.General?.Dimension_Largo,
        envio_dimension_ancho: quote.General?.Dimension_Ancho,
        envio_dimension_alto: quote.General?.Dimension_Alto,
        envio_distancia: quote.General?.Distancia,
      }));

      setQuotes(transformedData);
      console.log('Cotizaciones encontradas:', transformedData.length);
      
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

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'aceptada':
        return 'Aceptada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return status || 'Desconocido';
    }
  };

  const getSimplifiedLocation = (fullAddress: string | undefined): string => {
    if (!fullAddress) return 'No especificado';
    
    // Extract city/locality from the full address
    const parts = fullAddress.split(',').map(part => part.trim());
    
    // Try to find the city/locality (usually the last meaningful part before province/country)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      
      // Skip common suffixes
      if (part.toLowerCase().includes('provincia') || 
          part.toLowerCase().includes('argentina') ||
          part.toLowerCase().includes('méxico') ||
          part.toLowerCase().includes('chile') ||
          part.toLowerCase().includes('colombia')) {
        continue;
      }
      
      // Return the first meaningful location found
      if (part.length > 2) {
        return part;
      }
    }
    
    // Fallback: return the first part if no city found
    return parts[0] || fullAddress;
  };

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedQuote(null);
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'all') return true;
    return quote.Estado?.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
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
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle size={64} className="mx-auto text-red-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar cotizaciones</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchQuotes}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Mis Cotizaciones</h1>
              <p className="text-gray-500 mt-1">Gestiona las cotizaciones que has enviado</p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={fetchQuotes}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Actualizar
              </button>
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
        </div>

        {filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Cotización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dador de Carga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oferta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id_Cotizaciones} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{quote.id_Cotizaciones}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getSimplifiedLocation(quote.envio_origen)} → {getSimplifiedLocation(quote.envio_destino)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.Nombre_Dador || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(quote.Fecha)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.Estado)}`}>
                        {getStatusLabel(quote.Estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">
                        ${(quote.Oferta || 0).toLocaleString('es-AR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewDetails(quote)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No hay cotizaciones disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all' 
                ? 'No has enviado cotizaciones aún. Ve a "Planificar Envío" para encontrar oportunidades.'
                : `No hay cotizaciones con estado "${getStatusLabel(filterStatus)}".`
              }
            </p>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t">
          <div className="text-sm text-gray-500 text-center">
            Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles de Cotización #{selectedQuote.id_Cotizaciones}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Información completa del envío y cotización
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 p-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-800 mb-3">Información de la Cotización</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado:</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedQuote.Estado)}`}>
                        {getStatusLabel(selectedQuote.Estado)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha de Cotización:</span>
                      <span className="text-gray-900">{formatDateTime(selectedQuote.Fecha)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vigencia:</span>
                      <span className="text-gray-900">{formatDate(selectedQuote.Vigencia)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Oferta:</span>
                      <span className="text-green-600 font-bold text-lg">
                        ${(selectedQuote.Oferta || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-800 mb-3">Información del Dador</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nombre:</span>
                      <span className="text-gray-900">{selectedQuote.Nombre_Dador || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Correo:</span>
                      <EmailDisplay dadorName={selectedQuote.Nombre_Dador || ''} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Teléfono de Contacto:</span>
                      <PhoneDisplay dadorName={selectedQuote.Nombre_Dador || ''} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Envío:</span>
                      <span className="text-gray-900">#{selectedQuote.id_Envio}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  Información de Ruta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Origen</div>
                    <div className="font-medium text-gray-900">{selectedQuote.envio_origen || 'No especificado'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Destino</div>
                    <div className="font-medium text-gray-900">{selectedQuote.envio_destino || 'No especificado'}</div>
                  </div>
                  {selectedQuote.envio_distancia && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Distancia</div>
                      <div className="font-medium text-gray-900">{selectedQuote.envio_distancia} km</div>
                    </div>
                  )}
                  {selectedQuote.envio_parada_programada && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Paradas Programadas</div>
                      <div className="space-y-1">
                        {selectedQuote.envio_parada_programada.split('\n').map((parada, index) => (
                          <div key={index} className="text-sm bg-blue-50 text-blue-800 px-2 py-1 rounded">
                            📍 {parada.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cargo Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Package className="h-5 w-5 text-green-600 mr-2" />
                  Información de Carga
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedQuote.envio_tipo_carga && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Tipo de Carga</div>
                      <div className="font-medium text-gray-900">{selectedQuote.envio_tipo_carga}</div>
                    </div>
                  )}
                  {selectedQuote.envio_peso && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Peso</div>
                      <div className="font-medium text-gray-900">{selectedQuote.envio_peso} Tn</div>
                    </div>
                  )}
                  {(selectedQuote.envio_dimension_largo || selectedQuote.envio_dimension_ancho || selectedQuote.envio_dimension_alto) && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Dimensiones (cm)</div>
                      <div className="font-medium text-gray-900">
                        {selectedQuote.envio_dimension_largo || 0} × {selectedQuote.envio_dimension_ancho || 0} × {selectedQuote.envio_dimension_alto || 0}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle and Schedule Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(selectedQuote.envio_tipo_vehiculo || selectedQuote.envio_tipo_carroceria) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Truck className="h-5 w-5 text-purple-600 mr-2" />
                      Vehículo Requerido
                    </h3>
                    <div className="space-y-2">
                      {selectedQuote.envio_tipo_vehiculo && (
                        <div>
                          <div className="text-sm text-gray-500">Tipo de Vehículo</div>
                          <div className="font-medium text-gray-900">{selectedQuote.envio_tipo_vehiculo}</div>
                        </div>
                      )}
                      {selectedQuote.envio_tipo_carroceria && (
                        <div>
                          <div className="text-sm text-gray-500">Tipo de Carrocería</div>
                          <div className="font-medium text-gray-900">{selectedQuote.envio_tipo_carroceria}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(selectedQuote.envio_fecha_retiro || selectedQuote.envio_horario_retiro) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                      Programación
                    </h3>
                    <div className="space-y-2">
                      {selectedQuote.envio_fecha_retiro && (
                        <div>
                          <div className="text-sm text-gray-500">Fecha de Retiro</div>
                          <div className="font-medium text-gray-900">
                            {new Date(selectedQuote.envio_fecha_retiro).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      )}
                      {selectedQuote.envio_horario_retiro && (
                        <div>
                          <div className="text-sm text-gray-500">Horario de Retiro</div>
                          <div className="font-medium text-gray-900">{selectedQuote.envio_horario_retiro}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Observations */}
              {selectedQuote.envio_observaciones && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Observaciones del Cliente</h3>
                  <p className="text-gray-700 text-sm">{selectedQuote.envio_observaciones}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                {selectedQuote.Estado?.toLowerCase() === 'aceptada' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Iniciar Viaje
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperadorCotizaciones;