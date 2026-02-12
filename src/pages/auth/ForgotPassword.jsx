import React from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useFormik } from 'formik';
import { forgotSchema } from '../../common/validation';
import { resetPassword } from '../../services/firebase.auth.services';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const handleSubmit = async (values) => {
    try {
      const result = await resetPassword(values.email);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotSchema,
    onSubmit: handleSubmit,
  });
  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <h1 className="text-2xl font-black text-text-primary text-left mb-1">
        Forgot Password
      </h1>

      {/* Login Form */}
      <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formik?.values?.email}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          placeholder="hello@work.com"
          error={formik?.touched.email && formik?.errors.email}
        />

        <Button
          type="submit"
          disabled={formik?.isSubmitting}
          className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          isLoading={formik?.isSubmitting}
        >
          Send verification code
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
