import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/loader/Loader';
import { paths } from './paths';
import { LOGIN_TYPES, useLoginType } from '../utils/loginType';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const loginType = useLoginType();
  
  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If admin trying to access non-admin routes, redirect to admin dashboard
  if (loginType === LOGIN_TYPES.ADMIN && !window.location.pathname.startsWith(paths.admin.root)) {
    return <Navigate to={paths.admin.dashboard} replace />;
  }

  // If restaurant user, don't allow access to order pages
  if (
    loginType === LOGIN_TYPES.RESTAURANT &&
    (window.location.pathname === paths.orders ||
      window.location.pathname === '/')
  ) {
    return <Navigate to={paths.products} replace />;
  }

  return children ? children : <Outlet />;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const loginType = useLoginType();

  if (loading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    if (loginType === LOGIN_TYPES.ADMIN) {
      return <Navigate to={paths.admin.dashboard} replace />;
    }

    // If restaurant user, redirect to subscription page
    if (loginType === LOGIN_TYPES.RESTAURANT) {
      return <Navigate to={paths.subscription} replace />;
    }

    // For supplier users, redirect to orders page
    return <Navigate to="/orders" replace />;
  }

  return children ? children : <Outlet />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
PublicRoute.propTypes = {
  children: PropTypes.node,
};
