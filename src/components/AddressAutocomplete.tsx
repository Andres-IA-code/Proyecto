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
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
        )}
        
        {error && (
          <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-400" />
        )}
      </div>

      {isOpen && (predictions.length > 0 || error) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {error ? (
            <div className="p-3 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          ) : (
            predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelectPlace(prediction)}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;