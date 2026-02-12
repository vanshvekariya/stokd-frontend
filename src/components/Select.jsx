import React, { useState } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';
import Button from './Button';

const CustomSelect = ({
  label,
  placeholder = 'Select Option',
  className = '',
  name,
  readonly,
  error,
  disabled,
  isDisabled,
  id,
  horizontal,
  validate,
  description,
  onChange,
  options = [],
  value,
  defaultValue,
  required = false,
  allowAddNew = false,
  onAddNewOption,
  optionsBgColor = '#ffffff',
  showError = true,
  size = 'md',
  ...rest
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');

  // Convert options to the format react-select expects internally
  const processedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      // For string options, create both id and name as the string value
      return {
        id: opt,
        name: opt,
      };
    }
    // Otherwise use existing id/name
    return opt;
  });

  // Get selected value
  const getSelectedValue = () => {
    if (!value) return null;

    // If value is already an object with id property, find matching option
    if (value && typeof value === 'object' && 'id' in value) {
      const selectedOption = processedOptions.find(
        (opt) => opt.id === value.id
      );
      return selectedOption || value;
    }

    // If value is a primitive (string/number), find the matching option
    const selectedOption = processedOptions.find((opt) => opt.id === value);

    return selectedOption || null;
  };

  const handleChange = (selectedOption) => {
    if (selectedOption?.id === 'add_new_option' && allowAddNew) {
      setShowAddNew(true);
      return;
    }

    if (onChange) {
      onChange(selectedOption);
    }
  };

  const handleAddNewSubmit = () => {
    if (!newOptionValue.trim()) return;
    if (onAddNewOption) {
      // Create new option with id and name
      onAddNewOption({
        id: newOptionValue,
        name: newOptionValue,
      });
    }
    setNewOptionValue('');
    setShowAddNew(false);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.6rem',
      fontWeight: 400,
      backgroundColor: 'transparent',
      borderColor: error ? '#EF4444' : state.isFocused ? '#15803D' : '#E2E4E9',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(49, 130, 206, 0.5)' : 'none',
      '&:hover': { borderColor: state.isFocused ? '#15803D' : '#d1d5db' },
      minHeight: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '44px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: optionsBgColor,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '150px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#868c98',
      fontWeight: 400,
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#15803D'
        : state.isFocused
          ? '#f3f4f6'
          : 'transparent',
      color: state.isSelected ? 'white' : '#0f172a',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#f3f4f6',
      },
    }),
  };

  const finalOptions = [
    ...processedOptions,
    allowAddNew && {
      id: 'add_new_option',
      name: '+ Add New Option',
    },
  ].filter(Boolean);

  // Process default value if provided
  const processedDefaultValue = defaultValue
    ? typeof defaultValue === 'object'
      ? defaultValue
      : {
          id: defaultValue,
          name: defaultValue,
        }
    : undefined;

  return (
    <div
      className={`w-full ${horizontal ? 'flex items-start' : ''} ${className}`}
    >
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-sm font-medium mb-1 text-gray-700`}
        >
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative w-full">
        {!showAddNew ? (
          <Select
            options={finalOptions}
            onChange={handleChange}
            isDisabled={readonly || disabled || isDisabled}
            placeholder={placeholder}
            styles={customStyles}
            value={getSelectedValue()}
            defaultValue={processedDefaultValue}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            {...rest}
          />
        ) : (
          <div className="flex">
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="Enter new option"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              autoFocus
            />
            <Button
              type="button"
              className="ml-2 px-3 bg-primary text-white rounded-lg"
              onClick={handleAddNewSubmit}
            >
              <Plus size={18} />
            </Button>
          </div>
        )}
      </div>
      {showError && error && <p className="text-xs mt-1 text-error">{error}</p>}
      {validate && <p className="text-xs mt-1 text-success-500">{validate}</p>}
      {description && (
        <p className="text-xs mt-1 text-gray-500">{description}</p>
      )}
    </div>
  );
};

CustomSelect.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string,
  readonly: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disabled: PropTypes.bool,
  isDisabled: PropTypes.bool,
  id: PropTypes.string,
  horizontal: PropTypes.bool,
  validate: PropTypes.string,
  description: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  required: PropTypes.bool,
  allowAddNew: PropTypes.bool,
  onAddNewOption: PropTypes.func,
  optionsBgColor: PropTypes.string,
  showError: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default CustomSelect;
