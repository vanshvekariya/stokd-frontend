import Input from '../../components/Input';
import { useFormik } from 'formik';
import Button from '../../components/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { completeRegistrationSchema } from '../../common/validation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { acceptInvitation } from '../../services/auth.services';

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [invitationToken, setInvitationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Extract invitationToken from URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('invitationToken');

    if (!token) {
      toast.error('Invalid invitation link');
      navigate('/auth/login');
      return;
    }

    // Remove quotes if they exist in the token
    const cleanToken = token.replace(/^"(.*)"$/, '$1');
    setInvitationToken(cleanToken);
    setVerifying(false);
  }, [location, navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      // Prepare payload for API
      const payload = {
        token: invitationToken,
        name: values.name,
        password: values.password,
        invitationType: 'RESTAURANT'
      };

      // Call the API
      const response = await acceptInvitation(payload);
      
      if (response.status === 200) {
        toast.success('Registration completed successfully!');
        navigate('/auth/login');
      } else {
        toast.error('Failed to complete registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to complete registration';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: completeRegistrationSchema,
    onSubmit: handleSubmit,
  });

  if (verifying) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-5 items-center justify-center">
        <h1 className="text-2xl font-black text-text-primary text-center mb-1">
          Verifying Invitation
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <h1 className="text-2xl font-black text-text-primary text-center mb-1">
        Complete Your Registration
      </h1>
      <p className="text-center text-gray-600">
        Please enter your name and create a password to complete your registration.
      </p>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="John Doe"
          error={formik.touched.name && formik.errors.name}
          disabled={isLoading || formik.isSubmitting}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter your password"
          error={formik.touched.password && formik.errors.password}
          disabled={isLoading || formik.isSubmitting}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Confirm your password"
          error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          disabled={isLoading || formik.isSubmitting}
        />

        <Button
          type="submit"
          className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          isLoading={formik.isSubmitting || isLoading}
        >
          Complete Registration
        </Button>
      </form>
    </div>
  );
};

export default CompleteRegistration;