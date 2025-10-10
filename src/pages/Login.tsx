import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle, Mail, Database } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, resendEmailVerification } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for URL parameters
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    
    if (verified === 'true') {
      setSuccessMessage('¡Email verificado exitosamente! Ya puedes iniciar sesión.');
    }
    
    if (reset === 'success') {
      setSuccessMessage('Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña.');
    }
  }, [searchParams]);

  const getRedirectPath = (roles: string): string => {
    const roleArray = roles.toLowerCase().split(', ');
    
    // Priority order: dador -> operador -> broker
    if (roleArray.includes('dador')) {
      return '/app';
    } else if (roleArray.includes('operador')) {
      return '/operador';
    } else if (roleArray.includes('broker')) {
      return '/broker';
    }
    
    // Default fallback
    return '/app';
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await resendEmailVerification(email);
      setSuccessMessage('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
      setShowResendVerification(false);
    } catch (error: any) {
      console.error('Error resending verification:', error);
      setError('Error al reenviar el correo de verificación. Intenta nuevamente.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setShowResendVerification(false);

    try {
      // Validate input
      if (!email || !password) {
        setError('Por favor complete todos los campos');
        return;
      }

      console.log('🔐 Intentando iniciar sesión con:', email);

      // Use Supabase Auth to sign in
      const { user, profile } = await signIn(email, password);

      console.log('✅ Inicio de sesión exitoso:', { user: user.id, profile: profile.id_Usuario });

      // Save session data to localStorage (for compatibility with existing code)
      const sessionData = {
        user: {
          id: profile.id_Usuario,
          email: profile.Correo,
          name: profile.Nombre,
          lastName: profile.Apellido,
          roles: profile.Rol_Operativo,
          personType: profile.Tipo_Persona,
          phone: profile.Telefono,
          address: {
            street: profile.Domicilio,
            number: profile.Numero,
            floor: profile.Piso,
            apartment: profile.Departamento,
            location: profile.Localidad
          },
          authUserId: user.id // Store the Supabase Auth user ID
        },
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      };

      localStorage.setItem('userSession', JSON.stringify(sessionData));
      
      console.log('💾 Datos de sesión guardados:', sessionData);

      // Determine redirect path based on roles
      const redirectPath = getRedirectPath(profile.Rol_Operativo || '');
      
      console.log('🚀 Redirigiendo a:', redirectPath);

      // Small delay to ensure everything is saved
      setTimeout(() => {
        // Redirect to appropriate panel
        navigate(redirectPath, { replace: true });
      }, 100);

    } catch (error: any) {
      console.error('💥 Error during login:', error);
      
      // Handle specific Supabase Auth errors
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('Supabase no está configurado correctamente')) {
        setError(
          <div className="space-y-2">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium">Base de datos no configurada</span>
            </div>
            <p className="text-sm text-gray-600">
              La aplicación necesita ser configurada con una base de datos Supabase. 
              Por favor contacta al administrador del sistema.
            </p>
          </div>
        );
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        setError(
          <div className="space-y-2">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium">Error de conexión</span>
            </div>
            <p className="text-sm text-gray-600">
              No se puede conectar con el servidor. Verifica tu conexión a internet 
              o contacta al administrador si el problema persiste.
            </p>
          </div>
        );
      } else if (errorMessage.includes('Invalid login credentials')) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Por favor confirma tu email antes de iniciar sesión.');
        setShowResendVerification(true);
      } else if (errorMessage.includes('Too many requests')) {
        setError('Demasiados intentos. Espera unos minutos antes de intentar nuevamente.');
      } else if (errorMessage.includes('User not found')) {
        setError('No existe una cuenta con este email. ¿Necesitas registrarte?');
      } else if (errorMessage.includes('No se encontró el perfil del usuario')) {
        setError('Tu cuenta está siendo configurada. Por favor intenta nuevamente en unos momentos o contacta al administrador.');
      } else {
        setError(errorMessage || 'Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 relative">
          {/* Back Arrow */}
          <Link
            to="/"
            className="absolute top-4 left-1 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            title="Volver al inicio"
          >
            <ArrowLeft size={20} />
          </Link>

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

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <div className="text-sm font-medium text-red-800">
                    {typeof error === 'string' ? error : error}
                  </div>
                  {showResendVerification && (
                    <button
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500 underline disabled:opacity-50"
                    >
                      {resendingVerification ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          Reenviando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Reenviar correo de verificación
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(''); // Clear error when user types
                    if (successMessage) setSuccessMessage(''); // Clear success message
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(''); // Clear error when user types
                    if (successMessage) setSuccessMessage(''); // Clear success message
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                  placeholder="Ingrese su contraseña"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-black hover:text-gray-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  ¿No tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;