import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import { getSupplierId } from '../../utils/share';
import { getDeliveryInfo, updateDeliveryInfo } from '../../services/deliveryInfo.service';

const deliveryInfoSchema = Yup.object().shape({
  minOrderValue: Yup.number()
    .typeError('Must be a number')
    .min(0, 'Cannot be negative')
    .required('Min order value is required'),
  minDeliveryFee: Yup.number()
    .typeError('Must be a number')
    .min(0, 'Cannot be negative')
    .required('Minimum delivery fee is required'),
});

const DeliveryInformation = () => {
  const [loading, setLoading] = useState(true);
  const supplierId = getSupplierId();

  const formik = useFormik({
    initialValues: {
      minOrderValue: '',
      minDeliveryFee: '',
    },
    validationSchema: deliveryInfoSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          minimumOrderQuantity: Number(values.minOrderValue),
          deliveryFee: Number(values.minDeliveryFee)
        };
        
        await updateDeliveryInfo(supplierId, payload);
        toast.success('Delivery information updated successfully');
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Update failed');
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
  };

  useEffect(() => {
    const fetchDeliveryInfo = async () => {
      try {
        setLoading(true);
        const response = await getDeliveryInfo(supplierId);
        if (response && response.data) {
          formik.setValues({
            minOrderValue: response.data.minimumOrderQuantity || '',
            minDeliveryFee: response.data.deliveryFee || ''
          });
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch delivery information');
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      fetchDeliveryInfo();
    }
  }, [supplierId]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Delivery information</h2>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="minOrderValue"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Min order value
            </label>
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">AUD</span>
              </div>
            <input
              type="number"
              id="minOrderValue"
              name="minOrderValue"
              value={formik.values.minOrderValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="0"
              className={`w-full pl-12 pr-4 py-2 border ${formik.touched.minOrderValue && formik.errors.minOrderValue ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
            />
            {formik.touched.minOrderValue && formik.errors.minOrderValue && (
              <div className="text-error text-sm mt-1">
                {formik.errors.minOrderValue}
              </div>
            )}
            </div>
          </div>

          <div>
            <label
              htmlFor="minDeliveryFee"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Minimum delivery fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">AUD</span>
              </div>
              <input
                type="number"
                id="minDeliveryFee"
                name="minDeliveryFee"
                value={formik.values.minDeliveryFee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="0.00"
                className={`w-full pl-12 pr-4 py-2 border ${formik.touched.minDeliveryFee && formik.errors.minDeliveryFee ? 'border-error' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              />
            </div>
            {formik.touched.minDeliveryFee && formik.errors.minDeliveryFee && (
              <div className="text-error text-sm mt-1">
                {formik.errors.minDeliveryFee}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="secondary" className="w-2/5" onClick={handleCancel}>
            Cancel
          </Button>
            <Button
            onClick={formik.handleSubmit}
            isLoading={formik.isSubmitting || loading}
            className="w-3/5"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryInformation;
