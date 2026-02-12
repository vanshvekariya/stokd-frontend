/* eslint-disable react/prop-types */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import Login from '../../pages/auth/Login';
import * as firebaseAuthServices from '../../services/firebase.auth.services';
import * as authServices from '../../services/auth.services';
import * as shareUtils from '../../utils/share';
import { toast } from 'react-toastify';
import { paths } from '../../routes/paths';
import { render } from '@testing-library/react';

// Mock dependencies
const mockNavigate = vi.fn();

// We need to mock react-router-dom before importing the render-utils
vi.mock('react-router-dom', () => {
  return {
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => <div>{children}</div>,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock individual functions instead of entire modules
vi.mock('../../services/firebase.auth.services', () => ({
  signIn: vi.fn(),
}));

vi.mock('../../services/auth.services', () => ({
  login: vi.fn(),
  me: vi.fn(),
}));

vi.mock('../../utils/share', () => ({
  commonLogoutFunc: vi.fn(),
  setLocalStorageItem: vi.fn(),
}));

// Mock the AuthContext
const mockSetBackendAuth = vi.fn();
const mockRefreshToken = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    setBackendAuth: mockSetBackendAuth,
    refreshToken: mockRefreshToken,
  }),
}));

// Mock components
vi.mock('../../components/Input', () => ({
  default: (props) => <input {...props} data-testid={props.name} />,
}));

vi.mock('../../components/Button', () => ({
  default: ({ children, onClick, type }) => (
    <button onClick={onClick} type={type} data-testid="login-button">
      {children}
    </button>
  ),
}));

vi.mock('../../pages/auth/SocialLogin', () => ({
  default: () => <div data-testid="social-login">Social Login Component</div>,
}));

// Mock formik
vi.mock('formik', () => {
  const actual = vi.importActual('formik');
  return {
    ...actual,
    useFormik: ({ initialValues, onSubmit }) => {
      // Store onSubmit for test access
      vi.stubGlobal('testFormikSubmit', onSubmit);

      return {
        values: initialValues,
        errors: {},
        touched: {},
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        handleSubmit: vi.fn((e) => {
          if (e && e.preventDefault) e.preventDefault();
          return onSubmit(initialValues);
        }),
        isSubmitting: false,
      };
    },
  };
});

// Set up mock for validation schema
vi.mock('../../common/validation', () => ({
  loginSchema: {
    validate: vi.fn().mockResolvedValue(true),
  },
}));

// Custom render function for this test specifically
function customRender(ui) {
  return render(ui);
}

// Set up all the tests
describe('Login Component API and Navigation Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('successfully logs in and redirects to orders page', async () => {
    // Mock successful Firebase authentication
    firebaseAuthServices.signIn.mockResolvedValue({
      success: true,
      token: 'firebase-token-123',
    });

    // Mock successful backend authentication
    authServices.login.mockResolvedValue({
      status: 200,
      data: { data: { requiresRefresh: false } },
    });

    // Mock successful user data fetch
    authServices.me.mockResolvedValue({
      data: { data: { id: 1, name: 'Test User', email: 'test@example.com' } },
    });

    customRender(<Login />);

    // Directly call the handleSubmit function with test values
    const testValues = { email: 'test@example.com', password: 'password123' };
    global.testFormikSubmit(testValues);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if Firebase auth was called with correct credentials
      expect(firebaseAuthServices.signIn).toHaveBeenCalledWith(testValues);

      // Check if backend auth was called with Firebase token
      expect(authServices.login).toHaveBeenCalledWith({
        idToken: 'firebase-token-123',
      });

      // Check if local storage was updated
      expect(shareUtils.setLocalStorageItem).toHaveBeenCalledWith(
        'isLoggedIn',
        true
      );
      expect(shareUtils.setLocalStorageItem).toHaveBeenCalledWith(
        'user',
        expect.any(Object)
      );

      // Check if auth context was updated
      expect(mockSetBackendAuth).toHaveBeenCalledWith(true);

      // Check if success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        'User logged in successfully!'
      );

      // Check if navigation occurred to orders page
      expect(mockNavigate).toHaveBeenCalledWith(paths.orders);
    });
  });

  it('handles Firebase authentication failure with proper error message', async () => {
    // Mock failed Firebase authentication
    firebaseAuthServices.signIn.mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });

    customRender(<Login />);

    // Directly call the handleSubmit function with test values
    const testValues = {
      email: 'test@example.com',
      password: 'wrong-password',
    };
    global.testFormikSubmit(testValues);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if the error toast was shown
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password');

      // Check that backend login was not called
      expect(authServices.login).not.toHaveBeenCalled();

      // Check that navigation didn't occur
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles backend authentication failure properly', async () => {
    // Mock successful Firebase authentication
    firebaseAuthServices.signIn.mockResolvedValue({
      success: true,
      token: 'firebase-token-123',
    });

    // Mock failed backend authentication
    authServices.login.mockResolvedValue({
      status: 401,
    });

    customRender(<Login />);

    // Directly call the handleSubmit function with test values
    const testValues = { email: 'test@example.com', password: 'password123' };
    global.testFormikSubmit(testValues);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if logout function was called
      expect(shareUtils.commonLogoutFunc).toHaveBeenCalled();

      // Check if the error toast was shown
      expect(toast.error).toHaveBeenCalledWith(
        'Authentication failed with the server.'
      );

      // Check that navigation didn't occur
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('performs token refresh when required', async () => {
    // Mock successful Firebase authentication
    firebaseAuthServices.signIn.mockResolvedValue({
      success: true,
      token: 'firebase-token-123',
    });

    // Mock successful backend authentication with refresh required
    authServices.login.mockResolvedValue({
      status: 200,
      data: {
        data: {
          requiresRefresh: true,
        },
      },
    });

    // Mock successful user data fetch
    authServices.me.mockResolvedValue({
      data: {
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    });

    customRender(<Login />);

    // Directly call the handleSubmit function with test values
    const testValues = { email: 'test@example.com', password: 'password123' };
    global.testFormikSubmit(testValues);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if refresh token was called
      expect(mockRefreshToken).toHaveBeenCalled();

      // Check if the success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        'User logged in successfully!'
      );

      // Check if navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith(paths.orders);
    });
  });

  it('redirects to profile setup when user has no supplier account', async () => {
    // Mock successful Firebase authentication
    firebaseAuthServices.signIn.mockResolvedValue({
      success: true,
      token: 'firebase-token-123',
    });

    // Mock backend error for missing supplier account
    authServices.login.mockRejectedValue({
      response: {
        data: {
          message: `Supplier login failed: User doesn't have a supplier account. Please create a supplier first.`,
        },
      },
    });

    customRender(<Login />);

    // Directly call the handleSubmit function with test values
    const testValues = { email: 'test@example.com', password: 'password123' };
    global.testFormikSubmit(testValues);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if navigation to profile setup occurred
      expect(mockNavigate).toHaveBeenCalledWith(paths.auth.profileSetup);

      // Check that appropriate error toast was shown
      expect(toast.error).toHaveBeenCalledWith(
        `Supplier login failed: User doesn't have a supplier account. Please create a supplier first.`
      );
    });
  });

  it('displays generic error message for unexpected errors', async () => {
    // Mock successful Firebase authentication
    firebaseAuthServices.signIn.mockResolvedValue({
      success: true,
      token: 'firebase-token-123',
    });

    // Mock unexpected backend error
    authServices.login.mockRejectedValue({
      response: {
        data: {},
      },
    });

    customRender(<Login />);

    // Directly call the handleSubmit function with test values
    const testValues = { email: 'test@example.com', password: 'password123' };
    global.testFormikSubmit(testValues);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check that appropriate error toast was shown
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });
});
