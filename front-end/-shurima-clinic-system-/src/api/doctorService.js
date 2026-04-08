import axiosInstance from './axiosInstance';

const doctorService = {
  // Get all doctors with pagination and filters
  getAllDoctors: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await axiosInstance.get(`/doctors?${params}`);
    const payload = response.data;
    return {
      ...payload,
      data: payload.data?.doctors || [],
      pagination: payload.data?.pagination,
    };
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    const response = await axiosInstance.get(`/doctors/${id}`);
    return response.data;
  },

  // Create doctor
  createDoctor: async (data) => {
    const response = await axiosInstance.post('/doctors', data);
    return response.data;
  },

  // Update doctor
  updateDoctor: async (id, data) => {
    const response = await axiosInstance.put(`/doctors/${id}`, data);
    return response.data;
  },

  // Delete doctor
  deleteDoctor: async (id) => {
    const response = await axiosInstance.delete(`/doctors/${id}`);
    return response.data;
  },

  // Get doctors by clinic
  getDoctorsByClinic: async (clinicId, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page,
      limit,
    });
    const response = await axiosInstance.get(
      `/doctors/clinic/${clinicId}?${params}`
    );
    return response.data;
  },
};

export default doctorService;
