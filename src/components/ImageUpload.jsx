import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import uploadImage from '../assets/uploadImage.svg';
import ImageLoader from './ImageLoader';

const ImageUpload = ({
  onImageUpload,
  minDimensions = '400x400px',
  allowedTypes = 'PNG or JPEG',
  className = '',
  showDimention = true,
  currentImage = null,
  isLoading = false,
}) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateImage = async (file) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Please upload ${allowedTypes}`);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 400 || img.height < 400) {
          reject(new Error(`Image must be at least ${minDimensions}`));
        } else {
          resolve(true);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await validateImage(file);
      setError('');
      onImageUpload(file);
    } catch (err) {
      setError(err.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Circular Image Container */}
      <div
        className={`${showDimention ? 'w-20 h-20' : 'w-15 h-15'} rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden mb-2`}
      >
        {currentImage ? (
          <ImageLoader
            src={currentImage}
            alt="Preview"
            fallbackSrc={uploadImage}
            containerClassName="w-full h-full"
            imageClassName="rounded-full"
          />
        ) : (
          <img
            src={uploadImage}
            alt="Upload"
            className="w-full h-full object-cover rounded-full"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        {/* Upload Text */}
        <p className="text-base text-text-primary font-medium ">
          {currentImage ? 'Change Image' : 'Upload Image'}
        </p>
        <p className="text-sm text-text-info">
          {showDimention && `Min ${minDimensions}, ${allowedTypes}`}
        </p>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={`px-4 py-1 bg-white border border-border text-text-info rounded-lg text-sm hover:bg-gray-50 w-20 mt-2 ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex items-center justify-center`}
        >
          {isLoading ? (
            <span>Loading</span>
          ) : currentImage ? (
            'Change'
          ) : (
            'Upload'
          )}
        </button>

        {error && <p className="text-error text-xs ">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
};

ImageUpload.propTypes = {
  onImageUpload: PropTypes.func.isRequired,
  minDimensions: PropTypes.string,
  allowedTypes: PropTypes.string,
  className: PropTypes.string,
  showDimention: PropTypes.bool,
  currentImage: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default ImageUpload;
