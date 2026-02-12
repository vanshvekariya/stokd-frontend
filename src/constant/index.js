export const ERRORS = {
  NETWORK_ERROR: 'Network Error.',
  SESSION_EXPIRED_ERROR: 'Your session has expired please login again.',
};

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&;])[A-Za-z\d@$!%*?&;]{6,}$/;

export const NOT_ALLOWED_BLANK_SPACE_REGEX = /^(?!^\s+)[\s\S]+$/;

export const NUMBERS = /^[0-9]+$/;

export const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const countryCodes = [
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+64', country: 'NZ', name: 'New Zealand' },
];
