import { axiosInstance } from '../config/api';

/**
 * Get all notifications
 * @param {number} page - Page number (0-indexed)
 * @param {number} limit - Number of items per page
 * @param {string} search - Optional search term
 * @returns {Promise} Promise object with notifications data
 */
export const getNotifications = (page = 0, limit = 10, search = '') => {
  let url = `/notifications?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Mark notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 * @returns {Promise} Promise object with response data
 */
export const markNotificationAsRead = (notificationId) => {
  const url = `/notifications/${notificationId}/read`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Get unread notifications count
 * @returns {Promise} Promise object with unread notifications count
 */
export const getUnreadNotificationCount = () => {
  const url = '/notifications/unread-count';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

/**
 * Mark all notifications as read
 * @returns {Promise} Promise object with response data
 */
export const markAllNotificationsAsRead = () => {
  const url = '/notifications/mark-all-read';
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};