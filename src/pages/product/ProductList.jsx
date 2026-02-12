import React, { useCallback, useEffect, useRef, useState } from 'react';
import Table from '../../components/Table';
import PageHeader from '../../components/Heading';
import { productColumn } from './ProductColumn';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import warningIcon from '../../assets/warning.svg';
import AddEditProduct from './AddEditProduct';
import { deleteProduct, getProducts, bulkUploadProducts, getProductCategory } from '../../services/product.services';
import { toast } from 'react-toastify';
import { getSupplierBranchId, getSupplierId } from '../../utils/share';
import { debounce } from '../../utils/common';
import Button from '../../components/Button';
import FileUpload from '../../components/FileUpload';
import ErrorModal from '../../components/ErrorModal';
import * as XLSX from 'xlsx';

const ProductList = () => {
  const supplierId = getSupplierId();
  const supplierBranchId = getSupplierBranchId();
  const tableRef = useRef();
  const [showModal, setShowModal] = useState({
    show: false,
    isEdit: false,
    isCopy: false,
    isBulkUpload: false,
    details: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState({
    show: false,
    details: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch product categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getProductCategory();
        if (response?.data?.data?.items) {
          // Sort categories by displayOrder
          const sortedCategories = [...response.data.data.items].sort(
            (a, b) => a.displayOrder - b.displayOrder
          );
          setCategories(sortedCategories);
        }
      } catch (error) {
        toast.error('Failed to load product categories');
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
      if (tableRef.current) {
        tableRef.current.resetPage();
        tableRef.current.reFetchData();
      }
    }, 500),
    []
  );

  // Handle search input change with debounce
  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const getData = useCallback(
    async (params) => {
      try {
        let filterObj = {};

        if (params.filterString) {
          try {
            const filterParam = params.filterString.replace('filters=', '');
            filterObj = JSON.parse(filterParam);
          } catch (e) {
            console.error('Error parsing filters:', e);
          }
        }

        // Add category filter if selected
        if (selectedCategory) {
          filterObj.categoryId = selectedCategory;
        }

        // Rebuild the filter string
        const queryParams = {
          ...params,
          filterString: Object.keys(filterObj).length > 0 ? `filters=${JSON.stringify(filterObj)}` : '',
          globalFilter: searchTerm || params.globalFilter
        };

        // Make the API call
        const resp = await getProducts(
          supplierId,
          supplierBranchId,
          queryParams
        );

        return {
          data: resp?.data?.data?.items || [],
          rowCount: resp?.data?.data?.total || 0,
        };
      } catch (error) {
        toast.error(error?.response?.data?.message);
        return { data: [], rowCount: 0 };
      }
    },
    [supplierId, selectedCategory, searchTerm]
  );

  const handleEdit = useCallback((row) => {
    setShowModal({ show: true, isEdit: true, details: row });
  }, []);

  const handleCopy = useCallback((row) => {
    setShowModal({ show: true, isCopy: true, details: row });
  }, []);

  const handleDelete = useCallback((row) => {
    setShowDeleteModal({ show: true, details: row });
  }, []);

  // Memoize the columns array to prevent recreation on each render
  const columns = React.useMemo(
    () => productColumn(handleEdit, handleCopy, handleDelete),
    [handleEdit, handleCopy, handleDelete]
  );

  // Handle category change
  const handleCategoryChange = (value) => {
    // Store the entire category object instead of just the ID
    setSelectedCategory(value ? value.id : '');
    
    // Reset the table pagination when category changes
    if (tableRef.current) {
      tableRef.current.resetPage(false); // Reset to first page
      tableRef.current.reFetchData(); // Trigger data refetch
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setLoading(true);
      await deleteProduct(
        supplierId,
        supplierBranchId,
        showDeleteModal?.details?.id
      );
      tableRef.current.reFetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
      setShowDeleteModal({ show: false, details: '' });
    }
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setUploadErrors([]);
  };

  const handleFileDelete = () => {
    setUploadedFile(null);
    setUploadErrors([]);
  };

  const downloadErrorSheet = useCallback(() => {
    try {
      // Define the header columns matching your Excel format
      const headerColumns = [
        'Product Name',
        'SKU',
        'Category',
        'Unit',
        'Base Unit',
        'Weight Of Product In unit',
        'Quantity Per Unit',
        'Quantity Of Unit',
        'Price Per Unit',
        'Is GST Free',
        'Error Message' // Added as the last column
      ];

      // Create worksheet data starting with headers
      const worksheetData = [headerColumns];

      // Add error rows with all original data plus error message
      uploadErrors.forEach((error) => {
        const row = [
          error.name || '',
          error.sku || '',
          error.categoryName || '',
          error.unitName || '',
          error.baseUnitName || '',
          error.itemWeight || '',
          error.itemsCount || '',
          error.variantStockLevel || '',
          error.price || '',
          error.isGstFree !== undefined ? (error.isGstFree ? 'TRUE' : 'FALSE') : '',
          error.reason || '' // Error message in the last column
        ];
        worksheetData.push(row);
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 20 }, // Product Name
        { wch: 15 }, // SKU
        { wch: 15 }, // Category
        { wch: 10 }, // Unit
        { wch: 10 }, // Base Unit
        { wch: 25 }, // Weight Of Product In unit
        { wch: 18 }, // Quantity Per Unit
        { wch: 18 }, // Quantity Of Unit
        { wch: 15 }, // Price Per Unit
        { wch: 12 }, // Is GST Free
        { wch: 50 }  // Error Message (wider for error messages)
      ];
      ws['!cols'] = columnWidths;

      // Append worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Upload Errors');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `product_upload_errors_${timestamp}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      toast.error(error?.message || 'Error downloading error sheet');
    }
  }, [uploadErrors]);

  const handleBulkUpload = async () => {
    try {
      if (!uploadedFile) {
        toast.error('Please select a file to upload');
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await bulkUploadProducts(supplierId, supplierBranchId, formData);
      const failedRecords = response?.data?.data?.filter((record) => record.uploadStatus === 'failed');
      const successRecords = response?.data?.data?.filter((record) => record.uploadStatus === 'uploaded');

      if (failedRecords?.length > 0) {
        setUploadErrors(failedRecords);
        setSuccessCount(successRecords?.length);
        setShowErrorModal(true);
      } else {
        toast.success(response?.data?.message || 'Products uploaded successfully');
        setUploadErrors([]);
        setShowModal({ show: false, isBulkUpload: false });
      }

      tableRef.current.reFetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error uploading products');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setUploadedFile(null);
    setShowModal(false);
  };
  
  // Prepare category options for the Select component
  const categoryOptions = categories.map(category => ({
    id: category.id,
    name: category.name
  }));

  return (
    <>
      <PageHeader
        title="Products"
        buttonText="Add Product"
        searchPlaceholder="Search products..."
        onSearch={handleSearch}
        secondaryButton={
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setShowModal({ show: true, isBulkUpload: true })}
          >
            Bulk Upload
          </Button>
        }
        onButtonClick={() =>
          setShowModal({ show: true, isEdit: false, details: '' })
        }
        extraComponent={
          <Select
            showError={false}
            size="sm"
            name="category"
            placeholder={loadingCategories ? "Loading categories..." : "Select Category"}
            options={categoryOptions}
            onChange={handleCategoryChange}
            value={selectedCategory}
            className="w-full sm:w-auto"
            isDisabled={loadingCategories}
          />
        }
      />
      <Table
        columns={columns}
        getData={getData}
        ref={tableRef}
      />
      {showModal.show && !showModal.isBulkUpload && (
        <AddEditProduct
          showModal={showModal}
          leftButtonFunctionCall={handleModalClose}
          onSuccess={() => tableRef.current.reFetchData()}
        />
      )}
      {showDeleteModal.show && (
        <Modal
          src={warningIcon}
          imageStyle="w-18 h-18"
          showSmallModal
          leftButtonTitle="Close"
          rightButtonTitle="Yes, Delete"
          rightButtonLoading={loading}
          rightButtonFunctionCall={handleDeleteProduct}
          leftButtonFunctionCall={() =>
            setShowDeleteModal({ show: false, details: '' })
          }
          modalBodyFunction={() => (
            <div className="px-4 font-bold text-text-primary text-center text-xl">
              Are you sure you want to delete this product?
            </div>
          )}
        />
      )}
      {showModal.show && showModal.isBulkUpload && (
        <Modal
          title="Bulk Upload Products"
          leftButtonTitle="Cancel"
          rightButtonTitle="Upload"
          rightButtonLoading={loading}
          rightButtonFunctionCall={handleBulkUpload}
          leftButtonFunctionCall={handleModalClose}
          modalBodyFunction={() => (
            <div className="p-4">
              <FileUpload
                onFileUpload={handleFileUpload}
                file={uploadedFile}
                onDelete={handleFileDelete}
                acceptedFileTypes=".xlsx, .xls"
              />
              <div className="mt-4 text-center">
                <a
                  href="/templates/product_template.xlsx"
                  download
                  className="text-primary hover:underline text-sm"
                >
                  Download Template
                </a>
              </div>
            </div>
          )}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          leftButtonFunctionCall={() => setShowErrorModal(false)}
          rightButtonFunctionCall={downloadErrorSheet}
          uploadErrors={uploadErrors}
          successCount={successCount}
        />
      )}
    </>
  );
};

export default ProductList;
