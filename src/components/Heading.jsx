import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const PageHeader = ({
  title,
  searchPlaceholder = 'Search',
  extraComponent,
  buttonText,
  onButtonClick,
  onSearch,
  showSearch = true,
  secondaryButton,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full px-1 py-4 pb-8 bg-white gap-y-2">
      {/* Left section with title and search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
        <div className="text-2xl sm:text-3xl font-black text-gray-900 truncate whitespace-nowrap">
          {title}
        </div>
        {showSearch && (
          <div className="w-full sm:w-1/4">
            <Input
              name="search"
              variant="search"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              icon={<Search color="#64748B" className="w-5 h-5" />}
            />
          </div>
        )}
        {extraComponent && (
          <div className="w-full sm:w-auto flex-shrink-0">{extraComponent}</div>
        )}
      </div>

      {/* Right section with button(s) */}
      <div className="flex flex-row gap-2 w-full sm:w-auto sm:ml-4">
        {secondaryButton}
        {buttonText && (
          <Button size="sm" onClick={onButtonClick} variant="primary" className="w-full sm:w-auto">
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  searchPlaceholder: PropTypes.string,
  extraComponent: PropTypes.node,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
  onSearch: PropTypes.func,
  showSearch: PropTypes.bool,
  secondaryButton: PropTypes.node,
};

export default PageHeader;
