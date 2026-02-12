import React, { useCallback, useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { debounce } from '../../utils/common';

// Components
import PageHeader from '../../components/Heading';
import Table from '../../components/Table';
import Select from '../../components/Select';
import UserDetail from './UserDetail';

// Services
import {
  getAllUsers,
  getAllRoles,
  getUserById,
} from '../../services/admin.services';

// Columns
import { userColumns } from './UserColumns';

const statusOptions = [
  { id: 'ACTIVE', name: 'Active' },
  { id: 'INACTIVE', name: 'Inactive' },
];

const defaultRoles = [
  // { id: null, name: 'All Users' },
  // { id: -1, name: 'Incomplete Profiles' },
];

const Users = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: null, status: null });
  const [roles, setRoles] = useState(defaultRoles);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAllRoles();
        const apiRoles = response.data.data || [];

        const formatted = [
          // defaultRoles[0],
          ...apiRoles.map((role) => ({
            id: role.id,
            name: role.name
              .split('_')
              .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
              .join(' '),
          })),
          defaultRoles[1],
        ];

        setRoles(formatted);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            'Failed to fetch roles. Please try again.'
        );
        setRoles(defaultRoles);
      }
    };

    fetchRoles();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      tableRef.current?.resetPage(false);
      tableRef.current?.reFetchData();
    }, 500),
    []
  );

  // Fetch users with pagination, filtering, and sorting
  const getData = useCallback(
    async (tableParams) => {
      setLoading(true);

      try {
        // Build filter object
        const filterObj = {};

        // Apply role filter
        if (filters.role) {
          filterObj.role = filters.role;
        }

        // Apply status filter
        if (filters.status === 'ACTIVE' || filters.status === 'INACTIVE') {
          filterObj.status = filters.status;
        }

        // Prepare query parameters
        const queryParams = {
          pagination: {
            pageIndex: tableParams.pageIndex || 0,
            pageSize: tableParams.pageSize || 10,
          },
          globalFilter: searchTerm || '',
          filterString:
            Object.keys(filterObj).length > 0
              ? `filters=${JSON.stringify(filterObj)}`
              : '',
          sortingString: tableParams.sorting
            ? `sort=${tableParams.sorting.id}&order=${tableParams.sorting.desc ? 'desc' : 'asc'}`
            : '',
        };

        // Make API call
        const response = await getAllUsers(queryParams);

        return {
          data: response.data.data?.items || [],
          rowCount: response.data.data?.total || 0,
        };
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message ||
          'Failed to fetch users. Please try again.';
        toast.error(errorMessage);
        console.error('Error fetching users:', error);
        return { data: [], rowCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [filters, searchTerm] // Re-run when filters or search term changes
  );

  // Dropdown change handler
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value?.id || null }));
    tableRef.current?.resetPage(false);
    tableRef.current?.reFetchData();
  };


  const handleRowClick = async (row) => {
    setIsDrawerOpen(true);
    setIsUserLoading(true);
    setSelectedUser(null); // Reset selected user while loading
    try {
      const response = await getUserById(row?.id);
      setSelectedUser(response?.data?.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to fetch user details'
      );
    } finally {
      setIsUserLoading(false);
    }
  };

    return (
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          searchPlaceholder="Search users..."
          showSearch
          onSearch={debouncedSearch}
          extraComponent={
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Select
                size="sm"
                name="role"
                placeholder={loading ? 'Loading roles...' : 'Select Role'}
                options={roles}
                onChange={(value) => handleFilterChange('role', value)}
                value={
                  filters.role === null
                    ? null
                    : roles.find((r) => r.id === filters.role) || null
                }
                className="w-full sm:w-48"
                disabled={loading}
                isClearable
              />
              <Select
                size="sm"
                name="status"
                placeholder="Select Status"
                options={statusOptions}
                onChange={(value) => handleFilterChange('status', value)}
                value={
                  filters.status === null
                    ? null
                    : statusOptions.find((s) => s.id === filters.status) || null
                }
                className="w-full sm:w-40"
                isClearable
              />
            </div>
          }
        />
        <div className="bg-white rounded-lg shadow">
          <Table
            ref={tableRef}
            columns={userColumns}
            getData={getData}
            onRowClick={handleRowClick}
          />
        </div>

        {/* User Detail Drawer */}
        <UserDetail
          selectedUser={selectedUser}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          isLoading={isUserLoading}
        />
      </div>
    );
};

export default Users;
