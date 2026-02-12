import { axiosInstance } from '../config/api';

export const getPaymentTerms = () => {
  const url = '/payments/terms';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
