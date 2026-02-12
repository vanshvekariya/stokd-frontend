import React, { useState } from 'react';
import { createStripeAccountLink } from '../services/stripe.services';
import { toast } from 'react-toastify';
import Modal from './Modal';
import PropTypes from 'prop-types';

const StripeOnboardingModal = ({ isOpen, onClose, supplierId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupStripe = async () => {
    if (!supplierId) {
      toast.error('Supplier information not available. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createStripeAccountLink(supplierId);
      const accountLinkUrl = response?.data?.accountLink;
      
      if (accountLinkUrl) {
        // Open the Stripe onboarding URL in a new tab
        window.open(accountLinkUrl, '_self');
        onClose();
      } else {
        toast.error('Failed to generate Stripe onboarding link');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to create Stripe account link'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const modalBody = () => {
    return (
      <div className="mt-2">
        <p className="text-gray-600">
          You need to complete your Stripe account setup to receive payouts. 
          This is a one-time process that will allow you to receive payments 
          directly to your bank account.
        </p>
      </div>
    );
  };

  return isOpen ? (
    <Modal
      title="Complete Stripe Onboarding"
      modalBodyFunction={modalBody}
      leftButtonTitle="Later"
      rightButtonTitle="Set up now"
      leftButtonFunctionCall={onClose}
      rightButtonFunctionCall={handleSetupStripe}
      rightButtonLoading={isLoading}
      showSmallModal={true}
      showCloseButton={false}
      onClose={onClose}
    />
  ) : null;
};

StripeOnboardingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  supplierId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default StripeOnboardingModal;
