const validateCreateAdmin = (data) => {
  const errors = {};

  if (!data.userId) {
    errors.userId = 'User ID is required';
  }

  if (data.permissions && !Array.isArray(data.permissions)) {
    errors.permissions = 'Permissions must be an array';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateUpdateAdmin = (data) => {
  const errors = {};

  if (data.permissions && !Array.isArray(data.permissions)) {
    errors.permissions = 'Permissions must be an array';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateCreateAdmin,
  validateUpdateAdmin,
};
