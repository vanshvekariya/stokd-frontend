import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import ProfileLayout from '../../layouts/ProfileLayout';
import ProfileDetails from '../../pages/profile/ProfileDetails';
import DeliveryZone from '../../pages/profile/DeliveryZone';
import Integrations from '../../pages/profile/Integrations';
import Chat from '../../pages/chat/Chat';
import Notification from '../../pages/notification/Notification';
import { ProtectedRoute } from '../Guard';
import BusinessDetails from '../../pages/profile/BuisnessDetails';
import DeliveryInformation from '../../pages/profile/DeliveryInformation';

export const profileRoutes = [
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Suspense>
          <Outlet />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'delivery-information',
        element: (
          <ProfileLayout>
            <DeliveryInformation />
          </ProfileLayout>
        ),
      },
      {
        // index: true,
        path: 'details',
        element: (
          <ProfileLayout>
            <ProfileDetails />
          </ProfileLayout>
        ),
      },
      {
        path: 'delivery-zones',
        element: (
          <ProfileLayout>
            <DeliveryZone />
          </ProfileLayout>
        ),
      },
      {
        path: 'business-details',
        element: (
          <ProfileLayout>
            <BusinessDetails />
          </ProfileLayout>
        ),
      },
      {
        path: 'integrations',
        element: (
          <ProfileLayout>
            <Integrations />
          </ProfileLayout>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProfileLayout showBlank>
            <Chat />
          </ProfileLayout>
        ),
      },
      {
        path: 'notification',
        element: (
          <ProfileLayout showBlank>
            <Notification />
          </ProfileLayout>
        ),
      },
    ],
  },
];
