import React, { useState, useEffect } from 'react';
import Drawer from '../../components/Drawer';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import PropTypes from 'prop-types';
import Loader from '../../components/loader/Loader';
import { m, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createOrGetConversation } from '../../services/chat.services';
import WarningAmber from '@mui/icons-material/WarningAmber';
import DisputeDetail from './DisputeDetail';

const OrderDetail = ({
  selectedOrder,
  open,
  setIsDrawerOpen,
  onOrderAction,
  isLoading,
}) => {
  const [showRejectField, setShowRejectField] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cachedOrder, setCachedOrder] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showDisputeDrawer, setShowDisputeDrawer] = useState(false);
  const navigate = useNavigate();

  // Cache the order data to prevent UI flicker
  useEffect(() => {
    if (selectedOrder) {
      setCachedOrder(selectedOrder);
    }
  }, [selectedOrder]);

  const handleReject = () => {
    onOrderAction('REJECT', rejectReason);
    setRejectReason('');
    setShowRejectField(false);
  };

  const handleStartChat = async (userId) => {
    if (!userId) {
      // Instead of console.error, we'll handle this gracefully
      setIsChatLoading(false);
      return;
    }

    try {
      setIsChatLoading(true);
      // Create or get an existing conversation with this restaurant user
      // Pass restaurant name and image to the function
      const conversation = await createOrGetConversation(
        userId,
        selectedOrder?.restaurantInfo?.branchName || '',
        selectedOrder?.restaurantInfo?.profileImage || ''
      );
      
      // Navigate to the chat page
      navigate('/profile/chat', { state: { selectedConversationId: conversation.id } });
    } catch {
      // Silently handle error without console.error
      // In a production app, you might want to use a toast notification here
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDispatch = async () => {
    try {
      setIsDispatching(true);
      // Call the parent component's onOrderAction with 'DISPATCHED'
      onOrderAction('DISPATCHED');
    } catch {
      // Error is handled by the parent component through the catch block
    } finally {
      setIsDispatching(false);
    }
  };

  const handleViewDispute = () => {
    setShowDisputeDrawer(true);
  };

  return (
    <Drawer
      isOpen={open}
      onClose={() => setIsDrawerOpen(false)}
      title={
        isLoading ? (
          'Loading order details...'
        ) : (
          <div className="flex items-center gap-4">
            <div className="capitalize">
              {selectedOrder?.restaurantInfo?.branchName}
            </div>
            <div className="text-sm font-normal mt-1 text-text-secondary">
              #{selectedOrder?.orderNumber}
            </div>
            <div>
              <Chip
                text={selectedOrder?.status}
                variant={
                  selectedOrder?.status === 'PENDING'
                    ? 'info'
                    : selectedOrder?.status === 'CANCELLED'
                      ? 'warning'
                      : selectedOrder?.status === 'ACCEPTED' ||
                          selectedOrder?.status === 'COMPLETED' ||
                          selectedOrder?.status === 'DELIVERED' ||
                          selectedOrder?.status === 'DISPATCHED'
                        ? 'success'
                        : 'error'
                }
              />
            </div>
          </div>
        )
      }
      footerContent={
        !isLoading && (
          <div className="flex flex-col w-full gap-4">
            {showRejectField && (
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Please provide a reason for rejecting this order..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}
            <div className="flex gap-4 justify-end">
              {selectedOrder?.hasDispute && selectedOrder?.disputeIds?.length > 0 && (
                <Button
                  variant="warning"
                  onClick={handleViewDispute}
                  className="flex items-center justify-center gap-2"
                >
                  <WarningAmber />
                  View Dispute
                </Button>
              )}
              <Button 
                variant="secondary" 
                onClick={() => handleStartChat(selectedOrder?.restaurantInfo?.userId)}
                disabled={isChatLoading}
              >
                {isChatLoading ? 'Loading...' : 'Message'}
              </Button>
              {selectedOrder?.status === 'PENDING' && (
                <>
                  {!showRejectField ? (
                    <Button
                      variant="secondary"
                      onClick={() => setShowRejectField(true)}
                    >
                      Reject
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowRejectField(false);
                          setRejectReason('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleReject}
                        disabled={!rejectReason.trim()}
                      >
                        Confirm Reject
                      </Button>
                    </>
                  )}
                  {!showRejectField && (
                    <Button
                      variant="primary"
                      onClick={() => onOrderAction('ACCEPT')}
                    >
                      Accept
                    </Button>
                  )}
                </>
              )}
              {selectedOrder?.status === 'ACCEPTED' && (
                <Button
                  variant="primary"
                  onClick={handleDispatch}
                  disabled={isDispatching}
                >
                  {isDispatching ? 'Processing...' : 'Mark as Dispatched'}
                </Button>
              )}
            </div>
          </div>
        )
      }
    >
      <div className="p-4 flex flex-col gap-6 min-h-[60vh] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <m.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <Loader className="!min-h-[75vh]" />
            </m.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isLoading && (
            <m.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1"
            >
              {cachedOrder ? (
                <m.table
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="w-full"
                >
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-text-primary font-semibold py-3">
                        Product name
                      </th>
                      <th className="text-left text-text-primary font-semibold py-3">
                        Qty
                      </th>
                      <th className="text-left text-text-primary font-semibold py-3">
                        Price
                      </th>
                      <th className="text-left text-text-primary font-semibold py-3">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.items?.map((item, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-3 text-text-primary font-normal">
                          <div className="flex items-center gap-2">
                            {item?.productName}
                            {item?.hasDispute && (
                              <div className="text-amber-500" title={`Dispute Status: ${item?.disputeStatus || 'Pending'}`}>
                                <WarningAmber sx={{ fontSize: 16 }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-text-primary font-normal">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-text-primary font-semibold">
                          ${item.unitPrice}
                        </td>
                        <td className="py-3 text-text-primary font-normal">
                          <span
                            className={`flex items-center ${
                              item?.inventoryStatus?.availableQuantity === 0
                                ? 'text-error'
                                : 'text-primary-light'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                item?.inventoryStatus?.availableQuantity === 0
                                  ? 'bg-error'
                                  : 'bg-primary-light'
                              }`}
                            />
                            {item?.inventoryStatus?.availableQuantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </m.table>
              ) : (
                <m.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-center py-10 h-full flex items-center justify-center"
                >
                  <p className="text-gray-500">No order details available</p>
                </m.div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
      {/* Dispute Detail Drawer */}
      <DisputeDetail
        disputeId={selectedOrder?.disputeIds?.join(',')}
        open={showDisputeDrawer}
        onClose={() => setShowDisputeDrawer(false)}
        isLoading={isLoading}
      />
    </Drawer>
  );
};

OrderDetail.propTypes = {
  selectedOrder: PropTypes.object,
  open: PropTypes.bool,
  setIsDrawerOpen: PropTypes.func,
  onOrderAction: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default OrderDetail;
