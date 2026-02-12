import React from 'react';
import PropTypes from 'prop-types';

const Switch = ({ enabled, onToggle, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-4 after:h-3 after:w-3',
    default: 'w-11 h-6 after:h-5 after:w-5',
    large: 'w-11 h-7 after:h-6 after:w-6',
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={enabled}
        onChange={onToggle}
      />
      <div
        className={`${sizeClasses[size]} bg-gray-200 rounded-full peer 
        peer-checked:after:translate-x-full 
        peer-checked:after:border-white 
        after:content-[''] 
        after:absolute 
        after:top-0.5 
        after:left-[2px] 
        after:bg-white 
        after:border-gray-300 
        after:border 
        after:rounded-full 
        after:transition-all 
        peer-checked:bg-green-500`}
      ></div>
    </label>
  );
};

Switch.propTypes = {
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

Switch.defaultProps = {
  size: 'default',
};

export default Switch;
