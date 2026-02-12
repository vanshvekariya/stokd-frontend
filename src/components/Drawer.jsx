import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import { m } from 'framer-motion'; // Import m instead of motion

const Drawer = ({ isOpen, onClose, title, children, footerContent, hideCloseIcon = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay with smooth fade effect */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            className="fixed inset-0 bg-black/30 bg-opacity-50 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Drawer with smooth glide effect */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            className="fixed right-0 top-0 h-full bg-white z-50 w-full max-w-2xl shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 ">
                <div className="font-black text-2xl">{title}</div>
                {!hideCloseIcon && (
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                )}
              </div>

              {/* Content area */}
              <div className="px-6 py-3 flex-1 overflow-y-auto">{children}</div>

              {/* Footer */}
              {footerContent && (
                <div className="shadow-drawer-shadow bg-white px-6 py-4">
                    {footerContent}
                  </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  footerContent: PropTypes.node,
  hideCloseIcon: PropTypes.bool,
};

export default Drawer;
