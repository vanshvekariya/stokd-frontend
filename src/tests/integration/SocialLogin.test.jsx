import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SocialLogin from '../../pages/auth/SocialLogin';
import * as firebaseAuthServices from '../../services/firebase.auth.services';
import * as authServices from '../../services/auth.services';
import * as shareUtils from '../../utils/share';
import { toast } from 'react-toastify';
import { paths } from '../../routes/paths';

// Mock dependencies
const mockNavigate = vi.fn();
const mockSetIsLoading = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock firebase auth services
vi.mock('../../services/firebase.auth.services', () => ({
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
}));

// Mock auth services
vi.mock('../../services/auth.services', () => ({
  login: vi.fn(),
  me: vi.fn(),
}));

// Mock utils
vi.mock('../../utils/share', () => ({
  commonLogoutFunc: vi.fn(),
  setLocalStorageItem: vi.fn(),
}));

// Mock AuthContext
const mockSetBackendAuth = vi.fn();
const mockRefreshToken = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    setBackendAuth: mockSetBackendAuth,
    refreshToken: mockRefreshToken,
  }),
}));

// Helper function to render SocialLogin component
const renderSocialLogin = () => {
  return render(
    <SocialLogin isLoading={false} setIsLoading={mockSetIsLoading} />
  );
};

describe('SocialLogin Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders all social login buttons correctly', () => {
    renderSocialLogin();

    // Check that all buttons are rendered
    expect(screen.getByAltText('Google')).toBeInTheDocument();
    expect(screen.getByAltText('Facebook')).toBeInTheDocument();
    expect(screen.getByAltText('Apple')).toBeInTheDocument();

    // Check that Facebook button is disabled
    const facebookButton = screen.getByAltText('Facebook').closest('button');
    expect(facebookButton).toBeDisabled();
  });

  it('successfully logs in with Google and redirects', async () => {
    // Set up mocks for successful flow
    firebaseAuthServices.signInWithGoogle.mockResolvedValue({
      success: true,
      token: 'google-token-123',
    });

    authServices.login.mockResolvedValue({
      status: 200,
      data: { data: { requiresRefresh: false } },
    });

    authServices.me.mockResolvedValue({
      data: { data: { id: 1, name: 'Test User', email: 'test@example.com' } },
    });

    renderSocialLogin();

    // Click Google login button
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);

    // Check loading state was set
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);

    // Wait for async flow to complete
    await waitFor(() => {
      // Check if Firebase auth was called
      expect(firebaseAuthServices.signInWithGoogle).toHaveBeenCalled();

      // Check if backend auth was called with token
      expect(authServices.login).toHaveBeenCalledWith({
        idToken: 'google-token-123',
      });

      // Verify local storage was updated
      expect(shareUtils.setLocalStorageItem).toHaveBeenCalledWith(
        'isLoggedIn',
        true
      );

      expect(shareUtils.setLocalStorageItem).toHaveBeenCalledWith(
        'user',
        expect.any(Object)
      );

      // Verify auth context was updated
      expect(mockSetBackendAuth).toHaveBeenCalledWith(true);

      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        'User logged in successfully!'
      );

      // Verify navigation to orders page
      expect(mockNavigate).toHaveBeenCalledWith(paths.orders);

      // Verify loading state was reset
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('successfully logs in with Apple and redirects', async () => {
    // Set up mocks for successful flow
    firebaseAuthServices.signInWithApple.mockResolvedValue({
      success: true,
      token: 'apple-token-456',
    });

    authServices.login.mockResolvedValue({
      status: 200,
      data: { data: { requiresRefresh: false } },
    });

    authServices.me.mockResolvedValue({
      data: { data: { id: 1, name: 'Test User', email: 'test@example.com' } },
    });

    renderSocialLogin();

    // Click Apple login button
    const appleButton = screen.getByAltText('Apple').closest('button');
    fireEvent.click(appleButton);

    // Wait for async flow to complete
    await waitFor(() => {
      // Check if Firebase auth was called
      expect(firebaseAuthServices.signInWithApple).toHaveBeenCalled();

      // Check if backend auth was called with token
      expect(authServices.login).toHaveBeenCalledWith({
        idToken: 'apple-token-456',
      });

      // Verify toast was shown
      expect(toast.success).toHaveBeenCalledWith('Apple Sign-In successful!');

      // Verify navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith(paths.orders);
    });
  });

  it('handles token refresh when required with Google login', async () => {
    // Set up mocks for flow requiring token refresh
    firebaseAuthServices.signInWithGoogle.mockResolvedValue({
      success: true,
      token: 'google-token-123',
    });

    authServices.login.mockResolvedValue({
      status: 200,
      data: { data: { requiresRefresh: true } },
    });

    authServices.me.mockResolvedValue({
      data: { data: { id: 1, name: 'Test User', email: 'test@example.com' } },
    });

    renderSocialLogin();

    // Click Google login button
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);

    // Wait for async flow to complete
    await waitFor(() => {
      // Verify refresh token was called
      expect(mockRefreshToken).toHaveBeenCalled();

      // Verify navigation still occurred
      expect(mockNavigate).toHaveBeenCalledWith(paths.orders);
    });
  });

  it('handles backend authentication failure with Google login', async () => {
    // Set up mocks for flow with backend auth failure
    firebaseAuthServices.signInWithGoogle.mockResolvedValue({
      success: true,
      token: 'google-token-123',
    });

    authServices.login.mockResolvedValue({
      status: 401, // Unauthorized status
    });

    renderSocialLogin();

    // Click Google login button
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);

    // Wait for async flow to complete
    await waitFor(() => {
      // Verify logout was called
      expect(shareUtils.commonLogoutFunc).toHaveBeenCalled();

      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith(
        'Authentication failed with the server.'
      );

      // Verify navigation did not occur
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('redirects to profile setup when user has no supplier account with Google login', async () => {
    // Set up mocks for flow with missing supplier account
    firebaseAuthServices.signInWithGoogle.mockResolvedValue({
      success: true,
      token: 'google-token-123',
    });

    authServices.login.mockRejectedValue({
      response: {
        data: {
          message: `Supplier login failed: User doesn't have a supplier account. Please create a supplier first.`,
        },
      },
    });

    renderSocialLogin();

    // Click Google login button
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);

    // Wait for async flow to complete
    await waitFor(() => {
      // Verify correct toast message was shown
      expect(toast.error).toHaveBeenCalledWith(
        'Please setup your profile first'
      );

      // Verify navigation to profile setup
      expect(mockNavigate).toHaveBeenCalledWith(paths.auth.profileSetup);
    });
  });

  it('handles Google login failure', async () => {
    // Set up mocks for Google auth failure
    firebaseAuthServices.signInWithGoogle.mockResolvedValue({
      success: false,
      error: 'Google authentication failed',
    });

    renderSocialLogin();

    // Click Google login button
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);

    // Wait for async flow to complete
    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith('Google authentication failed');

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();

      // Verify loading state was reset
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles generic error during Google login', async () => {
    // Set up mocks for unexpected error during Google login
    const networkError = new Error('Network error');
    firebaseAuthServices.signInWithGoogle.mockRejectedValue(networkError);

    renderSocialLogin();

    // Click Google login button
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);

    // Wait for async flow to complete
    await waitFor(() => {
      // Verify error toast was shown with the error object
      // This matches the actual implementation: toast.error(error ?? 'An unexpected error occurred')
      expect(toast.error).toHaveBeenCalledWith(networkError);

      // Verify loading state was reset
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('disables buttons during loading state', () => {
    // Render with loading state true
    render(<SocialLogin isLoading={true} setIsLoading={mockSetIsLoading} />);

    // Verify buttons are disabled
    const googleButton = screen.getByAltText('Google').closest('button');
    const appleButton = screen.getByAltText('Apple').closest('button');

    expect(googleButton).toBeDisabled();
    expect(appleButton).toBeDisabled();
  });
});
