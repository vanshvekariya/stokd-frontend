import { axiosInstance } from '../config/api';

export const coonectIntegration = (supplierId, data) => {
  const url = `/suppliers/${supplierId}/accounting/authorize`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getIntegrationDetails = (supplierId) => {
  const url = `/suppliers/${supplierId}/accounting/integrations`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const disConnectIntegration = (supplierId, integrationId) => {
  const url = `/suppliers/${supplierId}/accounting/integrations/${integrationId}/disconnect`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
