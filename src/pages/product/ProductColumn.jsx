import { Copy, Pencil, Trash2 } from 'lucide-react';
import Chip from '../../components/Chip';
import ImageLoader from '../../components/ImageLoader';

export const productColumn = (handleEdit, handleCopy, handleDelete) => [
  {
    maxSize: 100,
    accessorFn: (row) => (
      <div className="w-10 h-10 bg-nav-bg border border-border rounded-full overflow-hidden">
        {row?.variants[0]?.images[0] || row?.image ? (
          <ImageLoader
            src={row?.variants[0]?.images[0] || row?.image}
            alt={row?.name || 'Product'}
            containerClassName="w-full h-full"
            imageClassName="rounded-full bg-nav-bg"
          />
        ) : (
          <div className="w-full h-full"></div>
        )}
      </div>
    ),
    header: 'Image',
  },
  {
    maxSize: 200,
    accessorKey: 'name',
    header: 'Name',
  },
  {
    maxSize: 150,
    accessorKey: 'category',
    header: 'Category',
    accessorFn: (row) => {
      // Check if category is an object or string
      const categoryText =
        typeof row.category === 'object'
          ? row.category.name // If it's an object, use the name property
          : row.category || 'category'; // Otherwise use the value directly or fallback

      return <Chip text={categoryText} />;
    },
  },
  {
    maxSize: 150,
    header: 'SKU',
    accessorFn: (row) => {
      return row?.variants[0]?.sku;
    },
  },
  {
    maxSize: 150,
    accessorFn: (row) => {
      return row?.variants[0]?.unit?.name;
    },
    header: 'Unit',
  },
  {
    maxSize: 150,
    accessorFn: (row) => {
      return row?.variants[0]?.baseUnit?.name;
    },
    header: 'Base Unit',
  },
  {
    maxSize: 100,
    accessorFn: (row) => {
      return row?.variants[0]?.formattedPrice;
    },
    header: 'Price',
  },
  {
    maxSize: 100,
    accessorFn: (row) => {
      return row?.variants[0]?.variantStockLevel;
    },
    header: 'Quantity',
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
            handleCopy(row);
          }}
        >
          <Copy color="#475569" size={18} />
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
