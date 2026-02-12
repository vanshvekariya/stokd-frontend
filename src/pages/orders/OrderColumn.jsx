import Chip from '../../components/Chip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const orderColumn = [
  {
    header: 'Order Id',
    accessorFn: (row) => row?.orderNumber,
    enableSorting: false,
  },
  {
    maxSize: 350,
    accessorFn: (row) => (
      <div className="capitalize">{row?.restaurantName}</div>
    ),
    header: 'Restaurant',
  },
  {
    accessorFn: (row) => row?.itemCount,
    header: 'Items',
  },
  {
    header: 'Total',
    accessorFn: (row) => (
      <div>
        {row?.totalAmount.includes('$')
          ? row?.totalAmount
          : `$${row?.totalAmount}`}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    accessorFn: (row) => (
      <Chip
        text={row?.status}
        variant={
          row?.status === 'PENDING'
            ? 'info'
            : row?.status === 'CANCELLED'
              ? 'warning'
              : row?.status === 'ACCEPTED' ||
                  row?.status === 'COMPLETED' ||
                  row?.status === 'DELIVERED'
                ? 'success'
                : 'error'
        }
      />
    ),
  },
  {
    id: 'dispute',
    header: '',
    size: 50,
    accessorFn: (row) => (
      <div className="flex justify-center">
        {row?.hasDispute && (
          <div className="text-amber-500" title={`Dispute Status: ${row?.disputeStatus || 'Pending'}`}>
            <WarningAmberIcon sx={{ fontSize: 20 }} />
          </div>
        )}
      </div>
    ),
  },
];
