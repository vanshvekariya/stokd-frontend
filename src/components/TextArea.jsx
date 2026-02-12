import React from 'react';
import PropTypes from 'prop-types';

const TextArea = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  name,
  rows,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-text-primary mb-1"
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-text-primary placeholder:text-text-placeholder placeholder:font-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
          error ? 'border-error focus:ring-error' : 'border-border'
        }`}
        required={required}
        {...props}
      />
      {error && <p className="-mt-0.5 text-sm text-error">{error}</p>}
    </div>
  );
};

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  rows: PropTypes.string,
  ...PropTypes.object,
};

export default TextArea;
