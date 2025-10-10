import React, { useState } from 'react';
import { Eye, EyeOff, HelpCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, Usuario } from '../lib/supabase';
import { validateEmail, validateName, validateDNI, validateCUIT, validatePhone, formatPhoneNumber } from '../utils/validation';

type PersonType = 'fisica' | 'juridica';
type UserRole = 'dador' | 'operador' | 'broker';

interface FormData {
  personType: PersonType;
  // Persona Física
  firstName: string;
  lastName: string;
  dni: string;
  // Persona Jurídica
  businessName: string;
  cuit: string;
  // Dirección
  street: string;
  streetNumber: string;
  floor: string;
  apartment: string;
  location: string;
  // Contacto
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  // Roles
  roles: UserRole[];
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    personType: 'fisica',
    firstName: '',
    lastName: '',
    dni: '',
    businessName: '',
    cuit: '',
    street: '',
    streetNumber: '',
    floor: '',
    apartment: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '+54 9 ',
    roles: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailValidation, setEmailValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    error?: string;
  }>({ isValidating: false, isValid: null });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear success message when user modifies form
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleDNIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits and limit to 8 characters
    const digitsOnly = value.replace(/\D/g, '');
    const limitedValue = digitsOnly.slice(0, 8);
    setFormData(prev => ({ ...prev, dni: limitedValue }));
    
    // Clear error when user starts typing
    if (errors.dni) {
      setErrors(prev => ({ ...prev, dni: undefined }));
    }
    
    // Clear success message when user modifies form
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
    
    // Clear success message when user modifies form
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }

    if (email.length > 0) {
      setEmailValidation({ isValidating: true, isValid: null });
      
      try {
        const validation = await validateEmail(email);
        setEmailValidation({
          isValidating: false,
          isValid: validation.isValid,
          error: validation.error
        });
      } catch (error) {
        setEmailValidation({
          isValidating: false,
          isValid: false,
          error: 'Error al validar el email'
        });
      }
    } else {
      setEmailValidation({ isValidating: false, isValid: null });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
    
    // Clear roles error when user selects a role
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: undefined }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const newErrors: Partial<Record<keyof FormData, string>> = {};

      // CAMPOS OBLIGATORIOS según tipo de persona
      if (formData.personType === 'fisica') {
        // Para Persona Física: Nombre, Apellido, DNI son obligatorios
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'El nombre es obligatorio';
        } else if (!validateName(formData.firstName)) {
          newErrors.firstName = 'Nombre inválido (solo letras, 2-50 caracteres)';
        }
        
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'El apellido es obligatorio';
        } else if (!validateName(formData.lastName)) {
          newErrors.lastName = 'Apellido inválido (solo letras, 2-50 caracteres)';
        }
        
        if (!formData.dni.trim()) {
          newErrors.dni = 'El DNI es obligatorio';
        } else if (!validateDNI(formData.dni)) {
          newErrors.dni = 'DNI inválido (7-8 dígitos)';
        }
      } else {
        // Para Persona Jurídica: Razón Social y CUIT son obligatorios
        if (!formData.businessName.trim()) {
          newErrors.businessName = 'La razón social es obligatoria';
        } else if (formData.businessName.length < 3) {
          newErrors.businessName = 'Razón social debe tener al menos 3 caracteres';
        }
        
        if (!formData.cuit.trim()) {
          newErrors.cuit = 'El CUIT es obligatorio';
        } else if (!validateCUIT(formData.cuit)) {
          newErrors.cuit = 'CUIT inválido (11 dígitos sin guiones)';
        }
      }

      // DOMICILIO OBLIGATORIO
      if (!formData.street.trim()) {
        newErrors.street = 'La calle es obligatoria';
      }
      
      if (!formData.streetNumber.trim()) {
        newErrors.streetNumber = 'El número es obligatorio';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'La localidad/partido es obligatoria';
      }

      // CAMPOS OBLIGATORIOS COMUNES: Email, Contraseña y Roles
      if (!formData.email.trim()) {
        newErrors.email = 'El correo electrónico es obligatorio';
      } else if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Email inválido';
      }
      
      if (!formData.password.trim()) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Debe confirmar la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      // ROLES OBLIGATORIOS
      if (formData.roles.length === 0) {
        newErrors.roles = 'Debe seleccionar al menos un rol operativo';
      }

      // CAMPOS OPCIONALES - Solo validar si tienen contenido
      if (formData.phone.trim() && formData.phone !== '+54 9 ' && !validatePhone(formData.phone)) {
        newErrors.phone = 'Teléfono inválido (formato: +54 9 XXXX-XXXXXX)';
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        // Prepare data for Usuarios table
        const usuarioData: Omit<Usuario, 'id_Usuario' | 'auth_user_id'> = {
          Nombre: formData.personType === 'fisica' ? formData.firstName : formData.businessName,
          Apellido: formData.personType === 'fisica' ? formData.lastName : null,
          DNI: formData.personType === 'fisica' && formData.dni ? parseInt(formData.dni) : null,
          Domicilio: formData.street,
          Numero: formData.streetNumber ? parseFloat(formData.streetNumber) : null,
          Piso: formData.floor ? parseFloat(formData.floor) : null,
          Departamento: formData.apartment || null,
          Localidad: formData.location,
          Tipo_Persona: formData.personType === 'fisica' ? 'Física' : 'Jurídica',
          Rol_Operativo: formData.roles.join(', '),
          Correo: formData.email,
          Telefono: (formData.phone.trim() && formData.phone !== '+54 9 ') ? formData.phone : null
        };

        console.log('Registrando usuario con Supabase Auth:', usuarioData);

        // Crear usuario en Supabase Auth (sin insertar en tabla Usuarios todavía)
        const { user } = await signUp(formData.email, formData.password, usuarioData);

        console.log('Usuario registrado exitosamente en Auth:', user);
        
        // Show success message and redirect to login
        setSuccessMessage('¡Cuenta creada exitosamente! Por favor, verifica tu email antes de iniciar sesión. El perfil se completará automáticamente después de la verificación.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle specific Supabase Auth errors
      if (error.message?.includes('User already registered')) {
        setErrors({ email: 'Este email ya está registrado. Intenta iniciar sesión.' });
      } else if (error.message?.includes('Password should be at least')) {
        setErrors({ password: 'La contraseña debe tener al menos 6 caracteres.' });
      } else if (error.message?.includes('Invalid email')) {
        setErrors({ email: 'El formato del email no es válido.' });
      } else {
        setErrors({ email: 'Error al crear la cuenta. Intente nuevamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailInputClasses = () => {
    let baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black pr-10';
    
    if (emailValidation.isValidating) {
      return `${baseClasses} border-gray-300`;
    }
    
    if (emailValidation.isValid === true) {
      return `${baseClasses} border-green-300 bg-green-50`;
    }
    
    if (emailValidation.isValid === false || errors.email) {
      return `${baseClasses} border-red-300 bg-red-50`;
    }
    
    return `${baseClasses} border-gray-300`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            O{' '}
            <Link to="/login" className="font-medium text-black hover:text-gray-700">
              inicia sesión si ya tienes una cuenta
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Persona */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Tipo de Persona
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="personType"
                    value="fisica"
                    checked={formData.personType === 'fisica'}
                    onChange={() => setFormData(prev => ({ ...prev, personType: 'fisica' }))}
                    className="h-4 w-4 text-black"
                  />
                  <span className="ml-2">Persona Física</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="personType"
                    value="juridica"
                    checked={formData.personType === 'juridica'}
                    onChange={() => setFormData(prev => ({ ...prev, personType: 'juridica' }))}
                    className="h-4 w-4 text-black"
                  />
                  <span className="ml-2">Persona Jurídica</span>
                </label>
              </div>
            </div>

            {/* Campos específicos según tipo de persona */}
            {formData.personType === 'fisica' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    DNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleDNIChange}
                    placeholder="12345678"
                    maxLength={8}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.dni ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">Ingrese su DNI (7-8 dígitos)</p>
                  {errors.dni && (
                    <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Razón Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    CUIT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cuit"
                    value={formData.cuit}
                    onChange={handleInputChange}
                    placeholder="20123456789"
                    maxLength={11}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.cuit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">Ingrese 11 dígitos sin guiones</p>
                  {errors.cuit && (
                    <p className="mt-1 text-sm text-red-600">{errors.cuit}</p>
                  )}
                </div>
              </div>
            )}

            {/* Dirección */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                {formData.personType === 'fisica' ? 'Domicilio Real' : 'Domicilio Legal'}
                <span className="text-red-500 ml-1">*</span>
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Calle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.street ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Número <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="streetNumber"
                    value={formData.streetNumber}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.streetNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.streetNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.streetNumber}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Piso <span className="text-sm font-normal text-gray-500">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Departamento <span className="text-sm font-normal text-gray-500">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Localidad/Partido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className={getEmailInputClasses()}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailValidation.isValidating && (
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                      )}
                      {!emailValidation.isValidating && emailValidation.isValid === true && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {!emailValidation.isValidating && emailValidation.isValid === false && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  {emailValidation.error && (
                    <p className="mt-1 text-sm text-red-600">{emailValidation.error}</p>
                  )}
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                  {emailValidation.isValid === true && (
                    <p className="mt-1 text-sm text-green-600">Email válido</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Teléfono <span className="text-sm font-normal text-gray-500">(Opcional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+54 9 1234-567890"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">Formato: +54 9 XXXX-XXXXXX</p>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Roles */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Roles Operativos <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('dador')}
                    onChange={() => handleRoleChange('dador')}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="ml-2">Dador de Carga</span>
                  <div className="relative ml-1 group">
                    <HelpCircle 
                      size={16} 
                      className="text-gray-400 cursor-help"
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Es aquella persona o empresa que necesita mover carga
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('operador')}
                    onChange={() => handleRoleChange('operador')}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="ml-2">Operador Logístico</span>
                  <div className="relative ml-1 group">
                    <HelpCircle 
                      size={16} 
                      className="text-gray-400 cursor-help"
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Es aquel que ofrece transporte para mover carga
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('broker')}
                    onChange={() => handleRoleChange('broker')}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="ml-2">Broker Logístico</span>
                  <div className="relative ml-1 group">
                    <HelpCircle 
                      size={16} 
                      className="text-gray-400 cursor-help"
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Es aquel que ofrece servicio de Dador de carga y Operador Logístico
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              {errors.roles && (
                <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || emailValidation.isValidating || (formData.email && !emailValidation.isValid)}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;