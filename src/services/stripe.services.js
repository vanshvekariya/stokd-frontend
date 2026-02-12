import { axiosInstance } from '../config/api';

/**
 * Get the Stripe onboarding status for a supplier
 * @param {number} supplierId - The ID of the supplier
 * @returns {Promise} - The API response
 */
export const getStripeOnboardingStatus = (supplierId) => {
  const url = `/stripe-accounts/supplier/${supplierId}/onboarding-status`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Create a Stripe account link for onboarding
 * @param {number} supplierId - The ID of the supplier
 * @returns {Promise} - The API response with the Stripe account link
 */
export const createStripeAccountLink = (supplierId) => {
  const url = `/stripe-accounts/supplier/${supplierId}/account-link`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Get the Stripe dashboard URL for a supplier
 * @param {number} supplierId - The ID of the supplier
 * @returns {Promise} - The API response with the Stripe dashboard URL
 */
export const getStripeDashboardUrl = (supplierId) => {
  const url = `/payments/suppliers/${supplierId}/dashboard`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
