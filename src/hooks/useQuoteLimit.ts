import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';

interface QuoteLimitHook {
  quotesUsed: number;
  quotesLimit: number;
  hasReachedLimit: boolean;
  isLoading: boolean;
  error: string | null;
  refreshCount: () => Promise<void>;
  incrementCount: () => void;
}

export const useQuoteLimit = (): QuoteLimitHook => {
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

      // Count shipments created by this user
      const { count, error: countError } = await supabase
        .from('General')
        .select('*', { count: 'exact', head: true })
        .eq('id_Usuario', currentUser.profile.id_Usuario);

      if (countError) {
        console.error('Error counting quotes:', countError);
        setError('Error al obtener el conteo de solicitudes');
        return;
      }

      setQuotesUsed(count || 0);
      console.log('Quotes used:', count);
      
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