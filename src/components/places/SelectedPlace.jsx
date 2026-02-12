import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display a selected place with delete option
 */
const SelectedPlace = ({ place, onDelete }) => {
  // Get first letter of place name for the icon
  const firstLetter = place.name.charAt(0).toUpperCase();
  
  return (
    <div className="border border-border rounded-lg bg-white p-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 bg-info/20 rounded-full flex justify-center items-center">
            <div className="text-info-text font-semibold text-2xl">{firstLetter}</div>
          </div>
          <div>
            <div className="text-secondary-button-text text-lg text-medium">
              {place.name}
            </div>
            <div className="text-text-primary text-sm">
              {place.formattedAddress}
              {place.postcode && <span className="ml-2">Postcode: {place.postcode}</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={() => onDelete(place.id)}
          className="text-error hover:text-error-dark p-1 cursor-pointer"
          aria-label="Delete place"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

SelectedPlace.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    formattedAddress: PropTypes.string.isRequired,
    lat: PropTypes.number,
    lng: PropTypes.number,
    postcode: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};

export default SelectedPlace;
