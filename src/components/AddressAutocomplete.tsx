import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useGooglePlaces } from '../hooks/useGooglePlaces';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar dirección...",
  className = "",
  required = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { predictions, isLoading, error, searchPlaces, getPlaceDetails, clearPredictions } = useGooglePlaces();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 3) {
      setIsOpen(true);
      await searchPlaces(newValue);
    } else if (newValue.length > 0) {
      setIsOpen(true);
      clearPredictions();
    } else {
      setIsOpen(false);
      clearPredictions();
    }
  };

  const handleSelectPlace = async (prediction: any) => {
    setInputValue(prediction.description);
    setIsOpen(false);
    clearPredictions();

    // Get place details to extract coordinates
    const details = await getPlaceDetails(prediction.place_id);
    if (details?.geometry?.location) {
      onChange(prediction.description, {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      });
    } else {
      onChange(prediction.description);
    }
  };

  const handleFocus = () => {
    if (predictions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={`w-full pl-10 pr-10 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-blue-500" />

        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-blue-500 animate-spin" />
        )}

        {error && (
          <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
        >
          {isLoading && predictions.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Buscando direcciones...
            </div>
          ) : error ? (
            <div className="p-3 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          ) : predictions.length > 0 ? (
            <>
              <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                <p className="text-xs font-medium text-blue-700">
                  {predictions.length} {predictions.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </p>
              </div>
              {predictions.map((prediction, index) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  onClick={() => handleSelectPlace(prediction)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-gray-600">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : inputValue.length < 3 && inputValue.length > 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center flex items-center justify-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
              Escribe al menos 3 caracteres para buscar
            </div>
          ) : inputValue.length >= 3 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No se encontraron resultados
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;