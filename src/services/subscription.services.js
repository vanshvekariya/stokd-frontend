import { axiosInstance } from '../config/api';

/**
 * Check if a restaurant has an active subscription
 * @param {number} restaurantId - The ID of the restaurant
 * @returns {Promise} - The API response with subscription status
 */
export const checkRestaurantSubscription = (restaurantId) => {
  const url = `/subscriptions/restaurants/${restaurantId}/is-subscribed`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Get all available subscription plans
 * @returns {Promise} - The API response with subscription plans
 */
export const getSubscriptionPlans = () => {
  const url = '/subscriptions/plans';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Subscribe to a plan
 * @param {object} data - The subscription data containing priceId and restaurantId
 * @returns {Promise} - The API response
 */
export const subscribeToPlan = (data) => {
  const { restaurantId, priceId } = data;
  const url = `/subscriptions/restaurants/${restaurantId}/create-session`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, { priceId })
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Create a billing portal session for managing subscriptions
 * @param {number} restaurantId - The ID of the restaurant
 * @returns {Promise} - The API response with the billing portal URL
 */
export const createBillingPortalSession = (restaurantId) => {
  const url = `/subscriptions/restaurants/${restaurantId}/billing-portal`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
