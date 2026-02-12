import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthLayout from '../../layouts/Authlayout';
import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import ForgotPassword from '../../pages/auth/ForgotPassword';
import SetPassword from '../../pages/auth/SetPassword';
import ProfileSetup from '../../pages/auth/ProfileSetup';
import profileBg from '../../assets/profileBg.png';
import { PublicRoute } from '../Guard';
import { paths } from '../paths';
import CompleteRegistration from '../../pages/auth/CompleteRegistration';

export const authRoutes = [
  {
    path: '/auth',
    element: (
      <PublicRoute>
        <Suspense>
          <Outlet />
        </Suspense>
      </PublicRoute>
    ),
    children: [
      {
        path: 'login',
        element: (
          <AuthLayout
            link="Sign up"
            linkUrl={paths.auth.signup}
            linkText="Don’t have an account?"
          >
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: 'signup',
        element: (
          <AuthLayout
            link="Login"
            linkUrl={paths.auth.login}
            linkText="Already have an account?"
          >
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <AuthLayout
            link="Login"
            linkUrl={paths.auth.login}
            linkText="Already have an account?"
          >
            <ForgotPassword />
          </AuthLayout>
        ),
      },
      {
        path: 'set-password',
        element: (
          <AuthLayout
            link="Login"
            linkUrl={paths.auth.login}
            linkText="Already have an account?"
          >
            <SetPassword />
          </AuthLayout>
        ),
      },
      {
        path: 'profile-setup',
        element: (
          <AuthLayout
            link="Exit Setup"
            linkUrl={paths.auth.login}
            // linkText="Already have an account?"
            imageSrc={profileBg}
          >
            <ProfileSetup />
          </AuthLayout>
        ),
      },
      {
        path: 'complete-registration',
        element: (
          <AuthLayout
          // link="Login"
          // linkUrl={paths.restaurant.login}
          // linkText="Already have an account?"
          >
            <CompleteRegistration />
          </AuthLayout>
        ),
      },
    ],
  },
];
