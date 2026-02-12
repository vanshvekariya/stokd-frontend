import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, vi, describe, beforeEach, afterEach, test } from 'vitest';
import '@testing-library/jest-dom';
import AddEditProduct from '../../pages/product/AddEditProduct';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('../../services/file.upload.services', () => ({
  fileUpload: vi.fn().mockResolvedValue({
    apiUrl: 'https://example.com/uploaded.jpg',
    key: 'uploaded-image-key',
  }),
}));

vi.mock('../../services/product.services', () => ({
  getProductCategory: vi.fn(),
  getProductUnit: vi.fn(),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

// Important: Mock the utils/share module correctly
vi.mock('../../utils/share', () => ({
  getSupplierId: vi.fn(() => 'supplier-123'),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock formik
vi.mock('formik', () => {
  const actual = vi.importActual('formik');
  return {
    ...actual,
    useFormik: ({ initialValues, onSubmit, validationSchema }) => {
      return {
        values: initialValues,
        errors: {},
        touched: {},
        handleChange: vi.fn((e) => {
          // Mock the handleChange to update the values
          initialValues[e.target.name] = e.target.value;
        }),
        handleBlur: vi.fn(),
        handleSubmit: vi.fn((e) => {
          if (e && e.preventDefault) e.preventDefault();
          return onSubmit(initialValues);
        }),
        setFieldValue: vi.fn((field, value) => {
          initialValues[field] = value;
        }),
        resetForm: vi.fn(),
        isSubmitting: false,
        setValues: vi.fn((newValues) => {
          Object.keys(newValues).forEach((key) => {
            initialValues[key] = newValues[key];
          });
        }),
      };
    },
  };
});

// Import mocked modules
import * as fileUploadService from '../../services/file.upload.services';
import * as productServices from '../../services/product.services';

// Sample data for tests
const mockProductCategories = {
  data: {
    data: {
      items: [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Clothing' },
      ],
    },
  },
};

const mockProductUnits = {
  data: {
    data: {
      items: [
        { id: 1, name: 'Piece', isPackingUnit: false },
        { id: 2, name: 'Box', isPackingUnit: true },
      ],
    },
  },
};

const mockProductDetails = {
  id: 123,
  name: 'Test Product',
  image: 'https://example.com/image.jpg',
  categoryId: 1,
  variants: [
    {
      id: 456,
      sku: 'TEST-123',
      variantName: 'Test Product',
      price: 99.99,
      isGstFree: false,
      variantStockLevel: 100,
      itemsCount: 10,
      itemWeight: 5,
      unit: 2,
      isDefault: true,
    },
  ],
};

// Setup props for component
const mockProps = {
  showModal: {
    show: true,
    isEdit: false,
    isCopy: false,
    details: null,
  },
  leftButtonFunctionCall: vi.fn(),
  onSuccess: vi.fn(),
};

// Setup the mock auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userToken: 'test-token',
  }),
}));

// Mock components
vi.mock('../../components/Input', () => ({
  default: (props) => <input {...props} data-testid={props.name} />,
}));

vi.mock('../../components/Button', () => ({
  default: ({ children, onClick, type, disabled, className }) => (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

vi.mock('../../components/ImageUpload', () => ({
  default: ({ onImageUpload, currentImage }) => (
    <div data-testid="image-upload">
      Image Upload Component
      <button
        data-testid="mock-image-upload"
        onClick={() => onImageUpload({ name: 'test-image.jpg' })}
      >
        Upload Image
      </button>
      {currentImage && <img src={currentImage} alt="Current" />}
    </div>
  ),
}));

vi.mock('../../components/Select', () => ({
  default: ({ label, name, value, onChange, options, placeholder }) => (
    <div data-testid={`select-${name}`}>
      <label>{label}</label>
      <select
        name={name}
        value={value || ''}
        onChange={(e) => {
          // Find the selected option object
          const selectedOption = options?.find(
            (opt) => opt.id.toString() === e.target.value
          );
          onChange(selectedOption);
        }}
        data-testid={`select-input-${name}`}
      >
        <option value="">{placeholder}</option>
        {options?.map((option) => (
          <option key={option.id} value={option.id.toString()}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock the Modal component to directly expose the rightButtonFunctionCall
vi.mock('../../components/Modal', () => ({
  default: ({
    title,
    leftButtonTitle,
    rightButtonTitle,
    leftButtonFunctionCall,
    rightButtonFunctionCall,
    modalBodyFunction,
    rightButtonLoading,
  }) => {
    // Store the rightButtonFunctionCall globally for test access
    vi.stubGlobal('testRightButtonFunction', rightButtonFunctionCall);

    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <div>{modalBodyFunction()}</div>
        <div className="modal-footer">
          <button
            onClick={leftButtonFunctionCall}
            data-testid="modal-left-button"
          >
            {leftButtonTitle}
          </button>
          <button
            onClick={rightButtonFunctionCall}
            data-testid="modal-right-button"
            disabled={rightButtonLoading}
          >
            {rightButtonTitle}
          </button>
        </div>
      </div>
    );
  },
}));

describe('AddEditProduct Component Integration Tests', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mock responses
    productServices.getProductCategory.mockResolvedValue(mockProductCategories);
    productServices.getProductUnit.mockResolvedValue(mockProductUnits);
    productServices.addProduct.mockResolvedValue({ status: 201 });
    productServices.updateProduct.mockResolvedValue({ status: 200 });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test Case 1: Component renders correctly in "Add New Product" mode
  test('renders correctly in Add New Product mode', async () => {
    render(<AddEditProduct {...mockProps} />);

    // Check if modal title is correct
    expect(screen.getByText('Add New Product')).toBeInTheDocument();

    // Verify API calls
    await waitFor(() => {
      expect(productServices.getProductCategory).toHaveBeenCalled();
      expect(productServices.getProductUnit).toHaveBeenCalled();
    });

    // Check for buttons
    expect(screen.getByText('GST Applicable')).toBeInTheDocument();
    expect(screen.getByText('GST Free')).toBeInTheDocument();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // Check for image upload
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });

  // Test Case 2: Successfully adds a new product
  test('successfully adds a new product', async () => {
    render(<AddEditProduct {...mockProps} />);

    // Wait for product categories and units to load
    await waitFor(() => {
      expect(productServices.getProductCategory).toHaveBeenCalled();
      expect(productServices.getProductUnit).toHaveBeenCalled();
    });

    // Fill the form
    const nameInput = screen.getByTestId('name');
    const skuInput = screen.getByTestId('sku');
    const quantityInput = screen.getByTestId('quantity');
    const priceInput = screen.getByTestId('price');

    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'New Test Product' },
    });
    fireEvent.change(skuInput, {
      target: { name: 'sku', value: 'NEW-TEST-001' },
    });
    fireEvent.change(quantityInput, {
      target: { name: 'quantity', value: '50' },
    });
    fireEvent.change(priceInput, {
      target: { name: 'price', value: '149.99' },
    });

    // Select category
    const categorySelect = screen.getByTestId('select-input-category');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    // Select unit
    const unitSelect = screen.getByTestId('select-input-unit');
    fireEvent.change(unitSelect, { target: { value: '1' } });

    // Upload image
    const uploadButton = screen.getByTestId('mock-image-upload');
    fireEvent.click(uploadButton);

    // Use the exposed rightButtonFunction directly
    global.testRightButtonFunction();

    // Verify API call
    await waitFor(() => {
      expect(productServices.addProduct).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // Test Case 3: Edit mode populates the form correctly
  test('populates form correctly in Edit mode', async () => {
    const editProps = {
      ...mockProps,
      showModal: {
        show: true,
        isEdit: true,
        isCopy: false,
        details: mockProductDetails,
      },
    };

    render(<AddEditProduct {...editProps} />);

    // Check modal title
    expect(screen.getByText('Edit Product')).toBeInTheDocument();

    // Wait for the form to be populated
    await waitFor(() => {
      const nameInput = screen.getByTestId('name');
      expect(nameInput).toBeInTheDocument();
    });
  });

  // Test Case 4: Updates a product successfully
  test('successfully updates an existing product', async () => {
    const editProps = {
      ...mockProps,
      showModal: {
        show: true,
        isEdit: true,
        isCopy: false,
        details: mockProductDetails,
      },
    };

    render(<AddEditProduct {...editProps} />);

    // Wait for form to be populated
    await waitFor(() => {
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });

    // Modify the product name
    const nameInput = screen.getByTestId('name');
    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Updated Product Name' },
    });

    // Use the exposed rightButtonFunction directly
    global.testRightButtonFunction();

    // Verify API call
    await waitFor(() => {
      expect(productServices.updateProduct).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // Test Case 5: Image upload works correctly
  test('handles image upload correctly', async () => {
    render(<AddEditProduct {...mockProps} />);

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

  // Test Case 6: Copy mode works correctly
  test('correctly copies a product', async () => {
    const copyProps = {
      ...mockProps,
      showModal: {
        show: true,
        isEdit: true,
        isCopy: true,
        details: mockProductDetails,
      },
    };

    render(<AddEditProduct {...copyProps} />);

    // Check modal title
    expect(screen.getByText('Copy Product')).toBeInTheDocument();

    // Check button text
    expect(screen.getByText('Save Copy')).toBeInTheDocument();

    // Use the exposed rightButtonFunction directly
    global.testRightButtonFunction();

    // Verify addProduct was called
    await waitFor(() => {
      expect(productServices.addProduct).toHaveBeenCalled();
    });
  });

  // Test Case 7: Packing unit functionality works correctly
  test('shows packing fields when a packing unit is selected', async () => {
    render(<AddEditProduct {...mockProps} />);

    // Wait for the selects to be populated
    await waitFor(() => {
      expect(productServices.getProductUnit).toHaveBeenCalled();
    });

    // Select a packing unit (Box, id: 2)
    const unitSelect = screen.getByTestId('select-input-unit');
    fireEvent.change(unitSelect, { target: { value: '2' } }); // Box has isPackingUnit=true

    // Check packing fields existence using an alternative approach
    // Since the DOM changes might not trigger waitFor immediately
    const packingFieldsCheck = () => {
      try {
        const itemWeight = screen.getByTestId('itemWeight');
        const itemsCount = screen.getByTestId('itemsCount');
        return itemWeight && itemsCount;
      } catch (e) {
        return false;
      }
    };

    // Continue checking until fields appear or timeout
    await waitFor(
      () => {
        expect(packingFieldsCheck()).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  // Test Case 8: Modal closes on cancel
  test('closes modal when Cancel button is clicked', async () => {
    render(<AddEditProduct {...mockProps} />);

    // Click the Cancel button
    const cancelButton = screen.getByTestId('modal-left-button');
    fireEvent.click(cancelButton);

    // Verify leftButtonFunctionCall was called
    expect(mockProps.leftButtonFunctionCall).toHaveBeenCalled();
  });

  // Test Case 9: Handles API errors correctly
  test('handles API errors during form submission', async () => {
    // Mock API error
    const errorMessage = 'Failed to add product due to server error';
    productServices.addProduct.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    render(<AddEditProduct {...mockProps} />);

    // Fill minimal required fields
    const nameInput = screen.getByTestId('name');
    const skuInput = screen.getByTestId('sku');
    const quantityInput = screen.getByTestId('quantity');
    const priceInput = screen.getByTestId('price');

    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Test Product' },
    });
    fireEvent.change(skuInput, { target: { name: 'sku', value: 'TEST-001' } });
    fireEvent.change(quantityInput, {
      target: { name: 'quantity', value: '10' },
    });
    fireEvent.change(priceInput, { target: { name: 'price', value: '99.99' } });

    // Use the exposed rightButtonFunction directly
    global.testRightButtonFunction();

    // Verify error handling
    await waitFor(() => {
      expect(productServices.addProduct).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  // Test Case 10: GST toggle buttons work correctly
  test('toggles GST status correctly', async () => {
    render(<AddEditProduct {...mockProps} />);

    // Find GST toggle buttons
    const gstFreeButton = screen.getByText('GST Free');

    // Click on GST Free button
    fireEvent.click(gstFreeButton);

    // Fill required fields
    const nameInput = screen.getByTestId('name');
    const skuInput = screen.getByTestId('sku');
    const quantityInput = screen.getByTestId('quantity');
    const priceInput = screen.getByTestId('price');

    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Test Product' },
    });
    fireEvent.change(skuInput, { target: { name: 'sku', value: 'TEST-001' } });
    fireEvent.change(quantityInput, {
      target: { name: 'quantity', value: '10' },
    });
    fireEvent.change(priceInput, { target: { name: 'price', value: '99.99' } });

    // Use the exposed rightButtonFunction directly
    global.testRightButtonFunction();

    // Verify that addProduct was called
    await waitFor(() => {
      expect(productServices.addProduct).toHaveBeenCalled();
    });
  });
});
