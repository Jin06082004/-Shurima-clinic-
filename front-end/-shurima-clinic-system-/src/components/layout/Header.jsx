import { Bell, Search, Menu, ChevronDown, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Try to fetch user profile or use cached user
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        console.error('Error parsing user cache:', err);
      }
    }

    // Load notifications from localStorage
    const cachedNotifications = localStorage.getItem('notifications');
    if (cachedNotifications) {
      try {
        const parsed = JSON.parse(cachedNotifications);
        setNotifications(parsed);
      } catch (err) {
        console.error('Error parsing notifications:', err);
      }
    }
  }, [navigate]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    localStorage.setItem('sidebarOpen', JSON.stringify(!sidebarOpen));
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
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
            onClick={handleMarkAllAsRead}
            className="relative p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <Bell className="w-5 h-5 text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount}
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

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-outline-variant z-50">
                <div className="p-3 border-b border-outline-variant">
                  <p className="text-sm font-medium text-on-surface">{user?.fullName || user?.name || 'User'}</p>
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
