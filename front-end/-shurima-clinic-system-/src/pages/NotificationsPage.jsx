import { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Bell, Check, Trash2, Calendar, AlertCircle, Info } from 'lucide-react';

const typeIcons = {
  appointment: Calendar,
  reminder: AlertCircle,
  system: Info,
};

const typeColors = {
  appointment: 'bg-primary-container text-on-primary-container',
  reminder: 'bg-tertiary-fixed/10 text-tertiary-fixed',
  system: 'bg-secondary-container text-on-secondary-container',
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from localStorage (mock implementation)
  useEffect(() => {
    const loadNotifications = () => {
      try {
        console.log('🔔 NotificationsPage - Loading notifications...');
        const stored = localStorage.getItem('notifications');
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
          console.log('📦 NotificationsPage - Loaded', parsed.length, 'notifications');
        } else {
          // Initialize with some sample notifications
          const initial = [
            {
              id: '1',
              title: 'Lịch hẹn đã được xác nhận',
              message: 'Lịch hẹn của bạn vào ngày mai đã được xác nhận bởi bác sĩ',
              type: 'appointment',
              isRead: false,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '2',
              title: 'Nhắc nhở lịch khám',
              message: 'Bạn có lịch khám vào lúc 10:00 sáng mai',
              type: 'reminder',
              isRead: false,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: '3',
              title: 'Bảo trì hệ thống',
              message: 'Hệ thống sẽ bảo trì vào ngày 20/4/2026 từ 22:00 - 06:00',
              type: 'system',
              isRead: true,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ];
          setNotifications(initial);
          localStorage.setItem('notifications', JSON.stringify(initial));
        }
      } catch (err) {
        console.error('❌ NotificationsPage - Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = (id) => {
    console.log('✅ NotificationsPage - Marking as read:', id);
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    console.log('✅ NotificationsPage - Marking all as read');
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    console.log('🗑️ NotificationsPage - Deleting notification:', id);
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface">Thông báo</h2>
            <p className="text-sm text-on-surface-variant">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo chưa đọc`
                : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type];
          return (
            <Card
              key={notification.id}
              className={`transition-all ${
                !notification.isRead
                  ? 'bg-primary-container/10 border-l-4 border-l-primary'
                  : ''
              }`}
            >
              <CardContent className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${typeColors[notification.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold ${!notification.isRead ? 'text-on-surface' : 'text-on-surface'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 rounded-md hover:bg-surface-container transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-4 h-4 text-on-surface-variant" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 rounded-md hover:bg-error-container transition-colors"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-30" />
            <p className="text-on-surface-variant">Không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
