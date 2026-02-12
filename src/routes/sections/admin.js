import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { ProtectedRoute } from '../Guard';
import AdminLayout from '../../layouts/AdminLayout';
import { paths } from '../paths';

// Import admin pages here
import Users from '../../pages/admin/Users';
import Dashboard from '../../pages/admin/Dashboard';
import Restaurants from '../../pages/admin/Restaurants';
import Suppliers from '../../pages/admin/Suppliers';

// Admin route protection component
const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const userType = localStorage.getItem('userType');
        if (!userType) {
          throw new Error('User role not found. Please log in again.');
        }
        
        if (userType !== 'admin') {
          console.warn(`Unauthorized access`);
          throw new Error('You do not have permission to access this page.');
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Admin access check failed:', error);
        setError(error.message || 'Access denied. Please log in as an admin.');
        // Redirect to login after a short delay to show the error message
        const timer = setTimeout(() => {
          navigate(paths.auth.login, { 
            replace: true,
            state: { from: window.location.pathname, error: error.message }
          });
        }, 1000);
        return () => clearTimeout(timer);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Verifying admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-lg font-medium mb-4">Access Denied</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(paths.auth.login, { replace: true })}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : null;
};

export const adminRoutes = [
  {
    path: paths.admin.root,
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout>
            <Suspense>
              <Outlet />
            </Suspense>
          </AdminLayout>
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={paths.admin.dashboard} replace />,
      },
      {
        path: paths.admin.dashboard,
        element: <Dashboard />,
      },
      {
        path: paths.admin.users,
        element: <Users />,
      },
      {
        path: paths.admin.restaurants,
        element: <Restaurants />,
      },
      {
        path: paths.admin.suppliers,
        element: <Suppliers />,
      },
    ],
  },
];
