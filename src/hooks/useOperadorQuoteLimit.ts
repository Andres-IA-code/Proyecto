import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface OperadorQuoteLimitHook {
  quotesUsed: number;
  quotesLimit: number;
  hasReachedLimit: boolean;
  isLoading: boolean;
  error: string | null;
  refreshCount: () => Promise<void>;
  incrementCount: () => void;
}

export const useOperadorQuoteLimit = (): OperadorQuoteLimitHook => {
  const [quotesUsed, setQuotesUsed] = useState(0);
  const [quotesLimit] = useState(5); // Free plan limit
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        return;
      }

      // Construir el nombre del operador según el tipo de persona
      const nombreOperador = currentUser.profile.Tipo_Persona === 'Física' 
        ? `${currentUser.profile.Nombre} ${currentUser.profile.Apellido || ''}`.trim()
        : currentUser.profile.Nombre;

      // Count quotes sent by this operator
      const { count, error: countError } = await supabase
        .from('Cotizaciones')
        .select('*', { count: 'exact', head: true })
        .eq('Nombre_Operador', nombreOperador);

      if (countError) {
        console.error('Error counting quotes:', countError);
        setError('Error al obtener el conteo de cotizaciones');
        return;
      }

      setQuotesUsed(count || 0);
      console.log('Quotes used by operator:', count);
      
    } catch (err) {
      console.error('Error in refreshCount:', err);
      setError('Error inesperado al obtener el conteo');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementCount = () => {
    setQuotesUsed(prev => prev + 1);
  };

  useEffect(() => {
    refreshCount();
  }, []);

  return {
    quotesUsed,
    quotesLimit,
    hasReachedLimit: quotesUsed >= quotesLimit,
    isLoading,
    error,
    refreshCount,
    incrementCount,
  };
};