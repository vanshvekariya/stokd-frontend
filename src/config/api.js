import axios from 'axios';
import { API_URL } from '../common/envVariables';
import { toast } from 'react-toastify';
import { ERRORS } from '../constant';
import { commonLogoutFunc } from '../utils/share';
import { getAuthToken } from '../context/AuthContext';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 300000,
});

axiosInstance.interceptors.request.use(
  async function (config) {
    try {
      const jwt = await getAuthToken();
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
      return config;
    } catch (error) {
      toast.error(ERRORS.NETWORK_ERROR);
      commonLogoutFunc();
      return Promise.reject(error);
    }
  },
  function (error) {
    if (error?.response?.data?.error && error?.response?.data?.message) {
      toast.error(error?.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    if (response.status === 'error') {
      toast.error(ERRORS.SESSION_EXPIRED_ERROR);
      return Promise.reject(response);
    }
    return response;
  },
  function (error) {
    if (!error?.response?.data) {
      toast.error(error.message || ERRORS.NETWORK_ERROR);
    } else if ([440, 401, 403].includes(error?.response?.status)) {
      toast.error(ERRORS.SESSION_EXPIRED_ERROR);
      commonLogoutFunc();
    } 
    // else if (error?.response?.data?.error && error?.response?.data?.message) {
    //   toast.error(error?.response?.data?.message);
    // }
    return Promise.reject(error);
  }
);
