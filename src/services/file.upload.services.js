/* eslint-disable no-console */
import axios from 'axios';
import { API_URL } from '../common/envVariables';

export const fileUpload = async (folder, key, file, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/media?entityType=${folder}`,
      {
        assetPurpose: 'profile',
        fileName: key.trim().replace(/\s+/g, '_'),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fileUploadData = response?.data?.data;

    if (!fileUploadData || !fileUploadData.apiUrl) {
      throw new Error('Invalid upload data received');
    }

    // Convert file to binary data using FileReader
    const binaryData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });

    // Send binary data in PUT request
    await axios.put(fileUploadData.apiUrl, binaryData, {
      headers: {
        'Content-Type': file?.type || 'application/octet-stream',
      },
      transformRequest: [(data) => data],
    });

    return fileUploadData;
  } catch (error) {
    console.error('Error during file upload:', error);
    throw error;
  }
};

export const fileUploadWithBlob = async (folder, key, file) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${API_URL}/media`,
      {
        folder: folder,
        fileName: key.trim().replace(/\s+/g, '_'),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fileUploadData = response?.data?.data;

    if (!fileUploadData || !fileUploadData.apiUrl) {
      throw new Error('Invalid upload data received');
    }

    // Create a Blob from the file if it's not already a Blob
    const blob =
      file instanceof Blob ? file : new Blob([file], { type: file.type });

    await axios.put(fileUploadData.apiUrl, blob, {
      headers: {
        'Content-Type': file?.type || 'application/octet-stream',
      },
      transformRequest: [(data) => data],
    });

    return fileUploadData;
  } catch (error) {
    console.error('Error during file upload:', error);
    throw error;
  }
};
