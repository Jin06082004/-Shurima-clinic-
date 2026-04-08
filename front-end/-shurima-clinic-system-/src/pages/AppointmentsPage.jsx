import { useState } from 'react';
import { useAppointmentStore, useUserStore, useUIStore, useAuthStore } from '@/stores';
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

function BookingModal({ isOpen, onClose, onSuccess }) {
  const { addAppointment } = useAppointmentStore();
  const { users } = useUserStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Lấy danh sách bác sĩ từ users
  const doctors = users.filter((u) => u.role === 'doctor');

  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: '',
    doctorId: '',
    department: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setFormData({
      ...formData,
      doctorId,
      department: doctor?.department || '',
    });
    setErrors({ ...errors, doctorId: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientName.trim()) newErrors.patientName = 'Vui lòng nhập họ tên';
    if (!formData.patientPhone.trim()) newErrors.patientPhone = 'Vui lòng nhập số điện thoại';
    if (!/^[0-9]{10,11}$/.test(formData.patientPhone.replace(/\s/g, ''))) {
      newErrors.patientPhone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.doctorId) newErrors.doctorId = 'Vui lòng chọn bác sĩ';
    if (!formData.department) newErrors.department = 'Vui lòng chọn khoa';
    if (!formData.date) newErrors.date = 'Vui lòng chọn ngày khám';
    if (!formData.time) newErrors.time = 'Vui lòng chọn giờ khám';
    if (!formData.reason.trim()) newErrors.reason = 'Vui lòng nhập lý do khám';

    // Kiểm tra ngày không được trong quá khứ
    const today = new Date().toISOString().split('T')[0];
    if (formData.date && formData.date < today) {
      newErrors.date = 'Ngày khám không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Tìm thông tin bác sĩ
      const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

      // Tạo appointment mới
      addAppointment({
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        phone: formData.patientPhone,
        doctorName: selectedDoctor?.name || 'Chưa chọn',
        department: formData.department,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
      });

      // TODO: Gọi API backend khi có backend
      // const response = await fetch('/api/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        patientName: user?.name || '',
        patientEmail: user?.email || '',
        patientPhone: '',
        doctorId: '',
        department: '',
        date: '',
        time: '',
        reason: '',
        notes: '',
      });
    } catch (error) {
      console.error('Booking error:', error);
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
          {/* Họ tên bệnh nhân */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Họ tên bệnh nhân <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.patientName ? 'ring-2 ring-error' : ''
              }`}
              placeholder="Nhập họ tên bệnh nhân"
            />
            {errors.patientName && (
              <p className="text-xs text-error mt-1">{errors.patientName}</p>
            )}
          </div>

          {/* Số điện thoại & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Số điện thoại <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  errors.patientPhone ? 'ring-2 ring-error' : ''
                }`}
                placeholder="0912345678"
              />
              {errors.patientPhone && (
                <p className="text-xs text-error mt-1">{errors.patientPhone}</p>
              )}
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Khoa */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Chuyên khoa <span className="text-error">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.department ? 'ring-2 ring-error' : ''
              }`}
            >
              <option value="">Chọn khoa khám</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-xs text-error mt-1">{errors.department}</p>
            )}
          </div>

          {/* Bác sĩ */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Bác sĩ khám <span className="text-error">*</span>
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.doctorId ? 'ring-2 ring-error' : ''
              }`}
            >
              <option value="">Chọn bác sĩ</option>
              {doctors
                .filter((d) => !formData.department || d.department === formData.department)
                .map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.department}
                  </option>
                ))}
            </select>
            {errors.doctorId && (
              <p className="text-xs text-error mt-1">{errors.doctorId}</p>
            )}
          </div>

          {/* Ngày & Giờ khám */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Ngày khám <span className="text-error">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={minDate}
                className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  errors.date ? 'ring-2 ring-error' : ''
                }`}
              />
              {errors.date && (
                <p className="text-xs text-error mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Giờ khám <span className="text-error">*</span>
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  errors.time ? 'ring-2 ring-error' : ''
                }`}
              >
                <option value="">Chọn giờ</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="text-xs text-error mt-1">{errors.time}</p>
              )}
            </div>
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
  const { appointments, approveAppointment, cancelAppointment, filterStatus, setFilterStatus } = useAppointmentStore();
  const { showToast } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (id) => {
    approveAppointment(id);
    showToast({ type: 'success', message: 'Đã xác nhận lịch hẹn' });
  };

  const handleCancel = (id) => {
    cancelAppointment(id);
    showToast({ type: 'error', message: 'Đã hủy lịch hẹn' });
  };

  const handleBookingSuccess = () => {
    showToast({ type: 'success', message: 'Đặt lịch thành công! Vui lòng chờ xác nhận.' });
  };

  const statusLabels = {
    all: 'Tất cả',
    confirmed: 'Đã xác nhận',
    pending: 'Chờ xử lý',
    cancelled: 'Đã hủy',
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
                <TableHead>Khoa</TableHead>
                <TableHead>Ngày & Giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="text-xs font-medium text-on-primary-container">
                          {apt.patientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <p className="text-xs text-on-surface-variant">{apt.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>{apt.department}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{apt.date}</p>
                      <p className="text-xs text-on-surface-variant">{apt.time}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={apt.status}>
                      {statusLabels[apt.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(apt.id)}
                            className="p-1.5 rounded-md hover:bg-primary-container transition-colors"
                            title="Xác nhận"
                          >
                            <Check className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleCancel(apt.id)}
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
              ))}
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
      />
    </div>
  );
}
