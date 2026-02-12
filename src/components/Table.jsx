import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { MaterialReactTable } from 'material-react-table';
import { toast } from 'react-toastify';
import { m, AnimatePresence } from 'framer-motion';

const Table = forwardRef(
  (
    {
      getData,
      columns,
      enableRowSelection = false,
      debounceTimeout = 700,
      onRowClick,
    },
    ref
  ) => {
    const tableRef = useRef();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    });
    const [debouncedColumnFilters, setDebouncedColumnFilters] = useState([]);
    // Track if component is mounted to prevent state updates after unmount
    const isMounted = useRef(true);

    // Setup debounced filter function only once
    const debouncedFilterRef = useRef(null);
    useEffect(() => {
      debouncedFilterRef.current = debounce((filters) => {
        if (isMounted.current) {
          setDebouncedColumnFilters(filters);
        }
      }, debounceTimeout);

      return () => {
        // Clean up on unmount
        isMounted.current = false;
        if (debouncedFilterRef.current) {
          debouncedFilterRef.current.cancel();
        }
      };
    }, [debounceTimeout]);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      reFetchData() {
        setIsLoading(true);
        setIsRefetching(true);
        fetchData();
        if (tableRef.current) {
          tableRef.current.resetRowSelection();
        }
      },
      resetPage(checkPage) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: !checkPage
            ? 0
            : data.length === 1 && prev.pageIndex > 0
              ? prev.pageIndex - 1
              : prev.pageIndex,
        }));
      },
      pagination: pagination,
    }));

    // Handle column filter changes
    const handleColumnFiltersChange = useCallback((filters) => {
      setColumnFilters(filters);
      if (debouncedFilterRef.current) {
        debouncedFilterRef.current(filters);
      }
    }, []);

    // Core data fetching function
    const fetchData = useCallback(async () => {
      if (!getData) return;

      // Only set loading on initial load, use refetching flag for updates
      if (data.length === 0) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const filterObject = debouncedColumnFilters.reduce((acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        }, {});

        const filterString = `filter=${JSON.stringify(filterObject)}`;

        const sortingArray = sorting.map(
          (sort) => `"${sort.id}","${sort.desc ? 'DESC' : 'ASC'}"`
        );
        const sortingString = sortingArray.length
          ? `sort=[${sortingArray.join(',')}]`
          : '';

        const response = await getData({
          pagination,
          filterString,
          globalFilter,
          sortingString,
        });

        if (isMounted.current) {
          setData(response?.data || []);
          setRowCount(response?.rowCount || 0);
        }
      } catch (error) {
        if (isMounted.current) {
          toast.error(error);
          setData([]);
          setRowCount(0);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    }, [
      getData,
      pagination,
      debouncedColumnFilters,
      globalFilter,
      sorting,
      data?.length,
    ]);

    // Trigger fetchData when relevant dependencies change
    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const processedColumns = columns.map((column) => ({
      ...column,
      muiTableHeadCellProps: {
        sx: {
          fontSize: '16px',
          fontWeight: 500,
          color: '#475467',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #EAECF0',
          padding: '12px 24px',
        },
      },
      muiTableBodyCellProps: {
        sx: {
          fontSize: '16px',
          color: '#475467',
          borderBottom: '1px solid #EAECF0',
          padding: '16px 24px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
        },
      },
    }));

    const tableProps = {
      tableInstanceRef: tableRef,
      columns: processedColumns,
      data,
      enableTopToolbar: false,
      enableColumnFilters: false,
      enableGlobalFilter: false,
      enableColumnActions: false,
      enableRowSelection,
      enableSorting: false,
      manualPagination: true,
      enablePagination: true,
      manualFiltering: true,
      manualSorting: true,
      rowCount: rowCount,
      onColumnFiltersChange: handleColumnFiltersChange,
      onGlobalFilterChange: setGlobalFilter,
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      state: {
        isLoading,
        showProgressBars: isRefetching,
        pagination,
        sorting,
        columnFilters,
        globalFilter,
      },
      muiTablePaperProps: {
        elevation: 0,
        sx: {
          boxShadow: 'none',
          border: '1px solid #EAECF0',
          borderRadius: '12px',
        },
      },

      muiTableProps: {
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          '&:hover': {
            borderRadius: '0px',
          },
        },
      },
      muiTableBodyRowProps: ({ row }) => ({
        sx: {
          borderBottom: '1px solid #EAECF0',
          '&:hover': {
            backgroundColor: '#F9FAFB',
            borderRadius: '0px',
            cursor: onRowClick ? 'pointer' : 'default',
          },
        },
        onClick: (event) => {
          if (
            !onRowClick ||
            Object.values(event.target)?.[1]
              ?.className?.split(' ')
              .includes('MuiBackdrop-root')
          ) {
            return;
          }
          onRowClick(row?.original);
        },
      }),
      muiTableHeadRowProps: {
        sx: {
          backgroundColor: '#F9FAFB',
        },
      },
      muiLinearProgressProps: {
        sx: {
          backgroundColor: '#4ADE80',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#15803D',
          },
        },
      },
    };

    const NoDataComponent = () => (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#475467',
          gap: '0.5rem',
        }}
      >
        <m.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          📋
        </m.div>
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}
        >
          No data available
        </m.p>
      </m.div>
    );

    const LoadingComponent = () => (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '0.5rem',
        }}
      >
        <m.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ fontSize: '24px' }}
        >
          ⚡
        </m.div>
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            margin: 0,
            fontSize: '16px',
            color: '#475467',
            fontWeight: 500,
          }}
        >
          Loading data...
        </m.p>
      </m.div>
    );

    return (
      <AnimatePresence mode="wait">
        <m.div
          key={isLoading ? 'loading' : 'table'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MaterialReactTable
            {...tableProps}
            renderEmptyRowsFallback={
              isLoading ? LoadingComponent : NoDataComponent
            }
          />
        </m.div>
      </AnimatePresence>
    );
  }
);

Table.displayName = 'Table';

Table.propTypes = {
  getData: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  initialPageSize: PropTypes.number,
  initialPageIndex: PropTypes.number,
  enableRowSelection: PropTypes.bool,
  debounceTimeout: PropTypes.number,
  onRowClick: PropTypes.func,
};

export default Table;
