import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fileUpload } from '../../services/file.upload.services';
import { updateSupplierBusinessDetails } from '../../services/auth.services';
import {
  extractPhoneDetails,
  getLocalStorageItem,
  updateSupplierBranchInLocalStorage,
} from '../../utils/share';
import { step1Schema, step2Schema } from '../../common/validation';
import BusinessForm from '../../common/componenets/BusinessForm';
import * as yup from 'yup';

const combinedSchema = yup.object().shape({
  // From step1Schema - business info fields
  businessName: step1Schema.fields.businessName,
  companyDescription: step1Schema.fields.companyDescription,
  abn: step1Schema.fields.abn,

  // From step2Schema - address fields
  street: step2Schema.fields.street,
  country: step2Schema.fields.country,
  state: step2Schema.fields.state,
  city: step2Schema.fields.city,
  businessPhone: step2Schema.fields.businessPhone,
  zipCode: step2Schema.fields.zipCode,
});

const BusinessDetails = () => {
  const { userToken } = useAuth();
  const userData = getLocalStorageItem('user');

  // Extract phone details (country code and phone number)
  const { countryCode, phoneNumber } = extractPhoneDetails(
    userData?.supplier?.branches[0]?.phone
  );

  const initialValues = {
    logoImage: userData?.supplier?.logoImage || '',
    businessName: userData?.supplier?.branches[0]?.branchName || '',
    companyDescription:
    userData?.supplier?.companyDescription || '',
    abn: userData?.supplier?.abn || null,
    businessPhoneCountryCode: countryCode,
    businessPhone: phoneNumber,
    street: userData?.supplier?.branches[0]?.address?.street || '',
    country: userData?.supplier?.branches[0]?.address?.country || '',
    state: userData?.supplier?.branches[0]?.address?.state || '',
    city: userData?.supplier?.branches[0]?.address?.city || '',
    zipCode: userData?.supplier?.branches[0]?.address?.zipcode || '',
  };

  const handleSubmit = async (values) => {
    const finalData = {
      ...values,
      abn: values.abn,
      address: {
        street: values.street,
        zipcode: values.zipCode,
        city: values.city,
        country: values.country,
        state: values.state,
        latitude: 0,
        longitude: 0,
      },
      paymentOptions: {},
      countryCode: values.country,
      businessPhone: `${values.businessPhoneCountryCode}${values.businessPhone}`,
    };

    try {
      const response = await updateSupplierBusinessDetails(
        userData?.supplier?.id,
        userData?.supplier?.branches[0]?.id,
        finalData
      );
      
      updateSupplierBranchInLocalStorage(response?.data?.data);
      toast.success('Business details updated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCancel = (formikInstance) => {
    formikInstance.resetForm();
  };

  const handleImageUpload = async (file) => {
    await fileUpload('SUPPLIER', file?.name, file, userToken);
  };

  return (
    <div className="p-6">
      <BusinessForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        showImageUpload
        onCancel={handleCancel}
        onImageUpload={handleImageUpload}
        submitLabel="Save Changes"
        cancelLabel="Cancel"
        layout="split"
        validationSchema={combinedSchema}
        fields={[
          'logoImage',
          'businessName',
          'abn',
          'companyDescription',
          'street',
          'businessPhone',
          'country',
          'state',
          'city',
          'zipCode',
        ]}
      />
    </div>
  );
};

export default BusinessDetails;
