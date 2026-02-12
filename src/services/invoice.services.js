import { axiosInstance } from '../config/api';

export const getInvoices = (
  id,
  { pagination, filterString, globalFilter, sortingString }
) => {
  let url = `/supplier/${id}/invoices?`;
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

export const getInvoiceById = (supplierId, id, format = 'json') => {
  const url = `/supplier/${supplierId}/order/${id}/invoice?entityType=supplier&${format === 'json' ? '&format=json' : ''}`;

  // For JSON format, return regular response
  if (format === 'json') {
    return new Promise((resolve, reject) => {
      axiosInstance
        .get(url)
        .then((response) => resolve(response))
        .catch((err) => reject(err));
    });
  }

  // For PDF format (inline viewing), use blob response type
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url, {
        responseType: 'blob',
      })
      .then((response) => {
        // Create a blob URL from the response data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const viewUrl = window.URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(viewUrl, '_blank');

        // Clean up the blob URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(viewUrl);
        }, 100);

        resolve({ success: true, url: viewUrl });
      })
      .catch((err) => reject(err));
  });
};

export const downloadInvoice = (supplierId, orderId) => {
  const url = `/supplier/${supplierId}/order/${orderId}/invoice/download?entityType=supplier`;

  return new Promise((resolve, reject) => {
    axiosInstance
      .get(url, {
        responseType: 'blob', // Important: Set responseType to 'blob'
      })
      .then((response) => {
        // Create a blob URL from the response data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Get filename from Content-Disposition header if available
        const contentDisposition = response.headers['content-disposition'];
        let filename = `Invoice_${orderId}.pdf`; // Default filename

        if (contentDisposition) {
          const filenameMatch =
            contentDisposition.match(/filename="?([^"]*)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);

        resolve(response);
      })
      .catch((err) => reject(err));
  });
};
