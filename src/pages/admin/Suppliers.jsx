import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { debounce } from '../../utils/common';

// Components
import PageHeader from '../../components/Heading';
import Table from '../../components/Table';
import Select from '../../components/Select';
import SupplierDetail from './SupplierDetail';

// Services
import {
  getAllSuppliers,
  getSupplierById,
} from '../../services/admin.services';

// Columns
import { supplierColumns } from './SupplierColumns';

const statusOptions = [
  { id: 'ACTIVE', name: 'Active' },
  { id: 'INACTIVE', name: 'Inactive' },
];

const Suppliers = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getData = useCallback(
    async (tableParams) => {
      try {
        setLoading(true);
        let filterObj = {};

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

        const response = await getAllSuppliers(queryParams);

        return {
          data: response.data.data?.items || [],
          rowCount: response.data.data?.total || 0,
        };
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast.error(
          error?.response?.data?.message ||
            'Failed to fetch suppliers. Please try again.'
        );
        return { data: [], rowCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filters]
  );

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value?.id || null,
    }));
    if (tableRef.current) {
      tableRef.current.resetPage();
      tableRef.current.reFetchData();
    }
  };

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

  // Handle search input change with debounce
  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  // Handle row click
  const handleRowClick = async (row) => {
    setIsDrawerOpen(true);
    setIsLoading(true);
    setSelectedSupplier(null);
    try {
      const response = await getSupplierById(row.id);
      setSelectedSupplier(response?.data?.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to fetch supplier details'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Management"
        searchPlaceholder="Search suppliers..."
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
          columns={supplierColumns}
          getData={getData}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>

      <SupplierDetail
        selectedSupplier={selectedSupplier}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Suppliers;