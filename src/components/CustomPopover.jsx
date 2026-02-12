import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const CustomPopover = ({
  open,
  children,
  arrow = 'top-right',
  hiddenArrow,
  onClose,
  className,
  ...other
}) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        ref={popoverRef}
        className={`relative bg-white shadow-lg rounded-lg p-4 ${className}`}
        {...other}
      >
        {!hiddenArrow && (
          <div
            className={`absolute w-3 h-3 bg-white rotate-45 shadow-md ${getArrowPosition(arrow)}`}
          ></div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

const getArrowPosition = (arrow) => {
  const positions = {
    'top-right': 'top-0 right-4 -mt-1',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2 -mt-1',
    'top-left': 'top-0 left-4 -mt-1',
    'bottom-right': 'bottom-0 right-4 -mb-1',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2 -mb-1',
    'bottom-left': 'bottom-0 left-4 -mb-1',
    'left-top': 'left-0 top-4 -ml-1',
    'left-center': 'left-0 top-1/2 transform -translate-y-1/2 -ml-1',
    'left-bottom': 'left-0 bottom-4 -ml-1',
    'right-top': 'right-0 top-4 -mr-1',
    'right-center': 'right-0 top-1/2 transform -translate-y-1/2 -mr-1',
    'right-bottom': 'right-0 bottom-4 -mr-1',
  };
  return positions[arrow] || '';
};

CustomPopover.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
  hiddenArrow: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  arrow: PropTypes.oneOf([
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'left-top',
    'left-center',
    'left-bottom',
    'right-top',
    'right-center',
    'right-bottom',
  ]),
};
