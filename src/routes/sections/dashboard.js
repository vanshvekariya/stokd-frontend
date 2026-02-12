import { Outlet } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { Suspense } from 'react';
import OrderList from '../../pages/orders/OrderList';
import ProductList from '../../pages/product/ProductList';
import TruckList from '../../pages/truck/TruckList';
import DriverList from '../../pages/driver/DriverList';
import { ProtectedRoute } from '../Guard';
import VerifyRestaurantList from '../../pages/Restaurants/VerifyRestaurantList';
import InvoiceList from '../../pages/invoice/InvoiceList';

export const dashboardRoutes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </MainLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        // index: true,
        path: '/',
        element: <OrderList />,
      },
      {
        // index: true,
        path: '/orders',
        element: <OrderList />,
      },
      {
        // index: true,
        path: '/products',
        element: <ProductList />,
      },

      {
        path: 'trucks',
        element: <TruckList />,
      },
      {
        path: 'drivers',
        element: <DriverList />,
      },
      {
        path: 'verify-restaurants',
        element: <VerifyRestaurantList />,
      },
      {
        path: 'invoices',
        element: <InvoiceList />,
      },
    ],
  },
];
