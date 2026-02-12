import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderList from '../../pages/orders/OrderList';
import {
  getAllOrders,
  getOrderById,
  orderAction,
} from '../../services/order.services';
import { toast } from 'react-toastify';
import React from 'react';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userToken: 'mock-token',
    user: {
      id: 1,
      name: 'Test User',
      countryId: 1,
    },
  }),
}));

// Mock the required modules and functions
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/order.services', () => ({
  getAllOrders: vi.fn(),
  getOrderById: vi.fn(),
  orderAction: vi.fn(),
}));

vi.mock('../../utils/share', () => ({
  getSupplierId: vi.fn(() => 'supplier-123'),
}));

// For testing the drawer opening/closing
let mockDrawerIsOpen = false;

// Mock the components used in OrderList
vi.mock('../../components/Table', () => ({
  default: vi.fn(({ columns, getData, onRowClick, ref }) => {
    // Store the ref for testing
    if (ref) {
      ref.current = {
        resetPage: vi.fn(),
        reFetchData: vi.fn(),
      };
    }

    return (
      <div data-testid="mock-table">
        <button
          data-testid="refetch-data-btn"
          onClick={() => ref?.current?.reFetchData()}
        >
          Refetch Data
        </button>
        <button
          data-testid="row-click-btn"
          onClick={() => {
            // Simulate clicking on a row
            onRowClick({ id: 1, status: 'PENDING' });
          }}
        >
          Click Row
        </button>
      </div>
    );
  }),
}));

vi.mock('../../components/Heading', () => ({
  default: vi.fn(({ title }) => (
    <div data-testid="mock-page-header">
      <h1>{title}</h1>
    </div>
  )),
}));

// Mock the Drawer component
vi.mock('../../components/Drawer', () => {
  return {
    default: vi.fn(({ isOpen, onClose, title, children, footerContent }) => {
      // Save the open state for testing
      mockDrawerIsOpen = isOpen;

      if (!isOpen) return null;

      return (
        <div data-testid="drawer-component">
          <div className="drawer-header">
            <div>{title}</div>
            <button data-testid="drawer-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
          <div className="drawer-content">{children}</div>
          <div className="drawer-footer">{footerContent}</div>
        </div>
      );
    }),
  };
});

// Mock the Button component
vi.mock('../../components/Button', () => ({
  default: vi.fn(({ children, onClick, variant, disabled }) => (
    <button
      data-testid={`${children?.toString().toLowerCase().replace(/\s+/g, '-')}-btn`}
      onClick={onClick}
      className={`mock-button mock-button-${variant}`}
      disabled={disabled}
    >
      {children}
    </button>
  )),
}));

// Mock the Chip component
vi.mock('../../components/Chip', () => ({
  default: vi.fn(({ text, variant }) => (
    <div className={`mock-chip mock-chip-${variant}`}>{text}</div>
  )),
}));

describe('OrderList Component', () => {
  const mockSupplierId = 'supplier-123';
  const mockOrders = {
    data: {
      data: {
        items: [
          { id: 1, status: 'PENDING' },
          { id: 2, status: 'ACCEPTED' },
        ],
        totalCount: 2,
      },
    },
  };

  const mockOrderDetails = {
    data: {
      data: {
        id: 1,
        orderNumber: 'ORD123',
        status: 'PENDING',
        branch: { branchName: 'Test Branch' },
        orderItems: [
          {
            productName: 'Test Product',
            quantity: 5,
            unitPrice: 10,
            stock: 20,
          },
        ],
      },
    },
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockDrawerIsOpen = false;

    // Setup default mocks
    getAllOrders.mockResolvedValue(mockOrders);
    getOrderById.mockResolvedValue(mockOrderDetails);
    orderAction.mockResolvedValue({
      data: { message: 'Order action successful' },
    });
  });

  it('renders the component correctly', () => {
    render(<OrderList />);

    // Check for page header
    expect(screen.getByText('Orders')).toBeInTheDocument();

    // Check for table
    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('loads order details when a row is clicked', async () => {
    render(<OrderList />);

    // Click on a row
    fireEvent.click(screen.getByTestId('row-click-btn'));

    // Check if the API was called with correct parameters
    expect(getOrderById).toHaveBeenCalledWith(mockSupplierId, 1);

    // Check if the drawer is open
    await waitFor(() => {
      expect(mockDrawerIsOpen).toBe(true);
    });

    // Check if drawer component is rendered
    expect(screen.getByTestId('drawer-component')).toBeInTheDocument();
  });

  it('handles API error when loading order details', async () => {
    // Mock API error
    const errorMessage = 'Error loading order details';
    getOrderById.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<OrderList />);

    // Click on a row
    fireEvent.click(screen.getByTestId('row-click-btn'));

    // Check if the error toast was displayed
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('calls orderAction with ACCEPT when Accept button is clicked', async () => {
    // Mock successful order action
    orderAction.mockResolvedValueOnce({
      data: { message: 'Order accepted successfully' },
    });

    const { container } = render(<OrderList />);

    // Click on a row to open drawer
    fireEvent.click(screen.getByTestId('row-click-btn'));

    // Wait for drawer to be visible
    await waitFor(() => {
      expect(screen.getByTestId('drawer-component')).toBeInTheDocument();
    });

    // Find all buttons in the footer and click the one that says "Accept"
    const acceptButton = screen.getByTestId('accept-btn');
    fireEvent.click(acceptButton);

    // Check if the correct API call was made
    await waitFor(() => {
      expect(orderAction).toHaveBeenCalledWith(mockSupplierId, 1, {
        action: 'ACCEPT',
      });
    });

    // Wait for the success toast (the test will pass once the mock is called)
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('handles rejection with reason input', async () => {
    render(<OrderList />);

    // Click on a row to open drawer
    fireEvent.click(screen.getByTestId('row-click-btn'));

    // Wait for drawer to be visible
    await waitFor(() => {
      expect(screen.getByTestId('drawer-component')).toBeInTheDocument();
    });

    // Find the reject button in the footer
    const rejectButton = screen.getByTestId('reject-btn');
    fireEvent.click(rejectButton);

    // Now the textarea should be visible and we should be able to enter text
    // Find the textarea by its placeholder text
    const textarea = screen.getByPlaceholderText(/Please provide a reason/i);
    fireEvent.change(textarea, { target: { value: 'Out of stock' } });

    // Find and click the confirm reject button
    const confirmButton = screen.getByTestId('confirm-reject-btn');
    fireEvent.click(confirmButton);

    // Check if the API was called with the correct parameters
    await waitFor(() => {
      expect(orderAction).toHaveBeenCalledWith(mockSupplierId, 1, {
        action: 'REJECT',
        reason: 'Out of stock',
      });
    });

    // Check for success toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('handles API error when rejecting an order', async () => {
    // Mock API error
    const errorMessage = 'Error rejecting order';
    orderAction.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<OrderList />);

    // Click on a row to open drawer
    fireEvent.click(screen.getByTestId('row-click-btn'));

    // Wait for drawer to be visible
    await waitFor(() => {
      expect(screen.getByTestId('drawer-component')).toBeInTheDocument();
    });

    // Find the reject button and click it
    const rejectButton = screen.getByTestId('reject-btn');
    fireEvent.click(rejectButton);

    // Enter rejection reason
    const textarea = screen.getByPlaceholderText(/Please provide a reason/i);
    fireEvent.change(textarea, { target: { value: 'Out of stock' } });

    // Find and click the confirm reject button
    const confirmButton = screen.getByTestId('confirm-reject-btn');
    fireEvent.click(confirmButton);

    // Check if API was called correctly
    await waitFor(() => {
      expect(orderAction).toHaveBeenCalled();
    });

    // Wait for error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('closes the drawer when close button is clicked', async () => {
    render(<OrderList />);

    // Click on a row to open drawer
    fireEvent.click(screen.getByTestId('row-click-btn'));

    // Wait for drawer to be visible
    await waitFor(() => {
      expect(screen.getByTestId('drawer-component')).toBeInTheDocument();
    });

    // Find and click the Close button
    const closeButton = screen.getByTestId('drawer-close-btn');
    fireEvent.click(closeButton);

    // Check if drawer is closed
    expect(mockDrawerIsOpen).toBe(false);
  });
});
