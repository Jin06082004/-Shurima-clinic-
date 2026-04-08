const validateRegister = (data) => {
  const errors = {};

  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Valid email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.fullName = 'Full name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = {};

  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Valid email is required';
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateChangePassword = (data) => {
  const errors = {};

  if (!data.oldPassword) {
    errors.oldPassword = 'Old password is required';
  }

  if (!data.newPassword || data.newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
