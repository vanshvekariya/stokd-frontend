import { axiosInstance } from '../config/api';

export const login = (data) => {
  const url = '/auth/supplier/login';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const adminLogin = (data) => {
  const url = '/auth/admin/login';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const restaurantLogin = (data) => {
  const url = '/auth/restaurant/login-for-subscription';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const logout = () => {
  const url = '/auth/logout';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const userSignup = () => {
  const url = '/users/sync';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const supplierProfileSignUp = (data) => {
  const url = '/suppliers/signup';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const restaurantProfileSignUp = (data) => {
  const url = '/restaurants/signup';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const me = () => {
  const url = '/me';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getSupplier = (id) => {
  const url = `/suppliers/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const updateSupplierPersonalDetails = (data) => {
  const url = '/users/profile';
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const updateSupplierBusinessDetails = (supplierId, id, data) => {
  const url = `/suppliers/${supplierId}/branches/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const acceptInvitation = (data) => {
  const url = '/auth/accept-invitation';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
