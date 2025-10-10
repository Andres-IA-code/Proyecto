import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../lib/supabase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico');
        return;
      }

      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      
      if (error.message?.includes('User not found')) {
        setError('No existe una cuenta con este correo electrónico');
      } else if (error.message?.includes('Email rate limit exceeded')) {
        setError('Has solicitado demasiados resets. Espera unos minutos antes de intentar nuevamente.');
      } else {
        setError('Error al enviar el correo de recuperación. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Correo Enviado
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recuperar Contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 relative">
          {/* Back Arrow */}
          <Link
            to="/login"
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            title="Volver al inicio de sesión"
          >
            <ArrowLeft size={20} />
          </Link>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black"
                  placeholder="ejemplo@correo.com"
                />
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
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace de recuperación'
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
                  ¿Recordaste tu contraseña?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;