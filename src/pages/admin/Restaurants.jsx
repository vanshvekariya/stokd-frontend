import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { debounce } from '../../utils/common';

// Components
import PageHeader from '../../components/Heading';
import Table from '../../components/Table';
import Select from '../../components/Select';
import RestaurantDetail from './RestaurantDetail';

// Services
import {
  getAllRestaurants,
  getRestaurantById,
} from '../../services/admin.services';

// Columns
import { restaurantColumns } from './RestaurantColumns';

const statusOptions = [
  { id: 'ACTIVE', name: 'Active' },
  { id: 'INACTIVE', name: 'Inactive' },
];

const Restaurants = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: null,
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getData = useCallback(
    async (tableParams) => {
      try {
        setLoading(true);
        const filterObj = {};

        // Handle status filter
        if (filters.status) {
          filterObj.status = filters.status;
        }

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

        const response = await getAllRestaurants(queryParams);
        return {
          data: response.data.data?.items || [],
          rowCount: response.data.data?.total || 0,
        };
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast.error(
          error?.response?.data?.message ||
            'Failed to fetch restaurants. Please try again.'
        );
        return { data: [], rowCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filters.status]
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
      if (tableRef.current) {
        tableRef.current.resetPage();
        tableRef.current.reFetchData();
      }
    }, 500),
    []
  );
  // Dropdown change handler
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value?.id || null }));
    tableRef.current?.resetPage(false);
    tableRef.current?.reFetchData();
  };

  // Handle search input change with debounce
  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const handleRowClick = async (row) => {
    setIsDrawerOpen(true);
    setLoading(true);
    setSelectedRestaurant(null);
    try {
      const response = await getRestaurantById(row.id);
      setSelectedRestaurant(response?.data?.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to fetch restaurant details'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Management"
        searchPlaceholder="Search restaurants..."
        showSearch={true}
        onSearch={handleSearch}
        extraComponent={
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
        }
      />

      <div className="bg-white rounded-lg shadow">
        <Table
          ref={tableRef}
          columns={restaurantColumns}
          getData={getData}
          onRowClick={handleRowClick}
        />
      </div>

      <RestaurantDetail
        selectedRestaurant={selectedRestaurant}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoading={loading}
      />
    </div>
  );
};

export default Restaurants;
