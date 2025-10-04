import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Package, Truck, FileText, Plus, X, Upload } from 'lucide-react';
import AddressAutocomplete from '../components/AddressAutocomplete';
import QuoteLimitModal from '../components/QuoteLimitModal';
import { calculateDistance } from '../utils/distanceCalculator';
import { supabase, getCurrentUser } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useQuoteLimit } from '../hooks/useQuoteLimit';

interface FormData {
  origin: string;
  destination: string;
  estimatedDistance: string;
  estimatedTime: string;
  cargoType: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  vehicleType: string;
  pickupDate: string;
  pickupTime: string;
  shipmentType: string;
  bodyType: string;
  flexibleDate: boolean;
  observations: string;
  scheduledStops: Array<{
    address: string;
    coordinates?: { lat: number; lng: number };
  }>;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const QuoteRequest: React.FC = () => {
  const navigate = useNavigate();
  const { quotesUsed, quotesLimit, hasReachedLimit, isLoading: limitLoading, refreshCount, incrementCount } = useQuoteLimit();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    estimatedDistance: '',
    estimatedTime: '',
    cargoType: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    vehicleType: '',
    pickupDate: '',
    pickupTime: '',
    shipmentType: '',
    bodyType: '',
    flexibleDate: false,
    observations: '',
    scheduledStops: [],
  });

  const [coordinates, setCoordinates] = useState<{
    origin?: Coordinates;
    destination?: Coordinates;
  }>({});

  const [newStop, setNewStop] = useState('');
  const [newStopCoords, setNewStopCoords] = useState<Coordinates | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Check if user has reached limit when component mounts
  useEffect(() => {
    if (!limitLoading && hasReachedLimit) {
      setShowLimitModal(true);
    }
  }, [limitLoading, hasReachedLimit]);

  // Effect to calculate total distance including stops
  useEffect(() => {
    calculateTotalDistance();
  }, [coordinates.origin, coordinates.destination, formData.scheduledStops]);

  const calculateTotalDistance = async () => {
    if (!coordinates.origin || !coordinates.destination) {
      setFormData(prev => ({ ...prev, estimatedDistance: '' }));
      return;
    }

    console.log('🚀 Calculando distancia...', {
      origin: coordinates.origin,
      destination: coordinates.destination,
      stops: formData.scheduledStops.length
    });

    try {
      const waypoints = formData.scheduledStops
        .filter(stop => stop.coordinates)
        .map(stop => stop.coordinates!);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-distance`;

      console.log('📡 Llamando a la API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          origin: coordinates.origin,
          destination: coordinates.destination,
          waypoints: waypoints.length > 0 ? waypoints : undefined,
        }),
      });

      console.log('📥 Respuesta recibida:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Datos recibidos:', data);

      if (data.distance) {
        console.log('✅ Distancia calculada:', data.distance, 'km');
        setFormData(prev => ({
          ...prev,
          estimatedDistance: data.distance.toString()
        }));
      } else if (data.error) {
        console.warn('⚠️ Error en la API de Google Maps, usando cálculo alternativo');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ Error al calcular con Google Maps:', error);
      console.log('🔄 Usando cálculo de distancia alternativo (Haversine)...');

      let totalDistance = 0;
      const waypoints = [coordinates.origin];

      formData.scheduledStops.forEach(stop => {
        if (stop.coordinates) {
          waypoints.push(stop.coordinates);
        }
      });

      waypoints.push(coordinates.destination);

      for (let i = 0; i < waypoints.length - 1; i++) {
        const distance = calculateDistance(
          waypoints[i].lat,
          waypoints[i].lng,
          waypoints[i + 1].lat,
          waypoints[i + 1].lng
        );
        totalDistance += distance;
      }

      const roundedDistance = Math.round(totalDistance);
      console.log('✅ Distancia calculada (Haversine):', roundedDistance, 'km');

      setFormData(prev => ({
        ...prev,
        estimatedDistance: roundedDistance.toString()
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddressChange = (field: 'origin' | 'destination') => (
    value: string,
    coords?: Coordinates
  ) => {
    console.log(`📍 ${field} cambiado:`, { value, coords });

    setFormData(prev => ({ ...prev, [field]: value }));

    if (coords) {
      console.log(`✅ Guardando coordenadas de ${field}:`, coords);
      setCoordinates(prev => {
        const newCoords = { ...prev, [field]: coords };
        console.log('📍 Estado completo de coordenadas:', newCoords);
        return newCoords;
      });
    } else {
      console.log(`⚠️ No hay coordenadas para ${field}, limpiando...`);
      // Clear coordinates if address is cleared
      setCoordinates(prev => {
        const newCoords = { ...prev };
        delete newCoords[field];
        return newCoords;
      });
    }
  };

  const handleStopAddressChange = (value: string, coords?: Coordinates) => {
    console.log('🛑 Parada cambiada:', { value, coords });
    setNewStop(value);
    if (coords) {
      setNewStopCoords(coords);
      console.log('✅ Coordenadas de parada guardadas:', coords);
    } else {
      setNewStopCoords(undefined);
    }
  };

  const addScheduledStop = (stopAddress?: string, stopCoords?: Coordinates) => {
    // Limit to maximum 3 stops
    if (formData.scheduledStops.length >= 3) {
      return;
    }

    const addressToAdd = stopAddress || newStop.trim();
    const coordsToAdd = stopCoords || newStopCoords;

    if (addressToAdd) {
      console.log('➕ Agregando parada:', { address: addressToAdd, coords: coordsToAdd });
      setFormData(prev => ({
        ...prev,
        scheduledStops: [...prev.scheduledStops, {
          address: addressToAdd,
          coordinates: coordsToAdd
        }],
      }));
      setNewStop('');
      setNewStopCoords(undefined);
    }
  };

  const removeScheduledStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scheduledStops: prev.scheduledStops.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check quote limit before submitting
    if (hasReachedLimit) {
      setShowLimitModal(true);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setSubmitError('La base de datos no está configurada. Por favor contacta al administrador del sistema.');
        return;
      }

      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setSubmitError('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Validate required fields
      if (!formData.origin.trim()) {
        setSubmitError('El origen es obligatorio');
        return;
      }
      if (!formData.destination.trim()) {
        setSubmitError('El destino es obligatorio');
        return;
      }
      if (!formData.weight.trim()) {
        setSubmitError('El peso es obligatorio');
        return;
      }
      if (!formData.pickupDate) {
        setSubmitError('La fecha de retiro es obligatoria');
        return;
      }
      if (!formData.pickupTime) {
        setSubmitError('La hora de retiro es obligatoria');
        return;
      }

      // Prepare data for insertion
      const shipmentData = {
        id_Usuario: currentUser.profile.id_Usuario,
        Estado: 'Solicitado',
        Origen: formData.origin.trim(),
        Destino: formData.destination.trim(),
        Distancia: formData.estimatedDistance ? parseFloat(formData.estimatedDistance) : null,
        Tipo_Carga: formData.cargoType || null,
        Tipo_Vehiculo: formData.vehicleType || null,
        Peso: formData.weight.trim(),
        Dimension_Largo: formData.dimensions.length ? parseInt(formData.dimensions.length) : null,
        Dimension_Ancho: formData.dimensions.width ? parseInt(formData.dimensions.width) : null,
        Dimension_Alto: formData.dimensions.height ? parseInt(formData.dimensions.height) : null,
        Tipo_Carroceria: formData.bodyType || null,
        Fecha_Retiro: formData.pickupDate && formData.pickupTime 
          ? `${formData.pickupDate}T${formData.pickupTime}:00+00:00` 
          : null,
        Horario_Retiro: formData.pickupTime || null,
        Observaciones: formData.observations.trim() || null,
        Tiempo_Estimado_Operacion: formData.estimatedTime.trim() || null,
        Parada_Programada: formData.scheduledStops.length > 0 
          ? formData.scheduledStops.map(stop => stop.address).join('\n') 
          : null,
        Nombre_Dador: currentUser.profile.Tipo_Persona === 'Física' 
          ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
          : currentUser.profile.Nombre,
        Email: currentUser.profile.Correo
      };

      console.log('Guardando datos del envío:', shipmentData);

      // Insert into General table
      const { data, error } = await supabase
        .from('General')
        .insert([shipmentData])
        .select()
        .single();

      if (error) {
        console.error('Error al guardar el envío:', error);
        
        // Handle specific database errors
        if (error.message?.includes('JWT')) {
          setSubmitError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.message?.includes('permission')) {
          setSubmitError('No tienes permisos para realizar esta acción. Contacta al administrador.');
        } else if (error.message?.includes('connection')) {
          setSubmitError('Error de conexión con la base de datos. Verifica tu conexión a internet.');
        } else {
          setSubmitError('Error al guardar el envío. Por favor intenta nuevamente o contacta al administrador.');
        }
        return;
      }

      console.log('Envío guardado exitosamente:', data);

      // Increment the quote count
      incrementCount();

      // Reset form
      setFormData({
        origin: '',
        destination: '',
        estimatedDistance: '',
        estimatedTime: '',
        cargoType: '',
        weight: '',
        dimensions: {
          length: '',
          width: '',
          height: '',
        },
        vehicleType: '',
        pickupDate: '',
        pickupTime: '',
        shipmentType: '',
        bodyType: '',
        flexibleDate: false,
        observations: '',
        scheduledStops: [],
      });
      setCoordinates({});
      setNewStop('');

      // Show success message and redirect
      alert('¡Solicitud de envío creada exitosamente! Serás redirigido a la página de cotizaciones.');
      
      // Use setTimeout to ensure the alert is shown before navigation
      setTimeout(() => {
        navigate('/app/quotes', { replace: true });
      }, 1000);

    } catch (error: any) {
      console.error('Error inesperado:', error);
      
      // Handle different types of errors
      if (error.message?.includes('Base de datos no configurada')) {
        setSubmitError('La aplicación no está configurada correctamente. Por favor contacta al administrador del sistema.');
      } else if (error.message?.includes('Network')) {
        setSubmitError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        setSubmitError('Error inesperado. Por favor intenta nuevamente o contacta al administrador.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStopsCount = () => {
    return formData.scheduledStops.length;
  };

  const getTotalDistanceInfo = () => {
    const stopsWithCoords = formData.scheduledStops.filter(stop => stop.coordinates).length;
    const totalStops = formData.scheduledStops.length;
    
    if (coordinates.origin && coordinates.destination) {
      const routeInfo = totalStops > 0 
        ? `incluyendo ${stopsWithCoords}/${totalStops} paradas con GPS`
        : 'ruta directa';
      return `✅ Distancia total calculada (${routeInfo})`;
    }
    return '📍 Selecciona origen y destino para calcular distancia total';
  };

  const canAddMoreStops = () => {
    return formData.scheduledStops.length < 3;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primera fila: Origen, Destino, Distancia Estimada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen *
                </label>
                <AddressAutocomplete
                  value={formData.origin}
                  onChange={handleAddressChange('origin')}
                  placeholder="Buscar dirección de origen..."
                  required
                  name="origin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino *
                </label>
                <AddressAutocomplete
                  value={formData.destination}
                  onChange={handleAddressChange('destination')}
                  placeholder="Buscar dirección de destino..."
                  required
                  name="destination"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distancia Estimada (Km)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="estimatedDistance"
                    value={formData.estimatedDistance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-semibold text-blue-600"
                    placeholder="Calculado automáticamente"
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">km</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getTotalDistanceInfo()}
                </p>
              </div>
            </div>

            {/* Segunda fila: Tiempo Estimado para la Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo Estimado para la Operación
              </label>
              <input
                type="text"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 2 días, 24 horas, 1 semana"
              />
              <p className="text-xs text-gray-500 mt-1">Tiempo estimado que debería tomar completar la operación</p>
            </div>

            {/* Tercera fila: Paradas Programadas (máximo 3) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paradas Programadas ({getStopsCount()}/3)
              </label>
              <div className="flex gap-2">
                <AddressAutocomplete
                  value={newStop}
                  onChange={(value, coords) => {
                    setNewStop(value);
                    // If a place is selected from dropdown, add it immediately
                    if (coords && canAddMoreStops()) {
                      addScheduledStop(value, coords);
                    }
                  }}
                  placeholder={canAddMoreStops() ? "Buscar parada intermedia..." : "Máximo 3 paradas permitidas"}
                  className="flex-1"
                  disabled={!canAddMoreStops()}
                />
                <button
                  type="button"
                  onClick={() => addScheduledStop()}
                  className={`px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    canAddMoreStops() && newStop.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!canAddMoreStops() || !newStop.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
              {formData.scheduledStops.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.scheduledStops.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <div className="flex items-center flex-1">
                        <MapPin size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">{stop.address}</span>
                        {stop.coordinates && (
                          <span className="ml-2 text-xs text-green-600 font-medium">📍 GPS</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScheduledStop(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {canAddMoreStops() 
                  ? `Puedes agregar ${3 - formData.scheduledStops.length} parada(s) más. Las paradas se incluyen automáticamente en el cálculo de distancia total.`
                  : 'Máximo de 3 paradas alcanzado. Las paradas están incluidas en el cálculo de distancia total.'
                }
              </p>
            </div>

            {/* Cuarta fila: Tipo de Carga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Carga
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'general', label: 'Carga General', icon: '📦' },
                  { value: 'refrigerada', label: 'Carga Refrigerada', icon: '❄️' },
                  { value: 'peligrosa', label: 'Carga Peligrosa', icon: '⚠️' },
                  { value: 'sobredimensionada', label: 'Carga Sobredimensionada', icon: '📏' },
                ].map((cargo) => (
                  <label key={cargo.value} className="relative">
                    <input
                      type="radio"
                      name="cargoType"
                      value={cargo.value}
                      checked={formData.cargoType === cargo.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                      formData.cargoType === cargo.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-2xl mb-2">{cargo.icon}</div>
                      <div className="text-sm font-medium">{cargo.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quinta fila: Peso, Dimensiones, Cantidad de Bultos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso(Tn) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Peso total en toneladas"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largo(cm)
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Largo"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancho(cm)
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ancho"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alto(cm)
                </label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Alto"
                  min="0"
                />
              </div>
            </div>

            {/* Sexta fila: Tipo de Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Vehículo
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'n1', label: 'N1', subtitle: 'Hasta 3.5 Tn' },
                  { value: 'n2', label: 'N2', subtitle: '3.5 - 12 Tn' },
                  { value: 'n3', label: 'N3', subtitle: 'Más de 12 Tn' },
                ].map((vehicle) => (
                  <label key={vehicle.value} className="relative">
                    <input
                      type="radio"
                      name="vehicleType"
                      value={vehicle.value}
                      checked={formData.vehicleType === vehicle.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                      formData.vehicleType === vehicle.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <Truck className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                      <div className="font-medium">{vehicle.label}</div>
                      <div className="text-sm text-gray-500">{vehicle.subtitle}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo de Carrocería */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Carrocería
              </label>
              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar tipo de carrocería</option>
                <option value="BATAN CERRADO">BATAN CERRADO</option>
                <option value="CAJA ABIERTA">CAJA ABIERTA</option>
                <option value="CARGA REFRIGERADA">CARGA REFRIGERADA</option>
                <option value="CON BARANDAS">CON BARANDAS</option>
                <option value="DOLLY">DOLLY</option>
                <option value="ESTANQUE">ESTANQUE</option>
                <option value="FURGÓN">FURGÓN</option>
                <option value="PLAYO">PLAYO</option>
                <option value="PORTA CONTENEDOR">PORTA CONTENEDOR</option>
                <option value="SIDER">SIDER</option>
                <option value="TANQUE/CISTERNA">TANQUE/CISTERNA</option>
                <option value="TANQUE ABIERTA">TANQUE ABIERTA</option>
                <option value="TOLVA">TOLVA</option>
                <option value="VOLCADOR">VOLCADOR</option>
                <option value="EXTENSIBLE">EXTENSIBLE</option>
                <option value="GRANELERO">GRANELERO</option>
                <option value="JAULA">JAULA</option>
                <option value="SILO">SILO</option>
              </select>
            </div>

            {/* Séptima fila: Fecha y Hora de Retiro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Retiro
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Retiro
                </label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Octava fila: Tipo de Envío */}
            <div>
              <div className="flex justify-between items-center mb-3">
                {formData.flexibleDate && (
                  <div className="block text-sm font-medium text-gray-700">
                    Tipo de Envío
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="flexibleDate"
                    checked={formData.flexibleDate}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Fecha Flexible
                  </label>
                </div>
              </div>
              {formData.flexibleDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'express', label: 'Express', subtitle: 'hasta 3 dias' },
                    { value: 'normal', label: 'Normal', subtitle: 'entre 3 y 7 dias' },
                  ].map((shipment) => (
                    <label key={shipment.value} className="relative">
                      <input
                        type="radio"
                        name="shipmentType"
                        value={shipment.value}
                        checked={formData.shipmentType === shipment.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`border-2 rounded-lg p-3 text-center cursor-pointer transition-all ${
                        formData.shipmentType === shipment.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="font-medium text-sm">{shipment.label}</div>
                        <div className="text-xs text-gray-500">{shipment.subtitle}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Novena fila: Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional sobre el envío..."
              />
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {submitError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || hasReachedLimit}
                className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                  hasReachedLimit 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : hasReachedLimit ? (
                  'Límite Alcanzado'
                ) : (
                  'Enviar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quote Limit Modal */}
      <QuoteLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        quotesUsed={quotesUsed}
        quotesLimit={quotesLimit}
      />
    </div>
  );
};

export default QuoteRequest;