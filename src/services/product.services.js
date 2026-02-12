import { axiosInstance } from '../config/api';

export const getProductCategory = () => {
  const url = '/product-categories?page=0&limit=9999';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getProductUnit = () => {
  const url = '/units?page=0&limit=100';
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const getProducts = (
  supplierId,
  supplierBranchId,
  { pagination, filterString, globalFilter, sortingString }
) => {
  // Build query parameters
  const params = new URLSearchParams();
  params.append('limit', pagination?.pageSize ?? 10);
  params.append('page', pagination?.pageIndex ?? 0);
  
  if (globalFilter) {
    params.append('search', globalFilter);
  }
  
  // Parse the filters from filterString if it exists
  if (filterString) {
    try {
      // Extract the JSON object from the filterString
      const filtersStr = filterString.replace('filters=', '');
      const filters = JSON.parse(filtersStr);
      
      // Add each filter as a bracket notation query parameter (filters[key]=value)
      Object.entries(filters).forEach(([key, value]) => {
        params.append(`filters[${key}]`, value);
      });
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }
  
  // Add sorting if provided
  if (sortingString) {
    const sortParams = new URLSearchParams(sortingString);
    sortParams.forEach((value, key) => {
      params.append(key, value);
    });
  }
  
  // Build the final URL
  const url = `/suppliers/${supplierId}/branch/${supplierBranchId}/products?${params.toString()}`;
  
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const addProduct = (supplierId, supplierBranchId, data) => {
  const url = `/suppliers/${supplierId}/branch/${supplierBranchId}/products`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const updateProduct = (supplierId, supplierBranchId, id, data) => {
  const url = `/suppliers/${supplierId}/branch/${supplierBranchId}/products/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(url, data)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const deleteProduct = (supplierId, supplierBranchId, id) => {
  const url = `/suppliers/${supplierId}/branch/${supplierBranchId}/products/${id}`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .delete(url)
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};

export const bulkUploadProducts = (supplierId, supplierBranchId, formData) => {
  const url = `/suppliers/${supplierId}/branch/${supplierBranchId}/products/bulk-upload`;
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => resolve(response))
      .catch((err) => reject(err));
  });
};
