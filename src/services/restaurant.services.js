import { axiosInstance } from '../config/api';

export const getRestaurants = (
  supplierId,
  { pagination, filterString, globalFilter, sortingString }
) => {
  let url = `/suppliers/${supplierId}/verified-restaurants?`;
  url += `limit=${pagination?.pageSize ?? 10}&page=${pagination?.pageIndex ?? 0}&`;
  if (filterString) url += `${filterString}&`;
  if (globalFilter) url += `globalSearch=${globalFilter}&`;
  if (sortingString) url += sortingString;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const verifyRestaurant = (supplierId, restaurantId, data) => {
  const url = `/suppliers/${supplierId}/verify-restaurant/${restaurantId}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
