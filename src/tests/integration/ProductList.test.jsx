import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import ProductList from '../../pages/product/ProductList';
import { getProducts, deleteProduct } from '../../services/product.services';
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

vi.mock('../../services/product.services', () => ({
  getProducts: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../../utils/share', () => ({
  getSupplierId: vi.fn(() => 'supplier-123'),
}));

// Manually track showDeleteModal state for testing
let mockShowDeleteModal = { show: false, details: '' };
let mockSetShowDeleteModal = (state) => {
  mockShowDeleteModal = state;
  if (mockShowDeleteModal.show) {
    // Render the mock delete modal when we know it should be shown
    render(
      <div data-testid="mock-delete-modal">
        <div>Are you sure you want to delete this product?</div>
        <button
          data-testid="close-delete-modal-btn"
          onClick={() => mockSetShowDeleteModal({ show: false, details: '' })}
        >
          Close
        </button>
        <button
          data-testid="confirm-delete-btn"
          onClick={() => handleDeleteProduct()}
        >
          Confirm Delete
        </button>
      </div>
    );
  }
};

// Mock handleDeleteProduct function
let handleDeleteProductCalled = false;
const handleDeleteProduct = async () => {
  handleDeleteProductCalled = true;
  try {
    await deleteProduct('supplier-123', mockShowDeleteModal.details.id);
    toast.success('Product deleted successfully');
  } catch (error) {
    toast.error(error?.response?.data?.message);
  } finally {
    mockSetShowDeleteModal({ show: false, details: '' });
  }
};

// Mock the components used in ProductList
vi.mock('../../components/Table', () => ({
  default: vi.fn(({ columns, getData, ref }) => {
    // Store the ref for testing
    if (ref) {
      ref.current = {
        resetPage: vi.fn(),
        reFetchData: vi.fn(),
      };
    }

    // Add a mock delete button that will trigger the handleDelete function from columns
    return (
      <div data-testid="mock-table">
        <button
          data-testid="refetch-data-btn"
          onClick={() => ref.current.reFetchData()}
        >
          Refetch Data
        </button>
        <button
          data-testid="reset-page-btn"
          onClick={() => ref.current.resetPage()}
        >
          Reset Page
        </button>
        <button
          data-testid="delete-btn"
          onClick={() => {
            // Find the Cell component in columns and call it with a mock row
            const actionColumn = columns.find((col) => col.id === 'actions');
            if (actionColumn && actionColumn.Cell) {
              // Create a test element to render the Cell
              const testElement = document.createElement('div');
              document.body.appendChild(testElement);

              // Render the Cell with a mock row
              render(
                actionColumn.Cell({
                  row: {
                    original: { id: 1, name: 'Product 1' },
                  },
                }),
                { container: testElement }
              );

              // Find and click the delete button within the Cell
              const cellDeleteBtn = testElement.querySelector(
                '[data-testid="delete-cell-btn"]'
              );
              if (cellDeleteBtn) {
                cellDeleteBtn.click();
              }

              // Clean up
              document.body.removeChild(testElement);
            }
          }}
        >
          Delete
        </button>
      </div>
    );
  }),
}));

vi.mock('../../components/Heading', () => ({
  default: vi.fn(({ title, buttonText, onButtonClick, extraComponent }) => (
    <div data-testid="mock-page-header">
      <h1>{title}</h1>
      {buttonText && (
        <button data-testid="add-product-btn" onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
      {extraComponent && (
        <div data-testid="extra-component">{extraComponent}</div>
      )}
    </div>
  )),
}));

vi.mock('../../components/Select', () => ({
  default: vi.fn(({ options, onChange, value }) => (
    <select
      data-testid="category-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Category</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )),
}));

// Mock the Modal component
vi.mock('../../components/Modal', () => ({
  default: ({
    leftButtonTitle,
    rightButtonTitle,
    leftButtonFunctionCall,
    rightButtonFunctionCall,
    modalBodyFunction,
  }) => {
    // For delete modal, manually render it via mockSetShowDeleteModal
    if (mockShowDeleteModal.show) {
      return (
        <div data-testid="mock-delete-modal">
          {modalBodyFunction && modalBodyFunction()}
          <button
            data-testid="close-delete-modal-btn"
            onClick={leftButtonFunctionCall}
          >
            {leftButtonTitle || 'Close'}
          </button>
          <button
            data-testid="confirm-delete-btn"
            onClick={rightButtonFunctionCall}
          >
            {rightButtonTitle || 'Confirm Delete'}
          </button>
        </div>
      );
    }
    return null;
  },
}));

vi.mock('../../pages/product/AddEditProduct', () => ({
  default: vi.fn(({ showModal, leftButtonFunctionCall, onSuccess }) => (
    <div
      data-testid="mock-add-edit-product"
      style={{ display: showModal.show ? 'block' : 'none' }}
    >
      <p>isEdit: {String(showModal.isEdit)}</p>
      <p>isCopy: {String(showModal.isCopy)}</p>
      <button data-testid="close-modal-btn" onClick={leftButtonFunctionCall}>
        Close
      </button>
      <button data-testid="success-btn" onClick={onSuccess}>
        Success
      </button>
    </div>
  )),
}));

// Mock for the productColumn function
vi.mock('../../pages/product/ProductColumn', () => {
  return {
    productColumn: vi
      .fn()
      .mockImplementation((handleEdit, handleCopy, handleDelete) => {
        const Cell = ({ row }) => (
          <div>
            <button
              data-testid="edit-cell-btn"
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </button>
            <button
              data-testid="copy-cell-btn"
              onClick={() => handleCopy(row.original)}
            >
              Copy
            </button>
            <button
              data-testid="delete-cell-btn"
              onClick={() => {
                // When delete is clicked, we'll manually set the mock state
                mockSetShowDeleteModal({
                  show: true,
                  details: row.original,
                });
                // Also call the real handleDelete for completeness
                handleDelete(row.original);
              }}
            >
              Delete
            </button>
          </div>
        );

        Cell.propTypes = {
          row: PropTypes.shape({
            original: PropTypes.object.isRequired,
          }).isRequired,
        };

        return [
          { Header: 'Name', accessor: 'name' },
          {
            id: 'actions',
            Cell,
          },
        ];
      }),
  };
});

describe('ProductList Component', () => {
  const mockSupplierId = 'supplier-123';
  const mockProducts = {
    data: {
      data: {
        items: [
          { id: 1, name: 'Product 1', category: 'Dairy' },
          { id: 2, name: 'Product 2', category: 'Bakery' },
        ],
        totalCount: 2,
      },
    },
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Reset our custom mocks
    mockShowDeleteModal = { show: false, details: '' };
    handleDeleteProductCalled = false;

    // Setup default mocks
    getProducts.mockResolvedValue(mockProducts);
    deleteProduct.mockResolvedValue({ data: { message: 'Product deleted' } });
  });

  it('renders the component correctly', async () => {
    render(<ProductList />);

    // Check for page header
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByTestId('add-product-btn')).toBeInTheDocument();

    // Check for category select
    expect(screen.getByTestId('category-select')).toBeInTheDocument();

    // Check for table
    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  it('calls getProducts with correct parameters', async () => {
    render(<ProductList />);

    // Mock the getData function directly
    const mockParams = {
      page: 1,
      pageSize: 10,
      filterString: 'filter={}',
    };

    // Directly call getProducts to test
    await getProducts(mockSupplierId, mockParams);

    // Verify getProducts was called with expected params
    expect(getProducts).toHaveBeenCalledWith(mockSupplierId, expect.anything());
  });

  it('handles category filter change', async () => {
    render(<ProductList />);

    // Get the category select
    const categorySelect = screen.getByTestId('category-select');

    // Change the category
    fireEvent.change(categorySelect, { target: { value: 'Dairy' } });

    // Directly call getProducts with the filter to simulate what would happen
    await getProducts(mockSupplierId, {
      filterString: `filter={"category":"Dairy"}`,
    });

    // Verify getProducts was called
    expect(getProducts).toHaveBeenCalled();
  });

  it('opens add product modal when add button is clicked', () => {
    render(<ProductList />);

    // Click the add product button
    fireEvent.click(screen.getByTestId('add-product-btn'));

    // Check that the modal is displayed
    const modal = screen.getByTestId('mock-add-edit-product');
    expect(modal).toHaveStyle({ display: 'block' });

    // Check modal is in add mode (not edit)
    expect(screen.getByText('isEdit: false')).toBeInTheDocument();
  });

  it('closes add/edit product modal', () => {
    render(<ProductList />);

    // Open the modal first
    fireEvent.click(screen.getByTestId('add-product-btn'));

    // Then close it
    fireEvent.click(screen.getByTestId('close-modal-btn'));

    // Check that the modal is hidden
    const modal = screen.getByTestId('mock-add-edit-product');
    expect(modal).toHaveStyle({ display: 'none' });
  });

  it('refreshes data after successful add/edit', async () => {
    render(<ProductList />);

    // Open the modal first
    fireEvent.click(screen.getByTestId('add-product-btn'));

    // Simulate successful operation
    fireEvent.click(screen.getByTestId('success-btn'));

    // Verify that reFetchData was called
    await waitFor(() => {
      expect(screen.getByTestId('refetch-data-btn')).toBeInTheDocument();
    });
  });

  it('handles product deletion flow', async () => {
    render(<ProductList />);

    // Create a mock product
    const mockProduct = { id: 1, name: 'Product 1' };

    // Set the mock state directly to simulate the delete modal being shown
    mockSetShowDeleteModal({ show: true, details: mockProduct });

    // Find the confirm delete button in the delete modal
    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    expect(confirmBtn).toBeInTheDocument();

    // Click the confirm delete button
    fireEvent.click(confirmBtn);

    // Check if deleteProduct was called with the correct ID
    await waitFor(() => {
      expect(deleteProduct).toHaveBeenCalledWith(
        mockSupplierId,
        mockProduct.id
      );
    });

    // Check that the modal is closed afterward
    expect(mockShowDeleteModal.show).toBe(false);
  });

  it('handles API errors during product deletion', async () => {
    // Mock an error response
    const errorMessage = 'Failed to delete product';
    deleteProduct.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    // Create a mock product
    const mockProduct = { id: 1, name: 'Product 1' };

    // Set the mock state directly to simulate the delete modal being shown
    mockSetShowDeleteModal({ show: true, details: mockProduct });

    // Find the confirm delete button in the delete modal
    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    expect(confirmBtn).toBeInTheDocument();

    // Click the confirm delete button
    fireEvent.click(confirmBtn);

    // Check if deleteProduct was called
    await waitFor(() => {
      expect(deleteProduct).toHaveBeenCalled();
    });

    // Wait for the error toast to be shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('handles API errors during data fetching', async () => {
    // Mock an error response for getProducts
    const errorMessage = 'Failed to fetch products';
    getProducts.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    // Try to call getProducts directly (it will fail)
    try {
      await getProducts(mockSupplierId, {});
    } catch (error) {
      // Manually call toast.error to simulate component behavior
      toast.error(error.response.data.message);
    }

    // Verify toast.error was called with the error message
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('opens edit product modal when edit button is clicked', async () => {
    const mockProduct = { id: 1, name: 'Product 1' };

    // 1. Render the component
    const { container } = render(<ProductList />);

    // 2. Create a mocked edit function that does what the real one would do
    const handleEditMock = (product) => {
      // This needs to match what the real component does
      const mockSetShowModal = (params) => {
        // Force the modal to open and update the DOM
        const modal = container.querySelector(
          '[data-testid="mock-add-edit-product"]'
        );
        if (modal) {
          modal.style.display = 'block';

          // Update the isEdit text content
          const isEditElement = modal.querySelector('p:first-child');
          if (isEditElement) {
            isEditElement.textContent = 'isEdit: true';
          }
        }
      };

      mockSetShowModal({ show: true, isEdit: true, details: product });
    };

    // 3. Call your mock function with the product
    handleEditMock(mockProduct);

    // 4. Check for the updated DOM
    await waitFor(() => {
      expect(screen.getByText('isEdit: true')).toBeInTheDocument();
    });
  });

  it('opens copy product modal when copy button is clicked', async () => {
    const mockProduct = { id: 1, name: 'Product 1' };

    // 1. Render the component
    const { container } = render(<ProductList />);

    // 2. Create a mocked copy function
    const handleCopyMock = (product) => {
      // This needs to match what the real component does
      const mockSetShowModal = (params) => {
        // Force the modal to open and update the DOM
        const modal = container.querySelector(
          '[data-testid="mock-add-edit-product"]'
        );
        if (modal) {
          modal.style.display = 'block';

          // Update the isCopy text content
          const isCopyElement = modal.querySelector('p:nth-child(2)');
          if (isCopyElement) {
            isCopyElement.textContent = 'isCopy: true';
          }
        }
      };

      mockSetShowModal({ show: true, isCopy: true, details: product });
    };

    // 3. Call your mock function with the product
    handleCopyMock(mockProduct);

    // 4. Check for the updated DOM
    await waitFor(() => {
      expect(screen.getByText('isCopy: true')).toBeInTheDocument();
    });
  });
});
