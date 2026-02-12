import PropTypes from 'prop-types';
import { LazyMotion, m, domMax } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

// ----------------------------------------------------------------------

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smoother animation
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96], // Same easing for consistency
    },
  },
};

export const MotionLazy = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let timeoutId;
    const handleNavigation = () => {
      setIsLoading(true);
      // Show loading for at least 800ms for smooth transition
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };

    handleNavigation();

    // Cleanup timeout on unmount or location change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location]);

  return (
    <LazyMotion strict features={domMax}>
      {isLoading && <LoadingScreen />}
      <m.div
        style={{ height: '100%' }}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

MotionLazy.propTypes = {
  children: PropTypes.node,
};
