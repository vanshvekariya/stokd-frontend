import { toast } from 'react-toastify';
import { logout } from '../services/auth.services';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { City, State } from 'country-state-city';
import axios from 'axios';

export const setLocalStorageItem = (key, value) => {
  if (!key) {
    toast.error('Key is required to set item in localStorage');
    return;
  }
  try {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, data);
  } catch (error) {
    toast.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorageItem = (key) => {
  if (!key) return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    toast.error('Error reading from localStorage:', error);
    return null;
  }
};

export const removeLocalStorageItem = (key) => {
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    toast.error('Error removing from localStorage:', error);
  }
};

export const commonLogoutFunc = async () => {
  // Add a guard to prevent multiple calls
  if (window.isLoggingOut) {
    return;
  }

  try {
    // Set flag to prevent multiple calls
    window.isLoggingOut = true;

    // Handle backend logout first
    try {
      await logout();
    } catch (error) {
      toast.error('Backend logout error:', error);
      // Continue with local logout even if backend fails
    }

    // Firebase signout
    try {
      await signOut(auth);
    } catch (error) {
      toast.error('Firebase signout error:', error);
      // Continue with local logout even if Firebase fails
    }

    // Clear local storage regardless of the API responses
    removeLocalStorageItem('isLoggedIn');
    removeLocalStorageItem('user');

    toast.success('User logged out successfully');

    // If needed, redirect to login page
    // window.location.href = '/login';
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Logout failed');
  } finally {
    // Reset the flag
    window.isLoggingOut = false;
  }
};

export const countries = [
  { id: 'AU', name: 'Australia' },
  { id: 'NZ', name: 'New Zealand' },
];

// Get states for selected country
export const getStateOptions = (countryCode) => {
  if (!countryCode) return [];
  const states = State.getStatesOfCountry(countryCode);

  return states.map((state) => ({
    id: state.isoCode,
    name: state.name,
  }));
};

// Get cities for selected state
export const getCityOptions = (countryCode, selectedState) => {
  if (!countryCode || !selectedState) return [];
  const cities = City.getCitiesOfState(countryCode, selectedState);
  return cities.map((city) => ({
    id: city.name,
    name: city.name,
  }));
};

// Get postcode options for a location (city, state, country)
export const getPostcodeOptions = async (city, state, country) => {
  if (!city || !country) return [];
  
  try {
    // For Australia
    if (country === 'AU' && state) {
      const response = await axios.get(`https://api.zippopotam.us/au/${state.toLowerCase()}/${city.toLowerCase()}`);
      if (response.data && response.data.places && response.data.places.length > 0) {
        return response.data.places.map(place => ({
          id: place['post code'],
          name: place['post code']
        }));
      }
    }
    // For New Zealand
    else if (country === 'NZ') {
      const response = await axios.get(`https://api.zippopotam.us/nz/${city.toLowerCase()}`);
      if (response.data && response.data.places && response.data.places.length > 0) {
        return response.data.places.map(place => ({
          id: place['post code'],
          name: place['post code']
        }));
      }
    }
    return [];
  } catch {
    // Silent fail if API is unavailable
    return [];
  }
};

// Get first available postcode for a location (city, state, country)
export const getPostcode = async (city, state, country) => {
  if (!city || !country) return '';
  
  try {
    const options = await getPostcodeOptions(city, state, country);
    return options.length > 0 ? options[0].id : '';
  } catch {
    // Silent fail if API is unavailable
    return '';
  }
};

export const getUserCountry = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    const user = JSON.parse(userString);
    return user?.supplier?.address?.country || null;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return null;
  }
};

export const getSupplierId = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    const user = JSON.parse(userString);
    return user?.supplier?.id || null;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return null;
  }
};

export const getSupplierBranchId = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;

    const user = JSON.parse(userString);
    return user?.supplier?.branches?.[0]?.id || null;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return null;
  }
};

export const updateSupplierBranchInLocalStorage = (updatedData) => {
  if (!updatedData || !updatedData.id) {
    return null;
  }

  // Get the current user data from local storage
  const currentUserData = getLocalStorageItem('user');
  if (!currentUserData || !currentUserData.supplier) {
    return null;
  }

  // Create a deep copy of the current user data
  const updatedUserData = JSON.parse(JSON.stringify(currentUserData));
  
  // Check if the API response has branches array (full supplier object)
  if (
    updatedData.branches &&
    Array.isArray(updatedData.branches) &&
    updatedData.branches.length > 0
  ) {
    // This is a full supplier object with branches
    // Update the supplier properties
    updatedUserData.supplier.id = updatedData.id;
    updatedUserData.supplier.businessName = updatedData.branchName;
    updatedUserData.supplier.businessPhone = updatedData.phone;
    updatedUserData.supplier.companyDescription =
    updatedData.companyDescription;
    updatedUserData.supplier.logoImage = updatedData.logoImage;
    updatedUserData.supplier.address = updatedData.address;
    updatedUserData.supplier.status = updatedData.status;
    updatedUserData.supplier.countryCode = updatedData.countryCode;

    // Update the branch data if it exists
    if (updatedUserData.supplier.branches) {
      updatedUserData.supplier.branches = updatedData.branches;
    }
  } else {
    // This is just a branch object or a supplier without branches array
    // Update the branch data if branches exist in user data
    if (
      updatedUserData.supplier.branches &&
      updatedUserData.supplier.branches.length > 0
    ) {
      updatedUserData.supplier.branches[0] = updatedData;
    }

    // Always update the supplier properties directly
    updatedUserData.supplier.id = updatedData.id || updatedUserData.supplier.id;
    updatedUserData.supplier.businessName =
      updatedData.branchName || updatedUserData.supplier.businessName;
    updatedUserData.supplier.businessPhone =
      updatedData.phone || updatedUserData.supplier.businessPhone;

    if (updatedData.companyDescription) {
      updatedUserData.supplier.companyDescription =
        updatedData.companyDescription;
    }

    if (updatedData.logoImage) {
      updatedUserData.supplier.logoImage = updatedData.logoImage;
    }

    if (updatedData.address) {
      updatedUserData.supplier.address = updatedData.address;
    }

    if(updatedData.abn){
      updatedUserData.supplier.abn = updatedData.abn;
    }
  }

  // Save the updated user data back to local storage
  setLocalStorageItem('user', updatedUserData);

  return updatedUserData;
};

export const formatPhoneNumber = (phoneWithCode) => {
  if (!phoneWithCode) return '';

  // Remove country code prefix if present
  if (phoneWithCode.startsWith('+61')) {
    return phoneWithCode.substring(3); // Remove +61
  } else if (phoneWithCode.startsWith('+64')) {
    return phoneWithCode.substring(3); // Remove +64
  }

  return phoneWithCode;
};

export const extractPhoneDetails = (phoneWithCode) => {
  if (!phoneWithCode) return { countryCode: '+61', phoneNumber: '' };

  // Extract country code and phone number
  if (phoneWithCode.startsWith('+61')) {
    return {
      countryCode: '+61',
      phoneNumber: phoneWithCode.substring(3),
    };
  } else if (phoneWithCode.startsWith('+64')) {
    return {
      countryCode: '+64',
      phoneNumber: phoneWithCode.substring(3),
    };
  }

  // Default to +61 if no country code is found
  return {
    countryCode: '+61',
    phoneNumber: phoneWithCode,
  };
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};



export const formatAddress = (address) => {
  if (!address) return 'N/A';

  const { street, city, state, zipcode, country } = address;
  const parts = [street, city, state, zipcode, country].filter(Boolean);

  // If we have any parts, join them with comma and space
  // Otherwise return 'N/A' if all parts are missing
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};




export const formatPhoneNumberWithCountryCode = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.toString().replace(/[^\d+]/g, '');

  // If number already has a country code, format it with space after country code
  if (cleaned.startsWith('+61')) {
    const number = cleaned.substring(3); // Remove +61
    return `+61 ${number}`;
  } else if (cleaned.startsWith('+64')) {
    const number = cleaned.substring(3); // Remove +64
    return `+64 ${number}`;
  }

  // If no country code, assume Australian number
  return `+61 ${cleaned}`;
};

