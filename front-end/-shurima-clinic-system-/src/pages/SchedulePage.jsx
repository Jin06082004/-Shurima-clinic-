import { useState, useEffect, useCallback, useMemo } from 'react';
import { scheduleService, doctorService } from '@/api';
import { Card, CardContent, Button, StatusBadge, Input } from '@/components/ui';
import { canEditDoctorSchedule, getUserRole, ROLE } from '@/lib/permissions';
import { Plus, Clock, ChevronLeft, ChevronRight, Stethoscope, MapPin, CalendarOff } from 'lucide-react';

const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const shifts = [
  { id: 'morning', label: 'Sáng', timeRange: '07:00 - 13:00' },
  { id: 'afternoon', label: 'Chiều', timeRange: '13:00 - 19:00' },
  { id: 'evening', label: 'Tối', timeRange: '19:00 - 07:00' },
];

const SHIFT_TIME_SLOTS = {
  morning: [{ from: '07:00', to: '13:00', isAvailable: true }],
  afternoon: [{ from: '13:00', to: '19:00', isAvailable: true }],
  evening: [{ from: '19:00', to: '07:00', isAvailable: true }],
};

function getWeekDates(date) {
  const week = [];
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    week.push(day);
  }
  return week;
}

function formatLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toApiEndOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function toApiStartOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function inferShiftFromSlots(timeSlots) {
  if (!timeSlots?.length) return 'morning';
  const from = timeSlots[0]?.from || '07:00';
  const hh = parseInt(String(from).split(':')[0], 10);
  if (Number.isNaN(hh) || hh < 13) return 'morning';
  if (hh < 19) return 'afternoon';
  return 'evening';
}

/** Tránh lệch ngày khi gửi ISO (đặt giờ trưa local) */
function parseLocalDateInput(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split('-').map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function timeSlotsForShift(shiftId) {
  return SHIFT_TIME_SLOTS[shiftId] || SHIFT_TIME_SLOTS.morning;
}

/** Chuẩn hóa Celander từ API sang dạng lưới ca */
function mapCelandersToGrid(list) {
  if (!Array.isArray(list)) return [];
  return list.map((raw) => {
    const dateObj = new Date(raw.date);
    const dateStr = formatLocalDateKey(dateObj);
    const doc = raw.doctorId;
    let doctorName = 'Bác sĩ';
    if (doc && typeof doc === 'object' && doc.userId) {
      if (typeof doc.userId === 'object' && doc.userId.fullName) {
        doctorName = doc.userId.fullName;
      }
    }
    const shift = raw.isHoliday ? 'morning' : inferShiftFromSlots(raw.timeSlots);
    return {
      id: String(raw._id),
      date: dateStr,
      shift,
      doctorName: raw.isHoliday ? 'Nghỉ / Holiday' : doctorName,
      room: raw.note?.trim() || '—',
      department: doc?.specialization || '—',
      isHoliday: !!raw.isHoliday,
    };
  });
}

export function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [formDate, setFormDate] = useState(() => formatLocalDateKey(new Date()));
  const [formShift, setFormShift] = useState('morning');
  const [formNote, setFormNote] = useState('');
  const [formDoctorId, setFormDoctorId] = useState('');
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const canEdit = canEditDoctorSchedule();
  const userRole = getUserRole();
  const isDoctorUser = userRole === ROLE.DOCTOR;

  const currentWeek = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const fetchWeek = useCallback(async () => {
    const week = getWeekDates(selectedDate);
    const start = week[0];
    const end = week[6];
    try {
      setLoading(true);
      setLoadError(null);
      const response = await scheduleService.getAllSchedules({
        page: 1,
        limit: 500,
        startDate: toApiStartOfDay(start),
        endDate: toApiEndOfDay(end),
      });
      if (response.success) {
        const rawList = response.data ?? [];
        setSchedules(mapCelandersToGrid(rawList));
      } else {
        setSchedules([]);
        setLoadError(response.message || 'Không tải được lịch trực');
      }
    } catch (err) {
      setSchedules([]);
      setLoadError(err.response?.data?.message || 'Không tải được lịch trực');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  useEffect(() => {
    if (!showAddModal || isDoctorUser) return;
    let cancelled = false;
    (async () => {
      try {
        setDoctorsLoading(true);
        const res = await doctorService.getAllDoctors(1, 500);
        if (!cancelled && res.success) {
          setDoctorOptions(res.data || []);
        }
      } catch {
        if (!cancelled) setDoctorOptions([]);
      } finally {
        if (!cancelled) setDoctorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showAddModal, isDoctorUser]);

  const openAddModal = () => {
    setFormDate(formatLocalDateKey(new Date()));
    setFormShift('morning');
    setFormNote('');
    setFormDoctorId('');
    setFormError(null);
    setShowAddModal(true);
  };

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

  const formatDate = (date) =>
    date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getSchedulesForDateAndShift = (date, shiftId) => {
    const dateStr = formatLocalDateKey(date);
    return schedules.filter((s) => s.date === dateStr && s.shift === shiftId);
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!isDoctorUser && !formDoctorId) {
      setFormError('Vui lòng chọn bác sĩ.');
      return;
    }
    const payload = {
      date: parseLocalDateInput(formDate).toISOString(),
      timeSlots: timeSlotsForShift(formShift),
    };
    if (formNote.trim()) payload.note = formNote.trim();
    if (!isDoctorUser) payload.doctorId = formDoctorId;

    try {
      setSubmitting(true);
      const res = await scheduleService.createSchedule(payload);
      if (res.success) {
        await fetchWeek();
        setShowAddModal(false);
      } else {
        setFormError(res.message || 'Không tạo được lịch trực');
      }
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Không tạo được lịch trực';
      if (data && typeof data.message === 'string' && data.message.trim()) {
        msg = data.message.trim();
      } else if (data?.errors != null) {
        msg =
          typeof data.errors === 'string'
            ? data.errors
            : JSON.stringify(data.errors);
      } else if (err.message) {
        msg = err.message;
      }
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

          <div className="flex flex-wrap items-center gap-3">
            {!canEdit && (
              <span className="text-sm text-on-surface-variant">Chế độ xem (chỉ bác sĩ / quản trị được chỉnh sửa)</span>
            )}
            {canEdit && (
              <Button variant="primary" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm lịch trực
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loadError && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm">{loadError}</div>
      )}

      <Card className="overflow-hidden">
        {loading && (
          <div className="px-4 py-3 text-sm text-on-surface-variant border-b border-outline-variant">
            Đang tải lịch trực…
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="p-4 text-left text-label-md text-on-surface-variant font-medium sticky left-0 bg-surface-container-low min-w-[100px] z-10">
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
                        isToday(date) ? 'text-primary' : 'text-on-surface'
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
                  <td className="p-4 sticky left-0 bg-surface-container-lowest z-10 border-r border-outline-variant/50">
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
                        <div className="space-y-2 min-h-[4rem]">
                          {!loading &&
                            daySchedules.map((sch) => (
                              <div
                                key={sch.id}
                                className="p-2 bg-surface-container rounded-lg border border-outline-variant/40"
                              >
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {sch.isHoliday ? (
                                    <CalendarOff className="w-3.5 h-3.5 text-tertiary-fixed shrink-0" />
                                  ) : (
                                    <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                                  )}
                                  <span className="text-xs font-medium text-on-surface truncate">{sch.doctorName}</span>
                                  {sch.isHoliday && (
                                    <StatusBadge variant="pending" className="!text-[10px] !py-0">
                                      Nghỉ
                                    </StatusBadge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{sch.room}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{sch.department}</span>
                                </div>
                              </div>
                            ))}
                          {loading && (
                            <div className="h-16 border border-dashed border-outline-variant/50 rounded-lg bg-surface-container-low/50" />
                          )}
                          {!loading && daySchedules.length === 0 && (
                            <div className="h-16 border border-dashed border-outline-variant rounded-lg flex items-center justify-center text-on-surface-variant/40">
                              {canEdit ? <Plus className="w-4 h-4" /> : <span className="text-xs">Trống</span>}
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

      {showAddModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md card-shadow space-y-4"
            onSubmit={handleSubmitSchedule}
          >
            <h2 className="text-headline-sm text-on-surface">Thêm lịch trực mới</h2>
            {isDoctorUser && (
              <p className="text-sm text-on-surface-variant">
                Lịch sẽ được gán cho tài khoản bác sĩ của bạn.
              </p>
            )}

            {!isDoctorUser && (
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1">Bác sĩ</label>
                <select
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-body-md text-on-surface"
                  value={formDoctorId}
                  onChange={(e) => setFormDoctorId(e.target.value)}
                  disabled={doctorsLoading}
                  required
                >
                  <option value="">{doctorsLoading ? 'Đang tải…' : 'Chọn bác sĩ'}</option>
                  {doctorOptions.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.userId?.fullName || 'Bác sĩ'} — {doc.specialization || '—'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Ngày</label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Ca</label>
              <select
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-body-md text-on-surface"
                value={formShift}
                onChange={(e) => setFormShift(e.target.value)}
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.timeRange})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Ghi chú / phòng (tuỳ chọn)</label>
              <Input
                type="text"
                placeholder="Ví dụ: Phòng 201"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>

            {formError && (
              <div className="text-sm text-error bg-error-container/30 rounded-lg px-3 py-2">{formError}</div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
                disabled={submitting}
              >
                Đóng
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
                {submitting ? 'Đang lưu…' : 'Lưu lịch trực'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
