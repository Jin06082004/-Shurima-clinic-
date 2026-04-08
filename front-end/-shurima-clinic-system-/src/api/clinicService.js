import axiosInstance from './axiosInstance';

const clinicService = {
  // Get all clinics with pagination and filters
  getAllClinics: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await axiosInstance.get(`/clinics?${params}`);
    return response.data;
  },

  // Get clinic by ID
  getClinicById: async (id) => {
    const response = await axiosInstance.get(`/clinics/${id}`);
    return response.data;
  },

  // Create clinic
  createClinic: async (data) => {
    const response = await axiosInstance.post('/clinics', data);
    return response.data;
  },

  // Update clinic
  updateClinic: async (id, data) => {
    const response = await axiosInstance.put(`/clinics/${id}`, data);
    return response.data;
  },

  // Delete clinic
  deleteClinic: async (id) => {
    const response = await axiosInstance.delete(`/clinics/${id}`);
    return response.data;
  },

  // Search clinics
  searchClinics: async (searchTerm) => {
    const response = await axiosInstance.get(
      `/clinics/search?search=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  },
};

export default clinicService;
