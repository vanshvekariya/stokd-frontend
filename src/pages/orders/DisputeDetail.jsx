import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Drawer from '../../components/Drawer';
import PropTypes from 'prop-types';
import Loader from '../../components/loader/Loader';
import { m, AnimatePresence } from 'framer-motion';
import { getDisputesByIds, updateDisputeStatus } from '../../services/dispute.services';
import { getSupplierId } from '../../utils/share';
import { toast } from 'react-toastify';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Chip from '../../components/Chip';

const DisputeDetail = ({ disputeId, open, onClose, isLoading: parentLoading }) => {
  const [actionForms, setActionForms] = useState({});
  const [supplierResponses, setSupplierResponses] = useState({});
  const [refundAmounts, setRefundAmounts] = useState({});
  const [isActionLoading, setIsActionLoading] = useState({});
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const supplierId = getSupplierId();

  useEffect(() => {
    if (!disputeId || !supplierId || !open) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get all disputes for this order
        const disputeIds = disputeId.split(',');
        const disputeResponse = await getDisputesByIds(supplierId, disputeIds.join(','));
        const disputeData = disputeResponse?.data?.data || [];
        
        // Sort disputes by ID to maintain consistent order
        disputeData.sort((a, b) => a.id.localeCompare(b.id));
        setDisputes(disputeData);


      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch dispute details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [disputeId, supplierId, open]);

  const handleDisputeAction = async (disputeId, actionType) => {
    if (!disputeId || !supplierId || !supplierResponses[disputeId]) return;
    
    if (actionType === 'ACCEPT' && (!refundAmounts[disputeId] || parseFloat(refundAmounts[disputeId]) <= 0)) {
      toast.error('Please enter a valid refund amount');
      return;
    }
    
    setIsActionLoading(prev => ({ ...prev, [disputeId]: true }));
    try {
      const refundAmountsPayload = {};
      refundAmountsPayload[disputeId] = parseFloat(refundAmounts[disputeId] || 0);

      await updateDisputeStatus(supplierId, disputeId, {
        status: actionType === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
        supplierResponse: supplierResponses[disputeId],
        refundAmounts: actionType === 'ACCEPT' ? refundAmountsPayload : {}
      });
      toast.success(`Dispute ${actionType.toLowerCase()}ed successfully`);
      
      // Remove the processed dispute from state
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
      if (disputes.length === 1) {
        onClose(); // Close drawer if this was the last dispute
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${actionType.toLowerCase()} dispute`);
    } finally {
      setIsActionLoading(prev => ({ ...prev, [disputeId]: false }));
      setActionForms(prev => ({ ...prev, [disputeId]: false }));
      setSupplierResponses(prev => ({ ...prev, [disputeId]: '' }));
      setRefundAmounts(prev => ({ ...prev, [disputeId]: '' }));
    }
  };

  return (
    <Drawer
      isOpen={open}
      hideCloseIcon
      title={
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowBack />
          </button>
          <div>Dispute Details</div>
          {disputes[0]?.status && (
            <Chip
              text={disputes[0].status}
              variant={
                disputes[0].status === 'PENDING'
                  ? 'info'
                  : disputes[0].status === 'REJECTED'
                    ? 'error'
                    : 'success'
              }
            />
          )}
        </div>
      }
    >
      <div className="p-4 flex flex-col gap-6 relative">
        <AnimatePresence mode="wait">
          {(isLoading || parentLoading) ? (
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
          {!isLoading && !parentLoading && disputes.length > 0 && (
            <m.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1"
            >
              <div className="space-y-6">
                {disputes.map(dispute => (
                    <div key={dispute.id} className="mb-8">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Product</div>
                          <div className="font-medium">{dispute.productName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Issue Type</div>
                          <div className="font-medium capitalize">{dispute.issueType?.toLowerCase()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Quantity</div>
                          <div className="font-medium">{dispute.quantity}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Unit Price</div>
                          <div className="font-medium">${dispute.unitPrice}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Price</div>
                          <div className="font-medium">${dispute.totalPrice}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Refund Amount</div>
                          <div className="font-medium">${dispute.refundAmount || 0}</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-2">Issue Description</div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          {dispute.issueDescription || 'No description provided'}
                        </div>
                      </div>

                      {dispute.supplierResponse && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-500 mb-2">Your Response</div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            {dispute.supplierResponse}
                          </div>
                        </div>
                      )}

                      {dispute.issueImages?.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-500 mb-2">Issue Images</div>
                          <div className="grid grid-cols-2 gap-4">
                            {dispute.issueImages.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`Issue ${imgIndex + 1}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                      {/* Action buttons and forms below each dispute card */}
                      {dispute.status === 'PENDING' && (
                        <div className="mt-4">
                          {actionForms[dispute.id] ? (
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {actionForms[dispute.id] === 'ACCEPT' ? 'Approval Message' : 'Rejection Reason'}
                                </label>
                                <textarea
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder={actionForms[dispute.id] === 'ACCEPT' 
                                    ? 'Enter your response for approving this dispute...'
                                    : 'Enter your reason for rejecting this dispute...'
                                  }
                                  value={supplierResponses[dispute.id] || ''}
                                  onChange={(e) => setSupplierResponses(prev => ({
                                    ...prev,
                                    [dispute.id]: e.target.value
                                  }))}
                                />
                              </div>
                              {actionForms[dispute.id] === 'ACCEPT' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Refund Amount
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={dispute.totalPrice}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder={`Enter refund amount (max: $${dispute.totalPrice})`}
                                    value={refundAmounts[dispute.id] || ''}
                                    onChange={(e) => setRefundAmounts(prev => ({
                                      ...prev,
                                      [dispute.id]: e.target.value
                                    }))}
                                  />
                                </div>
                              )}
                              <div className="flex gap-4 justify-end">
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setActionForms(prev => ({ ...prev, [dispute.id]: null }));
                                    setSupplierResponses(prev => ({ ...prev, [dispute.id]: '' }));
                                    setRefundAmounts(prev => ({ ...prev, [dispute.id]: '' }));
                                  }}
                                  disabled={isActionLoading[dispute.id]}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => handleDisputeAction(dispute.id, actionForms[dispute.id])}
                                  disabled={
                                    isActionLoading[dispute.id] || 
                                    !supplierResponses[dispute.id]?.trim() || 
                                    (actionForms[dispute.id] === 'ACCEPT' && 
                                      (!refundAmounts[dispute.id] || parseFloat(refundAmounts[dispute.id]) <= 0))
                                  }
                                >
                                  {actionForms[dispute.id] === 'ACCEPT' ? 'Confirm Accept' : 'Confirm Reject'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 justify-end border-t border-gray-200 pt-4">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setActionForms(prev => ({ ...prev, [dispute.id]: 'REJECT' }));
                                }}
                                disabled={isActionLoading[dispute.id]}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="primary"
                                onClick={() => {
                                  setActionForms(prev => ({ ...prev, [dispute.id]: 'ACCEPT' }));
                                  setRefundAmounts(prev => ({ ...prev, [dispute.id]: dispute.totalPrice }));
                                }}
                                disabled={isActionLoading[dispute.id]}
                              >
                                Accept
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                ))}
              </div>

            </m.div>
          )}
        </AnimatePresence>
      </div>


    </Drawer>
  );
};

DisputeDetail.propTypes = {
  disputeId: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default DisputeDetail;
