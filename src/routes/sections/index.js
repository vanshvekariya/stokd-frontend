import { useRoutes } from 'react-router-dom';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { profileRoutes } from './profile';
import { subscriptionRoutes } from './subscription';
import { adminRoutes } from './admin';

export default function Router() {
  return useRoutes([
    // Redirect root to auth if not logged in, or to appropriate dashboard
    // {
    //   path: '/',
    //   element: <Navigate to="/auth" replace />,
    // },
    
    // Auth routes (login, signup, etc.)
    ...authRoutes,
    
    // Protected routes (require authentication)
    ...adminRoutes,
    ...dashboardRoutes,
    ...profileRoutes,
    ...subscriptionRoutes,
    
    // 404 - Keep this last
    // { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
