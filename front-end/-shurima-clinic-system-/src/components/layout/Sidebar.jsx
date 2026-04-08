import { useUIStore, useAuthStore, useNotificationStore } from '@/stores';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Clock,
  Bell,
  ChevronLeft,
  LogOut,
  Stethoscope,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { id: 'appointments', label: 'Quản lý Lịch hẹn', icon: CalendarDays },
  { id: 'users', label: 'Quản lý Người dùng', icon: Users },
  { id: 'schedule', label: 'Lịch trực Bác sĩ', icon: Clock },
];

export function Sidebar() {
  const { sidebarOpen, currentPage, setCurrentPage, toggleSidebar } = useUIStore();
  const { notifications } = useNotificationStore();
  const { logout } = useAuthStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white z-40 transition-all duration-300 border-r border-outline-variant',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-outline-variant">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-on-surface">Shurima</span>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mx-auto">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-md hover:bg-surface-container transition-colors',
            !sidebarOpen && 'hidden'
          )}
        >
          <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-container text-on-primary-container font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', !sidebarOpen && 'mx-auto')} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="px-3 mt-4">
        <button
          onClick={() => setCurrentPage('notifications')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            currentPage === 'notifications'
              ? 'bg-primary-container text-on-primary-container font-medium'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          )}
        >
          <div className="relative">
            <Bell className={cn('w-5 h-5', !sidebarOpen && 'mx-auto')} />
            {unreadCount > 0 && sidebarOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          {sidebarOpen && (
            <span className="flex-1 text-left">Thông báo</span>
          )}
          {!sidebarOpen && unreadCount > 0 && (
            <span className="absolute left-10 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* User & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-outline-variant">
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-on-surface-variant hover:bg-surface-container-low'
          )}
        >
          <LogOut className={cn('w-5 h-5', !sidebarOpen && 'mx-auto')} />
          {sidebarOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
