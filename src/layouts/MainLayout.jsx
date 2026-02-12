import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useActiveLink } from '../routes/hooks/use-active-link';
import PropTypes from 'prop-types';
import bell from '../assets/bellIcon.svg';
import chat from '../assets/chatIcon.svg';
import { navigationItems } from '../constant/navigationConfig';
import { CreditCard, User } from 'lucide-react';
import { paths } from '../routes/paths';
import ChatNotificationBadge from '../components/ChatNotificationBadge';
import NotificationBadge from '../components/NotificationBadge';
import { getSupplierId } from '../utils/share';
import { getStripeDashboardUrl } from '../services/stripe.services';
import { toast } from 'react-toastify';

const NavItem = ({ item }) => {
  const isActive = useActiveLink(item.path);

  return (
    <Link
      to={item.path}
      className={`px-4 py-2 rounded-[15px] text-sm transition-all duration-200 cursor-pointer${
        isActive
          ? ' text-primary font-medium shadow-tab-shadow border border-primary-light'
          : 'text-tab-text bg-white border border-border hover:bg-gray-50 '
      }`}
    >
      {item.name}
    </Link>
  );
};

const MainLayout = () => {
  const navigate = useNavigate();
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const handleViewStripeDashboard = async () => {
    const supplierId = getSupplierId();
    if (!supplierId) {
      toast.error('Supplier information not available. Please refresh the page.');
      return;
    }

    setIsLoadingDashboard(true);
    try {
      const response = await getStripeDashboardUrl(supplierId);
      const dashboardUrl = response?.data?.data?.url;
      
      if (dashboardUrl) {
        // Open the Stripe dashboard URL in a new tab
        window.open(dashboardUrl, '_blank');
      } else {
        toast.error('Failed to generate Stripe dashboard link');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to access Stripe dashboard'
      );
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Fixed Header/Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-nav-bg shadow-nav-shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
              <a
                  href="https://www.stokd.com"
                  target="_self"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <img src="/stokd-logo.svg" alt="Logo" className="h-8 w-auto" />
                </a>
              </div>

              {/* Navigation */}
              <nav className="flex-1 flex items-center justify-center px-8">
                <div className="flex gap-2">
                  {navigationItems.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </nav>

              <div className="flex items-center gap-2">
                {/* Stripe Dashboard Button */}
                <button
                  className="flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors"
                  onClick={handleViewStripeDashboard}
                  disabled={isLoadingDashboard}
                >
                  {isLoadingDashboard ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>View Stripe Dashboard</span>
                    </>
                  )}
                </button>

                <div
                  className="flex items-center h-10 w-10 rounded-full cursor-pointer relative"
                  onClick={() => navigate(paths.chat)}
                >
                  <img
                    src={chat}
                    className="h-full w-full text-icon-text"
                    alt="messages"
                  />
                  <div className="absolute -top-1 -right-1">
                    <ChatNotificationBadge />
                  </div>
                </div>

                <div
                  className="flex items-center h-10 w-10 rounded-full cursor-pointer relative"
                  onClick={() => navigate(paths.notification)}
                >
                  <img
                    src={bell}
                    className="h-full w-full text-icon-text "
                    alt="notifications"
                  />
                  <div className="absolute -top-1 -right-1">
                    <NotificationBadge />
                  </div>
                </div>

                <div
                  className="flex items-center bg-white text-icon-text justify-center h-10 w-10 rounded-full border border-border cursor-pointer"
                  onClick={() => navigate(paths.profileDetail)}
                >
                  <User className="text-icon-text" color="#475569" size={20} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area with padding to account for fixed header */}
        <main className="pt-18 py-6 px-4 sm:px-6 lg:px-8 flex-grow">
          {' '}
          {/* Added pt-16 for header height */}
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-gray-200 mt-auto">
          <div className="container mx-auto text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} SToKD. All rights reserved.
          </div>
        </footer>
      </div>
  );
};

NavItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default MainLayout;
