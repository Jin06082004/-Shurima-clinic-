import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Bell, Check, Trash2, CalendarCheck, AlertCircle, Info } from 'lucide-react';
import { notificationService } from '@/api';

const typeConfig = {
  appointment_request: {
    icon: CalendarCheck,
    color: 'bg-blue-100 text-blue-700',
    label: 'Yêu cầu đặt lịch',
  },
  appointment_confirmed: {
    icon: CalendarCheck,
    color: 'bg-success-container text-success',
    label: 'Xác nhận lịch hẹn',
  },
  appointment_cancelled: {
    icon: AlertCircle,
    color: 'bg-error-container text-error',
    label: 'Lịch hẹn bị hủy',
  },
  appointment_reminder: {
    icon: AlertCircle,
    color: 'bg-warning-container text-warning',
    label: 'Nhắc nhở',
  },
  system: {
    icon: Info,
    color: 'bg-secondary-container text-on-secondary-container',
    label: 'Hệ thống',
  },
};

const defaultConfig = { icon: Bell, color: 'bg-surface-container text-on-surface-variant', label: 'Thông báo' };

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Vừa xong';
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getMyNotifications(page, 20);
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount ?? 0);
        setPagination(res.data.pagination || { page: 1, total: 0, pages: 1 });
      } else {
        setError(res.message || 'Không tải được thông báo');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi xóa thông báo:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface">Thông báo</h2>
            <p className="text-sm text-on-surface-variant">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo chưa đọc`
                : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-surface-container rounded w-1/2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notifications List */}
      {!loading && (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const cfg = typeConfig[notification.type] || defaultConfig;
            const Icon = cfg.icon;
            return (
              <Card
                key={notification._id}
                className={`transition-all ${
                  !notification.isRead
                    ? 'bg-primary-container/10 border-l-4 border-l-primary'
                    : ''
                }`}
              >
                <CardContent className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-on-surface">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant mt-0.5 whitespace-pre-wrap">
                          {notification.message}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 rounded-md hover:bg-surface-container transition-colors"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="w-4 h-4 text-on-surface-variant" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
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

          {notifications.length === 0 && !error && (
            <div className="text-center py-16">
              <Bell className="w-14 h-14 mx-auto mb-4 text-on-surface-variant opacity-30" />
              <h3 className="text-lg font-medium text-on-surface mb-1">Không có thông báo</h3>
              <p className="text-sm text-on-surface-variant">
                {unreadCount > 0 ? 'Tất cả thông báo đã được đọc.' : 'Bạn chưa có thông báo nào.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchNotifications(pagination.page - 1)}
          >
            Trang trước
          </Button>
          <span className="text-sm text-on-surface-variant px-2">
            Trang {pagination.page} / {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchNotifications(pagination.page + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}