import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import usePlacesAPI from '../../hooks/usePlacesAPI';

/**
 * Places Autocomplete component with auto-detect country functionality
 */
const PlacesAutocomplete = ({ 
  onPlaceSelect, 
  defaultSearchType = 'name'
}) => {
  const [searchType, setSearchType] = useState(defaultSearchType);
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { 
    isLoaded, 
    error, 
    getPlacePredictions, 
    getPlaceDetails, 
    extractLocationData,
    isPostcodeQuery,
    searchByPostcode
  } = usePlacesAPI();
  
  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear input when search type changes
  useEffect(() => {
    setInputValue('');
    setPredictions([]);
    setShowDropdown(false);
  }, [searchType]);

  // Get placeholder text based on search type
  const getPlaceholder = () => {
    switch (searchType) {
      case 'postcode':
        return 'Enter postcode (e.g., 2026, 3121, 2603, 6012)';
      case 'name':
      default:
        return 'Enter place name (e.g., Bondi Beach, Richmond, Manuka, Karori)';
    }
  };

  // Validate input based on search type
  const isValidInput = (input) => {
    if (searchType === 'postcode') {
      return isPostcodeQuery(input);
    } else {
      return input.trim().length >= 2;
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isValidInput(value)) {
      setIsLoading(true);
      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        fetchPredictions(value);
      }, 300);
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  };

  // Get country flag from country code
  const getCountryFlag = (countryCode) => {
    const flags = {
      'AU': '🇦🇺',
      'NZ': '🇳🇿',
      'US': '🇺🇸',
      'CA': '🇨🇦',
      'GB': '🇬🇧'
    };
    return flags[countryCode] || '🌍';
  };

  // Fetch predictions based on search type (auto-detect country)
  const fetchPredictions = async (input) => {
    if (!isLoaded) {
      setIsLoading(false);
      return;
    }

    try {
      let results = [];
      
      if (searchType === 'postcode') {
        try {
          // Search by postcode using geocoding - let Google auto-detect country
          const postcodeResults = await searchByPostcode(input);
          
          // Convert geocoding results to prediction format
          results = postcodeResults.map((result, index) => {
            const locationData = extractLocationData(result.address_components);
            return {
              description: result.formatted_address,
              place_id: result.place_id,
              structured_formatting: {
                main_text: `Postcode ${input}`,
                secondary_text: result.formatted_address
              },
              types: ['postal_code'],
              isPostcodeResult: true,
              geocodingResult: result,
              countryCode: locationData.countryCode,
              country: locationData.country
            };
          });
        } catch (postcodeError) {
          console.error('Postcode search error:', postcodeError);
          try {
            const fallbackResults = await getPlacePredictions(input, {
              types: ['postal_code', 'sublocality', 'locality']
            });
            
            results = fallbackResults.filter(result => 
              result.description.includes(input)
            ).map(result => ({
              description: result.description,
              place_id: result.place_id,
              structured_formatting: {
                main_text: `Area ${input}`,
                secondary_text: result.description
              },
              types: result.types || ['locality'],
              isPostcodeResult: true,
              originalResult: result
            }));
          } catch (fallbackError) {
            console.error('Fallback search also failed:', fallbackError);
            throw postcodeError;
          }
        }
      } else {
        // Search by place name using autocomplete - no country restrictions
        results = await getPlacePredictions(input, {
          types: ['geocode'] // Include all location types globally
        });
      }
      
      setPredictions(results || []);
      setShowDropdown((results || []).length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setPredictions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle place selection
  const handlePlaceSelect = async (prediction) => {
    try {
      setIsLoading(true);
      
      let placeData;
      
      if (prediction.isPostcodeResult && prediction.geocodingResult) {
        // For postcode results from geocoding, use the geocoding data directly
        const geocodingResult = prediction.geocodingResult;
        const locationData = extractLocationData(geocodingResult.address_components);
        
        placeData = {
          id: geocodingResult.place_id,
          name: prediction.structured_formatting.main_text,
          formattedAddress: geocodingResult.formatted_address,
          lat: geocodingResult.geometry.location.lat(),
          lng: geocodingResult.geometry.location.lng(),
          postcode: locationData.postcode,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          countryCode: locationData.countryCode,
          searchType: 'postcode',
          isPostcodeResult: true
        };
      } else {
        // For place name results or fallback results, get place details
        const placeDetails = await getPlaceDetails(prediction.place_id, [
          'place_id', 'name', 'formatted_address', 'geometry', 'address_components'
        ]);
        
        const locationData = extractLocationData(placeDetails.address_components);
        
        placeData = {
          id: placeDetails.place_id,
          name: placeDetails.name,
          formattedAddress: placeDetails.formatted_address,
          lat: placeDetails.geometry?.location.lat(),
          lng: placeDetails.geometry?.location.lng(),
          postcode: locationData.postcode,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          countryCode: locationData.countryCode,
          searchType: searchType,
          isPostcodeResult: prediction.isPostcodeResult || false
        };
      }
      
      onPlaceSelect(placeData);
      
      // Update input with the selected place
      setInputValue(placeData.formattedAddress || prediction.description);
      setPredictions([]);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error selecting place:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (isValidInput(inputValue) && predictions.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle Enter key to select first result
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && predictions.length > 0) {
      e.preventDefault();
      handlePlaceSelect(predictions[0]);
    }
  };

  if (error) {
    return <div className="text-red-600 p-2">Error loading Places API: {error.message}</div>;
  }

  return (
    <div className="w-full space-y-3">
      {/* Search Type Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setSearchType('name')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            searchType === 'name'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏙️ Search by Name
        </button>
        <button
          type="button"
          onClick={() => setSearchType('postcode')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            searchType === 'postcode'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📮 Search by Postcode
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type={searchType === 'postcode' ? 'number' : 'text'}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={!isLoaded}
          maxLength={searchType === 'postcode' ? 4 : undefined}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Input validation hint for postcode */}
        {searchType === 'postcode' && inputValue && !isValidInput(inputValue) && (
          <div className="absolute top-full left-0 mt-1 text-xs text-amber-600">
            Please enter a 4-digit postcode
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="relative z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id || index}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handlePlaceSelect(prediction)}
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {prediction.structured_formatting?.main_text || 
                     prediction.description?.split(',')[0] || 
                     prediction.description}
                  </div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-600 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                  {!prediction.structured_formatting && prediction.description && (
                    <div className="text-sm text-gray-600 truncate">
                      {prediction.description}
                    </div>
                  )}
                </div>
                
                <div className="ml-2 flex items-center gap-1 flex-shrink-0">
                  {searchType === 'postcode' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📮
                    </span>
                  )}
                  {prediction.countryCode && (
                    <span className="text-lg" title={prediction.country}>
                      {getCountryFlag(prediction.countryCode)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && predictions.length === 0 && isValidInput(inputValue) && !isLoading && (
        <div className="relative z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No results found for &quot;{inputValue}&quot;
        </div>
      )}
    </div>
  );
};

PlacesAutocomplete.propTypes = {
  onPlaceSelect: PropTypes.func.isRequired,
  defaultSearchType: PropTypes.oneOf(['name', 'postcode'])
};

export default PlacesAutocomplete;
