import { useState, useEffect } from 'react';
import { appointmentService, userService, doctorService, clinicService } from '@/api';
import { Card, CardContent, Button, StatusBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { Plus, Search, Calendar, Check, X, MoreHorizontal, X as XIcon } from 'lucide-react';

// Danh sách giờ khám
const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

// Danh sách khoa
const DEPARTMENTS = [
  'Tim mạch',
  'Thần kinh',
  'Da liễu',
  'Nhi khoa',
  'Tai Mũi Họng',
  'Mắt',
  'Nội tổng quát',
  'Sản phụ khoa',
  'Cơ xương khớp',
  'Hô hấp',
];

function BookingModal({ isOpen, onClose, onSuccess, doctors }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [bookingClinicId, setBookingClinicId] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    timeSlotFrom: '07:00',
    timeSlotTo: '07:30',
    reason: '',
    notes: '',
    consultationType: 'in-person',
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          setUserProfile(response.data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await clinicService.getAllClinics(1, 200);
        if (cancelled) return;
        const list = res.success && res.data?.clinics ? res.data.clinics : [];
        setClinics(list);
      } catch {
        if (!cancelled) setClinics([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!formData.doctorId || !doctors.length) {
      setBookingClinicId('');
      return;
    }
    const doc = doctors.find((d) => String(d._id || d.id) === String(formData.doctorId));
    if (!doc) {
      setBookingClinicId('');
      return;
    }
    const fromDoc = doc.clinicId?._id || doc.clinicId;
    if (fromDoc) {
      setBookingClinicId(String(fromDoc));
    } else if (clinics.length === 1) {
      setBookingClinicId(String(clinics[0]._id));
    } else {
      setBookingClinicId('');
    }
  }, [formData.doctorId, doctors, clinics]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.doctorId) newErrors.doctorId = 'Vui lòng chọn bác sĩ';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Vui lòng chọn ngày khám';
    if (!formData.reason.trim()) newErrors.reason = 'Vui lòng nhập lý do khám';
    if (!bookingClinicId) newErrors.clinicId = 'Vui lòng chọn phòng khám';

    // Kiểm tra ngày không được trong quá khứ
    const today = new Date().toISOString().split('T')[0];
    if (formData.appointmentDate && formData.appointmentDate < today) {
      newErrors.appointmentDate = 'Ngày khám không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate() || !userProfile) return;

    setIsLoading(true);

    try {
      const selectedDoctor = doctors.find(
        (d) => String(d._id || d.id) === String(formData.doctorId)
      );

      if (!selectedDoctor) {
        setErrors({ submit: 'Bác sĩ không hợp lệ' });
        return;
      }

      if (!bookingClinicId) {
        setErrors({ submit: 'Vui lòng chọn phòng khám.' });
        return;
      }

      const appointmentData = {
        patientId: userProfile._id || userProfile.id,
        doctorId: formData.doctorId,
        clinicId: bookingClinicId,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        timeSlot: {
          from: formData.timeSlotFrom,
          to: formData.timeSlotTo,
        },
        reason: formData.reason,
        notes: formData.notes,
        consultationType: formData.consultationType,
      };

      console.log('📋 AppointmentsPage - Creating appointment:', appointmentData);
      
      const response = await appointmentService.createAppointment(appointmentData);
      console.log('📦 AppointmentsPage - Create response:', response);

      if (response.success) {
        console.log('✅ AppointmentsPage - Appointment created successfully');
        onSuccess();
        onClose();

        // Reset form
        setFormData({
          doctorId: '',
          appointmentDate: '',
          timeSlotFrom: '07:00',
          timeSlotTo: '07:30',
          reason: '',
          notes: '',
          consultationType: 'in-person',
        });
        setBookingClinicId('');
      } else {
        setErrors({ submit: response.message || 'Tạo lịch hẹn thất bại' });
      }
    } catch (error) {
      console.error('❌ AppointmentsPage - Booking error:', error);
      setErrors({ submit: error.response?.data?.message || 'Tạo lịch hẹn thất bại. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Lấy ngày tối thiểu (hôm nay)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto card-shadow">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest p-6 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface">Đặt lịch khám</h2>
            <p className="text-sm text-on-surface-variant mt-1">Điền thông tin để đặt lịch hẹn</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <XIcon className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.submit && (
            <div className="p-4 bg-error/10 rounded-lg border border-error/30">
              <p className="text-sm text-error">{errors.submit}</p>
            </div>
          )}

          {/* Bác sĩ */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Bác sĩ khám <span className="text-error">*</span>
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.doctorId ? 'ring-2 ring-error' : ''
              }`}
            >
              <option value="">Chọn bác sĩ</option>
              {doctors.map((doctor) => (
                <option key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                  {doctor.userId?.fullName || doctor.fullName || 'Bác sĩ'} —{' '}
                  {doctor.specialization ||
                    doctor.userId?.department ||
                    'Chưa phân chuyên khoa'}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-xs text-error mt-1">{errors.doctorId}</p>
            )}
          </div>

          {/* Phòng khám — backend bắt buộc clinicId; bác sĩ có thể chưa gán phòng trong hồ sơ */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Phòng khám <span className="text-error">*</span>
            </label>
            {clinics.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Chưa có phòng khám trong hệ thống. Vui lòng liên hệ quản trị.
              </p>
            ) : (
              <select
                value={bookingClinicId}
                onChange={(e) => {
                  setBookingClinicId(e.target.value);
                  setErrors((prev) => ({ ...prev, clinicId: '' }));
                }}
                className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  errors.clinicId ? 'ring-2 ring-error' : ''
                }`}
              >
                <option value="">Chọn phòng khám</option>
                {clinics.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || 'Phòng khám'}
                    {c.address?.city ? ` — ${c.address.city}` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.clinicId && (
              <p className="text-xs text-error mt-1">{errors.clinicId}</p>
            )}
          </div>

          {/* Ngày khám */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Ngày khám <span className="text-error">*</span>
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.appointmentDate ? 'ring-2 ring-error' : ''
              }`}
            />
            {errors.appointmentDate && (
              <p className="text-xs text-error mt-1">{errors.appointmentDate}</p>
            )}
          </div>

          {/* Giờ khám */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Từ giờ <span className="text-error">*</span>
              </label>
              <select
                name="timeSlotFrom"
                value={formData.timeSlotFrom}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Đến giờ <span className="text-error">*</span>
              </label>
              <select
                name="timeSlotTo"
                value={formData.timeSlotTo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loại khám */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Loại khám
            </label>
            <select
              name="consultationType"
              value={formData.consultationType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed"
            >
              <option value="in-person">Khám trực tiếp</option>
              <option value="online">Khám trực tuyến</option>
            </select>
          </div>

          {/* Lý do khám */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Lý do khám <span className="text-error">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed resize-none ${
                errors.reason ? 'ring-2 ring-error' : ''
              }`}
              placeholder="Mô tả triệu chứng hoặc lý do khám..."
            />
            {errors.reason && (
              <p className="text-xs text-error mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Ghi chú thêm */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Ghi chú thêm
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed resize-none"
              placeholder="Dị ứng thuốc, bệnh nền, v.v. (nếu có)"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="flex-1"
            >
              Đặt lịch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch appointments and doctors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📊 AppointmentsPage - Fetching appointments and doctors...');

        const [apptResponse, doctorResponse] = await Promise.all([
          appointmentService.getAllAppointments().catch(() => ({ success: false, data: [] })),
          // Backend mặc định limit=10 — nếu không truyền, dropdown chỉ có 10 bác sĩ đầu
          doctorService.getAllDoctors(1, 500).catch(() => ({ success: false, data: [] })),
        ]);

        console.log('📦 AppointmentsPage - Appointments response:', apptResponse);
        console.log('📦 AppointmentsPage - Doctors response:', doctorResponse);

        if (apptResponse.success) {
          setAppointments(apptResponse.data || []);
        }
        
        if (doctorResponse.success) {
          setDoctors(doctorResponse.data || []);
        }
      } catch (err) {
        console.error('❌ AppointmentsPage - Error fetching data:', err);
        setError('Không thể tải dữ liệu lịch hẹn');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Làm mới danh sách bác sĩ khi mở đặt lịch (bác sĩ mới tạo / AUTO-* từ lịch trực sẽ xuất hiện)
  useEffect(() => {
    if (!showBookingModal) return;
    let cancelled = false;
    (async () => {
      try {
        const doctorResponse = await doctorService.getAllDoctors(1, 500);
        if (!cancelled && doctorResponse.success) {
          setDoctors(doctorResponse.data || []);
        }
      } catch {
        /* giữ danh sách cũ */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showBookingModal]);

  const filteredAppointments = appointments.filter((apt) => {
    const patientName = apt.patientId?.fullName || apt.patientId?.email || 'Unknown';
    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.doctorId?.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (id) => {
    try {
      console.log('✅ AppointmentsPage - Completing appointment:', id);
      const response = await appointmentService.completeAppointment(id);
      console.log('📦 AppointmentsPage - Complete response:', response);
      
      if (response.success) {
        setAppointments(appointments.map(apt => 
          (apt._id === id || apt.id === id) ? { ...apt, status: 'completed' } : apt
        ));
      }
    } catch (err) {
      console.error('❌ Error completing appointment:', err);
    }
  };

  const handleCancel = async (id) => {
    try {
      console.log('❌ AppointmentsPage - Canceling appointment:', id);
      const response = await appointmentService.cancelAppointment(id);
      console.log('📦 AppointmentsPage - Cancel response:', response);
      
      if (response.success) {
        setAppointments(appointments.map(apt => 
          (apt._id === id || apt.id === id) ? { ...apt, status: 'cancelled' } : apt
        ));
      }
    } catch (err) {
      console.error('❌ Error canceling appointment:', err);
    }
  };

  const handleBookingSuccess = () => {
    // Refresh appointments list
    appointmentService.getAllAppointments().then(response => {
      if (response.success) {
        setAppointments(response.data || []);
      }
    });
  };

  const statusLabels = {
    all: 'Tất cả',
    scheduled: 'Đã lên lịch',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
    'no-show': 'Vắng mặt',
    rescheduled: 'Đặt lịch lại',
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm lịch hẹn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-tertiary-fixed"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === key
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" onClick={() => setShowBookingModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm lịch hẹn
        </Button>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Bác sĩ</TableHead>
                <TableHead>Loại khám</TableHead>
                <TableHead>Ngày & Giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((apt) => {
                const patientName = apt.patientId?.fullName || apt.patientId?.email || 'Unknown';
                const doctorName = apt.doctorId?.specialization || 'Doctor';
                const appointmentDate = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN') : '';
                const timeDisplay = apt.timeSlot ? `${apt.timeSlot.from} - ${apt.timeSlot.to}` : '';
                
                return (
                <TableRow key={apt._id || apt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="text-xs font-medium text-on-primary-container">
                          {patientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{patientName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doctorName}</TableCell>
                  <TableCell>{apt.consultationType}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointmentDate}</p>
                      <p className="text-xs text-on-surface-variant">{timeDisplay}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={apt.status}>
                      {statusLabels[apt.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {apt.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleApprove(apt._id || apt.id)}
                            className="p-1.5 rounded-md hover:bg-primary-container transition-colors"
                            title="Xác nhận"
                          >
                            <Check className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleCancel(apt._id || apt.id)}
                            className="p-1.5 rounded-md hover:bg-error-container transition-colors"
                            title="Hủy"
                          >
                            <X className="w-4 h-4 text-error" />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 rounded-md hover:bg-surface-container transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-30" />
              <p className="text-on-surface-variant">Không tìm thấy lịch hẹn nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
        doctors={doctors}
      />
    </div>
  );
}
