const ROOTS = {
  AUTH: '/auth',
  RESTAURANT: '/restaurant',
  ADMIN: '/admin',
};

export const paths = {
  page404: '/404',
  auth: {
    login: `${ROOTS.AUTH}/login`,
    signup: `${ROOTS.AUTH}/signup`,
    profileSetup: `${ROOTS.AUTH}/profile-setup`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    resetPassword: `${ROOTS.AUTH}/set-password`,
    completeRegistration: `${ROOTS.AUTH}/complete-registration`,
  },
  subscription: '/subscription',
  orders: '/orders',
  trucks: '/trucks',
  drivers: '/drivers',
  products: '/products',
  invoices: '/invoices',
  restaurants: '/verify-restaurants',
  notification: '/profile/notification',
  chat: '/profile/chat',
  profileDetail: '/profile/details',
  businessDetail: '/profile/business-details',
  deliveryZones: '/profile/delivery-zones',
  integrations: '/profile/integrations',
  deliveryInformation: '/profile/delivery-information',
  
  // Admin paths
  admin: {
    root: ROOTS.ADMIN,
    dashboard: `${ROOTS.ADMIN}/dashboard`,
    users: `${ROOTS.ADMIN}/users`,
    restaurants: `${ROOTS.ADMIN}/restaurants`,
    suppliers: `${ROOTS.ADMIN}/suppliers`,
  },
};
