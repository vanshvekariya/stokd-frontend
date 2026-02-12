import React from 'react';
import Drawer from '../../components/Drawer';
import PropTypes from 'prop-types';
import Loader from '../../components/loader/Loader';
import { m, AnimatePresence } from 'framer-motion';
import Chip from '../../components/Chip';
import {
  formatDate,
  formatAddress,
  countries,
  formatPhoneNumberWithCountryCode,
} from '../../utils/share';

const SupplierDetail = ({ selectedSupplier, open, onClose, isLoading }) => {
  if (!selectedSupplier) return null;

  const renderInfo = (label, value) => (
    <div className="mb-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium">{value || 'N/A'}</p>
    </div>
  );

  return (
    <Drawer
      isOpen={open}
      onClose={onClose}
      title={
        isLoading ? (
          'Loading supplier details...'
        ) : (
          <div className="flex items-center gap-4">
            <div className="capitalize">
              {selectedSupplier.businessName || 'Supplier Details'}
            </div>
            <div
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                selectedSupplier.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {selectedSupplier.status || 'INACTIVE'}
            </div>
          </div>
        )
      }
    >
      <div className="p-6 flex flex-col gap-6 min-h-[60vh] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <m.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <Loader className="!min-h-[75vh]" />
            </m.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isLoading && (
            <m.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-2xl text-orange-600 font-medium">
                  {selectedSupplier.businessName?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedSupplier.businessName || 'N/A'}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedSupplier.businessPhone 
                      ? formatPhoneNumberWithCountryCode(selectedSupplier.businessPhone) 
                      : 'N/A'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>
                      Member since {formatDate(selectedSupplier.createdAt)}
                    </span>
                    {/* <span>•</span> */}
                    {/* <span>
                      Last updated: {formatDate(selectedSupplier.updatedAt)}
                    </span> */}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-medium text-gray-700 mb-3">
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    {renderInfo(
                      'Business Name',
                      selectedSupplier.businessName
                    )}
                    {renderInfo(
                      'Country',
                      countries.find(
                        (c) => c.id === selectedSupplier.countryCode
                      )?.name || selectedSupplier.countryCode
                    )}
                    {renderInfo('Status', selectedSupplier.status)}
                    {renderInfo(
                      'Business Phone',
                      selectedSupplier.businessPhone 
                        ? formatPhoneNumberWithCountryCode(selectedSupplier.businessPhone)
                        : 'N/A'
                    )}
                    {selectedSupplier.companyDescription && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Company Description</p>
                        <p className="text-sm text-gray-700">{selectedSupplier.companyDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-medium text-gray-700 mb-3">
                    Address
                  </h3>
                  <div className="space-y-3">
                    {selectedSupplier.address ? (
                      <>
                        {renderInfo(
                          'Street',
                          selectedSupplier.address.street
                        )}
                        {renderInfo('City', selectedSupplier.address.city)}
                        {renderInfo('State', selectedSupplier.address.state)}
                        {renderInfo(
                          'Postal Code',
                          selectedSupplier.address.zipcode
                        )}
                        {renderInfo(
                          'Country',
                          countries.find(
                            (c) => c.id ===   selectedSupplier.address.country
                          )?.name || "N/A"
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">No address available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="text-base font-medium text-gray-700 mb-4">
                  All Branches (
                  {selectedSupplier.supplierBranches?.length || 0})
                </h3>

                <div className="space-y-4">
                  {selectedSupplier.supplierBranches?.length > 0 ? (
                    selectedSupplier.supplierBranches.map((branch) => (
                      <m.div
                        key={branch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {branch.branchName}
                                </h4>
                                {branch.isMainBranch && (
                                  <Chip
                                    text="Main Branch"
                                    variant="info"
                                    size="small"
                                  />
                                )}
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                {branch.phone 
                                  ? formatPhoneNumberWithCountryCode(branch.phone)
                                  : 'No contact number'}
                              </div>
                              <div className="mt-2">
                                <Chip
                                  text={branch.status || 'INACTIVE'}
                                  variant={
                                    branch.status === 'ACTIVE'
                                      ? 'success'
                                      : 'error'
                                  }
                                  size="small"
                                />
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Address
                              </div>
                              <div className="text-sm font-medium text-gray-700 max-w-[200px] text-right">
                                {formatAddress(branch.address)}
                              </div>
                            </div>
                          </div>

                          {branch.contactPerson && (
                            <div className="text-sm text-gray-600">
                              <span className="text-gray-500">Contact: </span>
                              {branch.contactPerson}
                            </div>
                          )}
                        </div>
                      </m.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No branches found
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
};

SupplierDetail.propTypes = {
  selectedSupplier: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default SupplierDetail;
