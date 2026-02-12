import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useActiveLink } from '../routes/hooks/use-active-link';
import PropTypes from 'prop-types';
import { paths } from '../routes/paths';
import { commonLogoutFunc } from '../utils/share';
import { Tooltip } from '@mui/material';

const ProfileLayout = ({ children, showBlank = false }) => {
  const navigate = useNavigate();

  const tabs = useMemo(
    () => [
      {
        id: 'delivery-information',
        label: 'Delivery information',
        path: paths.deliveryInformation,
      },
      {
        id: 'personal-details',
        label: 'Personal Details',
        path: paths.profileDetail,
      },
      {
        id: 'business-details',
        label: 'Business Details',
        path: paths.businessDetail,
      },
      {
        id: 'delivery-zones',
        label: 'Delivery zones',
        path: paths.deliveryZones,
      },
      {
        id: 'integrations',
        label: 'Integrations',
        path: paths.integrations,
      },
    ],
    []
  );

  const deliveryInformationActive = useActiveLink(paths.deliveryInformation);
  const personalDetailsActive = useActiveLink(paths.profileDetail);
  const businessDetailsActive = useActiveLink(paths.businessDetail);
  const deliveryZonesActive = useActiveLink(paths.deliveryZones);
  const integrationsActive = useActiveLink(paths.integrations);

  const activeLinks = [
    deliveryInformationActive,
    personalDetailsActive,
    businessDetailsActive,
    deliveryZonesActive,
    integrationsActive,
  ];

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleTabClick = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await commonLogoutFunc();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header/Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-nav-bg shadow-nav-shadow">
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

            {/* Close Button */}
            <div className="flex items-center gap-2">
              <Tooltip title="Logout" position="bottom" arrow>
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full border border-border bg-white ${isLoggingOut ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  onClick={isLoggingOut ? undefined : handleLogout}
                >
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-error rounded-full animate-spin"></div>
                  ) : (
                    <LogOut className="text-error" size={20} />
                  )}
                </div>
              </Tooltip>

              <div
                className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-white cursor-pointer"
                onClick={() => navigate(paths.orders)}
              >
                <X className="text-gray-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content Area with top padding to account for fixed header */}
      {showBlank ? (
        <main className="pt-18 py-6 px-4 sm:px-6 lg:px-8">
          {' '}
          {/* Added pt-16 for header height */}
          {children}
        </main>
      ) : (
        <div className="pt-16">
          {' '}
          {/* Add padding-top equal to header height */}
          <div className="w-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
            {/* Tab Navigation */}
            <div className="flex gap-4 ">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors text-text-primary cursor-pointer
                ${
                  activeLinks[index]
                    ? 'bg-white border border-primary'
                    : 'hover:text-gray-700 bg-table-background'
                }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Card */}
            <div className="bg-table-background rounded-3xl max-w-2xl w-lg">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProfileLayout.propTypes = {
  children: PropTypes.node,
  showBlank: PropTypes.bool,
};

export default ProfileLayout;
