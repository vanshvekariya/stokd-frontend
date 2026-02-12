import { axiosInstance } from '../config/api';

/**
 * Save delivery zones to the backend
 * @param {Array} zones - Array of delivery zone objects
 * @param {String} supplierId - Supplier ID
 * @returns {Promise} - API response
 */
export const saveDeliveryZones = (zones, supplierId) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/suppliers/${supplierId}/delivery-zones`, { zones })
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};

/**
 * Get delivery zones for a supplier from the backend
 * @param {String} supplierId - Supplier ID
 * @param {Number} pageIndex - Page number for pagination (default: 0, 0-indexed)
 * @param {Number} pageSize - Number of items per page (default: 10)
 * @param {String} search - Optional search term to filter delivery zones
 * @returns {Promise} - API response with zones and pagination data
 */
export const getDeliveryZones = (supplierId, pageIndex = 0, pageSize = 10, search = '') => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/suppliers/${supplierId}/delivery-zones`, {
        params: { page: pageIndex, limit: pageSize, search: search }
      })
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};

/**
 * Update a specific delivery zone
 * @param {String} supplierId - Supplier ID
 * @param {String} zoneId - Zone ID to update
 * @param {Object} zoneData - Updated zone data
 * @returns {Promise} - API response
 */
export const updateDeliveryZone = (supplierId, zoneId, zoneData) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(`/suppliers/${supplierId}/delivery-zones/${zoneId}`, zoneData)
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};

/**
 * Delete a specific delivery zone
 * @param {String} supplierId - Supplier ID
 * @param {String} zoneId - Zone ID to delete
 * @returns {Promise} - API response
 */
export const deleteDeliveryZone = (supplierId, zoneId) => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .delete(`/suppliers/${supplierId}/delivery-zones/${zoneId}`)
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};
