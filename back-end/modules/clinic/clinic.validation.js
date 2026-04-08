const validateCreateClinic = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Clinic name is required';
  }

  if (!data.phone || typeof data.phone !== 'string') {
    errors.phone = 'Phone number is required';
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.address) {
    if (data.address.city && typeof data.address.city !== 'string') {
      errors['address.city'] = 'City must be a string';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateUpdateClinic = (data) => {
  const errors = {};

  if (data.name && typeof data.name !== 'string') {
    errors.name = 'Clinic name must be a string';
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.phone = 'Phone number must be a string';
  }

  if (data.email && typeof data.email !== 'string') {
    errors.email = 'Email must be a string';
  } else if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateCreateClinic,
  validateUpdateClinic,
};
