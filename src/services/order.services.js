import { axiosInstance } from '../config/api';

export const getAllOrders = (
  id,
  { pagination, filterString, globalFilter, sortingString }
) => {
  let url = `/suppliers/${id}/orders?`;
  url += `limit=${pagination?.pageSize ?? 10}&page=${pagination?.pageIndex ?? 0}&`;
  if (filterString) url += `${filterString}&`;
  if (globalFilter) url += `search=${encodeURIComponent(globalFilter)}&`;
  if (sortingString) url += sortingString;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getOrderById = (supplierId, id) => {
  const url = `/suppliers/${supplierId}/orders/${id}`;

  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const orderAction = (supplierId, id, data) => {
  const url = `/suppliers/${supplierId}/orders/${id}/process`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const updateOrderStatus = (supplierId, orderId, status) => {
  const url = `/suppliers/${supplierId}/orders/${orderId}/status`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, { status })
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
