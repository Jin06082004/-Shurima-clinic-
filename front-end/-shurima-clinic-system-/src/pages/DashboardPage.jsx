import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { appointmentService, userService, scheduleService } from '@/api';
import {
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

function getPatientName(apt) {
  if (apt?.patientName) return apt.patientName;
  const p = apt?.patientId;
  if (p && typeof p === 'object' && p.fullName) return p.fullName;
  return '—';
}

function getPatientInitial(name) {
  const s = String(name || '').trim();
  return s ? s.charAt(0).toUpperCase() : '?';
}

function formatAptDate(apt) {
  if (!apt?.appointmentDate) return '—';
  try {
    return new Date(apt.appointmentDate).toISOString().split('T')[0];
  } catch {
    return '—';
  }
}

function formatAptTime(apt) {
  if (apt?.timeSlot?.from) {
    return apt.timeSlot.to ? `${apt.timeSlot.from} – ${apt.timeSlot.to}` : apt.timeSlot.from;
  }
  if (apt?.appointmentDate) {
    return new Date(apt.appointmentDate).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return '—';
}

export function DashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('📊 DashboardPage - Fetching dashboard data...');
        
        const [apptResponse, userResponse, scheduleResponse] = await Promise.all([
          appointmentService.getAllAppointments().catch(() => ({ success: false, data: [] })),
          userService.getAllUsers().catch(() => ({ success: false, data: [] })),
          scheduleService.getAllSchedules().catch(() => ({ success: false, data: [] })),
        ]);
        
        console.log('📦 DashboardPage - Appointments response:', apptResponse);
        console.log('📦 DashboardPage - Users response:', userResponse);
        console.log('📦 DashboardPage - Schedules response:', scheduleResponse);
        
        if (apptResponse.success) setAppointments(apptResponse.data || []);
        if (userResponse.success) setUsers(userResponse.data || []);
        if (scheduleResponse.success) setSchedules(scheduleResponse.data || []);
      } catch (err) {
        console.error('❌ DashboardPage - Error fetching data:', err);
        setError('Không thể tải dữ liệu bảng điều khiển');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const scheduledCount = appointments.filter((a) => a.status === 'scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const activeDoctors = users.filter((u) => u.role === 'doctor' && u.isActive === true).length;

  const todaySchedules = schedules.filter(
    (s) => s.date === new Date().toISOString().split('T')[0]
  );

  const stats = [
    {
      title: 'Lịch hẹn hôm nay',
      value: appointments.length,
      change: '+12%',
      trend: 'up',
      icon: CalendarDays,
      color: 'text-primary',
      bg: 'bg-primary-container',
    },
    {
      title: 'Đã hoàn thành',
      value: completedCount,
      change: '+8%',
      trend: 'up',
      icon: Activity,
      color: 'text-primary',
      bg: 'bg-primary-container',
    },
    {
      title: 'Đã lên lịch',
      value: scheduledCount,
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'text-tertiary-fixed',
      bg: 'bg-tertiary-fixed/10',
    },
    {
      title: 'Bác sĩ đang trực',
      value: activeDoctors,
      change: '0%',
      trend: 'neutral',
      icon: Users,
      color: 'text-secondary',
      bg: 'bg-secondary-container',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-label-md text-on-surface-variant mb-1">{stat.title}</p>
                  <p className="text-headline-md text-on-surface font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' && (
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    )}
                    {stat.trend === 'down' && (
                      <ArrowDownRight className="w-4 h-4 text-error" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.trend === 'up'
                          ? 'text-primary'
                          : stat.trend === 'down'
                          ? 'text-error'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-on-surface-variant">so với tuần trước</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lịch hẹn gần đây</CardTitle>
              <button className="text-sm text-tertiary-fixed hover:underline">
                Xem tất cả
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => {
                  const patientName = getPatientName(apt);
                  return (
                    <div
                      key={apt._id ?? apt.id}
                      className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                          <span className="text-sm font-medium text-on-primary-container">
                            {getPatientInitial(patientName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{patientName}</p>
                          <p className="text-sm text-on-surface-variant">{apt.reason ?? '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-on-surface">{formatAptTime(apt)}</p>
                        <p className="text-xs text-on-surface-variant">{formatAptDate(apt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Lịch trực hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedules.length > 0 ? (
                  todaySchedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg"
                    >
                      <div className="p-2 rounded-lg bg-primary-container">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-on-surface">{sch.doctorName}</p>
                        <p className="text-sm text-on-surface-variant">{sch.department}</p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {sch.timeRange} • {sch.room}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-on-surface-variant">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Không có lịch trực hôm nay</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
