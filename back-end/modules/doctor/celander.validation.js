const validateCreateCelander = (data) => {
  const errors = {};

  if (!data.doctorId) {
    errors.doctorId = 'Doctor ID is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  if (!data.timeSlots || !Array.isArray(data.timeSlots)) {
    errors.timeSlots = 'Time slots must be an array';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateUpdateCelander = (data) => {
  const errors = {};

  if (data.timeSlots && !Array.isArray(data.timeSlots)) {
    errors.timeSlots = 'Time slots must be an array';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateCreateCelander,
  validateUpdateCelander,
};
