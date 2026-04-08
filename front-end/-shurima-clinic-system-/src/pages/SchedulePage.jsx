import { useState } from 'react';
import { useScheduleStore, useUIStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardContent, Button, StatusBadge } from '@/components/ui';
import { Plus, Clock, Calendar, ChevronLeft, ChevronRight, Stethoscope, MapPin } from 'lucide-react';

const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const shifts = [
  { id: 'morning', label: 'Sáng', timeRange: '07:00 - 13:00' },
  { id: 'afternoon', label: 'Chiều', timeRange: '13:00 - 19:00' },
  { id: 'evening', label: 'Tối', timeRange: '19:00 - 07:00' },
];

export function SchedulePage() {
  const { schedules, addSchedule } = useScheduleStore();
  const { showToast } = useUIStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const currentWeek = getWeekDates(selectedDate);

  function getWeekDates(date) {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      week.push(day);
    }
    return week;
  }

  const goToPrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getSchedulesForDateAndShift = (date, shiftId) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter((s) => s.date === dateStr && s.shift === shiftId);
  };

  const handleAddSchedule = () => {
    setShowAddModal(false);
    showToast({ type: 'success', message: 'Thêm lịch trực thành công' });
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToPrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-headline-sm font-semibold text-on-surface">
              Tuần {formatDate(currentWeek[0])} - {formatDate(currentWeek[6])}
            </h2>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm lịch trực
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="p-4 text-left text-label-md text-on-surface-variant font-medium sticky left-0 bg-surface-container-low min-w-[100px]">
                  Ca
                </th>
                {currentWeek.map((date, idx) => (
                  <th
                    key={idx}
                    className={`p-4 text-center min-w-[150px] ${
                      isToday(date) ? 'bg-primary-container/20' : ''
                    }`}
                  >
                    <div className="text-label-md text-on-surface-variant">{days[date.getDay()]}</div>
                    <div
                      className={`text-lg font-semibold ${
                        isToday(date)
                          ? 'text-primary'
                          : 'text-on-surface'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-t border-outline-variant">
                  <td className="p-4 sticky left-0 bg-surface-container-lowest">
                    <div className="font-medium text-on-surface">{shift.label}</div>
                    <div className="text-xs text-on-surface-variant">{shift.timeRange}</div>
                  </td>
                  {currentWeek.map((date, idx) => {
                    const daySchedules = getSchedulesForDateAndShift(date, shift.id);
                    return (
                      <td
                        key={idx}
                        className={`p-2 min-w-[150px] align-top ${
                          isToday(date) ? 'bg-primary-container/10' : ''
                        }`}
                      >
                        <div className="space-y-2">
                          {daySchedules.map((sch) => (
                            <div
                              key={sch.id}
                              className="p-2 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium text-on-surface truncate">
                                  {sch.doctorName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                <MapPin className="w-3 h-3" />
                                {sch.room}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                <Clock className="w-3 h-3" />
                                {sch.department}
                              </div>
                            </div>
                          ))}
                          {daySchedules.length === 0 && (
                            <div className="h-16 border border-dashed border-outline-variant rounded-lg flex items-center justify-center">
                              <Plus className="w-4 h-4 text-on-surface-variant opacity-30" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md card-shadow">
            <h2 className="text-headline-sm text-on-surface mb-6">Thêm lịch trực mới</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSchedule(); }} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Ngày</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Ca trực</label>
                <select className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed">
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>{s.label} ({s.timeRange})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Bác sĩ</label>
                <select className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed">
                  <option value="">Chọn bác sĩ</option>
                  <option value="BS001">BS. Minh Châu - Tim mạch</option>
                  <option value="BS002">BS. Hoàng Nam - Thần kinh</option>
                  <option value="BS003">BS. Thu Hà - Da liễu</option>
                </select>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Phòng</label>
                <input
                  type="text"
                  placeholder="VD: P.201"
                  className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-tertiary-fixed"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Thêm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
