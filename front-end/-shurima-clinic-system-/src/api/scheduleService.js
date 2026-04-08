import axiosInstance from './axiosInstance';

const scheduleService = {
  // Get all schedules
  getAllSchedules: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page,
      limit,
    });
    const response = await axiosInstance.get(`/doctors/schedule?${params}`);
    const payload = response.data;
    return {
      ...payload,
      data: payload.data?.schedules || [],
      pagination: payload.data?.pagination,
    };
  },

  // Get doctor's schedule by date range
  getDoctorSchedule: async (doctorId, startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    const response = await axiosInstance.get(
      `/doctors/schedule/${doctorId}/schedule?${params}`
    );
    return response.data;
  },

  // Get doctor's schedule by specific date
  getScheduleByDate: async (doctorId, date) => {
    const response = await axiosInstance.get(
      `/doctors/schedule/${doctorId}/schedule/${date}`
    );
    return response.data;
  },

  // Create schedule
  createSchedule: async (data) => {
    const response = await axiosInstance.post('/doctors/schedule/schedule', data);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id, data) => {
    const response = await axiosInstance.put(`/doctors/schedule/schedule/${id}`, data);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    const response = await axiosInstance.delete(`/doctors/schedule/schedule/${id}`);
    return response.data;
  },

  // Mark holiday
  markHoliday: async (doctorId, date, note = '') => {
    const response = await axiosInstance.post(
      `/doctors/schedule/${doctorId}/holiday/${date}`,
      { note }
    );
    return response.data;
  },

  // Unmark holiday
  unmarkHoliday: async (doctorId, date) => {
    const response = await axiosInstance.delete(
      `/doctors/schedule/${doctorId}/holiday/${date}`
    );
    return response.data;
  },
};

export default scheduleService;
