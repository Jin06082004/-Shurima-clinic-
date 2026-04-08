const validateCreateUser = (data) => {
  const errors = {};

  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.fullName = 'Full name is required';
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Valid email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.role || !['patient', 'doctor', 'admin', 'staff'].includes(data.role)) {
    errors.role = 'Valid role is required (patient, doctor, admin, staff)';
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.phone = 'Phone must be a string';
  }

  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    errors.gender = 'Gender must be male, female, or other';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateUpdateUser = (data) => {
  const errors = {};

  if (data.fullName && typeof data.fullName !== 'string') {
    errors.fullName = 'Full name must be a string';
  }

  if (data.email && typeof data.email !== 'string') {
    errors.email = 'Email must be a string';
  } else if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.role && !['patient', 'doctor', 'admin', 'staff'].includes(data.role)) {
    errors.role = 'Role must be patient, doctor, admin, or staff';
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.phone = 'Phone must be a string';
  }

  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    errors.gender = 'Gender must be male, female, or other';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
