import { axiosInstance } from '../config/api';


export const getAllRoles = () => {
  const url = '/roles';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getAllUsers = ({
  pagination = {},
  filterString = '',
  globalFilter = '',
  sortingString = ''
} = {}) => {
  const params = new URLSearchParams();
  
  // Handle pagination
  const pageSize = parseInt(pagination.pageSize, 10) || 10;
  const pageIndex = parseInt(pagination.pageIndex, 10) || 0;
  params.append('limit', pageSize);
  params.append('page', pageIndex);
  
  // Handle global search
  if (globalFilter && typeof globalFilter === 'string') {
    params.append('search', globalFilter.trim());
  }
  
  // Handle filters
  if (filterString && typeof filterString === 'string') {
    try {
      // Clean and parse the filter string
      const cleanFilterString = filterString.replace(/^filters=/, '').trim();
      if (cleanFilterString) {
        const filters = JSON.parse(cleanFilterString);
        
        // Only process if we have a valid filters object
        if (filters && typeof filters === 'object') {
          Object.entries(filters).forEach(([key, value]) => {
            // Skip null/undefined values
            if (value !== null && value !== undefined && value !== '') {
              params.append(`filters[${key}]`, value);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing filters:', error);
      // Don't throw, just continue without filters
    }
  }
  
  // Handle sorting
  if (sortingString && typeof sortingString === 'string') {
    try {
      const sortParams = new URLSearchParams(sortingString);
      sortParams.forEach((value, key) => {
        if (value) params.append(key, value);
      });
    } catch (error) {
      console.error('Error processing sorting:', error);
    }
  }

  // Build the final URL
  const url = `/admin/users?${params.toString()}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getUserById = (id) => {
  const url = `/admin/users/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getAllSuppliers = ({
  pagination = {},
  filterString = '',
  globalFilter = '',
  sortingString = ''
} = {}) => {
  const params = new URLSearchParams();
  
  // Handle pagination
  const pageSize = parseInt(pagination.pageSize, 10) || 10;
  const pageIndex = parseInt(pagination.pageIndex, 10) || 0;
  params.append('limit', pageSize);
  params.append('page', pageIndex);
  
  // Handle global search
  if (globalFilter && typeof globalFilter === 'string') {
    params.append('search', globalFilter.trim());
  }
  
  // Handle filters
  if (filterString && typeof filterString === 'string') {
    try {
      // Clean and parse the filter string
      const cleanFilterString = filterString.replace(/^filters=/, '').trim();
      if (cleanFilterString) {
        const filters = JSON.parse(cleanFilterString);
        
        // Only process if we have a valid filters object
        if (filters && typeof filters === 'object') {
          Object.entries(filters).forEach(([key, value]) => {
            // Skip null/undefined values
            if (value !== null && value !== undefined && value !== '') {
              params.append(`filters[${key}]`, value);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing filters:', error);
      // Don't throw, just continue without filters
    }
  }
  
  // Handle sorting
  if (sortingString && typeof sortingString === 'string') {
    try {
      const sortParams = new URLSearchParams(sortingString);
      sortParams.forEach((value, key) => {
        if (value) params.append(key, value);
      });
    } catch (error) {
      console.error('Error processing sorting:', error);
    }
  }

  // Build the final URL
  const url = `/admin/suppliers?${params.toString()}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getSupplierById = (id) => {
  const url = `/admin/suppliers/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getAllRestaurants = ({
  pagination = {},
  filterString = '',
  globalFilter = '',
  sortingString = ''
} = {}) => {
  const params = new URLSearchParams();
  
  // Handle pagination
  const pageSize = parseInt(pagination.pageSize, 10) || 10;
  const pageIndex = parseInt(pagination.pageIndex, 10) || 0;
  params.append('limit', pageSize);
  params.append('page', pageIndex);
  
  // Handle global search
  if (globalFilter && typeof globalFilter === 'string') {
    params.append('search', globalFilter.trim());
  }
  
  // Handle filters
  if (filterString && typeof filterString === 'string') {
    try {
      // Clean and parse the filter string
      const cleanFilterString = filterString.replace(/^filters=/, '').trim();
      if (cleanFilterString) {
        const filters = JSON.parse(cleanFilterString);
        
        // Only process if we have a valid filters object
        if (filters && typeof filters === 'object') {
          Object.entries(filters).forEach(([key, value]) => {
            // Skip null/undefined values
            if (value !== null && value !== undefined && value !== '') {
              params.append(`filters[${key}]`, value);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing filters:', error);
      // Don't throw, just continue without filters
    }
  }
  
  // Handle sorting
  if (sortingString && typeof sortingString === 'string') {
    try {
      const sortParams = new URLSearchParams(sortingString);
      sortParams.forEach((value, key) => {
        if (value) params.append(key, value);
      });
    } catch (error) {
      console.error('Error processing sorting:', error);
    }
  }

  // Build the final URL
  const url = `/admin/restaurants?${params.toString()}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getRestaurantById = (id) => {
  const url = `/admin/restaurants/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};



export const dashboardStats = () => {
  const url = '/admin/dashboard';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};




