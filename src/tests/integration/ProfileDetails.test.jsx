import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, vi, describe, beforeEach, afterEach, test } from 'vitest';
import '@testing-library/jest-dom';
import ProfileDetails from '../../pages/profile/ProfileDetails'; // Update path as needed

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

vi.mock('../../services/auth.services', () => ({
  updateSupplierPersonalDetails: vi.fn(),
}));

vi.mock('../../utils/share', () => ({
  getLocalStorageItem: vi.fn(),
  setLocalStorageItem: vi.fn(),
}));

// Mock the components
vi.mock('../../common/componenets/UserForm', () => ({
  default: ({ formik, isEditing, onCancel, onEdit }) => (
    <div data-testid="user-form">
      <div>Is Editing: {isEditing ? 'Yes' : 'No'}</div>
      <form onSubmit={formik.handleSubmit}>
        <input
          data-testid="name-input"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <input
          data-testid="phone-input"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
        />
        <input
          data-testid="email-input"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
        />
        {isEditing ? (
          <>
            <button type="submit" data-testid="save-button">
              Save
            </button>
            <button
              type="button"
              data-testid="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        ) : (
          <button type="button" data-testid="edit-button" onClick={onEdit}>
            Edit
          </button>
        )}
      </form>
    </div>
  ),
}));

// Import mocked modules
import { toast } from 'react-toastify';
import * as authServices from '../../services/auth.services';
import * as shareUtils from '../../utils/share';

// Sample user data for tests
const mockUserData = {
  user: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
  },
};

describe('ProfileDetails Component Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mock responses
    shareUtils.getLocalStorageItem.mockReturnValue(mockUserData);
    authServices.updateSupplierPersonalDetails.mockResolvedValue({
      data: {
        data: {
          ...mockUserData,
          user: { ...mockUserData.user, name: 'John Updated' },
        },
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test Case 1: Component renders correctly in view mode
  test('renders profile details in view mode', async () => {
    render(<ProfileDetails />);

    // Check if form is rendered
    expect(screen.getByTestId('user-form')).toBeInTheDocument();
    expect(screen.getByText('Is Editing: No')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();

    // Check inputs are populated with initial values
    expect(screen.getByTestId('name-input').value).toBe('John Doe');
    expect(screen.getByTestId('email-input').value).toBe(
      'john.doe@example.com'
    );
    expect(screen.getByTestId('phone-input').value).toBe('1234567890');
  });

  // Test Case 2: Switches to edit mode
  test('switches to edit mode when edit button is clicked', async () => {
    render(<ProfileDetails />);

    // Click edit button
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Check if it switched to edit mode
    expect(screen.getByText('Is Editing: Yes')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  // Test Case 3: Successfully updates profile details
  test('successfully updates profile details', async () => {
    render(<ProfileDetails />);

    // Switch to edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Modify the name field
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Jane Doe' },
    });

    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Verify API call
    await waitFor(() => {
      expect(authServices.updateSupplierPersonalDetails).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Personal details updated successfully'
      );
      expect(shareUtils.setLocalStorageItem).toHaveBeenCalled();
    });

    // Should be back in view mode
    expect(screen.getByText('Is Editing: No')).toBeInTheDocument();
  });

  // Test Case 4: Handles API errors on submission
  test('handles API errors during form submission', async () => {
    // Mock API error
    const errorMessage = 'Failed to update personal details';
    authServices.updateSupplierPersonalDetails.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    render(<ProfileDetails />);

    // Switch to edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Verify error handling
    await waitFor(() => {
      expect(authServices.updateSupplierPersonalDetails).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  // Test Case 5: Handles API errors with generic message
  test('displays generic error message when API error has no message', async () => {
    // Mock API error without message
    authServices.updateSupplierPersonalDetails.mockRejectedValueOnce({
      response: {
        data: {},
      },
    });

    render(<ProfileDetails />);

    // Switch to edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Verify error handling with generic message
    await waitFor(() => {
      expect(authServices.updateSupplierPersonalDetails).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  // Test Case 6: Cancel button resets the form
  test('cancel button resets the form and returns to view mode', async () => {
    render(<ProfileDetails />);

    // Switch to edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Modify the name field
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Changed Name' },
    });

    // Click cancel button
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    // Should be back in view mode with original values
    expect(screen.getByText('Is Editing: No')).toBeInTheDocument();
    expect(screen.getByTestId('name-input').value).toBe('John Doe');
  });

  // Test Case 7: Handles missing user data
  test('handles missing user data', async () => {
    // Setup mock with missing user data
    shareUtils.getLocalStorageItem.mockReturnValue({});

    render(<ProfileDetails />);

    // Check inputs are initialized with empty strings
    expect(screen.getByTestId('name-input').value).toBe('');
    expect(screen.getByTestId('email-input').value).toBe('');
    expect(screen.getByTestId('phone-input').value).toBe('');
  });

  // Test Case 8: Re-initializes form after update
  test('re-initializes form with updated values after successful submission', async () => {
    // Set up updated user data to be returned from the API
    const updatedUserData = {
      user: {
        id: 'user-123',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210',
      },
    };

    authServices.updateSupplierPersonalDetails.mockResolvedValueOnce({
      data: {
        data: updatedUserData,
      },
    });

    render(<ProfileDetails />);

    // Switch to edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Modify fields
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Updated Name' },
    });

    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Verify API call and localStorage update
    await waitFor(() => {
      expect(authServices.updateSupplierPersonalDetails).toHaveBeenCalled();
      expect(shareUtils.setLocalStorageItem).toHaveBeenCalledWith(
        'user',
        updatedUserData
      );
    });
  });
});
