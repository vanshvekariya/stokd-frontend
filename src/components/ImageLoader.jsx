import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { m, AnimatePresence } from 'framer-motion';
import './imageLoader.css';

const ImageLoader = ({
  src,
  alt = 'Image',
  className = '',
  fallbackSrc = null,
  loadingComponent = null,
  containerClassName = '',
  imageClassName = '',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setError(true);
      return;
    }

    setIsLoading(true);
    setError(false);
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <m.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`w-full h-full ${imageClassName}`}
        >
          {loadingComponent || (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          )}
        </m.div>
      );
    }

    if (error || !imageSrc) {
      return (
        <m.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`w-full h-full ${imageClassName}`}
        >
          {fallbackSrc ? (
            <img 
              src={fallbackSrc} 
              alt={alt} 
              className={`w-full h-full object-cover ${imageClassName}`}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
        </m.div>
      );
    }

    return (
      <m.img
        key="image"
        src={imageSrc}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full h-full object-cover image-fade-in ${imageClassName}`}
      />
    );
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName} ${className}`}>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

ImageLoader.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  loadingComponent: PropTypes.node,
  containerClassName: PropTypes.string,
  imageClassName: PropTypes.string,
};

export default ImageLoader;
