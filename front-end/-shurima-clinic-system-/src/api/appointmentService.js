import axiosInstance from './axiosInstance';

const appointmentService = {
  // Get all appointments with pagination and filters
  getAllAppointments: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await axiosInstance.get(`/appointments?${params}`);
    const payload = response.data;
    return {
      ...payload,
      data: payload.data?.appointments || [],
      pagination: payload.data?.pagination,
    };
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  },

  // Create appointment
  createAppointment: async (data) => {
    const response = await axiosInstance.post('/appointments', data);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, data) => {
    const response = await axiosInstance.put(`/appointments/${id}`, data);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await axiosInstance.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Complete appointment
  completeAppointment: async (id) => {
    const response = await axiosInstance.patch(`/appointments/${id}/complete`);
    return response.data;
  },

  // Rate appointment
  rateAppointment: async (id, rating) => {
    const response = await axiosInstance.patch(`/appointments/${id}/rate`, {
      rating,
    });
    return response.data;
  },

  // Get current user's appointments
  getMyAppointments: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page,
      limit,
    });
    const response = await axiosInstance.get(
      `/appointments/my/appointments?${params}`
    );
    return response.data;
  },

  // Get doctor's appointments
  getDoctorAppointments: async (doctorId, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page,
      limit,
    });
    const response = await axiosInstance.get(
      `/appointments/doctor/${doctorId}/appointments?${params}`
    );
    return response.data;
  },
};

export default appointmentService;
