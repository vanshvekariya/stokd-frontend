import PropTypes from 'prop-types';

const Chip = ({ variant = 'default', text }) => {
  const getChipStyles = () => {
    const baseStyles =
      'inline-flex items-center capitalize justify-center px-3 py-1 rounded-[20px] text-sm font-medium border whitespace-nowrap w-fit';

    const variants = {
      default: 'text-tab-text border-default',
      success: 'text-success-text border-success',
      warning: 'text-yellow-600 border-yellow-400',
      error: 'text-error-text border-chip-error',
      info: 'text-info-text border-info',
    };

    return `${baseStyles} ${variants[variant] || variants.default}`;
  };

  return (
    <div className="inline-block">
      <div className={getChipStyles()}>{text}</div>
    </div>
  );
};

Chip.propTypes = {
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  text: PropTypes.string.isRequired,
};

export default Chip;
