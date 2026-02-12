import { useState, useEffect, Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import { XCircle, ArrowLeft } from 'lucide-react';
import Button from './Button';
import { m, AnimatePresence } from 'framer-motion';

const Modal = ({
  src,
  title,
  info,
  modalBodyFunction,
  leftButtonTitle,
  rightButtonTitle,
  leftButtonFunctionCall,
  rightButtonFunctionCall,
  rightButtonLoading,
  isScrolling,
  isTitleLeft,
  contentWrapperStyles,
  detailModal,
  contentScroll,
  hideTitle,
  header,
  disableRightButton,
  showCloseButton = false,
  showBack,
  onClose,
  imageStyle,
  showSmallModal = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else if (leftButtonFunctionCall) {
        leftButtonFunctionCall();
      }
    }, 300); // Wait for animation to complete before triggering callbacks
  }, [onClose, leftButtonFunctionCall]);

  // ESC key to close the modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleClose]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop with animation */}
          <m.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
          />

          {/* Modal Container with animation */}
          <m.div
            className={`
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              bg-white rounded-3xl shadow-xl flex flex-col
              ${detailModal ? 'w-11/12 md:w-3/4 max-w-5xl' : `w-11/12 md:w-2/3 ${showSmallModal ? 'max-w-sm' : 'max-w-md'}`}
              ${isScrolling ? 'max-h-[90vh]' : contentScroll ? 'max-h-screen' : 'max-h-[90vh]'}
            `}
            onClick={(e) => e.stopPropagation()}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            {/* Custom Header */}
            {header && <div className="w-full">{header()}</div>}

            {/* Modal Title */}
            {!hideTitle && (
              <div
                className={`
                relative flex items-center px-6 pt-6 pb-3 
                ${detailModal ? 'border-b border-gray-200' : ''}
              `}
              >
                {/* Back Button */}
                {!detailModal &&
                  (onClose || leftButtonFunctionCall) &&
                  showBack && (
                    <m.button
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      onClick={onClose ?? leftButtonFunctionCall}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft size={20} />
                    </m.button>
                  )}

                {/* Close Button */}
                {!detailModal &&
                  (onClose || leftButtonFunctionCall) &&
                  showCloseButton && (
                    <m.button
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      onClick={onClose ?? leftButtonFunctionCall}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XCircle size={20} />
                    </m.button>
                  )}

                {/* Image and Title */}
                <div
                  className={`flex items-center ${isTitleLeft ? '' : 'justify-center'} w-full ${showBack || showCloseButton ? 'px-8' : ''}`}
                >
                  {src && (
                    <m.div
                      className={`${imageStyle || 'w-10 h-10'}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <img
                        src={src}
                        alt="Modal icon"
                        className="w-full h-full object-contain"
                      />
                    </m.div>
                  )}
                  <m.h2
                    className={`font-bold text-xl ${isTitleLeft ? 'text-left' : 'text-center'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    {title}
                  </m.h2>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <m.div
              className={`
                px-6 pb-4 ${contentScroll ? 'overflow-y-auto' : ''}
                ${contentWrapperStyles || ''}
                ${detailModal ? 'flex-1' : ''}
              `}
              style={contentWrapperStyles}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {info && <p className="text-gray-600 mb-4">{info}</p>}
              {modalBodyFunction && modalBodyFunction()}
            </m.div>

            {/* Modal Footer */}
            {!detailModal && (leftButtonTitle || rightButtonTitle) && (
              <m.div
                className="px-6 py-4 border-gray-200 flex justify-end gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {leftButtonTitle && (
                  <m.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="secondary"
                      disabled={rightButtonLoading}
                      onClick={leftButtonFunctionCall}
                    >
                      {leftButtonTitle}
                    </Button>
                  </m.div>
                )}

                {rightButtonTitle && (
                  <m.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="primary"
                      onClick={rightButtonFunctionCall}
                      disabled={rightButtonLoading || disableRightButton}
                    >
                      {rightButtonLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                      ) : (
                        rightButtonTitle
                      )}
                    </Button>
                  </m.div>
                )}
              </m.div>
            )}
          </m.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string.isRequired,
  info: PropTypes.string,
  modalBodyFunction: PropTypes.func,
  leftButtonTitle: PropTypes.string,
  rightButtonTitle: PropTypes.string,
  leftButtonFunctionCall: PropTypes.func,
  rightButtonFunctionCall: PropTypes.func,
  rightButtonLoading: PropTypes.bool,
  isScrolling: PropTypes.bool,
  isTitleLeft: PropTypes.bool,
  contentWrapperStyles: PropTypes.object,
  detailModal: PropTypes.bool,
  contentScroll: PropTypes.bool,
  hideTitle: PropTypes.bool,
  header: PropTypes.func,
  disableRightButton: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  showBack: PropTypes.bool,
  onClose: PropTypes.func,
  imageStyle: PropTypes.string,
  showSmallModal: PropTypes.bool,
};

export default Modal;
