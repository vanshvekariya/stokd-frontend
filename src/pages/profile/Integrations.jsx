import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MYOB from '../../assets/myob.png';
import XERO from '../../assets/xero.png';
import Button from '../../components/Button';
import {
  coonectIntegration,
  disConnectIntegration,
  getIntegrationDetails,
} from '../../services/integration.services';
import { getSupplierId } from '../../utils/share';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SkeletonCard from '../../components/loader/SkeletonCard';

const integrations = [
  {
    id: 'XERO',
    name: 'Xero',
    logo: XERO,
    description: 'Get your accounting done with the Xero Accounting app',
    enabled: false,
  },
  {
    id: 'MYOB',
    name: 'MYOB',
    logo: MYOB,
    description: 'Get your accounting done with the Xero Accounting app',
    enabled: true,
  },
  {
    id: 'NAVISION',
    name: 'Navison',
    logo: null,
    description: 'Get your accounting done with the Xero Accounting app',
    enabled: true,
  },
  {
    id: 'PRONTO',
    name: 'Pronto',
    logo: null,
    description: 'Get your accounting done with the Xero Accounting app',
    enabled: true,
  },
];

const IntegrationCard = ({
  logo,
  name,
  description,
  isConnected,
  onClick,
  disabled,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 h-fit">
      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-col gap-3">
          {/* Logo/Icon */}
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500 text-xl">{name[0]}</span>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <h3 className="text-gray-900 font-medium">{name}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <Button variant="primary" onClick={onClick} disabled={disabled}>
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </div>
  );
};

IntegrationCard.propTypes = {
  logo: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isConnected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

IntegrationCard.defaultProps = {
  logo: null,
};

// Main Integrations Component
const Integrations = () => {
  const supplierId = getSupplierId();
  const params = useLocation();
  const [integrationDetails, setIntegrationDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await getIntegrationDetails(supplierId);
      setIntegrationDetails(response.data.data[0]);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.search.includes('errorMessage')) {
      toast.error('Failed to connect to the integration');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchIntegrations();
  }, [params.search]);

  const handleConnect = async (id) => {
    try {
      if (
        integrationDetails?.provider === id &&
        integrationDetails?.status === 'ACTIVE'
      ) {
        await disConnectIntegration(supplierId, integrationDetails?.id);
        fetchIntegrations();
        toast.success('Integration disconnected successfully');
      } else {
        const response = await coonectIntegration(supplierId, { provider: id });
        window.location.href = response.data.data.authorizationUrl;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          {isLoading
            ? // Show skeleton loaders with staggered animation
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} index={index} />
              ))
            : // Show actual integration cards with animation
              integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  logo={integration.logo}
                  name={integration.name}
                  description={integration.description}
                  onClick={() => handleConnect(integration.id)}
                  isConnected={
                    integrationDetails &&
                    integrationDetails?.provider === integration.id &&
                    integrationDetails?.status === 'ACTIVE'
                  }
                  disabled={
                    integrationDetails &&
                    integrationDetails?.status === 'ACTIVE' &&
                    integrationDetails?.provider !== integration.id
                  }
                />
              ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Integrations;
