import Chip from '../../components/Chip';
import Button from '../../components/Button';

export const RestaurantCoulmn = (handleVerify, handlePaymentTermsChange, paymentTermsOptions) => [
  //   {
  //     maxSize: 100,
  //     accessorFn: (row) => (
  //       <div className="w-10 h-10 bg-nav-bg border border-border rounded-full overflow-hidden">
  //         {row?.variants[0]?.images[0] || row?.image ? (
  //           <ImageLoader
  //             src={row?.variants[0]?.images[0] || row?.image}
  //             alt={row?.name || 'Product'}
  //             containerClassName="w-full h-full"
  //             imageClassName="rounded-full bg-nav-bg"
  //           />
  //         ) : (
  //           <div className="w-full h-full"></div>
  //         )}
  //       </div>
  //     ),
  //     header: 'Image',
  //   },
  {
    maxSize: 200,
    accessorKey: 'name',
    header: 'Name',
  },
  {
    maxSize: 200,
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    maxSize: 150,
    header: 'Verification for Credit Terms',
    accessorFn: (row) => (
      <Chip
        text={row?.supplierVerifiedRestaurant ? 'Verified' : 'Not Verified'}
        variant={row?.supplierVerifiedRestaurant ? 'success' : 'error'}
      />
    ),
  },
  {
    maxSize: 200,
    header: 'Payment Terms',
    accessorFn: (row) => {
      const currentTerm = row?.paymentTerms || '';
      
      return (
        <div className="flex items-center gap-2">
          {row?.supplierVerifiedRestaurant ? (
            <select
              className="border border-border rounded px-2 py-1 text-sm"
              value={currentTerm}
              onChange={(e) => handlePaymentTermsChange(row, e.target.value)}
            >
              {paymentTermsOptions?.map((term) => (
                <option key={term.type} value={term.type}>
                  {term.description}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-gray-500 italic">Not available</span>
          )}
        </div>
      );
    },
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
            handleVerify(row);
          }}
        >
          <Button
            variant={row?.supplierVerifiedRestaurant ? 'error' : 'primary'}
            size="sm"
          >
            {row?.supplierVerifiedRestaurant
              ? 'Unverify Restaurant'
              : 'Verify Restaurant'}
          </Button>
        </div>
      </div>
    ),
  },
];
