// Signup.jsx
import { useFormik } from 'formik';
import { signupSchema } from '../../common/validation';
import { signUp } from '../../services/firebase.auth.services';
import { toast } from 'react-toastify';
import { paths } from '../../routes/paths';
import { useNavigate } from 'react-router-dom';
import SocialLogin from './SocialLogin';
import { useState } from 'react';
import UserForm from '../../common/componenets/UserForm';
import { useLoginType, LOGIN_TYPES } from '../../utils/loginType';

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const loginType = useLoginType();

  const handleSubmit = async (values) => {
    try {
      const result = await signUp(values);
      if (result.success) {
        toast.success('Sign-In successful!');
        navigate(paths.auth.profileSetup);
      } else {
        toast.error(result.error || 'Sign-In failed');
      }
    } catch (error) {
      toast.error(error || 'An unexpected error occurred');
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: signupSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="w-full max-w-sm flex flex-col gap-5 h-full">
      <h1 className="text-2xl font-black text-text-primary text-center mb-1">
        Create a new{' '}
        {loginType === LOGIN_TYPES.RESTAURANT ? 'restaurant' : 'supplier'}{' '}
        account
      </h1>

      {/* Social Login Buttons */}
      <SocialLogin setIsLoading={setIsLoading} isLoading={isLoading} />

      {/* Login Form */}
      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
        <UserForm
          formik={formik}
          isSignup={true}
          isEditing={true}
          submitButtonText="Register"
          showPasswordInfo={true}
        />
      </form>
    </div>
  );
};

export default Signup;
