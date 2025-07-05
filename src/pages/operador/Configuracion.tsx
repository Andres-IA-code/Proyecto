import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Building, MapPin, Bell, User, Camera, Upload, CheckCircle, AlertCircle, Truck, Package } from 'lucide-react';
import { getCurrentUser, updateUserProfile } from '../../lib/supabase';
import { formatPhoneNumber, validatePhone } from '../../utils/validation';

interface UserData {
  id_Usuario: number;
  Nombre: string;
  Apellido?: string;
  DNI?: number;
  Domicilio?: string;
  Numero?: number;
  Piso?: number;
  Departamento?: string;
  Localidad?: string;
  Tipo_Persona?: string;
  Rol_Operativo?: string;
  Correo?: string;
  Telefono?: string;
  auth_user_id?: string;
}

const OperadorConfiguracion: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [phoneError, setPhoneError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    streetNumber: '',
    floor: '',
    apartment: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get current user from Supabase Auth
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('Current user loaded:', currentUser);
      setUserData(currentUser.profile);
      
      // Populate form data with user information
      setFormData({
        firstName: currentUser.profile.Nombre || '',
        lastName: currentUser.profile.Apellido || '',
        email: currentUser.profile.Correo || '',
        phone: currentUser.profile.Telefono || '+54 9 ',
        street: currentUser.profile.Domicilio || '',
        streetNumber: currentUser.profile.Numero?.toString() || '',
        floor: currentUser.profile.Piso?.toString() || '',
        apartment: currentUser.profile.Departamento || '',
        location: currentUser.profile.Localidad || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Load saved profile image from localStorage
      const savedImage = localStorage.getItem(`profileImage_${currentUser.profile.id_Usuario}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Special handling for phone number
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
      setPhoneError(''); // Clear phone error when user types
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Create a FileReader to convert image to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        
        // Save to localStorage and state
        if (userData) {
          localStorage.setItem(`profileImage_${userData.id_Usuario}`, base64String);
          setProfileImage(base64String);
        }
        
        setUploadingImage(false);
      };
      
      reader.onerror = () => {
        alert('Error al cargar la imagen');
        setUploadingImage(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al cargar la imagen');
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    if (userData) {
      localStorage.removeItem(`profileImage_${userData.id_Usuario}`);
      setProfileImage(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!userData || !userData.auth_user_id) {
      console.error('No user data or auth_user_id available');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('saving');
    
    try {
      console.log('=== INICIANDO GUARDADO ===');
      console.log('Auth User ID:', userData.auth_user_id);
      console.log('Datos del formulario:', formData);

      // Validate and format phone number
      let phoneToSave = null;
      if (formData.phone && formData.phone !== '+54 9 ') {
        if (validatePhone(formData.phone)) {
          phoneToSave = formData.phone;
          setPhoneError('');
        } else {
          setPhoneError('Formato inválido. Use: +54 9 XXXX-XXXXXX');
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
          setSaving(false);
          return;
        }
      }

      // Prepare data to update
      const updatedData = {
        Nombre: formData.firstName.trim(),
        Apellido: formData.lastName.trim() || null,
        Correo: formData.email.trim(),
        Telefono: phoneToSave,
        Domicilio: formData.street.trim(),
        Numero: formData.streetNumber.trim() ? parseFloat(formData.streetNumber) : null,
        Piso: formData.floor.trim() ? parseFloat(formData.floor) : null,
        Departamento: formData.apartment.trim() || null,
        Localidad: formData.location.trim()
      };

      console.log('Datos preparados para actualizar:', updatedData);

      // Update using the helper function
      const result = await updateUserProfile(userData.auth_user_id, updatedData);

      console.log('=== GUARDADO EXITOSO ===');
      console.log('Datos actualizados:', result);

      // Update local state with the new data
      setUserData(prev => prev ? { ...prev, ...result } : null);
      
      // Update session data in localStorage
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.user = { ...session.user, ...updatedData };
        localStorage.setItem('userSession', JSON.stringify(session));
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error: any) {
      console.error('Error saving changes:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (selectedTab) {
      case 'profile':
        return 'Perfil del Operador';
      case 'company':
        return 'Información de la Empresa';
      case 'fleet':
        return 'Gestión de Flota';
      case 'notifications':
        return 'Notificaciones';
      default:
        return 'Perfil del Operador';
    }
  };

  const getDisplayName = () => {
    if (!userData) return 'Usuario';
    if (userData.Tipo_Persona === 'Física') {
      return `${userData.Nombre} ${userData.Apellido || ''}`.trim();
    } else {
      return userData.Nombre; // Business name for juridical persons
    }
  };

  const getInitials = () => {
    if (!userData) return 'U';
    if (userData.Tipo_Persona === 'Física') {
      const firstName = userData.Nombre?.charAt(0) || '';
      const lastName = userData.Apellido?.charAt(0) || '';
      return (firstName + lastName).toUpperCase();
    } else {
      return userData.Nombre?.charAt(0)?.toUpperCase() || 'E';
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Guardando cambios...';
      case 'success':
        return 'Todos los cambios guardados exitosamente';
      case 'error':
        return 'Error al guardar los cambios';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Cargando datos del operador...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error al cargar los datos del operador</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold">{getTitle()}</h1>
              <p className="text-gray-500 mt-1">Gestiona tu información como operador logístico</p>
            </div>
            
            {/* Save status indicator */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                {getSaveStatusIcon()}
                <span className={`text-sm ${
                  saveStatus === 'success' ? 'text-green-600' : 
                  saveStatus === 'error' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {getSaveStatusText()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setSelectedTab('profile')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCircle size={20} className="mx-auto mb-1" />
              Perfil
            </button>
            <button
              onClick={() => setSelectedTab('company')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === 'company'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building size={20} className="mx-auto mb-1" />
              Empresa
            </button>
            <button
              onClick={() => setSelectedTab('fleet')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === 'fleet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck size={20} className="mx-auto mb-1" />
              Flota
            </button>
            <button
              onClick={() => setSelectedTab('notifications')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell size={20} className="mx-auto mb-1" />
              Notificaciones
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mr-6 overflow-hidden shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {getInitials()}
                      </span>
                    )}
                  </div>
                  
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 h-24 w-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mr-6"
                       onClick={handlePhotoClick}>
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  
                  {uploadingImage && (
                    <div className="absolute inset-0 h-24 w-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center mr-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
                  <p className="text-gray-500">Operador Logístico</p>
                  <p className="text-sm text-gray-400">
                    {userData.Tipo_Persona === 'Física' ? 'Persona Física' : 'Persona Jurídica'}
                    {userData.DNI && ` • DNI: ${userData.DNI}`}
                  </p>
                  
                  <div className="mt-3 flex space-x-2">
                    <button 
                      onClick={handlePhotoClick}
                      disabled={uploadingImage}
                      className="inline-flex items-center px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Upload size={12} className="mr-1" />
                      {uploadingImage ? 'Cargando...' : 'Cambiar foto'}
                    </button>
                    
                    {profileImage && (
                      <button 
                        onClick={handleRemovePhoto}
                        className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Información Personal</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {userData.Tipo_Persona === 'Física' ? 'Nombre' : 'Razón Social'}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ingrese su nombre"
                      />
                    </div>
                    {userData.Tipo_Persona === 'Física' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apellido
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ingrese su apellido"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+54 9 XXXX-XXXXXX"
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          phoneError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Formato: +54 9 XXXX-XXXXXX (ej: +54 9 1234-567890)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Dirección de la Empresa</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calle
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre de la calle"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          name="streetNumber"
                          value={formData.streetNumber}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Piso
                        </label>
                        <input
                          type="text"
                          name="floor"
                          value={formData.floor}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Localidad
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ciudad o localidad"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t">
                <div className="flex items-center space-x-2">
                  {saveStatus !== 'idle' && (
                    <>
                      {getSaveStatusIcon()}
                      <span className={`text-sm ${
                        saveStatus === 'success' ? 'text-green-600' : 
                        saveStatus === 'error' ? 'text-red-600' : 
                        'text-blue-600'
                      }`}>
                        {getSaveStatusText()}
                      </span>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'company' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {userData.Tipo_Persona === 'Física' ? 'Nombre Completo' : 'Razón Social'}
                      </label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={getDisplayName()}
                        readOnly
                      />
                    </div>
                    {userData.DNI && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          DNI
                        </label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                          value={userData.DNI}
                          readOnly
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Persona
                      </label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        value={userData.Tipo_Persona || ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roles Operativos
                      </label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        value={userData.Rol_Operativo || ''}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={userData.Correo || ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={userData.Telefono || ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección Completa
                      </label>
                      <textarea
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        value={`${userData.Domicilio || ''} ${userData.Numero || ''} ${userData.Piso ? `Piso ${userData.Piso}` : ''} ${userData.Departamento ? `Depto ${userData.Departamento}` : ''}, ${userData.Localidad || ''}`.trim()}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'fleet' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
                  <Truck size={36} className="text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Gestión de Flota</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Administra tu flota de vehículos y equipos de transporte.
                </p>
                <div className="mt-6">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                    Agregar Vehículo
                  </button>
                </div>
                <div className="mt-6 text-left max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-2">
                    Funcionalidades disponibles:
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Registro de vehículos</li>
                    <li>• Control de documentación</li>
                    <li>• Seguimiento de mantenimiento</li>
                    <li>• Asignación de conductores</li>
                    <li>• Historial de servicios</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'notifications' && (
            <div className="py-12 text-center">
              <h2 className="text-lg font-medium text-gray-900">Configuración de notificaciones</h2>
              <p className="mt-2 text-sm text-gray-500">
                Esta sección está en desarrollo y estará disponible próximamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperadorConfiguracion;