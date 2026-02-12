import React, { useCallback, useEffect, useRef, useState } from 'react';
import Table from '../../components/Table';
import { orderColumn } from './OrderColumn';
import PageHeader from '../../components/Heading';
import OrderDetail from './OrderDetail';
import {
  getAllOrders,
  getOrderById,
  orderAction,
  updateOrderStatus,
} from '../../services/order.services';
import { getSupplierId, setLocalStorageItem } from '../../utils/share';
import { toast } from 'react-toastify';
import { me } from '../../services/auth.services';
import { debounce } from '../../utils/common';
import { getStripeOnboardingStatus } from '../../services/stripe.services';
import StripeOnboardingModal from '../../components/StripeOnboardingModal';

const OrderList = () => {
  const [supplierId, setSupplierId] = useState(getSupplierId());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef(null);
  const [showStripeModal, setShowStripeModal] = useState(false);


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

  // Fetch user data if supplier ID is not available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!supplierId) {
        setIsLoadingSupplier(true);
        try {
          const response = await me();
          if (response?.data?.data) {
            // Save user data to localStorage
            setLocalStorageItem('user', response.data.data);
            // Update supplier ID
            const newSupplierId = response.data.data?.supplier?.id;
            setSupplierId(newSupplierId);
          }
        } catch (error) {
          toast.error(
            `Failed to load user data: ${error?.response?.data?.message || 'Please try logging in again.'}`
          );
          // Custom error message with details from the error response
        } finally {
          setIsLoadingSupplier(false);
        }
      }
    };

    fetchUserData();
  }, []);

  // Check Stripe onboarding status when supplier ID is available
  useEffect(() => {
    const checkStripeOnboardingStatus = async () => {
      if (supplierId) {
        try {
          const response = await getStripeOnboardingStatus(supplierId);
          const { onboardingComplete } = response?.data || {};
          
          // Show the modal if onboarding is not complete and action is required
          if (!onboardingComplete) {
            setShowStripeModal(true);
          }
        } catch (error) {
          console.error('Failed to check Stripe onboarding status:', error);
          // Don't show error toast as this is a background check
        }
      }
    };

    checkStripeOnboardingStatus();
  }, [supplierId]);

  // Check for order ID in localStorage (for notification redirects)
  useEffect(() => {
    const checkForOrderRedirect = async () => {
      const openOrderId = localStorage.getItem('openOrderId');
      
      if (openOrderId && supplierId) {
        // Remove the order ID from localStorage to prevent reopening on page refresh
        localStorage.removeItem('openOrderId');
        
        // Fetch and open the order details
        setIsDrawerOpen(true);
        setIsOrderLoading(true);
        setSelectedOrder(null); // Reset selected order while loading
        
        try {
          const response = await getOrderById(supplierId, openOrderId);
          setSelectedOrder(response?.data?.data);
        } catch (error) {
          toast.error(
            error?.response?.data?.message || 'Failed to fetch order details'
          );
        } finally {
          setIsOrderLoading(false);
        }
      }
    };
    
    checkForOrderRedirect();
  }, [supplierId]);

  const getData = useCallback(
    async (params) => {
      if (!supplierId) {
        return { data: [], rowCount: 0 };
      }

      try {
        // Add search term to params
        const searchParams = {
          ...params,
          globalFilter: searchTerm || params.globalFilter
        };

        const resp = await getAllOrders(supplierId, searchParams);

        return {
          data: resp?.data?.data?.items || [],
          rowCount: resp?.data?.data?.total || 0,
        };
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch orders');
        return { data: [], rowCount: 0 };
      }
    },
    [supplierId, searchTerm]
  );

  const handleRowClick = async (row) => {
    if (!supplierId) {
      toast.error(
        'Supplier information not available. Please refresh the page.'
      );
      return;
    }

    setIsDrawerOpen(true);
    setIsOrderLoading(true);
    setSelectedOrder(null); // Reset selected order while loading
    try {
      const response = await getOrderById(supplierId, row?.id);
      setSelectedOrder(response?.data?.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to fetch order details'
      );
    } finally {
      setIsOrderLoading(false);
    }
  };
  const handleOrderAction = async (orderId, action, additionalData) => {
    if (!supplierId) {
      toast.error(
        'Supplier information not available. Please refresh the page.'
      );
      return;
    }

    try {
      // Handle DISPATCHED action separately
      if (action === 'DISPATCHED') {
        await updateOrderStatus(supplierId, orderId, 'DISPATCHED');
      } else {
        // For other actions (ACCEPT, REJECT), use the existing orderAction API
        const data = {
          action,
          ...(action === 'REJECT' && { reason: additionalData }),
        };
        await orderAction(supplierId, orderId, data);
      }

      // Show success message with context
      if (action === 'REJECT') {
        toast.success('Order rejected successfully');
      } else {
        toast.success(`Order ${action.toLowerCase()}ed successfully`);
      }
      tableRef.current?.reFetchData();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to process order action'
      );
    } finally {
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Orders" 
        searchPlaceholder="Search orders..."
        onSearch={handleSearch}
        showSearch={true}
      />
      {isLoadingSupplier ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading supplier information...</p>
        </div>
      ) : !supplierId ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <p>Supplier information not available.</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      ) : (
        <Table
          columns={orderColumn}
          getData={getData}
          onRowClick={handleRowClick}
          ref={tableRef}
        />
      )}

      {/* Order Details Drawer */}
      <OrderDetail
        selectedOrder={selectedOrder}
        open={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onOrderAction={(action, additionalData) =>
          handleOrderAction(selectedOrder?.id, action, additionalData)
        }
        isLoading={isOrderLoading}
      />

      {/* Stripe Onboarding Modal */}
      <StripeOnboardingModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        supplierId={supplierId}
      />
    </>
  );
};

export default OrderList;
