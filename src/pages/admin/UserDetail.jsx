import React from 'react';
import Drawer from '../../components/Drawer';
import PropTypes from 'prop-types';
import Loader from '../../components/loader/Loader';
import { m, AnimatePresence } from 'framer-motion';
import {
  formatDate,
  formatPhoneNumberWithCountryCode,
} from '../../utils/share';


const UserDetail = ({
  selectedUser,
  open,
  onClose,
  isLoading,
}) => {
  if (!selectedUser) return null;

  const renderUserInfo = (label, value) => (
    <div className="mb-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium">{value || 'N/A'}</p>
    </div>
  );

  const renderBusinessInfo = (user) => {
    const business = user.suppliers?.[0] || user.restaurants?.[0];
    const branches = business?.supplierBranches || [];
    const mainBranch = branches.find(branch => branch.isMainBranch) || branches[0];
    const address = mainBranch?.address;

    if (!business) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          {business.businessName ? 'Business Information' : 'No Business Information'}
        </h3>
        
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Details</h4>
              <div className="space-y-3">
                {renderUserInfo('Business Name', business.businessName)}
                {renderUserInfo('Business Type', business.companyDescription || 'N/A')}
                {renderUserInfo('Business Email', user.email)}
                {renderUserInfo('Phone', 
                  business.businessPhone || mainBranch?.phone 
                    ? formatPhoneNumberWithCountryCode(business.businessPhone || mainBranch.phone)
                    : 'N/A'
                )}
                {renderUserInfo('Status', business.status || 'N/A')}
                {renderUserInfo('Account Type', business.suppliers ? 'Supplier' : 'Restaurant')}
              </div>
            </div>
            
            {mainBranch && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Main Branch</h4>
                <div className="space-y-3">
                  {renderUserInfo('Branch Name', mainBranch.branchName)}
                  {renderUserInfo('Contact Person', mainBranch.contactPerson || 'N/A')}
                  {renderUserInfo('Phone', 
                    mainBranch.phone 
                      ? formatPhoneNumberWithCountryCode(mainBranch.phone)
                      : 'N/A'
                  )}
                  {renderUserInfo('Status', mainBranch.status || 'N/A')}
                </div>
              </div>
            )}
          </div>

          {address && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {renderUserInfo('Street', address.street)}
                  {renderUserInfo('City', address.city)}
                </div>
                <div>
                  {renderUserInfo('State/Region', address.state)}
                  {renderUserInfo('Postal Code', address.zipcode)}
                  {renderUserInfo('Country', address.country)}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {renderUserInfo('Account Created', formatDate(business.createdAt))}
                {renderUserInfo('Last Updated', formatDate(business.updatedAt))}
              </div>
              <div>
                {renderUserInfo('Account Status', business.status || 'N/A')}
                {renderUserInfo('Stripe Account', business.stripe_account_id ? 'Connected' : 'Not Connected')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Format role name for display
  const formatRoleName = (role) => {
    if (!role?.role?.name) return '';
    return role.role.name
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  // Get primary role (first role in the array)
  const primaryRole = selectedUser.userRoles?.[0];
  const roleName = formatRoleName(primaryRole);

  return (
    <Drawer
      isOpen={open}
      onClose={onClose}
      title={
        isLoading ? (
          'Loading user details...'
        ) : (
          <div className="flex items-center gap-4">
            <div className="capitalize">
              {selectedUser.name || 'User Details'}
            </div>
            <div className="text-sm font-normal text-text-secondary">
              {selectedUser.email}
            </div>
            <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              selectedUser.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedUser.status || 'INACTIVE'}
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
              className="flex-1"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl text-blue-600 font-medium">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedUser.name || 'N/A'}
                      </h2>
                      {primaryRole && (
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {roleName}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{selectedUser.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Member since {formatDate(selectedUser.createdAt)}</span>
                      <span>•</span>
                      <span>Last login: {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-medium text-gray-700 mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      {renderUserInfo('Email', selectedUser.email)}
                      {renderUserInfo('Phone', 
                        selectedUser.phoneNumber 
                          ? formatPhoneNumberWithCountryCode(selectedUser.phoneNumber)
                          : 'N/A'
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className={`text-sm font-medium ${
                            selectedUser.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {selectedUser.status || 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-medium text-gray-700 mb-3">
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      {renderUserInfo('Account Created', formatDate(selectedUser.createdAt))}
                      {renderUserInfo('Last Active', selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never')}
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                {renderBusinessInfo(selectedUser)}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
};

UserDetail.propTypes = {
  selectedUser: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default UserDetail;
