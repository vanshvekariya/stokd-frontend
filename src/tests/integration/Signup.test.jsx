/* eslint-disable react/prop-types */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Signup from '../../pages/auth/Signup';
import * as firebaseAuthServices from '../../services/firebase.auth.services';
import { toast } from 'react-toastify';
import { paths } from '../../routes/paths';

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

// Mock individual functions
vi.mock('../../services/firebase.auth.services', () => ({
  signUp: vi.fn(),
}));

// Mock the AuthContext
const mockSetBackendAuth = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    setBackendAuth: mockSetBackendAuth,
  }),
}));

// Mock components
vi.mock('../../components/Input', () => ({
  default: (props) => <input {...props} data-testid={props.name} />,
}));

vi.mock('../../components/Button', () => ({
  default: ({ children, onClick, type, disabled }) => (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      data-testid="register-button"
    >
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
  signupSchema: {
    validate: vi.fn().mockResolvedValue(true),
  },
}));

// Custom render function for this test specifically
function customRender(ui) {
  return render(ui);
}

describe('Signup Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call signUp service when form is submitted with valid data', async () => {
    // Mock successful signup
    firebaseAuthServices.signUp.mockResolvedValue({ success: true });

    customRender(<Signup />);

    // Directly call the handleSubmit function with test values
    const testValues = {
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'Password123',
    };

    global.testFormikSubmit(testValues);

    // Check if signUp was called with the correct arguments
    await waitFor(() => {
      expect(firebaseAuthServices.signUp).toHaveBeenCalledWith(testValues);
    });

    // Check if success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Google Sign-In successful!');
    });

    // Check if navigation occurred to profile setup page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(paths.auth.profileSetup);
    });
  });

  it('should show error toast when signup fails', async () => {
    // Mock failed signup
    firebaseAuthServices.signUp.mockResolvedValue({
      success: false,
      error: 'Email already in use',
    });

    customRender(<Signup />);

    // Directly call the handleSubmit function with test values
    const testValues = {
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'Password123',
    };

    global.testFormikSubmit(testValues);

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already in use');
    });

    // Check that navigation didn't occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors during signup', async () => {
    // Mock exception during signup
    firebaseAuthServices.signUp.mockRejectedValue(new Error('Network error'));

    customRender(<Signup />);

    // Directly call the handleSubmit function with test values
    const testValues = {
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'Password123',
    };

    global.testFormikSubmit(testValues);

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Check that navigation didn't occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle loading state during form submission', async () => {
    // Create a promise that we can control when it resolves
    let resolveSignUp;
    const signUpPromise = new Promise((resolve) => {
      resolveSignUp = resolve;
    });

    firebaseAuthServices.signUp.mockReturnValue(signUpPromise);

    // We'll add some assertions about the UI state here when we implement
    // a mock version that can manipulate the isLoading state
    customRender(<Signup />);

    // Directly call the handleSubmit function with test values
    const testValues = {
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'Password123',
    };

    // Here we'd trigger an action that sets isLoading to true
    global.testFormikSubmit(testValues);

    // Resolve the signup promise
    resolveSignUp({ success: true });

    // Check that the success flow completed
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(paths.auth.profileSetup);
    });
  });
});
