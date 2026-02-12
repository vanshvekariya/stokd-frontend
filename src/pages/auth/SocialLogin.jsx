import googleIcon from '../../assets/google.svg';
// import facebookIcon from '../../assets/facebook.svg';
import appleIcon from '../../assets/apple.svg';
import PropTypes from 'prop-types';
import {
  signInWithApple,
  signInWithGoogle,
} from '../../services/firebase.auth.services';
import { login, me, restaurantLogin } from '../../services/auth.services';
import { commonLogoutFunc, setLocalStorageItem } from '../../utils/share';
import { toast } from 'react-toastify';
import { paths } from '../../routes/paths';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoginType, LOGIN_TYPES } from '../../utils/loginType';

const SocialLogin = ({ isLoading, setIsLoading }) => {
  const navigate = useNavigate();
  const { setBackendAuth, refreshToken } = useAuth();
  const loginType = useLoginType();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        // Authenticate with backend using the token
        let loginResponse;
        if (loginType === LOGIN_TYPES.RESTAURANT) {
          loginResponse = await restaurantLogin({ idToken: result.token });
        } else {
          loginResponse = await login({ idToken: result.token });
        }

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
      } else {
        toast.error(result.error || 'Google Sign-In failed');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithApple();

      if (result.success) {
        // Authenticate with backend using the token
        let loginResponse;
        if (loginType === LOGIN_TYPES.RESTAURANT) {
          loginResponse = await restaurantLogin({ idToken: result.token });
        } else {
          loginResponse = await login({ idToken: result.token });
        }

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
      } else {
        toast.error(result.error || 'Apple Sign-In failed');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {' '}
      <div className="flex gap-2">
        <button
          disabled={isLoading}
          className="flex-1 p-2.5 border border-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          onClick={handleGoogleSignIn}
          type="button"
        >
          <img src={googleIcon} alt="Google" className="h-5 w-5 mx-auto" />
        </button>
        {/* <button
          className="flex-1 p-2.5 border border-border rounded-lg hover:bg-gray-50 transition-colors"
          type="button"
          disabled={true} // Disable until implemented
        >
          <img src={facebookIcon} alt="Facebook" className="h-5 w-5 mx-auto" />
        </button> */}
        <button
          onClick={handleAppleSignIn}
          className="flex-1 p-2.5 border border-border rounded-lg hover:bg-gray-50 transition-colors"
          type="button"
          disabled={isLoading} // Disable until implemented
        >
          <img src={appleIcon} alt="Apple" className="h-5 w-5 mx-auto" />
        </button>
      </div>
      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm text-text-secondary">or</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>
    </>
  );
};

SocialLogin.propTypes = {
  setIsLoading: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default SocialLogin;
