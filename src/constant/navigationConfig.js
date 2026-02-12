import { paths } from '../routes/paths';

export const navigationItems = [
  { name: 'Orders', path: paths.orders },
  // { name: 'Trucks', path: paths.trucks },
  // { name: 'Drivers', path: paths.drivers },
  { name: 'Restaurants', path: paths.restaurants },
  { name: 'Products', path: paths.products },
  { name: 'Invoices', path: paths.invoices },
];


export const adminNavigationItems = [
  { name: 'Dashboard', path: paths.admin.dashboard },
  { name: 'Users', path: paths.admin.users },
  { name: 'Restaurants', path: paths.admin.restaurants },
  { name: 'Suppliers', path: paths.admin.suppliers },
];
