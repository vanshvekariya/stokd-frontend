import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import uploadIcon from '../assets/uploadImage.svg'; // You may want to use a different icon

const FileUpload = ({ onFileUpload, file, onDelete, acceptedFileTypes = '.xlsx, .xls' }) => {
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onFileUpload(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            onFileUpload(selectedFile);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onDelete();
    };

    return (
        <div className="w-full">
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {file ? (
                    <div className="flex flex-col items-center">
                        <img src={uploadIcon} alt="File" className="w-12 h-12 mb-2" />
                        <p className="text-sm text-gray-600">{file.name}</p>
                        <button
                            onClick={handleDelete}
                            className="mt-2 text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <img src={uploadIcon} alt="Upload" className="w-12 h-12 mb-2" />
                        <p className="text-base text-gray-600">
                            Drag and drop your file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Accepted file types: {acceptedFileTypes}
                        </p>
                    </div>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                key={file ? undefined : 'file-input'}
            />
        </div>
    );
};

FileUpload.propTypes = {
    onFileUpload: PropTypes.func.isRequired,
    file: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
    acceptedFileTypes: PropTypes.string,
};

export default FileUpload; 