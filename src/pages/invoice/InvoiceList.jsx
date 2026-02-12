import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Table from '../../components/Table';
import PageHeader from '../../components/Heading';
import { getSupplierId } from '../../utils/share';
import {
  downloadInvoice,
  getInvoiceById,
  getInvoices,
} from '../../services/invoice.services';
import { invoiceColumn } from './InoviceColumn';

const InvoiceList = () => {
  const supplierId = getSupplierId();
  const tableRef = useRef(null);

  const [viewLoadingId, setViewLoadingId] = useState(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);
  const [emailLoadingId, setEmailLoadingId] = useState(null);

  const getData = useCallback(
    async (params) => {
      try {
        let filterObj = {};

        if (params.filterString) {
          try {
            const filterParam = params.filterString.replace('filter=', '');
            filterObj = JSON.parse(filterParam);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error parsing filters:', e);
          }
        }

        // Prepare pagination parameters
        const page = params.pagination?.pageIndex || 0;
        const limit = params.pagination?.pageSize || 10;

        // Prepare query parameters
        const queryParams = {
          ...params,
          page,
          limit,
          filterString: `filter=${JSON.stringify(filterObj)}`,
        };

        // Fetch invoices from API
        const resp = await getInvoices(supplierId, queryParams);

        return {
          data: resp?.data?.data?.items || [],
          rowCount: resp?.data?.data?.total || 0,
        };
      } catch (error) {
        toast.error(
          error?.response?.data?.message || 'Failed to fetch invoices'
        );
        return { data: [], rowCount: 0 };
      }
    },
    [supplierId]
  );

  const handleDownload = async (row) => {
    if (!row?.orderId) {
      toast.error('Order ID not found');
      return;
    }

    try {
      // Set loading state
      setDownloadLoadingId(row.orderId);

      // Download the invoice
      await downloadInvoice(supplierId, row.orderId);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to download invoice'
      );
    } finally {
      // Clear loading state
      setDownloadLoadingId(null);
    }
  };

  const handleView = async (row) => {
    if (!row?.orderId) {
      toast.error('Order ID not found');
      return;
    }

    try {
      // Set loading state
      setViewLoadingId(row.orderId);

      // View invoice as PDF (opens in new tab)
      await getInvoiceById(supplierId, row.orderId, 'pdf');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to view invoice');
    } finally {
      // Clear loading state
      setViewLoadingId(null);
    }
  };

  const handleEmail = async (row) => {
    if (!row?.orderId) {
      toast.error('Order ID not found');
      return;
    }

    try {
      // Set loading state
      setEmailLoadingId(row.orderId);

      // TODO: Replace with actual email API call
      // Temporary simulation for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Invoice sent via email successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to email invoice');
    } finally {
      // Clear loading state
      setEmailLoadingId(null);
    }
  };

  const loadingStates = {
    view: viewLoadingId,
    download: downloadLoadingId,
    email: emailLoadingId,
  };

  const columns = React.useMemo(
    () => invoiceColumn(handleDownload, handleView, handleEmail, loadingStates),
    [
      handleDownload,
      handleView,
      handleEmail,
      viewLoadingId,
      downloadLoadingId,
      emailLoadingId,
    ]
  );

  return (
    <>
      <PageHeader title="Invoices" />
      <Table columns={columns} getData={getData} ref={tableRef} />
    </>
  );
};

export default InvoiceList;
