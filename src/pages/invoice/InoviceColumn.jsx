/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { Download, Eye, Mail, Loader2 } from 'lucide-react';
import Chip from '../../components/Chip';

const LoadingIndicator = () => (
  <div className="bg-primary-light/20 rounded-full p-2">
    <Loader2 className="animate-spin" size={18} />
  </div>
);

export const invoiceColumn = (
  handleDownload,
  handleView,
  handleEmail,
  loadingStates = {}
) => [
  {
    maxSize: 200,
    header: 'Restaurant Name',
    accessorFn: (row) => (
      <div className="capitalize">{row?.restaurantName}</div>
    ),
  },
  {
    maxSize: 200,
    accessorKey: 'invoiceNumber',
    header: 'Invoice Number',
  },
  {
    maxSize: 100,
    header: 'Status',
    accessorFn: (row) => {
      // Determine status variant based on invoice status
      const statusVariant =
        row?.status === 'DRAFT'
          ? 'info'
          : row?.status === 'COMPLETED'
            ? 'success'
            : 'error';

      return <Chip text={row?.status} variant={statusVariant} />;
    },
  },
  {
    maxSize: 200,
    accessorKey: 'orderNumber',
    header: 'Order Number',
  },
  {
    maxSize: 200,
    header: 'Total Amount',
    accessorFn: (row) => (
      <div>
        {row?.totalAmount.includes('$')
          ? row?.totalAmount
          : `$${row?.totalAmount}`}
      </div>
    ),
  },
  {
    maxSize: 100,
    header: 'Action',
    Cell: ({ row }) => {
      const rowData = row.original;
      const isViewLoading = loadingStates?.view === rowData?.orderId;
      const isDownloadLoading = loadingStates?.download === rowData?.orderId;
      const isEmailLoading = loadingStates?.email === rowData?.orderId;

      const ActionButton = ({
        isLoading,
        handler,
        icon,
        loadingTitle,
        defaultTitle,
      }) => (
        <div
          className={`relative inline-block ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} group`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoading) {
              handler(rowData);
            }
          }}
          title={isLoading ? loadingTitle : defaultTitle}
        >
          {isLoading ? <LoadingIndicator /> : icon}
          <div className="absolute -inset-2 p-3 rounded-full bg-transparent group-hover:bg-primary-light/20 transition-colors duration-200" />
        </div>
      );

      return (
        <div className="flex gap-4 items-center">
          {/* View Button */}
          <ActionButton
            isLoading={isViewLoading}
            handler={handleView}
            icon={<Eye size={18} />}
            loadingTitle="Loading..."
            defaultTitle="View Invoice"
          />

          {/* Download Button */}
          <ActionButton
            isLoading={isDownloadLoading}
            handler={handleDownload}
            icon={<Download size={18} />}
            loadingTitle="Downloading..."
            defaultTitle="Download Invoice"
          />

          {/* Email Button */}
          <ActionButton
            isLoading={isEmailLoading}
            handler={handleEmail}
            icon={<Mail size={18} />}
            loadingTitle="Sending..."
            defaultTitle="Email Invoice"
          />
        </div>
      );
    },
  },
];
