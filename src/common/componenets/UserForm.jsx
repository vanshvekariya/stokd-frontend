import React from 'react';
import { Info } from 'lucide-react';
import PropTypes from 'prop-types';
import Input from '../../components/Input';
import Button from '../../components/Button';

const UserForm = ({
  formik,
  isSignup = false,
  onCancel,
  submitButtonText = 'Save Changes',
  cancelButtonText = 'Cancel',
  showPasswordInfo = false,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Full Name"
        type="text"
        name="name"
        value={formik?.values?.name}
        onChange={formik?.handleChange}
        onBlur={formik?.handleBlur}
        placeholder="James Brown"
        error={formik?.touched.name && formik?.errors.name}
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formik?.values?.email}
        onChange={formik?.handleChange}
        onBlur={formik?.handleBlur}
        placeholder="hello@work.com"
        error={formik?.touched.email && formik?.errors.email}
        disabled={isSignup ? false : true}
      />

      {isSignup && (
        <>
          <Input
            label="Password"
            type="password"
            name="password"
            value={formik?.values.password || ''}
            onChange={formik?.handleChange}
            onBlur={formik?.handleBlur}
            placeholder="Enter your password"
            error={formik?.touched.password && formik?.errors.password}
          />
          {showPasswordInfo && (
            <p className="text-xs text-text-info items-center gap-0.5 flex -mt-4">
              <Info
                className="text-xs text-text-info"
                size={14}
                fill="#868c98"
                stroke="white"
              />
              Must contain 1 uppercase letter, 1 number, min 8 characters.
            </p>
          )}
        </>
      )}

      <div className="flex justify-end gap-3 mt-2">
        {isSignup ? (
          <Button
            type="submit"
            disabled={formik?.isSubmitting}
            className="w-full"
            isLoading={formik?.isSubmitting}
          >
            {submitButtonText}
          </Button>
        ) : (
          <>
            <Button variant="secondary" className="w-2/5" onClick={onCancel}>
              {cancelButtonText}
            </Button>
            <Button
              onClick={formik?.handleSubmit}
              isLoading={formik?.isSubmitting}
              className={onCancel ? 'w-3/5' : 'w-full'}
            >
              {submitButtonText}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

UserForm.propTypes = {
  formik: PropTypes.object.isRequired,
  isEditing: PropTypes.bool,
  isSignup: PropTypes.bool,
  onCancel: PropTypes.func,
  onEdit: PropTypes.func,
  submitButtonText: PropTypes.string,
  editButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  showPasswordInfo: PropTypes.bool,
};

export default UserForm;
