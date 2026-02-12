import { axiosInstance } from '../config/api';

/**
 * Get delivery information for a supplier
 * @param {string} supplierId - The ID of the supplier
 * @returns {Promise} - Promise with delivery information data
 */
export const getDeliveryInfo = (supplierId) => {
  const url = `/suppliers/${supplierId}/delivery-info`;
  return axiosInstance
    .get(url)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
};

/**
 * Update delivery information for a supplier
 * @param {string} supplierId - The ID of the supplier
 * @param {Object} data - Delivery information data
 * @param {number} data.minimumOrderQuantity - Minimum order quantity
 * @param {number} data.deliveryFee - Delivery fee
 * @returns {Promise} - Promise with updated delivery information
 */
export const updateDeliveryInfo = (supplierId, data) => {
  const url = `/suppliers/${supplierId}/delivery-info`;
  return axiosInstance
    .put(url, data)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
};
