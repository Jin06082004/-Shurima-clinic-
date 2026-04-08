import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store - Quản lý đăng nhập/đăng xuất
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Demo user
          const user = {
            id: 'USR001',
            email,
            name: 'Nguyễn Văn A',
            role: 'admin',
            avatar: null,
          };

          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: 'Đăng nhập thất bại', isLoading: false });
          return { success: false };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Gọi API backend khi có backend
          // const response = await fetch('/api/auth/register', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data),
          // });
          // if (!response.ok) throw new Error('Đăng ký thất bại');
          // const result = await response.json();

          // Demo: giả lập thành công sau 1s
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log('Register data:', data); // Debug log cho backend sử dụng
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: 'Đăng ký thất bại. Vui lòng thử lại.', isLoading: false });
          return { success: false };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'shurima-auth',
    }
  )
);

// Appointment Store - Quản lý lịch hẹn
export const useAppointmentStore = create(
  persist(
    (set, get) => ({
      appointments: [
        {
          id: 'APT001',
          patientName: 'Trần Thị B',
          doctorName: 'BS. Minh Châu',
          department: 'Tim mạch',
          date: '2026-04-10',
          time: '09:00',
          status: 'confirmed',
          phone: '0912345678',
          reason: 'Khám định kỳ',
        },
        {
          id: 'APT002',
          patientName: 'Lê Văn C',
          doctorName: 'BS. Hoàng Nam',
          department: 'Thần kinh',
          date: '2026-04-10',
          time: '10:30',
          status: 'pending',
          phone: '0923456789',
          reason: 'Đau đầu kinh niên',
        },
        {
          id: 'APT003',
          patientName: 'Phạm Thị D',
          doctorName: 'BS. Thu Hà',
          department: 'Da liễu',
          date: '2026-04-09',
          time: '14:00',
          status: 'cancelled',
          phone: '0934567890',
          reason: 'Nổi mẩn đỏ',
        },
      ],
      selectedDate: new Date().toISOString().split('T')[0],
      filterStatus: 'all',

      addAppointment: (appointment) => {
        const newAppointment = {
          ...appointment,
          id: `APT${Date.now()}`,
          status: 'pending',
        };
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
      },

      updateAppointment: (id, updates) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, ...updates } : apt
          ),
        }));
      },

      deleteAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.filter((apt) => apt.id !== id),
        }));
      },

      approveAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, status: 'confirmed' } : apt
          ),
        }));
      },

      cancelAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, status: 'cancelled' } : apt
          ),
        }));
      },

      setSelectedDate: (date) => set({ selectedDate: date }),
      setFilterStatus: (status) => set({ filterStatus: status }),

      getFilteredAppointments: () => {
        const { appointments, filterStatus } = get();
        if (filterStatus === 'all') return appointments;
        return appointments.filter((apt) => apt.status === filterStatus);
      },
    }),
    {
      name: 'shurima-appointments',
    }
  )
);

// User Store - Quản lý người dùng
export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'USR001',
          name: 'Nguyễn Văn A',
          email: 'admin@shurimaclinic.com',
          role: 'admin',
          department: 'Quản trị',
          status: 'active',
          phone: '0912345678',
          joinDate: '2025-01-15',
        },
        {
          id: 'USR002',
          name: 'BS. Minh Châu',
          email: 'minhchau@shurimaclinic.com',
          role: 'doctor',
          department: 'Tim mạch',
          status: 'active',
          phone: '0912345679',
          joinDate: '2025-03-20',
        },
        {
          id: 'USR003',
          name: 'BS. Hoàng Nam',
          email: 'hoangnam@shurimaclinic.com',
          role: 'doctor',
          department: 'Thần kinh',
          status: 'active',
          phone: '0912345680',
          joinDate: '2025-04-10',
        },
        {
          id: 'USR004',
          name: 'Điều dưỡng Linh',
          email: 'linh@shurimaclinic.com',
          role: 'nurse',
          department: 'Hồi sức',
          status: 'active',
          phone: '0912345681',
          joinDate: '2025-06-01',
        },
      ],
      searchTerm: '',
      filterRole: 'all',

      addUser: (user) => {
        const newUser = {
          ...user,
          id: `USR${Date.now()}`,
          status: 'active',
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilterRole: (role) => set({ filterRole: role }),

      getFilteredUsers: () => {
        const { users, searchTerm, filterRole } = get();
        return users.filter((user) => {
          const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = filterRole === 'all' || user.role === filterRole;
          return matchesSearch && matchesRole;
        });
      },
    }),
    {
      name: 'shurima-users',
    }
  )
);

// Schedule Store - Quản lý lịch trực
export const useScheduleStore = create(
  persist(
    (set, get) => ({
      schedules: [
        {
          id: 'SCH001',
          doctorName: 'BS. Minh Châu',
          department: 'Tim mạch',
          date: '2026-04-08',
          shift: 'morning',
          timeRange: '07:00 - 13:00',
          room: 'P.201',
          status: 'scheduled',
        },
        {
          id: 'SCH002',
          doctorName: 'BS. Hoàng Nam',
          department: 'Thần kinh',
          date: '2026-04-08',
          shift: 'afternoon',
          timeRange: '13:00 - 19:00',
          room: 'P.202',
          status: 'scheduled',
        },
        {
          id: 'SCH003',
          doctorName: 'BS. Thu Hà',
          department: 'Da liễu',
          date: '2026-04-08',
          shift: 'morning',
          timeRange: '07:00 - 13:00',
          room: 'P.203',
          status: 'scheduled',
        },
      ],
      selectedWeek: new Date().toISOString().split('T')[0],

      addSchedule: (schedule) => {
        const newSchedule = {
          ...schedule,
          id: `SCH${Date.now()}`,
        };
        set((state) => ({ schedules: [...state.schedules, newSchedule] }));
      },

      updateSchedule: (id, updates) => {
        set((state) => ({
          schedules: state.schedules.map((sch) =>
            sch.id === id ? { ...sch, ...updates } : sch
          ),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((sch) => sch.id !== id),
        }));
      },

      setSelectedWeek: (date) => set({ selectedWeek: date }),

      getSchedulesByDate: (date) => {
        return get().schedules.filter((sch) => sch.date === date);
      },
    }),
    {
      name: 'shurima-schedules',
    }
  )
);

// Notification Store - Quản lý thông báo
export const useNotificationStore = create((set, get) => ({
  notifications: [
    {
      id: 'NTF001',
      title: 'Lịch hẹn mới',
      message: 'Có lịch hẹn mới từ bệnh nhân Trần Thị B',
      type: 'appointment',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'NTF002',
      title: 'Nhắc nhở',
      message: 'Lịch trực ngày mai cần xác nhận',
      type: 'reminder',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'NTF003',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 22:00',
      type: 'system',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: `NTF${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((ntf) =>
        ntf.id === id ? { ...ntf, isRead: true } : ntf
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((ntf) => ({ ...ntf, isRead: true })),
    }));
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((ntf) => ntf.id !== id),
    }));
  },

  getUnreadCount: () => {
    return get().notifications.filter((ntf) => !ntf.isRead).length;
  },
}));

// UI Store - Quản lý trạng thái UI
export const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  currentPage: 'dashboard',
  modalOpen: null,
  toast: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentPage: (page) => set({ currentPage: page }),

  openModal: (modalName) => set({ modalOpen: modalName }),
  closeModal: () => set({ modalOpen: null }),

  showToast: (toast) => {
    set({ toast });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  hideToast: () => set({ toast: null }),
}));
