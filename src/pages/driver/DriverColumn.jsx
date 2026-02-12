import { Pencil, Trash2 } from 'lucide-react';
import Chip from '../../components/Chip';

export const driverColumn = (handleEdit, handleDelete) => [
  {
    accessorKey: 'driver',
    header: 'Driver',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    accessorFn: (row) => <Chip text={row?.status} />,
  },
  {
    accessorKey: 'truck',
    header: 'Truck',
  },
  {
    accessorKey: 'deliveryZone',
    header: 'Delivery Zone',
  },

  {
    maxSize: 100,
    header: 'Action',
    accessorFn: (row) => (
      <div className="flex gap-4 items-center">
        <div
          className="relative inline-block cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
        >
          <Pencil color="#475569" size={18} />
          <div className="absolute -inset-2 rounded-full p-3 bg-transparent group-hover:bg-primary-light/20 transition-colors duration-200" />
        </div>
        <div
          className="relative inline-block cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row);
          }}
        >
          <Trash2 color="#475569" size={18} />
          <div className="absolute -inset-2 p-3 rounded-full bg-transparent group-hover:bg-primary-light/20 transition-colors duration-200" />
        </div>
      </div>
    ),
  },
];
