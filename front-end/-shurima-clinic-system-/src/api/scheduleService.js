import axiosInstance from './axiosInstance';

const scheduleService = {
  /**
   * @param {object} opts - { page, limit, startDate, endDate } (ISO strings cho khoảng tuần)
   */
  getAllSchedules: async (opts = {}) => {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 200;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (opts.startDate) params.set('startDate', opts.startDate);
    if (opts.endDate) params.set('endDate', opts.endDate);
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
