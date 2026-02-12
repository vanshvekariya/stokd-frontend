import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { paths } from '../../routes/paths';
import { getSubscriptionPlans, subscribeToPlan, checkRestaurantSubscription } from '../../services/subscription.services';
import { getLocalStorageItem } from '../../utils/share';

const Subscription = () => {
  const navigate = useNavigate();
  const user = getLocalStorageItem('user');
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [checkingExistingSubscription, setCheckingExistingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user?.restaurant?.id) {
        setCheckingExistingSubscription(false);
        return;
      }

      try {
        const response = await checkRestaurantSubscription(user.restaurant.id);
        const isSubscribed = response?.data?.data?.isSubscribed;
        
        setHasActiveSubscription(isSubscribed);
        
        // if (isSubscribed) {
        //   // If already subscribed, show message
        //   toast.info('You already have an active subscription. Please login through our mobile app.');
        //   // navigate(paths.auth.login);
        // }
      } catch (error) {
        console.error('Error checking existing subscription:', error);
      } finally {
        setCheckingExistingSubscription(false);
      }
    };

    checkExistingSubscription();
  }, [navigate, user]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (checkingExistingSubscription) {
        return; // Don't fetch plans until we've checked existing subscription
      }
      
      try {
        setLoading(true);
        const response = await getSubscriptionPlans();
        if (response.data && response.data.data && response.data.data.plans) {
          setPlans(response.data.data.plans);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [checkingExistingSubscription]);

  const handleSubscribe = async () => {
    if (hasActiveSubscription) {
      toast.info('You already have an active subscription. Please login through our mobile app.');
      // navigate(paths.auth.login);
      return;
    }
    
    if (!selectedPlan) {
      toast.warning('Please select a subscription plan');
      return;
    }

    if (!user?.restaurant?.id) {
      toast.error('Restaurant information is missing. Please log in again.');
      navigate(paths.auth.login);
      return;
    }

    try {
      setSubscribing(true);
      const data = {
        priceId: selectedPlan.id,
        restaurantId: user?.restaurant?.id
      };
      
      const response = await subscribeToPlan(data);
      
      // Check if we have a checkout session URL from Stripe
      if (response.data?.data?.session?.url) {
        // Redirect to Stripe checkout page
        window.location.href = response.data.data.session.url;
      } else {
        toast.success('Successfully subscribed to plan');
        navigate(paths.auth.login);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error?.response?.data?.message || 'Failed to subscribe to plan');
    } finally {
      setSubscribing(false);
    }
  };

  const formatCurrency = (amount, currencyCode) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currencyCode || 'AUD'
    }).format(amount);
  };

  if (loading || checkingExistingSubscription) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Subscription Plans...</h1>
          <div className="flex justify-center space-x-2">
            <div className="animate-pulse h-4 w-4 bg-primary rounded-full"></div>
            <div className="animate-pulse h-4 w-4 bg-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
            <div className="animate-pulse h-4 w-4 bg-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Choose Your Subscription Plan</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select a plan that fits your restaurant&apos;s needs to access all features
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow-sm max-w-md mx-auto">
          <svg 
            className="w-16 h-16 text-gray-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-xl text-gray-700 mb-4">No subscription plans available at the moment.</p>
          <p className="text-gray-500 mb-6">Please check back later or contact support.</p>
          <button
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors shadow-sm"
            onClick={() => navigate(paths.auth.login)}
          >
            Return to Login
          </button>
        </div>
      ) : (
        <>
          <div className={`grid gap-8 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-xl p-6 transition-all hover:transform hover:scale-[1.02] border-gray-200 hover:border-primary hover:shadow-md`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  {plan.isActive && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="mb-5">
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrency(plan.price, plan.currencyCode)}
                  </span>
                  <span className="text-gray-600 ml-1">/{plan.interval}</span>
                </div>
                
                <div className="h-px bg-gray-200 w-full my-5"></div>
                
                <p className="text-gray-700 mb-6 min-h-[60px]">{plan.description}</p>
                
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-4">Features:</h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span className="text-gray-700">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  className={`w-full py-3 rounded-lg transition-colors font-medium text-center ${
                    selectedPlan?.id === plan.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent div onClick from firing
                    setSelectedPlan(plan);
                  }}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button
              className="px-10 py-3.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              onClick={handleSubscribe}
              disabled={!selectedPlan || subscribing || hasActiveSubscription}
            >
              {subscribing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : hasActiveSubscription ? (
                'Already Subscribed'
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
