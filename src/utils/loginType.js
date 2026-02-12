import { useLocation } from 'react-router-dom';
import { paths } from '../routes/paths';

export const LOGIN_TYPES = {
  SUPPLIER: 'supplier',
  RESTAURANT: 'restaurant',
  ADMIN: 'admin',
};

export const useLoginType = () => {
  // Get the hostname from window.location
  const hostname = window.location.hostname;
  
  // Check if the hostname contains 'restaurant' subdomain
  if (hostname.includes('restaurant')) {
    return LOGIN_TYPES.RESTAURANT;
  }

  // Check if the hostname contains 'admin' subdomain
  if (hostname.includes('admin')) {
    return LOGIN_TYPES.ADMIN;
  }
  
  // Default to supplier (or check for 'supplier' subdomain if needed)
  return LOGIN_TYPES.SUPPLIER;
};
