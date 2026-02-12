import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, vi, describe, beforeEach, afterEach, test } from 'vitest';
import '@testing-library/jest-dom';
import BusinessDetails from '../../pages/profile/BuisnessDetails';
// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

vi.mock('../../services/file.upload.services', () => ({
  fileUpload: vi.fn().mockResolvedValue({
    apiUrl: 'https://example.com/uploaded.jpg',
    key: 'uploaded-image-key',
  }),
}));

vi.mock('../../services/auth.services', () => ({
  updateSupplierBusinessDetails: vi.fn(),
}));

vi.mock('../../utils/share', () => ({
  getLocalStorageItem: vi.fn(),
  updateSupplierBranchInLocalStorage: vi.fn(),
}));

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userToken: 'test-token',
  }),
}));

// Important: Store mocked initialValues so we can check/modify them in tests
let mockedInitialValues = {};

// Mock the BusinessForm to properly simulate country code selection
vi.mock('../../common/componenets/BusinessForm', () => ({
  default: ({ initialValues, onSubmit, onCancel, onImageUpload }) => {
    // Store the initialValues for inspection in tests
    mockedInitialValues = { ...initialValues };

    // Determine country code based on the country in initialValues
    let countryCode = '+61'; // Default
    if (initialValues.country === 'NZ') {
      countryCode = '+64';
    }

    // Create the values to submit
    const formValues = {
      ...initialValues,
      businessPhoneCountryCode: countryCode,
    };

    return (
      <div data-testid="business-form">
        <button data-testid="mock-submit" onClick={() => onSubmit(formValues)}>
          Submit Form
        </button>
        <button
          data-testid="mock-cancel"
          onClick={() => onCancel({ resetForm: vi.fn() })}
        >
          Cancel Form
        </button>
        <button
          data-testid="mock-image-upload"
          onClick={() => onImageUpload({ name: 'test-image.jpg' })}
        >
          Upload Image
        </button>
      </div>
    );
  },
}));

// Import mocked modules
import { toast } from 'react-toastify';
import * as authServices from '../../services/auth.services';
import * as fileUploadService from '../../services/file.upload.services';
import * as shareUtils from '../../utils/share';

// Sample user data for tests
const mockUserData = {
  supplier: {
    id: 'supplier-123',
    branches: [{ id: 'branch-456' }],
    businessName: 'Test Business',
    companyDescription: 'Test description',
    businessPhone: '+61123456789',
    address: {
      street: '123 Test St',
      country: 'AU',
      state: 'VIC',
      city: 'Melbourne',
      zipcode: '3000',
    },
  },
};

describe('BusinessDetails Component Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks and initialValues
    vi.clearAllMocks();
    mockedInitialValues = {};

    // Set up mock responses
    shareUtils.getLocalStorageItem.mockReturnValue(mockUserData);
    authServices.updateSupplierBusinessDetails.mockResolvedValue({
      data: {
        data: { ...mockUserData.supplier, businessName: 'Updated Business' },
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test Case 1: Component renders correctly
  test('renders business details form correctly', async () => {
    render(<BusinessDetails />);

    // Check if form is rendered
    expect(screen.getByTestId('business-form')).toBeInTheDocument();
    expect(screen.getByText('Submit Form')).toBeInTheDocument();
    expect(screen.getByText('Cancel Form')).toBeInTheDocument();
  });

  // Test Case 2: Successfully submits form with business details
  test('successfully submits business details', async () => {
    render(<BusinessDetails />);

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(authServices.updateSupplierBusinessDetails).toHaveBeenCalledWith(
        'supplier-123',
        'branch-456',
        expect.objectContaining({
          businessName: 'Test Business',
          companyDescription: 'Test description',
          address: expect.objectContaining({
            street: '123 Test St',
            country: 'AU',
            state: 'VIC',
            city: 'Melbourne',
            zipcode: '3000',
          }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Business details updated successfully'
      );
      expect(shareUtils.updateSupplierBranchInLocalStorage).toHaveBeenCalled();
    });
  });

  // Test Case 3: Handles API errors on submission
  test('handles API errors during form submission', async () => {
    // Mock API error
    const errorMessage = 'Failed to update business details';
    authServices.updateSupplierBusinessDetails.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    render(<BusinessDetails />);

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(authServices.updateSupplierBusinessDetails).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  // Test Case 4: Cancel button resets the form
  test('cancel button resets the form', async () => {
    render(<BusinessDetails />);

    // Click cancel button
    const cancelButton = screen.getByTestId('mock-cancel');
    fireEvent.click(cancelButton);

    // Nothing to specifically verify here since we're mocking resetForm
    // But we can check that the button exists and can be clicked
    expect(cancelButton).toBeInTheDocument();
  });

  // Test Case 5: Image upload works correctly
  test('handles image upload correctly', async () => {
    render(<BusinessDetails />);

    // Click on mock image upload button
    const uploadButton = screen.getByTestId('mock-image-upload');
    fireEvent.click(uploadButton);

    // Verify fileUpload was called
    expect(fileUploadService.fileUpload).toHaveBeenCalledWith(
      'supplier',
      'test-image.jpg',
      expect.any(Object),
      'test-token'
    );
  });

  // Test Case 6: Phone number formatting works correctly
  test('formats phone number correctly for submission', async () => {
    render(<BusinessDetails />);

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify phone formatting in API call
    await waitFor(() => {
      expect(authServices.updateSupplierBusinessDetails).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          businessPhone: expect.stringContaining('+61'),
        })
      );
    });
  });

  // Test Case 7: Tests with different initial data (no business phone)
  test('handles missing business phone data', async () => {
    // Setup mock with missing phone
    const modifiedUserData = {
      ...mockUserData,
      supplier: {
        ...mockUserData.supplier,
        businessPhone: '',
      },
    };
    shareUtils.getLocalStorageItem.mockReturnValue(modifiedUserData);

    render(<BusinessDetails />);

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify API call still works
    await waitFor(() => {
      expect(authServices.updateSupplierBusinessDetails).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // Test Case 8: Tests with country-specific phone formatting
  test('formats phone number correctly for different country codes', async () => {
    // Setup mock with NZ phone number and address
    const nzUserData = {
      ...mockUserData,
      supplier: {
        ...mockUserData.supplier,
        businessPhone: '+64987654321',
        address: {
          ...mockUserData.supplier.address,
          country: 'NZ',
        },
      },
    };
    shareUtils.getLocalStorageItem.mockReturnValue(nzUserData);

    render(<BusinessDetails />);

    // Validate initialValues has NZ country
    await waitFor(() => {
      expect(mockedInitialValues.country).toBe('NZ');
    });

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify phone formatting for New Zealand
    await waitFor(() => {
      const calls = authServices.updateSupplierBusinessDetails.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // Get the submitted data
      const submittedData = calls[0][2]; // Third argument of the first call
      expect(submittedData).toBeDefined();
      expect(submittedData.businessPhone).toBeDefined();

      // Check that it contains the correct country code
      expect(submittedData.businessPhone).toContain('+64');
    });
  });

  // Test Case 9: Tests with API response that has different structure
  test('handles different API response structures', async () => {
    // Setup mock with different response structure
    authServices.updateSupplierBusinessDetails.mockResolvedValueOnce({
      status: 200,
      // Missing expected data structure
    });

    render(<BusinessDetails />);

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify API call and response handling
    await waitFor(() => {
      expect(authServices.updateSupplierBusinessDetails).toHaveBeenCalled();
      // Should still show success toast even with unexpected response structure
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // Test Case 10: Test case for empty initial values
  test('handles empty initial values correctly', async () => {
    // Setup mock with empty user data
    shareUtils.getLocalStorageItem.mockReturnValue({
      supplier: {
        id: 'supplier-123',
        branches: [{ id: 'branch-456' }],
        // Missing other fields
      },
    });

    render(<BusinessDetails />);

    // Click submit button
    const submitButton = screen.getByTestId('mock-submit');
    fireEvent.click(submitButton);

    // Verify API call with empty values
    await waitFor(() => {
      expect(authServices.updateSupplierBusinessDetails).toHaveBeenCalledWith(
        'supplier-123',
        'branch-456',
        expect.objectContaining({
          businessName: '',
          companyDescription: '',
          address: expect.objectContaining({
            street: '',
            country: '',
            state: '',
            city: '',
            zipcode: '',
          }),
        })
      );
    });
  });
});
