import Input from '../../components/Input';
import { useFormik } from 'formik';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../../common/validation';
import { signIn } from '../../services/firebase.auth.services';
import { useState } from 'react';
import { paths } from '../../routes/paths';
import { toast } from 'react-toastify';
import {
  login,
  restaurantLogin,
  adminLogin,
  me,
} from '../../services/auth.services';
import { commonLogoutFunc, setLocalStorageItem } from '../../utils/share';
import { useAuth } from '../../context/AuthContext';
import SocialLogin from './SocialLogin';
import { LOGIN_TYPES, useLoginType } from '../../utils/loginType';

const Login = () => {
  const navigate = useNavigate();
  const loginType = useLoginType();
  const { setBackendAuth, refreshToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      // First authenticate with Firebase
      const firebaseResponse = await signIn(values);

      if (!firebaseResponse.success) {
        toast.error(
          firebaseResponse.error || 'Authentication failed with Firebase'
        );
        return;
      }

      // Then authenticate with your backend based on login type
      const loginResponse =
        loginType === LOGIN_TYPES.RESTAURANT
          ? await restaurantLogin({ idToken: firebaseResponse.token })
          : loginType === LOGIN_TYPES.ADMIN
            ? await adminLogin({ idToken: firebaseResponse.token })
            : await login({ idToken: firebaseResponse.token });

      if (loginType === LOGIN_TYPES.RESTAURANT) {
        // Handle restaurant login flow
        if (loginResponse?.data?.data?.createAccount) {
          navigate(paths.auth.profileSetup);
          toast.info('Please setup your restaurant profile first');
          return;
        }

        if (loginResponse?.data?.data?.alreadySetup) {
          navigate(paths.subscription);
          toast.info(
            'You have completed the onboarding process. Purchase a subscription plan to access the features.And login through our mobile app'
          );
          return;
        }
      } else {
        // Handle supplier login flow
        if (loginResponse?.data?.data?.createAccount) {
          navigate(paths.auth.profileSetup);
          toast.info('Please setup your profile first');
          return;
        }
      }

      if (loginResponse.status !== 200) {
        // If backend rejects authentication, sign out from Firebase
        await commonLogoutFunc();
        toast.error('Authentication failed with the server.');
        return;
      }

      // Check if token refresh is needed
      if (loginResponse?.data?.data?.requiresRefresh === true) {
        await refreshToken();
      }
      setLocalStorageItem('isLoggedIn', true);
      setLocalStorageItem('userType', loginType);
      setBackendAuth(true);

      if (loginType === LOGIN_TYPES.ADMIN) {
        navigate(paths.admin.dashboard);
        return;
      }
      // Fetch user data
      const userResp = await me();
      if (userResp?.data?.data) {
        setLocalStorageItem('user', userResp.data.data);
      }

      toast.success('User logged in successfully!');
      if (loginType === LOGIN_TYPES.RESTAURANT) {
        navigate(paths.subscription);
        toast.info(
          'You have completed the onboarding process. Please login through our mobile app'
        );
        return;
      } else {
        navigate(paths.orders);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? 'An unexpected error occurred'
      );
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <h1 className="text-2xl font-black text-text-primary text-center mb-1">
        {loginType === LOGIN_TYPES.RESTAURANT
          ? 'Restaurant Login'
          : loginType === LOGIN_TYPES.ADMIN
            ? 'Admin Login'
            : 'Supplier Login'}
      </h1>

      {/* Social Login Buttons */}
      {loginType !== LOGIN_TYPES.ADMIN && (
        <SocialLogin setIsLoading={setIsLoading} isLoading={isLoading} />
      )}
      {/* Login Form */}
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="hello@work.com"
          error={formik.touched.email && formik.errors.email}
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
        <div className="self-end mt-[-12px]">
          <Link to={paths.auth.forgotPassword} className="text-primary">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          isLoading={formik.isSubmitting || isLoading}
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
