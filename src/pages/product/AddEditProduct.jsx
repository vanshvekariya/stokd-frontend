import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import { useAuth } from '../../context/AuthContext';
import { fileUpload } from '../../services/file.upload.services';
import { productSchema } from '../../common/validation';
import Input from '../../components/Input';
import ImageUpload from '../../components/ImageUpload';
import CustomSelect from '../../components/Select';
import {
  getProductCategory,
  getProductUnit,
  addProduct,
  updateProduct,
} from '../../services/product.services';
import { toast } from 'react-toastify';
import { getSupplierBranchId, getSupplierId } from '../../utils/share';
import Button from '../../components/Button';

const AddEditProduct = ({ showModal, leftButtonFunctionCall, onSuccess }) => {
  const { userToken } = useAuth();
  const supplierId = getSupplierId();
  const supplierBranchId = getSupplierBranchId();
  const [productCategories, setProductCategories] = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBaseUnit, setSelectedBaseUnit] = useState(null);
  const [showPackingFields, setShowPackingFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productImage, setProductImage] = useState();

  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleImageUpload = async (file) => {
    try {
      setIsImageUploading(true);
      const response = await fileUpload(
        'SUPPLIER',
        file?.name,
        file,
        userToken
      );
      setProductImage(response?.getUrl);
      formik.setFieldValue('image', response.key);
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsImageUploading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [productCategoryRes, unitRes] = await Promise.all([
        getProductCategory(),
        getProductUnit(),
      ]);

      setProductCategories(productCategoryRes?.data?.data?.items || []);
      setProductUnits(unitRes?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch data');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      const defaultCurrencyId =
        productUnits.length > 0 ? productUnits[0].currencyId : 1;

      const productPayload = {
        name: values.name,
        image: values.image || '',
        categoryId: parseInt(values.categoryId) || 1,
        variants: [
          {
            sku: values?.sku === '' ? null : values.sku,
            variantName: values.name, // Using the same name for variant
            price: parseFloat(values.price),
            unitId: values.unitId,
            baseUnitId: values.baseUnitId || null,
            isGstFree: values.isGstFree || false,
            variantStockLevel: parseFloat(parseFloat(values.quantity).toFixed(2)),
            itemsCount: showPackingFields
              ? parseInt(values.itemsCount || 0)
              : 0,
            itemWeight: parseFloat(values.itemWeight || 0),
            currencyId: defaultCurrencyId,
          },
        ],
      };

      // If we're editing (and not copying), include the product ID and variant ID
      let response;
      if (showModal?.isEdit && !showModal?.isCopy && showModal?.details?.id) {
        const defaultVariant =
          showModal.details.variants.find((v) => v.isDefault) ||
          showModal.details.variants[0];
        if (defaultVariant) {
          productPayload.variants[0].id = defaultVariant.id;
        }

        response = await updateProduct(
          supplierId,
          supplierBranchId,
          showModal.details.id,
          productPayload
        );
      } else {
        // When adding new or copying, we use addProduct
        response = await addProduct(
          supplierId,
          supplierBranchId,
          productPayload
        );
      }

      if (response.status === 200 || response.status === 201) {
        const successAction = showModal?.isEdit
          ? showModal?.isCopy
            ? 'copied'
            : 'updated'
          : 'added';

        toast.success(`Product ${successAction} successfully!`);
        formik.resetForm();
        if (onSuccess) onSuccess();
        leftButtonFunctionCall(); // Close modal
      } else {
        const failureAction = showModal?.isEdit
          ? showModal?.isCopy
            ? 'copy'
            : 'update'
          : 'add';

        toast.error(`Failed to ${failureAction} product`);
      }
    } catch (error) {
      const errorAction = showModal?.isEdit
        ? showModal?.isCopy
          ? 'copy'
          : 'update'
        : 'add';

      toast.error(
        error?.response?.data?.message || `Failed to ${errorAction} product`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      image: '',
      categoryId: '',
      sku: '',
      price: '',
      isGstFree: false,
      quantity: '',
      baseUnitId: null,
      unitId: '',
      itemsCount: '',
      itemWeight: '',
    },
    validationSchema: productSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true, // Important for update case
  });

  useEffect(() => {
    if (!showModal.show) {
      formik.resetForm();
      setSelectedUnit(null);
      setSelectedBaseUnit(null);
      setSelectedCategory(null);
      setShowPackingFields(false);
      setProductImage(null);
    }
  }, [showModal.show]);

  useEffect(() => {
    fetchData();
  }, []);

  // Populate form with existing data when editing or copying
  useEffect(() => {
    if (
      showModal?.show &&
      (showModal?.isEdit || showModal?.isCopy) &&
      showModal?.details &&
      productCategories.length > 0 &&
      productUnits.length > 0
    ) {
      const productDetails = showModal.details;

      // Find the default variant or use the first one
      const defaultVariant =
        productDetails.variants.find((v) => v.isDefault) ||
        productDetails.variants[0];

      if (defaultVariant) {
        // For copy functionality: modify values if needed
        let skuValue = defaultVariant.sku || '';
        let nameValue = productDetails.name || '';

        // Explicitly set each field
        formik.setValues({
          name: nameValue,
          image: productDetails.image || '',
          categoryId: productDetails.categoryId || '',
          sku: skuValue,
          price: defaultVariant.price?.toString() || '',
          isGstFree: defaultVariant.isGstFree || false,
          quantity: defaultVariant.variantStockLevel?.toString() || '',
          unitId: defaultVariant.unitId || '',
          baseUnitId: defaultVariant.baseUnitId || '',
          itemsCount: defaultVariant.itemsCount?.toString() || '',
          itemWeight: defaultVariant.itemWeight?.toString() || '',
        });

        setProductImage(productDetails.image);

        // Find and set category
        if (productDetails.categoryId) {
          const category = productCategories.find(
            (c) => c.id.toString() === productDetails.categoryId.toString()
          );
          if (category) {
            setSelectedCategory(category);
          }
        }

        // Find and set unit
        if (defaultVariant.unitId) {
          const unit = productUnits.find(
            (u) => u.id.toString() === defaultVariant.unitId.toString()
          );
          if (unit) {
            setSelectedUnit(unit);
            setShowPackingFields(unit.isPackagingUnit === true);
          } else if (defaultVariant.unit) {
            setSelectedUnit(defaultVariant.unit);
            setShowPackingFields(defaultVariant.unit.isPackagingUnit === true);
          }
        }

        // Find and set base unit
        if (defaultVariant.baseUnitId) {
          const baseUnit = productUnits.find(
            (u) => u.id.toString() === defaultVariant.baseUnitId.toString()
          );
          if (baseUnit) {
            setSelectedBaseUnit(baseUnit);
          } else if (defaultVariant.baseUnit) {
            setSelectedBaseUnit(defaultVariant.baseUnit);
          }
        }
      }
    }
  }, [
    showModal?.show,
    showModal?.isEdit,
    showModal?.isCopy,
    showModal?.details,
    productUnits,
    productCategories,
  ]);

  const handleUnitChange = (selectedOption) => {
    setSelectedUnit(selectedOption);

    // Check if the selected unit has isPackagingUnit = true
    setShowPackingFields(selectedOption?.isPackagingUnit === true);

    // Set the unit value in Formik
    formik.setFieldValue('unitId', selectedOption?.id || '');

    // Reset baseUnitId when unit changes
    formik.setFieldValue('baseUnitId', '');
    setSelectedBaseUnit(null);
  };

  const handleBaseUnitChange = (selectedOption) => {
    setSelectedBaseUnit(selectedOption);
    formik.setFieldValue('baseUnitId', selectedOption?.id || '');
  };

  // Handle category selection
  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    formik.setFieldValue('categoryId', selectedOption?.id || '');
  };

  // Determine the appropriate title and button text based on mode
  const getModalTitle = () => {
    if (showModal?.isCopy) return 'Copy Product';
    return showModal?.isEdit ? 'Edit Product' : 'Add New Product';
  };

  const getButtonTitle = () => {
    if (showModal?.isCopy) return 'Save Copy';
    return showModal?.isEdit ? 'Save Changes' : 'Add Product';
  };

  return (
    <>
      {showModal?.show && (
        <Modal
          title={getModalTitle()}
          rightButtonTitle={getButtonTitle()}
          leftButtonTitle="Cancel"
          isTitleLeft
          contentScroll
          isScrolling
          leftButtonFunctionCall={leftButtonFunctionCall}
          rightButtonFunctionCall={formik.handleSubmit}
          rightButtonLoading={isLoading || formik.isSubmitting}
          modalBodyFunction={() => (
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3"
            >
              <Input
                label="Product Name"
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Apple"
                error={formik.touched.name && formik.errors.name}
                required
              />
              <Input
                label="SKU"
                type="text"
                name="sku"
                value={formik.values.sku}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="SKU"
                error={formik.touched.sku && formik.errors.sku}
                // required
              />
              <CustomSelect
                label="Category"
                name="categoryId"
                value={selectedCategory}
                onChange={handleCategoryChange}
                onBlur={formik.handleBlur}
                placeholder="Fresh Goods"
                options={productCategories}
                error={formik.touched.categoryId && formik.errors.categoryId}
                required
              />
              <div className="flex gap-4">
                <CustomSelect
                  label="Unit"
                  name="unitId"
                  value={selectedUnit}
                  onChange={handleUnitChange}
                  onBlur={formik.handleBlur}
                  placeholder="Box"
                  options={productUnits}
                  error={formik.touched.unitId && formik.errors.unitId}
                  required
                />
                {selectedUnit?.isPackagingUnit && (
                  <CustomSelect
                    label="Base Unit"
                    name="baseUnitId"
                    value={selectedBaseUnit}
                    onChange={handleBaseUnitChange}
                    onBlur={formik.handleBlur}
                    placeholder="Kilogram"
                    options={productUnits.filter(
                      (unit) => unit.isPackagingUnit === false
                    )}
                    error={
                      formik.touched.baseUnitId && formik.errors.baseUnitId
                    }
                    required={selectedUnit?.isPackagingUnit}
                  />
                )}
              </div>
              {showPackingFields && (
                <div className="flex gap-4 items-end">
                  <Input
                    label={`Weight of Product in ${selectedBaseUnit?.name || selectedUnit?.baseUnit?.name || 'unit'}`}
                    type="number"
                    name="itemWeight"
                    value={formik.values.itemWeight}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="2Kg"
                    error={
                      formik.touched.itemWeight && formik.errors.itemWeight
                    }
                  />

                  <Input
                    label={`Quantity Per ${selectedUnit?.name || 'Unit'}`}
                    type="number"
                    name="itemsCount"
                    value={formik.values.itemsCount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="10 Packages"
                    error={
                      formik.touched.itemsCount && formik.errors.itemsCount
                    }
                    required={showPackingFields}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Input
                  label={`Quantity of ${selectedUnit?.name || 'Product'}`}
                  type="number"
                  name="quantity"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter quantity"
                  error={formik.touched.quantity && formik.errors.quantity}
                  required
                />
                <Input
                  label={`Price (per ${selectedUnit?.name || 'unit'})`}
                  type="number"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter price"
                  error={formik.touched.price && formik.errors.price}
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button
                  variant={!formik.values.isGstFree ? "primary" : "secondary"}
                  type="button"
                  onClick={() => formik.setFieldValue('isGstFree', false)}
                >
                  GST Applicable
                </Button>
                <Button
                  variant={formik.values.isGstFree ? "primary" : "secondary"}
                  type="button"
                  onClick={() => formik.setFieldValue('isGstFree', true)}
                >
                  GST Free
                </Button>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">Product Image</p>
                <div className="flex gap-4 items-center">
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    showDimention={false}
                    currentImage={productImage}
                    isLoading={isImageUploading}
                  />
                </div>
              </div>
            </form>
          )}
        />
      )}
    </>
  );
};

AddEditProduct.propTypes = {
  showModal: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool,
    isCopy: PropTypes.bool,
    details: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  leftButtonFunctionCall: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddEditProduct;
