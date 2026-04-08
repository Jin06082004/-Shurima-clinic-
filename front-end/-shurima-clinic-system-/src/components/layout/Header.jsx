import { Bell, Search, Menu, ChevronDown, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationService } from '@/api';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        console.error('Lỗi đọc user cache:', err);
      }
    }

    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved));
    }
  }, [navigate]);

  // Lấy số thông báo chưa đọc
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (res.success) {
          setUnreadCount(res.data.unreadCount ?? 0);
        }
      } catch {
        // Silently fail
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(next));
      return next;
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Bảng điều khiển',
      '/appointments': 'Quản lý Lịch hẹn',
      '/users': 'Quản lý Người dùng',
      '/schedule': 'Lịch trực Bác sĩ',
      '/notifications': 'Thông báo',
      '/profile': 'Hồ sơ của tôi',
    };
    return titles[location.pathname] || 'Shurima Clinic';
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
            onClick={handleToggleSidebar}
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
          {/* Notifications */}
          <button
            onClick={handleMarkAllAsRead}
            className="relative p-2 rounded-lg hover:bg-surface-container transition-colors"
            title="Đánh dấu tất cả đã đọc"
          >
            <Bell className="w-5 h-5 text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                <span className="text-sm font-medium text-on-primary-container">
                  {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-on-surface">
                {user?.fullName || user?.name || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-on-surface-variant hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-outline-variant z-50">
                <div className="p-3 border-b border-outline-variant">
                  <p className="text-sm font-medium text-on-surface">
                    {user?.fullName || user?.name || 'User'}
                  </p>
                  <p className="text-xs text-on-surface-variant">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-container-low transition-colors text-sm text-on-surface"
                  >
                    <User className="w-4 h-4" />
                    Hồ sơ của tôi
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-error-container transition-colors text-sm text-error"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}