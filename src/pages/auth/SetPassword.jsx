import Input from '../../components/Input';
import { useFormik } from 'formik';
import Button from '../../components/Button';
import { setPasswordSchema } from '../../common/validation';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../config/firebase';

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [actionCode, setActionCode] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Extract oobCode (action code) from URL
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');

    if (!oobCode) {
      toast.error('Invalid password reset link');
      navigate('/forgot-password');
      return;
    }

    // Verify the action code
    const verifyCode = async () => {
      try {
        // Verify the password reset code
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setActionCode(oobCode);
        setVerifying(false);
      } catch (error) {
        console.error('Error verifying reset code:', error);
        toast.error('Invalid or expired password reset link');
        navigate('/forgot-password');
      }
    };

    verifyCode();
  }, [location, navigate]);

  const handleSubmit = async (values) => {
    try {
      // Complete the password reset process
      await confirmPasswordReset(auth, actionCode, values.password);
      toast.success('Password has been reset successfully!');
      navigate('/auth/login');
    } catch (error) {
      console.error('Reset error:', error);
      let errorMessage = 'Failed to reset password';

      switch (error.code) {
        case 'auth/expired-action-code':
          errorMessage = 'The password reset link has expired';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'The password reset link is invalid';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak';
          break;
        default:
          errorMessage = error.message || 'Failed to reset password';
      }

      toast.error(errorMessage);
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: setPasswordSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <h1 className="text-2xl font-black text-text-primary text-left mb-1">
        Set Password
      </h1>

      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        <Input
          label="Password"
          type="password"
          name="password"
          value={formik?.values.password}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          placeholder="Enter your password"
          error={formik?.touched.password && formik?.errors.password}
        />
        <Input
          label="Re-Enter Password"
          type="password"
          name="confirmPassword"
          value={formik?.values.confirmPassword}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          placeholder="Enter your password"
          error={
            formik?.touched.confirmPassword && formik?.errors.confirmPassword
          }
        />

        <Button
          type="submit"
          disabled={formik?.isSubmitting}
          className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          isLoading={formik?.isSubmitting}
        >
          Update
        </Button>
      </form>
    </div>
  );
};

export default SetPassword;
