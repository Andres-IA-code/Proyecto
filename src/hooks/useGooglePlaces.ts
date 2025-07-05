import { useState, useCallback } from 'react';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface UseGooglePlacesReturn {
  predictions: PlacePrediction[];
  isLoading: boolean;
  error: string | null;
  searchPlaces: (input: string) => Promise<void>;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails | null>;
  clearPredictions: () => void;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/places-autocomplete?input=${encodeURIComponent(input)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        // If Google Maps API fails, try fallback or show error
        if (data.fallback_available) {
          console.warn('Google Maps API error, using fallback:', data.message);
          // You could implement a fallback here using Nominatim or another service
          setPredictions([]);
        } else {
          throw new Error(data.message || 'Error searching places');
        }
      } else if (data.predictions) {
        setPredictions(data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Error searching places:', err);
      setError(err instanceof Error ? err.message : 'Error searching places');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/places-autocomplete?type=details&place_id=${encodeURIComponent(placeId)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('Error getting place details:', data.message);
        return null;
      }

      return data.result;
    } catch (err) {
      console.error('Error getting place details:', err);
      return null;
    }
  }, []);

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    searchPlaces,
    getPlaceDetails,
    clearPredictions,
  };
};