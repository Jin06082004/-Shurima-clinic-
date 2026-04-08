import { useAuthStore, useUIStore, useNotificationStore } from '@/stores';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { notifications, markAllAsRead } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Bảng điều khiển',
      appointments: 'Quản lý Lịch hẹn',
      users: 'Quản lý Người dùng',
      schedule: 'Lịch trực Bác sĩ',
      notifications: 'Thông báo',
    };
    return titles[useUIStore.getState().currentPage] || 'Shurima Clinic';
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl z-30 border-b border-outline-variant transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-20'
      )}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-surface-container transition-colors"
          >
            <Menu className="w-5 h-5 text-on-surface-variant" />
          </button>

          <h1 className="text-headline-sm font-semibold text-on-surface">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant w-48"
            />
          </div>

          {/* Notifications */}
          <button
            onClick={markAllAsRead}
            className="relative p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <Bell className="w-5 h-5 text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User */}
          <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-sm font-medium text-on-primary-container">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-on-surface">
              {user?.name || 'Admin'}
            </span>
            <ChevronDown className="w-4 h-4 text-on-surface-variant hidden md:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
