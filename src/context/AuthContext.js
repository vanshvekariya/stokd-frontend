import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeToAuthChanges,
  getCurrentUserToken,
} from '../services/firebase.auth.services';
import PropTypes from 'prop-types';
import { getLocalStorageItem, removeLocalStorageItem } from '../utils/share';
import { auth } from '../config/firebase';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create a token cache to prevent excessive token fetching
let tokenCache = null;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [backendAuth, setBackendAuth] = useState(
    !!getLocalStorageItem('isLoggedIn')
  );

  useEffect(() => {
    // Subscribe to Firebase auth changes
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const token = await getCurrentUserToken();
          setUserToken(token);
          tokenCache = token;
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          toast.error('Something went wrong, please try again');
          setUserToken(null);
          tokenCache = null;
        }
      } else {
        // If Firebase user is null but we think we're logged in
        if (getLocalStorageItem('isLoggedIn')) {
          removeLocalStorageItem('isLoggedIn');
          removeLocalStorageItem('user');
          setBackendAuth(false);
        }

        setUserToken(null);
        tokenCache = null;
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Keep track of backendAuth changes
  useEffect(() => {
    const isLoggedIn = !!getLocalStorageItem('isLoggedIn');
    if (backendAuth !== isLoggedIn) {
      setBackendAuth(isLoggedIn);
    }
  }, [backendAuth]);

  // Function to refresh token manually
  const refreshToken = async () => {
    if (auth.currentUser) {
      try {
        const newToken = await auth.currentUser.getIdToken(true); // force refresh token
        setUserToken(newToken);
        tokenCache = newToken;
        return { success: true, token: newToken };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No authenticated user' };
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser && backendAuth,
    userToken,
    loading,
    backendAuth,
    setBackendAuth,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Get the token from cache first to prevent unnecessary Firebase calls
export const getAuthToken = () => {
  return tokenCache;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
