import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import warningIcon from '../assets/warning.svg';

const ErrorModal = ({
    leftButtonFunctionCall,
    rightButtonFunctionCall,
    uploadErrors,
    successCount,
}) => {
    return (
        <Modal
            src={warningIcon}
            imageStyle="w-18 h-18"
            showSmallModal={false}
            leftButtonTitle="Close"
            rightButtonTitle="Download Error Report"
            rightButtonFunctionCall={rightButtonFunctionCall}
            leftButtonFunctionCall={leftButtonFunctionCall}
            modalBodyFunction={() => (
                <div className="px-4 text-text-primary">
                    <h3 className="text-xl font-bold mb-4 text-center">Upload Results</h3>

                    <div className="mb-4">
                        <p className="text-green-600">
                            Successfully uploaded: {successCount} records
                        </p>
                        <p className="text-red-600">
                            Failed to upload: {uploadErrors.length} records
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="font-semibold mb-2">Failed Records:</p>
                        <div className="max-h-60 overflow-y-auto">
                            {uploadErrors.map((error, index) => (
                                <div
                                    key={index}
                                    className="bg-red-50 p-3 rounded-md mb-2 text-sm"
                                >
                                    <p>
                                        <span className="font-semibold">Row {error.rowNumber || index + 1}:</span>{' '}
                                        {error.reason || 'Unknown error'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Click &ldquo;Download Error Report&rdquo; to get detailed information about the failed records.
                        </p>
                    </div>
                </div>
            )}
        />
    );
};

ErrorModal.propTypes = {
    leftButtonFunctionCall: PropTypes.func.isRequired,
    rightButtonFunctionCall: PropTypes.func.isRequired,
    uploadErrors: PropTypes.arrayOf(
        PropTypes.shape({
            rowNumber: PropTypes.number,
            reason: PropTypes.string,
        })
    ).isRequired,
    successCount: PropTypes.number.isRequired,
};

export default ErrorModal; 