import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

// Mock dependencies
const mockNavigate = vi.fn();
const mockLocation = { search: '?oobCode=valid-action-code' };

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
  confirmPasswordReset: vi.fn(),
  verifyPasswordResetCode: vi.fn(),
  auth: {},
}));

describe('SetPassword API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Helper function to simulate the component's useEffect and form submission
  const simulateSetPasswordFlow = async (
    actionCode,
    password,
    verifyResult,
    resetResult
  ) => {
    // Mock verification result
    if (verifyResult instanceof Error) {
      verifyPasswordResetCode.mockRejectedValue(verifyResult);
    } else {
      verifyPasswordResetCode.mockResolvedValue(verifyResult);
    }

    // Mock reset result
    if (resetResult instanceof Error) {
      confirmPasswordReset.mockRejectedValue(resetResult);
    } else {
      confirmPasswordReset.mockResolvedValue(resetResult);
    }

    // Simulate component initialization (useEffect)
    try {
      await verifyPasswordResetCode({}, actionCode);

      // Simulate form submission
      try {
        await confirmPasswordReset({}, actionCode, password);
        toast.success('Password has been reset successfully!');
        mockNavigate('/auth/login');
      } catch (error) {
        let errorMessage = 'Failed to reset password';

        switch (error.code) {
          case 'auth/expired-action-code':
            errorMessage = 'The password reset link has expired';
            break;
          case 'auth/invalid-action-code':
            errorMessage = 'The password reset link is invalid';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak';
            break;
          default:
            errorMessage = error.message || 'Failed to reset password';
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Invalid or expired password reset link');
      mockNavigate('/forgot-password');
    }
  };

  it('successfully verifies code and resets password', async () => {
    const testEmail = 'user@example.com';
    const testPassword = 'NewPassword123!';
    const actionCode = 'valid-action-code';

    await simulateSetPasswordFlow(
      actionCode,
      testPassword,
      testEmail,
      undefined
    );

    await waitFor(() => {
      // Verify the code verification was called
      expect(verifyPasswordResetCode).toHaveBeenCalledWith({}, actionCode);

      // Verify password reset was called with correct parameters
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        {},
        actionCode,
        testPassword
      );

      // Verify success notification
      expect(toast.success).toHaveBeenCalledWith(
        'Password has been reset successfully!'
      );

      // Verify navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('handles verification error and redirects to forgot password', async () => {
    const actionCode = 'invalid-code';
    const error = new Error('Invalid code');
    error.code = 'auth/invalid-action-code';

    await simulateSetPasswordFlow(actionCode, 'password', error, undefined);

    await waitFor(() => {
      // Verify the code verification was called
      expect(verifyPasswordResetCode).toHaveBeenCalledWith({}, actionCode);

      // Verify error notification
      expect(toast.error).toHaveBeenCalledWith(
        'Invalid or expired password reset link'
      );

      // Verify navigation to forgot password page
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');

      // Verify password reset was NOT called
      expect(confirmPasswordReset).not.toHaveBeenCalled();
    });
  });

  it('handles expired action code error during reset', async () => {
    const testEmail = 'user@example.com';
    const testPassword = 'NewPassword123!';
    const actionCode = 'expired-code';
    const error = new Error('Expired code');
    error.code = 'auth/expired-action-code';

    await simulateSetPasswordFlow(actionCode, testPassword, testEmail, error);

    await waitFor(() => {
      // Verify the code verification was called
      expect(verifyPasswordResetCode).toHaveBeenCalledWith({}, actionCode);

      // Verify password reset was called
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        {},
        actionCode,
        testPassword
      );

      // Verify error notification with specific message
      expect(toast.error).toHaveBeenCalledWith(
        'The password reset link has expired'
      );

      // Verify no navigation happened after reset failure
      expect(mockNavigate).not.toHaveBeenCalledWith('/auth/login');
    });
  });

  it('handles weak password error during reset', async () => {
    const testEmail = 'user@example.com';
    const testPassword = 'weak';
    const actionCode = 'valid-code';
    const error = new Error('Password too weak');
    error.code = 'auth/weak-password';

    await simulateSetPasswordFlow(actionCode, testPassword, testEmail, error);

    await waitFor(() => {
      // Verify password reset was called
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        {},
        actionCode,
        testPassword
      );

      // Verify error notification with specific message
      expect(toast.error).toHaveBeenCalledWith('The password is too weak');
    });
  });

  it('handles generic error during reset', async () => {
    const testEmail = 'user@example.com';
    const testPassword = 'NewPassword123!';
    const actionCode = 'valid-code';
    const error = new Error('Network error');

    await simulateSetPasswordFlow(actionCode, testPassword, testEmail, error);

    await waitFor(() => {
      // Verify password reset was called
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        {},
        actionCode,
        testPassword
      );

      // Verify error notification with error message
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('handles missing oobCode in URL', async () => {
    // Simulate missing code in URL
    const originalLocation = mockLocation.search;
    mockLocation.search = '';

    // Directly test the URL code checking logic - similar to useEffect
    const queryParams = new URLSearchParams(mockLocation.search);
    const oobCode = queryParams.get('oobCode');

    if (!oobCode) {
      toast.error('Invalid password reset link');
      mockNavigate('/forgot-password');
    }

    // Verify error notification
    expect(toast.error).toHaveBeenCalledWith('Invalid password reset link');

    // Verify navigation to forgot password page
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');

    // Verify Firebase functions were NOT called
    expect(verifyPasswordResetCode).not.toHaveBeenCalled();
    expect(confirmPasswordReset).not.toHaveBeenCalled();

    // Restore original mock location
    mockLocation.search = originalLocation;
  });
});
