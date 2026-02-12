// ProfileDetails.jsx
import { useState } from 'react';
import { useFormik } from 'formik';
import { getLocalStorageItem, setLocalStorageItem } from '../../utils/share';
import { updateSupplierPersonalDetails } from '../../services/auth.services';
import { toast } from 'react-toastify';
import { profileSchema } from '../../common/validation';
import UserForm from '../../common/componenets/UserForm';

const ProfileDetails = () => {
  const userData = getLocalStorageItem('user');
  const [isEditing, setIsEditing] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: userData?.user?.name || '',
      email: userData?.user?.email || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const res = await updateSupplierPersonalDetails(values);
        
        // Get the current user data from localStorage
        const currentUserData = getLocalStorageItem('user');
        
        // Update only the user part while preserving the rest of the structure
        const updatedUserData = {
          ...currentUserData,
          user: res.data.data.user || res.data.data, // Handle both response formats
        };
        
        // Save the updated data back to localStorage
        setLocalStorageItem('user', updatedUserData);
        
        toast.success('Personal details updated successfully');
        formik.resetForm();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Update failed');
      } finally {
        setIsEditing(false);
      }
    },
  });

  const handleCancel = () => {
    setIsEditing(false);
    formik.resetForm();
  };

  return (
    <div className="p-6">
      <UserForm
        formik={formik}
        isEditing={isEditing}
        isSignup={false}
        onCancel={handleCancel}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
};

export default ProfileDetails;
