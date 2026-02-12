// hooks/usePlacesAPI.js
import { useState, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const usePlacesAPI = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [autocompleteService, setAutocompleteService] = useState(null);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is missing. Please check your .env file.');
  }

  useEffect(() => {
    const initializePlaces = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        
        // Initialize Places service
        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        
        // Initialize Autocomplete service
        const autoService = new window.google.maps.places.AutocompleteService();
        
        setPlacesService(service);
        setAutocompleteService(autoService);
        setIsLoaded(true);
      } catch (err) {
        setError(err);
        console.error('Error loading Google Maps API:', err);
      }
    };

    initializePlaces();
  }, []);

  // Get autocomplete predictions (without country restriction - let Google auto-detect)
  const getPlacePredictions = useCallback(async (input, options = {}) => {
    if (!isLoaded || !autocompleteService) {
      throw new Error('Places API not loaded');
    }

    return new Promise((resolve, reject) => {
      const request = {
        input,
        types: options.types || ['geocode'],
        // Remove componentRestrictions to allow global search
        // Google will auto-detect and prioritize based on input
        ...options
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(predictions || []);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Autocomplete failed: ${status}`));
        }
      });
    });
  }, [isLoaded, autocompleteService]);

  // Extract postal code, city, state, and country from address components
  const extractLocationData = useCallback((addressComponents) => {
    if (!addressComponents || !Array.isArray(addressComponents)) {
      return { postcode: null, city: null, state: null, country: null, countryCode: null };
    }
    
    let postcode = null;
    let city = null;
    let state = null;
    let country = null;
    let countryCode = null;
    
    // Look for postal_code type first
    const postalCodeComponent = addressComponents.find(
      component => component.types.includes('postal_code')
    );
    
    if (postalCodeComponent) {
      postcode = postalCodeComponent.long_name;
    }
    
    // Look for city (locality or sublocality)
    const cityComponent = addressComponents.find(
      component => component.types.includes('locality')
    ) || addressComponents.find(
      component => component.types.includes('sublocality_level_1')
    ) || addressComponents.find(
      component => component.types.includes('postal_town')
    );
    
    if (cityComponent) {
      city = cityComponent.long_name;
    }
    
    // Look for state (administrative_area_level_1)
    const stateComponent = addressComponents.find(
      component => component.types.includes('administrative_area_level_1')
    );
    
    if (stateComponent) {
      state = stateComponent.long_name;
    }
    
    // Look for country
    const countryComponent = addressComponents.find(
      component => component.types.includes('country')
    );
    
    if (countryComponent) {
      country = countryComponent.long_name;
      countryCode = countryComponent.short_name;
    }
    
    // If no postal_code found, try to extract from other components
    if (!postcode) {
      for (const component of addressComponents) {
        const postcodeMatch = component.long_name.match(/\b\d{4}\b/);
        if (postcodeMatch) {
          postcode = postcodeMatch[0];
          break;
        }
      }
    }
    
    return { postcode, city, state, country, countryCode };
  }, []);

  // Check if input looks like a postcode (4 digits - works for both AU and NZ)
  const isPostcodeQuery = useCallback((input) => {
    const trimmed = input.trim();
    return /^\d{4}$/.test(trimmed);
  }, []);

  // Search by postcode using geocoding (auto-detect country)
  const searchByPostcode = useCallback(async (postcode) => {
    if (!isLoaded || !window.google?.maps) {
      throw new Error('Google Maps API not loaded');
    }

    // Extract just the 4-digit postcode
    const postcodeMatch = postcode.match(/\b\d{4}\b/);
    const cleanPostcode = postcodeMatch ? postcodeMatch[0] : postcode;

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      // Try multiple search strategies without country restrictions
      // Let Google auto-detect the country
      const searchStrategies = [
        // Strategy 1: Just the postcode - let Google figure out the country
        { 
          address: cleanPostcode
        },
        // Strategy 2: Postcode with common suffixes
        { 
          address: `${cleanPostcode} Australia`
        },
        // Strategy 3: Try New Zealand specifically
        { 
          address: `${cleanPostcode} New Zealand`
        }
      ];

      let attemptIndex = 0;
      let allResults = [];

      const tryNextStrategy = () => {
        if (attemptIndex >= searchStrategies.length) {
          if (allResults.length > 0) {
            // Return the best results we found
            resolve(allResults);
          } else {
            reject(new Error(`No results found for postcode ${cleanPostcode}`));
          }
          return;
        }

        const strategy = searchStrategies[attemptIndex];
        attemptIndex++;

        geocoder.geocode(strategy, (results, status) => {
          
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            // Add results to our collection
            allResults = [...allResults, ...results];
            
            // If this is the first strategy and we got results, return them immediately
            if (attemptIndex === 1) {
              resolve(results);
              return;
            }
          }
          
          if (status === window.google.maps.GeocoderStatus.ZERO_RESULTS || 
              status === window.google.maps.GeocoderStatus.OK) {
            // Try next strategy
            tryNextStrategy();
          } else {
            reject(new Error(`Postcode search failed: ${status}`));
          }
        });
      };

      tryNextStrategy();
    });
  }, [isLoaded]);

  // Search for places using Text Search
  const searchPlaces = useCallback(async (query, options = {}) => {
    if (!isLoaded || !window.google?.maps?.places) {
      throw new Error('Places API not loaded');
    }

    return new Promise((resolve, reject) => {
      const request = {
        query,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating', 'photos'],
        ...options
      };

      placesService.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }, [isLoaded, placesService]);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId, fields = []) => {
    if (!isLoaded || !window.google?.maps?.places) {
      throw new Error('Places API not loaded');
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId,
        fields: fields.length > 0 ? fields : [
          'place_id', 'name', 'formatted_address', 'geometry', 
          'rating', 'photos', 'formatted_phone_number', 'website',
          'address_components'
        ]
      };

      placesService.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }, [isLoaded, placesService]);

  // Find nearby places
  const findNearbyPlaces = useCallback(async (location, radius = 5000, type = null) => {
    if (!isLoaded || !window.google?.maps?.places) {
      throw new Error('Places API not loaded');
    }

    return new Promise((resolve, reject) => {
      const request = {
        location,
        radius,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating']
      };

      if (type) {
        request.type = type;
      }

      placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(`Nearby search failed: ${status}`));
        }
      });
    });
  }, [isLoaded, placesService]);

  // Additional utility function for geocoding addresses
  const geocodeAddress = useCallback(async (address) => {
    if (!isLoaded || !window.google?.maps) {
      throw new Error('Google Maps API not loaded');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }, [isLoaded]);

  return {
    isLoaded,
    error,
    searchPlaces,
    getPlaceDetails,
    findNearbyPlaces,
    getPlacePredictions,
    extractLocationData, // Updated function name
    geocodeAddress,
    isPostcodeQuery,
    searchByPostcode
  };
};

export default usePlacesAPI;
