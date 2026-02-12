import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import PlacesAutocomplete from '../../components/places/PlacesAutocomplete';
import SelectedPlace from '../../components/places/SelectedPlace';
import Modal from '../../components/Modal';
import { saveDeliveryZones, getDeliveryZones, deleteDeliveryZone, updateDeliveryZone } from '../../services/deliveryZone.service';
import { getSupplierId } from '../../utils/share';
import { debounce } from '../../utils/common';

/**
 * DeliveryZone component for managing delivery zones with Google Places API
 */
const DeliveryZone = () => {
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState({ show: false });
  const [tempSelectedPlaces, setTempSelectedPlaces] = useState([]);
  const [editingZone, setEditingZone] = useState(null);
  const supplierId = getSupplierId();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Pagination state following the Table component pattern
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  
  const [rowCount, setRowCount] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  
  // Function to fetch delivery zones with pagination and search
  const fetchDeliveryZones = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setIsLoading(true);
      const response = await getDeliveryZones(supplierId, pagination.pageIndex, pagination.pageSize, searchTerm);
      
      if (response && response.data && isMounted.current) {
        setSelectedPlaces(response.data.items || []);
        setRowCount(response.data.total || 0);
      }
    } catch (error) {
      // Don't show error toast on initial load if zones don't exist yet
      if (error.response && error.response.status !== 404 && isMounted.current) {
        toast.error('Failed to load delivery zones');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [supplierId, pagination.pageIndex, pagination.pageSize, searchTerm]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Trigger fetchData when pagination changes
  useEffect(() => {
    fetchDeliveryZones();
  }, [fetchDeliveryZones]);
  
  // Calculate total pages for UI display
  const totalPages = Math.ceil(rowCount / pagination.pageSize);
  
  // Debounced search function using the utility
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchTerm(searchValue);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      // fetchDeliveryZones will be triggered by the useEffect that depends on searchTerm
    }, 500),
    []
  );
  
  // Handle search input change with debounce
  const handleSearchChange = (value) => {
    debouncedSearch(value);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPagination(prev => ({ ...prev, pageIndex: newPage }));
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place) => {
    // Check if place already exists in temp selected places
    const placeExists = tempSelectedPlaces.some(p => p.id === place.id);
    
    if (placeExists) {
      toast.info(`${place.name} is already in your delivery zones`);
      return;
    }
    
    setTempSelectedPlaces(prev => [...prev, place]);
    toast.success(`Added ${place.name} to delivery zones`);
  };

  // Handle place deletion in the modal
  const handleDeleteTempPlace = (placeId) => {
    setTempSelectedPlaces(prev => prev.filter(place => place.id !== placeId));
    toast.info('Removed from delivery zones');
  };
  
  // Handle place deletion on the main page
  const handleDeletePlace = async (placeId) => {
    try {
      setIsLoading(true);
      await deleteDeliveryZone(supplierId, placeId);
      
      // If this was the last item on the page and not the first page, go to previous page
      if (selectedPlaces.length === 1 && pagination.pageIndex > 0) {
        setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
      } else {
        // Otherwise just refresh the current page
        await fetchDeliveryZones();
      }
      
      toast.success('Delivery zone removed successfully');
    } catch (error) {
      toast.error('Failed to remove delivery zone');
      // Using a more user-friendly approach for error logging
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error deleting delivery zone:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit for a delivery zone
  const handleEditPlace = (place) => {
    setEditingZone(place);
    setShowModal({ show: true });
  };
  
  // Open modal and initialize temp selected places
  const handleOpenModal = () => {
    setEditingZone(null);
    setTempSelectedPlaces([]);
    setShowModal({ show: true });
  };
  
  // Close modal without saving
  const handleCloseModal = () => {
    setShowModal({ show: false });
  };

  // Save delivery zones from modal
  const handleSaveZonesFromModal = async () => {
    try {
      setIsSaving(true);
      
      if (editingZone) {
        // If we're editing an existing zone
        const updatedZone = {
          ...tempSelectedPlaces[0], // Should only have one place when editing
          id: editingZone.id
        };
        
        await updateDeliveryZone(supplierId, editingZone.id, updatedZone);
        toast.success('Delivery zone updated successfully');
      } else {
        // If we're adding new zones
        await saveDeliveryZones(tempSelectedPlaces, supplierId);
        toast.success('Delivery zones added successfully');
      }
      
      setShowModal({ show: false });
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      await fetchDeliveryZones();
    } catch (error) {
      // Using a more user-friendly approach for error logging
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error saving delivery zones:', error);
      }
      toast.error(error?.response?.data?.message || 'Failed to save delivery zones');
    } finally {
      setIsSaving(false);
    }
  };
  


  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Delivery Zones</h2>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Delivery Zone
        </button>
      </div>
      
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input 
          type="search" 
          className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Search delivery zones..." 
          value={searchInputValue}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInputValue(value);
            handleSearchChange(value);
          }}
        />
        {searchInputValue && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setSearchInputValue('');
              handleSearchChange('');
            }}
          >
            <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {selectedPlaces.length > 0 ? (
            <div className="mt-4 space-y-4">
              {selectedPlaces.map(place => (
                <div key={place.id} className="border border-border rounded-lg bg-white p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-3">
                      <div className="w-10 h-10 bg-info/20 rounded-full flex justify-center items-center">
                        <div className="text-info-text font-semibold text-2xl">{place.name.charAt(0).toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-secondary-button-text text-lg text-medium">
                          {place.name}
                        </div>
                        <div className="text-text-primary text-sm">
                          {place.city}, {place.state}
                          {place.zipcode && <span className="ml-2">Postcode: {place.zipcode}</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePlace(place.id)}
                      className="text-error hover:text-error-dark p-1 cursor-pointer"
                      aria-label="Delete place"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No delivery zones added yet. Search and select cities or regions above.
            </div>
          )}
        </>
      )}
      

      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(0)}
            disabled={pagination.pageIndex === 0}
            className={`p-2 rounded ${pagination.pageIndex === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
            aria-label="First page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={pagination.pageIndex === 0}
            className={`p-2 rounded ${pagination.pageIndex === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <span className="px-4 py-2 text-sm">
            Page {pagination.pageIndex + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={pagination.pageIndex === totalPages - 1}
            className={`p-2 rounded ${pagination.pageIndex === totalPages - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={pagination.pageIndex === totalPages - 1}
            className={`p-2 rounded ${pagination.pageIndex === totalPages - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
            aria-label="Last page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      

      
      {/* Modal for adding delivery zones */}
      {showModal.show && (
        <Modal
          title={editingZone ? `Edit Delivery Zone: ${editingZone.name}` : "Add Delivery Zone"}
          leftButtonTitle="Cancel"
          rightButtonTitle="Save Changes"
          rightButtonLoading={isSaving}
          rightButtonFunctionCall={handleSaveZonesFromModal}
          leftButtonFunctionCall={handleCloseModal}
          modalBodyFunction={() => (
            <div className="p-4">
              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-3">
                  {editingZone 
                    ? "Edit the delivery zone details" 
                    : "Search for a city, region, or enter a postcode to add to your delivery zones"}
                </p>
                <PlacesAutocomplete 
                  onPlaceSelect={handlePlaceSelect}
                  defaultSearchType="name"
                  initialValue={editingZone ? editingZone.name : ""}
                />
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Selected Delivery Zones</h3>
                {tempSelectedPlaces.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {tempSelectedPlaces.map(place => (
                      <SelectedPlace 
                        key={place.id} 
                        place={place} 
                        onDelete={handleDeleteTempPlace} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-text-secondary bg-gray-50 rounded-lg">
                    No delivery zones selected. Search and add zones above.
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default DeliveryZone;
