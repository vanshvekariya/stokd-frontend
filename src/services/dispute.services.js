import { axiosInstance } from '../config/api';

export const getDisputesByIds = (supplierId, disputeIds) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/suppliers/${supplierId}/disputes/${disputeIds}`)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getDisputeOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/suppliers/orders/${orderId}`)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const updateDisputeStatus = (supplierId, disputeIds, { status, supplierResponse, refundAmounts }) => {
  const url = `/suppliers/${supplierId}/disputes/${disputeIds}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(url, { status, supplierResponse, refundAmounts })
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
