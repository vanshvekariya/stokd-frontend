// src/pages/ProfileSetup.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import {
  supplierProfileSignUp,
  restaurantProfileSignUp,
} from '../../services/auth.services';
import { step1Schema, step2Schema } from '../../common/validation';
import BusinessForm from '../../common/componenets/BusinessForm';
import { LOGIN_TYPES, useLoginType } from '../../utils/loginType';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const loginType = useLoginType();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState({
    businessName: '',
    companyDescription: '',
    logoImage: null, 
    abn: null,
  });

  // First step form - business name and description only
  const handleStep1Submit = (values) => {
    setStep1Data({
      businessName: values.businessName,
      companyDescription: values.companyDescription,
      logoImage: values.logoImage || null, 
      abn: values.abn || null,
    });
    setCurrentStep(2);
  };

  // Second step form - address and contact details
  const handleStep2Submit = async (values) => {
    // Get country code from the selected country value
    const getCountryCode = (countryValue) => {
      // If country is empty, default to AU
      if (!countryValue) return 'AU';
      
      // Return the country value as the country code
      // This assumes the country value is already in ISO format (e.g., 'AU', 'NZ')
      return countryValue;
    };
    
    // Combine data from both steps
    const finalData = {
      businessName: step1Data.businessName,
      companyDescription: step1Data.companyDescription,
      abn: step1Data.abn,
      address: {
        street: values.street,
        zipcode: values.zipCode,
        city: values.city,
        country: values.country,
        state: values.state,
        latitude: 0,
        longitude: 0,
      },
      logoImage: step1Data.logoImage, 
      paymentOptions: {},
      countryCode: getCountryCode(values.country),
      businessPhone: `${values.businessPhoneCountryCode}${values.businessPhone}`,
    };

    try {
      // Choose the appropriate API based on login type
      if (loginType === LOGIN_TYPES.RESTAURANT) {
        await restaurantProfileSignUp(finalData);
        navigate(paths.auth.login);
        toast.success('Restaurant profile setup successfully');
        toast.info('You have completed the onboarding process. Please login to continue');
      } else {
        // For suppliers, continue with the existing flow
        await supplierProfileSignUp(finalData);
        navigate(paths.auth.login);
        toast.success('Profile setup successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <div>
        <div className="text-sm text-gray-600">Step {currentStep}/2</div>
        <h1 className="text-2xl font-bold text-gray-900">
          {loginType === LOGIN_TYPES.RESTAURANT
            ? 'Restaurant Setup'
            : 'Profile Setup'}
        </h1>
      </div>

      {currentStep === 1 ? (
        <BusinessForm
          initialValues={{
            businessName: step1Data.businessName,
            companyDescription: step1Data.companyDescription,
            logoImage: step1Data.logoImage,
            abn: step1Data.abn,
          }}
          onSubmit={handleStep1Submit}
          onCancel={() => navigate(-1)}
          submitLabel="Next"
          cancelLabel="Back"
          validationSchema={step1Schema}
          layout="compact"
          showImageUpload={true}
          fields={['businessName', 'abn', 'companyDescription', 'logoImage']}
        />
      ) : (
        <BusinessForm
          initialValues={{
            street: '',
            businessPhone: '',
            businessPhoneCountryCode: '+61',
            country: '',
            state: '',
            city: '',
            zipCode: '',
          }}
          onSubmit={handleStep2Submit}
          onCancel={(formik) => {
            formik.resetForm();
            setCurrentStep(1);
          }}
          submitLabel="Complete Setup"
          cancelLabel="Back"
          showImageUpload={false}
          validationSchema={step2Schema}
          layout="compact"
          // This prop would show only the address-related fields
          fields={[
            'street',
            'businessPhone',
            'country',
            'state',
            'city',
            'zipCode',
          ]}
        />
      )}
    </div>
  );
};

export default ProfileSetup;
