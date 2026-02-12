// src/components/forms/BusinessForm.jsx
import { useFormik } from 'formik';
import Input from '../../components/Input';
import Button from '../../components/Button';
import TextArea from '../../components/TextArea';
import CustomSelect from '../../components/Select';
import ImageUpload from '../../components/ImageUpload';
import {
  countries,
  getCityOptions,
  getStateOptions,
  getPostcodeOptions,
} from '../../utils/share';
import { step2Schema } from '../../common/validation';
import PropTypes from 'prop-types';
import { fileUpload } from '../../services/file.upload.services';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLoginType, LOGIN_TYPES } from '../../utils/loginType';

const BusinessForm = ({
  initialValues = {
    logoImage: null,
    businessName: '',
    companyDescription: '',
    businessPhoneCountryCode: '+61',
    businessPhone: '',
    street: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    abn: '',
  },
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isLoading = false,
  validationSchema = null,
  layout = 'standard',
  fields = null,
  showImageUpload = true,
}) => {
  const { userToken } = useAuth();
  const [productImage, setProductImage] = useState(
    initialValues.logoImage || null
  );
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isPostcodeFetching, setIsPostcodeFetching] = useState(false);
  const [postcodeOptions, setPostcodeOptions] = useState([]);
  const loginType = useLoginType();
  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema || step2Schema,
    enableReinitialize: true,
    onSubmit,
  });

  // Handle city selection and fetch postcodes
  const handleCityChange = async (selected) => {
    const cityValue = selected?.id || '';
    formik.setFieldValue('city', cityValue);
    formik.setFieldValue('zipCode', '');
    // Auto-fetch postcode options when city is selected
    if (cityValue && formik.values.country && formik.values.state) {
      setIsPostcodeFetching(true);
      try {
        // Fetch postcode options from API
        const options = await getPostcodeOptions(
          cityValue,
          formik.values.state,
          formik.values.country
        );

        setPostcodeOptions(options);

        // If we have options, select the first one
        if (options.length > 0) {
          formik.setFieldValue('zipCode', options[0].id);
        }
      } catch {
        // Silent fail - don't disrupt the user experience
      } finally {
        setIsPostcodeFetching(false);
      }
    } else {
      // Reset postcode options if city is cleared
      setPostcodeOptions([]);
      formik.setFieldValue('zipCode', '');
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setIsImageUploading(true);
      const folder =
        loginType === LOGIN_TYPES.RESTAURANT ? 'RESTAURANT' : 'SUPPLIER';
      const response = await fileUpload(folder, file?.name, file, userToken);
      setProductImage(response?.getUrl);
      formik.setFieldValue('logoImage', response.key);
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsImageUploading(false);
    }
  };

  const renderBusinessInfoFields = () => (
    <div className={layout === 'split' ? 'flex flex-col gap-4' : 'flex flex-col gap-4'}>
      {/* Business Name and ABN side by side in split layout */}
      {layout === 'split' && (!fields || (fields.includes('businessName') || fields.includes('abn'))) ? (
        <div className="flex gap-3">
          {(!fields || fields.includes('businessName')) && (
            <div className="w-1/2">
              <Input
                label="Business Name"
                type="text"
                name="businessName"
                value={formik.values.businessName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your business name"
                error={formik.touched.businessName && formik.errors.businessName}
              />
            </div>
          )}

          {(!fields || fields.includes('abn')) && (
            <div className="w-1/2">
              <Input
                label="ABN"
                type="text"
                name="abn"
                value={formik.values.abn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your ABN number"
                error={formik.touched.abn && formik.errors.abn}
                required={false}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Standard layout for non-split mode */}
          {(!fields || fields.includes('businessName')) && (
            <Input
              label="Business Name"
              type="text"
              name="businessName"
              value={formik.values.businessName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your business name"
              error={formik.touched.businessName && formik.errors.businessName}
            />
          )}

          {(!fields || fields.includes('abn')) && (
            <div className="flex flex-col gap-1">
              <Input
                label="ABN"
                type="text"
                name="abn"
                value={formik.values.abn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your ABN number"
                error={formik.touched.abn && formik.errors.abn}
                required={false}
              />
            </div>
          )}
        </>
      )}

      {(!fields || fields.includes('companyDescription')) && (
        <TextArea
          label="Company Description"
          name="companyDescription"
          value={formik.values.companyDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Describe your company..."
          rows={layout !== 'split' ? '3' : '1'}
          error={
            formik.touched.companyDescription &&
            formik.errors.companyDescription
          }
        />
      )}
    </div>
  );

  const renderAddressFields = () => (
    <>
      {/* Business Address and Phone Number */}
      <div
        className={layout === 'split' ? 'flex gap-3' : 'flex flex-col gap-4'}
      >
        {(!fields || fields.includes('businessPhone')) && (
          <Input
            label="Phone number"
            type="tel"
            name="businessPhone"
            value={formik.values.businessPhone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.businessPhone && formik.errors.businessPhone}
            onCountryCodeChange={(code) =>
              formik.setFieldValue('businessPhoneCountryCode', code)
            }
          />
        )}
        {(!fields || fields.includes('street')) && (
          <Input
            label="Business Address"
            type="text"
            name="street"
            value={formik.values.street}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="123 Business St, Melbourne, VIC 3000"
            error={formik.touched.street && formik.errors.street}
          />
        )}
      </div>
      {/* Country and State */}
      <div className="flex gap-3">
        {(!fields || fields.includes('country')) && (
          <CustomSelect
            label="Country"
            name="country"
            placeholder="Select Country"
            value={
              formik.values.country
                ? countries.find((c) => c.id === formik.values.country)
                : null
            }
            onChange={(selected) => {
              formik.setFieldValue('country', selected?.id || '');
              formik.setFieldValue('state', ''); // Reset state
              formik.setFieldValue('city', ''); // Reset city
            }}
            onBlur={formik.handleBlur}
            options={countries}
            error={formik.touched.country && formik.errors.country}
          />
        )}
        {(!fields || fields.includes('state')) && (
          <CustomSelect
            label="State"
            name="state"
            value={
              formik.values.state
                ? getStateOptions(formik.values.country).find(
                    (s) => s.id === formik.values.state
                  )
                : null
            }
            onChange={(selected) => {
              formik.setFieldValue('state', selected?.id || '');
              formik.setFieldValue('city', ''); // Reset city
            }}
            onBlur={formik.handleBlur}
            placeholder="Select State"
            options={getStateOptions(formik.values.country)}
            error={formik.touched.state && formik.errors.state}
            isDisabled={!formik.values.country}
          />
        )}
      </div>

      {/* City and Zip Code */}
      <div className="flex gap-3">
        {(!fields || fields.includes('city')) && (
          <CustomSelect
            label="City"
            name="city"
            value={
              formik.values.city
                ? getCityOptions(
                    formik.values.country,
                    formik.values.state
                  ).find((c) => c.id === formik.values.city)
                : null
            }
            onChange={handleCityChange}
            onBlur={formik.handleBlur}
            placeholder="Select City"
            options={getCityOptions(formik.values.country, formik.values.state)}
            error={formik.touched.city && formik.errors.city}
            isDisabled={!formik.values.state}
          />
        )}
        {(!fields || fields.includes('zipCode')) &&
          (Array.isArray(postcodeOptions) && postcodeOptions.length > 0 ? (
            <CustomSelect
              label="Post Code"
              name="zipCode"
              value={
                formik.values.zipCode
                  ? { id: formik.values.zipCode, name: formik.values.zipCode }
                  : null
              }
              onChange={(selected) =>
                formik.setFieldValue('zipCode', selected?.id || '')
              }
              onBlur={formik.handleBlur}
              placeholder="Select Postcode"
              options={postcodeOptions}
              error={formik.touched.zipCode && formik.errors.zipCode}
              isLoading={isPostcodeFetching}
              isDisabled={isPostcodeFetching}
              noOptionsMessage={() => 'Type to enter custom postcode'}
              allowCreateWhileLoading={true}
              formatCreateLabel={(inputValue) =>
                `Use postcode: "${inputValue}"`
              }
              onCreateOption={(inputValue) => {
                formik.setFieldValue('zipCode', inputValue);
              }}
            />
          ) : (
            <Input
              label="Post Code"
              name="zipCode"
              value={formik.values.zipCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter postcode"
              error={formik.touched.zipCode && formik.errors.zipCode}
              required={false}
              disabled={isPostcodeFetching}
            />
          ))}
      </div>
    </>
  );

  const renderButtons = () => (
    <div
      className={layout === 'standard' ? 'flex justify-end mt-3' : 'flex gap-2'}
    >
      {onCancel && (
        <Button
          variant="secondary"
          onClick={() => onCancel(formik)}
          className="w-2/5"
          type="button"
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        onClick={formik.handleSubmit}
        isLoading={isLoading || formik.isSubmitting}
        className={onCancel ? 'w-3/5' : 'w-full'}
        type="submit"
      >
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <form
      className={
        layout === 'standard'
          ? 'p-5 flex flex-col gap-3'
          : 'flex flex-col gap-4'
      }
    >
      {/* Only show image upload if specified and we're not restricting fields OR it's in the fields list */}
      {showImageUpload && (!fields || fields.includes('logoImage')) && (
        <div className="space-y-2 mb-4">
          <ImageUpload
            onImageUpload={handleImageUpload}
            currentImage={productImage}
            isLoading={isImageUploading}
          />
        </div>
      )}

      {/* Only show business info fields if not restricting fields OR they're in the fields list */}
      {(!fields ||
        fields.some((f) =>
          ['businessName', 'abn', 'companyDescription'].includes(f)
        )) &&
        renderBusinessInfoFields()}

      {/* Only show address fields if not restricting fields OR they're in the fields list */}
      {(!fields ||
        fields.some((f) =>
          [
            'street',
            'businessPhone',
            'country',
            'state',
            'city',
            'zipCode',
          ].includes(f)
        )) &&
        renderAddressFields()}

      {renderButtons()}
    </form>
  );
};

BusinessForm.propTypes = {
  initialValues: PropTypes.shape({
    businessName: PropTypes.string,
    companyDescription: PropTypes.string,
    businessPhone: PropTypes.string,
    street: PropTypes.string,
    country: PropTypes.string,
    state: PropTypes.string,
    city: PropTypes.string,
    zipCode: PropTypes.string,
    abn: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onImageUpload: PropTypes.func,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  showImageUpload: PropTypes.bool,
  isLoading: PropTypes.bool,
  validationSchema: PropTypes.object,
  layout: PropTypes.oneOf(['standard', 'compact', 'split']),
  fields: PropTypes.arrayOf(PropTypes.string),
};

export default BusinessForm;
