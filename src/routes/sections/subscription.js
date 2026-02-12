import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Subscription from '../../pages/subscription/Subscription';
import SubscriptionLayout from '../../layouts/SubscriptionLayout';
import { ProtectedRoute } from '../Guard';

export const subscriptionRoutes = [
  {
    path: 'subscription',
    element: (
      <ProtectedRoute>
        <SubscriptionLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </SubscriptionLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Subscription />,
      },
    ],
  },
  // Additional route for restaurant subdomain simulation
  {
    path: 'restaurant/subscription',
    element: (
      <ProtectedRoute>
        <SubscriptionLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </SubscriptionLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Subscription />,
      },
    ],
  },
];
