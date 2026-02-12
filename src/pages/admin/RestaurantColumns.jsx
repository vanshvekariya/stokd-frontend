import {
  countries,
  formatPhoneNumberWithCountryCode,
  formatDate,
} from '../../utils/share';

export const restaurantColumns = [
  {
    header: 'Restaurant',
    accessorFn: (row) => {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {row.logoImage ? (
              <img
                className="h-full w-full object-cover"
                src={row.logoImage}
                alt={row.businessName || 'Restaurant'}
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {row.businessName?.charAt(0)?.toUpperCase() || 'R'}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.businessName || 'N/A'}
            </div>
            {row.restaurantBranches?.length > 1 && (
              <div className="text-xs text-gray-500">
                {row.restaurantBranches.length} branches
              </div>
            )}
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
        {row.restaurantBranches?.[0]?.phone && (
          <div className="text-xs text-gray-500">
            Main:{' '}
            {formatPhoneNumberWithCountryCode(row.restaurantBranches[0].phone)}
          </div>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    header: 'Details',
    accessorFn: (row) => (
      <div className="text-sm text-gray-900 space-y-1">
        <div>
          <span className="text-gray-500">Country: </span>
          <span className="font-medium">
            {countries.find((c) => c.id === row.countryCode)?.name || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Branches: </span>
          <span className="font-medium">
            {row.restaurantBranches?.length || 0}
          </span>
        </div>
        {row.subscriptionEndDate && new Date(row.subscriptionEndDate) > new Date() && (
          <div>
            <span className="text-gray-500">Subscription: </span>
            <span className="font-medium text-green-600">
              Until {formatDate(row.subscriptionEndDate)}
            </span>
          </div>
        )}
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
