import * as yup from 'yup';
import {
  NOT_ALLOWED_BLANK_SPACE_REGEX,
  NUMBERS,
  PASSWORD_REGEX,
} from '../constant';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .matches(NOT_ALLOWED_BLANK_SPACE_REGEX, 'Email cannot contain spaces')
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      PASSWORD_REGEX,
      'Must contain at least one uppercase, one number and one special character'
    ),
});

export const createUserSchema = (isSignup = true) => {
  const baseSchema = {
    name: yup
      .string()
      .matches(
        NOT_ALLOWED_BLANK_SPACE_REGEX,
        'Full Name cannot start with blankspaces'
      )
      .required('Full Name is required'),
    email: yup
      .string()
      .matches(NOT_ALLOWED_BLANK_SPACE_REGEX, 'Email cannot contain spaces')
      .email('Invalid email')
      .required('Email is required'),
  };

  // Add password field only for signup
  if (isSignup) {
    baseSchema.password = yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        PASSWORD_REGEX,
        'Must contain at least one uppercase, one number and one special character'
      );
  }

  return yup.object().shape(baseSchema);
};

export const signupSchema = createUserSchema(true);
export const profileSchema = createUserSchema(false);

export const step1Schema = yup.object().shape({
  businessName: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Business Name cannot contain spaces'
    )
    .required('Business Name is required'),
  companyDescription: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Company Description cannot contain spaces'
    )
    .required('Company Description is required'),
  abn: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'ABN cannot start with blankspaces'
    )
    .test('is-abn-valid', 'ABN must be exactly 11 digits', function(value) {
      // If value is empty or null, it's valid (since ABN is optional)
      if (!value) return true;
      // Otherwise, check if it's exactly 11 digits
      return /^\d{11}$/.test(value);
    }),
  // logoImage: yup
  //   .string()
  //   .required('Logo Image is required'),
});

export const step2Schema = yup.object().shape({
  street: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Business Address cannot start with blankspaces'
    )
    .required('Business Address is required'),
  country: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Country cannot start with blankspaces'
    )
    .required('Country is required'),
  state: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'State cannot start with blankspaces'
    )
    .required('State is required'),
  city: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'City cannot start with blankspaces'
    )
    .required('City is required'),
  businessPhone: yup
    .string()
    .matches(NUMBERS, 'Phone number must contain only digits')
    .min(9, 'Phone number must be at least 9 digits long')
    .max(10, 'Phone number must be at most 10 digits long')
    .required('Phone number is required'),
  zipCode: yup
    .string()
    .min(4, 'Post Code must be at least 4 digits long')
    .max(6, 'Post Code cannot be longer than 6 digits')
    .required('Post Code is required'),
});

export const forgotSchema = yup.object().shape({
  email: yup
    .string()
    .matches(NOT_ALLOWED_BLANK_SPACE_REGEX, 'Email cannot contain spaces')
    .email('Invalid email')
    .required('Email is required'),
});

export const setPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      PASSWORD_REGEX,
      'Must contain at least one uppercase, one number and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export const driverSchema = yup.object().shape({
  driverName: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Driver Name cannot start with blankspaces'
    )
    .required('Driver Name is required'),
  deliveryEmail: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Delivery Email cannot contain spaces'
    )
    .email('Invalid email')
    .required('Delivery Email is required'),
  zone: yup.string().required('Delivery Zone is required'),
});

export const productSchema = yup.object().shape({
  name: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Product Name cannot start with blankspaces'
    )
    .required('Product Name is required'),
  sku: yup
    .string()
    .matches(NOT_ALLOWED_BLANK_SPACE_REGEX, 'SKU cannot start with blankspaces'),
  quantity: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, 'Quantity must be a valid number')
    .max(10, 'Quantity must be at most 10 digits long')
    .required('Quantity is required'),
  price: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, 'Price must be a valid number')
    .max(10, 'Price must be at most 10 digits long')
    .required('Price is required'),
  // unitId: yup.string().required('Unit is required'),
  // category: yup.string().required('Category is required'),
});

export const truckSchema = yup.object().shape({
  driverName: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'DriverName cannot start with blankspaces'
    )
    .required('Driver Name is required'),
  registration: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Registration cannot start with blankspaces'
    )
    .required('Registration Name is required'),
  capacity: yup.string().required('Capacity is required'),
});

export const completeRegistrationSchema = yup.object().shape({
  name: yup
    .string()
    .matches(
      NOT_ALLOWED_BLANK_SPACE_REGEX,
      'Full Name cannot start with blankspaces'
    )
    .required('Full Name is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      PASSWORD_REGEX,
      'Must contain at least one uppercase, one number and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});
