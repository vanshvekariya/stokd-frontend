import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EyeIcon, EyeOffIcon, ChevronDown } from 'lucide-react';
import { countryCodes } from '../constant';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  name,
  variant = 'default',
  icon,
  className,
  defaultCountryCode = '+61',
  onCountryCodeChange,
  disabled = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState(defaultCountryCode || '+61');

  const getStyles = () => {
    const baseStyles = `w-full focus:outline-none transition-colors rounded-lg text-text-primary placeholder:text-text-placeholder placeholder:font-light ${disabled ? 'bg-gray-200 cursor-not-allowed' : ''}`;

    const variants = {
      default:
        'px-3 py-2 h-11 border border-border focus:ring-2 focus:ring-primary focus:border-transparent',
      search:
        'bg-gray-100 py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-green-500',
    };

    let styles = `${baseStyles} ${variants[variant] || variants.default} ${error ? 'border-error focus:ring-error' : ''}`;

    // Add styles to hide number input arrows/spinners
    if (type === 'number' || type === 'tel') {
      styles +=
        ' [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
    }

    return styles;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderInput = () => {
    // Password input with toggle visibility
    if (type === 'password') {
      return (
        <div className="relative w-full">
          <input
            id={name}
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`${getStyles()} pr-10`}
            required={required}
            disabled={disabled}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={togglePasswordVisibility}
            tabIndex="-1" // So it doesn't get focus when tabbing through the form
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      );
    }

    // Phone number input with country code
    if (type === 'tel') {
      return (
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <select
              value={countryCode}
              onChange={(e) => {
                const newCode = `${e.target.value}`;
                setCountryCode(newCode);
                if (onCountryCodeChange) {
                  onCountryCodeChange(newCode);
                }
              }}
              className="appearance-none bg-transparent border-none focus:outline-none pr-6 text-text-primary font-normal "
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 pr-1"
            />
            <div className="border-r h-7 border-border"></div>
          </div>
          <input
            id={name}
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`${getStyles()} pl-19`}
            placeholder="XXX XXX XXX"
            required={required}
            disabled={disabled}
            {...props}
          />
        </div>
      );
    }

    // Default input with icon for search variant
    return (
      <div className="relative flex items-center w-full">
        {icon && variant === 'search' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={getStyles()}
          required={required}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  };

  return (
    <div className={`${className} w-full`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-text-primary mb-1"
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      {renderInput()}

      {variant === 'default' && (
        <p className="text-xs mt-1 ml-2 text-error">{error && error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  required: PropTypes.bool,
  error: PropTypes.string,
  name: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'search']),
  icon: PropTypes.element,
  className: PropTypes.string,
  defaultCountryCode: PropTypes.string,
  onCountryCodeChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Input;
