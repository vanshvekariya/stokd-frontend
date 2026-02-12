import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { adminNavigationItems } from '../constant/navigationConfig';
import { paths } from '../routes/paths';
import { commonLogoutFunc } from '../utils/share';
import { useActiveLink } from '../routes/hooks/use-active-link';
import { Tooltip } from '@mui/material';

const NavItem = ({ item }) => {
  const isActive = useActiveLink(item.path, {
    exact: item.path === paths.admin.dashboard, // Only match exactly for dashboard
    includeHash: false,
  });

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

const AdminLayout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await commonLogoutFunc();
    } finally {
      setIsLoggingOut(false);
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
                {adminNavigationItems.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </nav>

            {/* Logout Button */}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with padding to account for fixed header */}
      <main className="pt-20 pb-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-gray-200 bg-white mt-auto">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} SToKD. All rights reserved. (Admin
          Panel)
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
