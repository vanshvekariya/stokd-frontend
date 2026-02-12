import { formatDate } from '../../utils/share';

export const userColumns = [
  {
    header: 'Name',
    accessorFn: (row) => (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          {row.profileImage ? (
            <img
              className="h-10 w-10 rounded-full"
              src={row.profileImage}
              alt={row.name}
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {row.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="font-medium text-gray-900">{row.name || 'N/A'}</div>
      </div>
    ),
    enableSorting: false,
  },
  {
    header: 'Email',
    accessorFn: (row) => row.email || 'N/A',
    enableSorting: true,
  },

  {
    header: 'Role',
    accessorFn: (row) => {
      if (!row.userRoles || row.userRoles.length === 0) return 'N/A';

      // Get all unique role names
      const roles = [
        ...new Set(
          row.userRoles.map((ur) => {
            if (!ur.role) return null;
            // Format role name: SUPPLIER_OWNER -> Supplier Owner
            return ur.role.name
              .split('_')
              .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
              .join(' ');
          })
        ),
      ].filter(Boolean);

      return roles.length > 0 ? roles.join(', ') : 'N/A';
    },
    enableSorting: true,
    id: 'role',
  },

  {
    header: 'Business',
    accessorFn: (row) => {
      // Check for supplier business name first
      if (row.suppliers && row.suppliers.length > 0) {
        return row.suppliers[0]?.businessName || 'N/A';
      }
      // Then check for restaurant business name
      if (row.restaurants && row.restaurants.length > 0) {
        return row.restaurants[0]?.businessName || 'N/A';
      }
      return 'N/A';
    },
    enableSorting: true,
    id: 'business',
  },

  {
    header: 'Last Login',
    accessorFn: (row) =>
      row.lastLoginAt ? formatDate(row.lastLoginAt) : 'N/A',
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
  },
];
