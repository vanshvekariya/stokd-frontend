import { countries, formatPhoneNumberWithCountryCode } from '../../utils/share';

export const supplierColumns = [
  {
    header: 'Supplier',
    accessorFn: (row) => {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {row.logoImage ? (
              <img
                className="h-full w-full object-cover"
                src={row.logoImage}
                alt={row.businessName || 'Supplier'}
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {row.businessName?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            )}
          </div>
          <div className="font-medium text-gray-900">
            {row.businessName || 'N/A'}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    header: 'Contact',
    accessorFn: (row) => (
      <div className="flex flex-col space-y-1">
        <div className="text-sm text-gray-900">
          {formatPhoneNumberWithCountryCode(row.businessPhone) || 'N/A'}
        </div>
        {row.supplierBranches?.[0]?.phone && (
          <div className="text-xs text-gray-500">
            Main:{' '}
            {formatPhoneNumberWithCountryCode(row.supplierBranches[0].phone)}
          </div>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    header: 'Country',
    accessorFn: (row) => (
      <div className="text-sm text-gray-900 space-y-1">
        <div>
          <span className="font-medium">
            {countries.find((c) => c.id === row.countryCode)?.name || 'N/A'}
          </span>
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    header: 'Status',
    accessorFn: (row) => {
      const status = row.status?.toLowerCase() || 'inactive';
      const statusText = status === 'active' ? 'Active' : 'Inactive';
      const isActive = status === 'active';

      return (
        <div className="flex flex-col space-y-1">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {statusText}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
];
