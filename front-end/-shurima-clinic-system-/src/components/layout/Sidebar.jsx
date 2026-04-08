import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

import { canManageUsers } from '@/lib/permissions';
import { notificationService } from '@/api';

const menuItems = [
  { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'appointments', label: 'Quản lý Lịch hẹn', icon: CalendarDays, path: '/appointments' },
  { id: 'users', label: 'Quản lý Người dùng', icon: Users, path: '/users', adminOnly: true },
  { id: 'schedule', label: 'Lịch trực Bác sĩ', icon: Clock, path: '/schedule' },
];

function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) {
        setCount(res.data.unreadCount ?? 0);
      }
    } catch {
      // Silently fail, keep current count
    }
  };

  useEffect(() => {
    fetchCount();
    // Polling mỗi 30 giây để cập nhật badge số
    const interval = setInterval(fetchCount, 30000);
    // Đồng bộ khi tab quay lại
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return { count, refresh: fetchCount };
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { count: unreadCount, refresh: refreshCount } = useUnreadNotificationCount();

  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved));
    }
  }, []);

  const handleToggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const visibleMenuItems = menuItems.filter((item) => !item.adminOnly || canManageUsers());

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
          onClick={handleToggleSidebar}
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
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
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
          onClick={() => {
            refreshCount();
            navigate('/notifications');
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            location.pathname === '/notifications'
              ? 'bg-primary-container text-on-primary-container font-medium'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          )}
        >
          <div className="relative">
            <Bell className={cn('w-5 h-5', !sidebarOpen && 'mx-auto')} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          {sidebarOpen && <span className="flex-1 text-left">Thông báo</span>}
          {!sidebarOpen && unreadCount > 0 && (
            <span className="absolute left-10 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* User & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-outline-variant">
        <button
          onClick={handleLogout}
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