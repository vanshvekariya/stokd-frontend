import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { paths } from '../routes/paths';
import { commonLogoutFunc, getLocalStorageItem } from '../utils/share';
import { toast } from 'react-toastify';
import { LOGIN_TYPES, useLoginType } from '../utils/loginType';
import { checkRestaurantSubscription, createBillingPortalSession } from '../services/subscription.services';

const SubscriptionLayout = ({ children }) => {
  const loginType = useLoginType();
  const user = getLocalStorageItem('user');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  
  useEffect(() => {
    const checkSubscription = async () => {
      if (loginType === LOGIN_TYPES.RESTAURANT && user?.restaurant?.id) {
        try {
          const response = await checkRestaurantSubscription(user.restaurant.id);
          setHasSubscription(response?.data?.data?.isSubscribed || false);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setHasSubscription(false);
        }
      }
    };

    checkSubscription();
  }, [loginType, user]);

  const handleLogout = async () => {
    try {
      await commonLogoutFunc();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.restaurant?.id) {
      toast.error('Restaurant information is missing.');
      return;
    }

    try {
      setManagingSubscription(true);
      const response = await createBillingPortalSession(user.restaurant.id);
      
      // Check if we have a billing portal URL from Stripe
      if (response.data?.data?.session?.url) {
        // Redirect to Stripe billing portal
        window.location.href = response.data.data.session.url;
      } else {
        toast.error('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      toast.error(error?.response?.data?.message || 'Failed to access subscription management');
    } finally {
      setManagingSubscription(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
          <a
                href="https://www.stokd.com"
                target="_self"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <img src="/stokd-logo.svg" alt="Logo" className="h-8 w-auto" />
              </a>
              <div className="text-2xl font-bold text-primary pl-4">
                {loginType === LOGIN_TYPES.RESTAURANT ? 'Restaurant Portal' : 'Supplier Portal'}
              </div>
          </div>
          <div className="flex items-center space-x-4">
            {loginType === LOGIN_TYPES.RESTAURANT && hasSubscription && (
              <button
                onClick={handleManageSubscription}
                disabled={managingSubscription}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {managingSubscription ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Manage Subscription'
                )}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Stokd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

SubscriptionLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SubscriptionLayout;
