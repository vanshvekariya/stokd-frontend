import React, { useCallback, useRef, useState, useEffect } from 'react';
import Table from '../../components/Table';
import PageHeader from '../../components/Heading';
import { RestaurantCoulmn } from './RestaurantCoulmn';
import { toast } from 'react-toastify';
import { getSupplierId } from '../../utils/share';
import {
  getRestaurants,
  verifyRestaurant,
} from '../../services/restaurant.services';
import { getPaymentTerms } from '../../services/payment.services';
import Modal from '../../components/Modal';

const VerifyRestaurantList = () => {
  const supplierId = getSupplierId();
  const tableRef = useRef();
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState('');

  useEffect(() => {
    // Fetch payment terms when component mounts
    const fetchPaymentTerms = async () => {
      try {
        const response = await getPaymentTerms();
        if (response?.data?.data?.paymentTerms) {
          setPaymentTermsOptions(response.data.data.paymentTerms);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch payment terms');
      }
    };

    fetchPaymentTerms();
  }, []);

  const getData = useCallback(
    async (params) => {
      try {
        let filterObj = {};

        if (params.filterString) {
          try {
            const filterParam = params.filterString.replace('filter=', '');
            filterObj = JSON.parse(filterParam);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error parsing filters:', e);
          }
        }

        // Prepare pagination parameters
        const page = params.pagination?.pageIndex || 0;
        const limit = params.pagination?.pageSize || 10;

        // Rebuild the filter string
        const queryParams = {
          ...params,
          page,
          limit,
          filterString: `filter=${JSON.stringify(filterObj)}`,
        };

        // Make the API call
        const resp = await getRestaurants(supplierId, queryParams);

        return {
          data: resp?.data?.data?.items || [],
          rowCount: resp?.data?.data?.total || 0,
        };
      } catch (error) {
        toast.error(error?.response?.data?.message);
        return { data: [], rowCount: 0 };
      }
    },
    [supplierId]
  );
  const handlePaymentTermsChange = (row, termValue) => {
    try {
      verifyRestaurant(supplierId, row?.id, {
        verified: true,
        paymentTerms: termValue
      }).then(() => {
        tableRef.current?.reFetchData();
        toast.success('Payment terms updated successfully');
      }).catch((error) => {
        toast.error(error?.response?.data?.message || 'Failed to update payment terms');
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update payment terms');
    }
  };

  const handleVerifyClick = (row) => {
    if (row?.supplierVerifiedRestaurant) {
      // If already verified, just unverify
      handleVerify(row, null, false);
    } else {
      // If not verified, show modal to select payment terms
      setSelectedRestaurant(row);
      setSelectedPaymentTerm(row?.paymentTerms || (paymentTermsOptions[0]?.type || ''));
      setShowVerifyModal(true);
    }
  };

  const handleVerify = async (row, paymentTerm, verified = true) => {
    try {
      const data = {
        verified: verified
      };
      
      if (verified && paymentTerm) {
        data.paymentTerms = paymentTerm;
      }

      await verifyRestaurant(supplierId, row?.id, data);
      tableRef.current?.reFetchData();
      toast.success('Restaurant verification status updated successfully');
      setShowVerifyModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update verification status');
    }
  };

  const confirmVerify = () => {
    if (selectedRestaurant && selectedPaymentTerm) {
      handleVerify(selectedRestaurant, selectedPaymentTerm);
    }
  };
  // Memoize the columns array to prevent recreation on each render
  const columns = React.useMemo(
    () => RestaurantCoulmn(handleVerifyClick, handlePaymentTermsChange, paymentTermsOptions),
    [handleVerifyClick, handlePaymentTermsChange, paymentTermsOptions]
  );

  return (
    <>
      <PageHeader title="Restaurants" />
      <Table columns={columns} getData={getData} ref={tableRef} />

      {showVerifyModal && (
        <Modal
          title="Verify Restaurant"
          leftButtonTitle="Cancel"
          rightButtonTitle="Verify"
          leftButtonFunctionCall={() => setShowVerifyModal(false)}
          rightButtonFunctionCall={confirmVerify}
          modalBodyFunction={() => (
            <div className="p-4">
              <p className="mb-4">Please select payment terms for this restaurant:</p>
              <select
                className="w-full border border-border rounded px-3 py-2"
                value={selectedPaymentTerm}
                onChange={(e) => setSelectedPaymentTerm(e.target.value)}
              >
                {paymentTermsOptions.map((term) => (
                  <option key={term.type} value={term.type}>
                    {term.description}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
      )}
    </>
  );
};

export default VerifyRestaurantList;
