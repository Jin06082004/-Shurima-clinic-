import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/api';
import { canManageUsers } from '@/lib/permissions';
import { Button, Card, CardContent, StatusBadge } from '@/components/ui';
import { UserListSkeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, MoreHorizontal, UserCog, Stethoscope, UserCheck, X as XIcon, Trash2, Users, Phone, Mail, ShieldOff } from 'lucide-react';

// ============ Constants ============
const roleIcons = { admin: UserCog, doctor: Stethoscope, nurse: UserCheck, staff: UserCheck, patient: UserCheck };
const roleLabels = { admin: 'Quản trị', doctor: 'Bác sĩ', nurse: 'Điều dưỡng', staff: 'Nhân viên', patient: 'Bệnh nhân' };
const ALL_DEPARTMENTS = ['Quản trị', 'Tim mạch', 'Thần kinh', 'Da liễu', 'Nhi khoa', 'Tai Mũi Họng', 'Mắt', 'Nội tổng quát', 'Sản phụ khoa', 'Cơ xương khớp', 'Hô hấp', 'Hồi sức'];

// ============ Utility Functions ============
const getUserId = (user) => user?._id ?? user?.id ?? '';
const getDisplayName = (user) => user?.fullName || user?.name || '—';
const getNameInitial = (user) => {
  const s = String(getDisplayName(user)).trim();
  return s ? s.charAt(0).toUpperCase() : '?';
};
const formatJoinDate = (user) => {
  const raw = user?.joinDate ?? user?.createdAt;
  if (!raw) return '—';
  try { return new Date(raw).toLocaleDateString('vi-VN'); } catch { return '—'; }
};
const isUserActive = (user) => {
  if (user?.status === 'active' || user?.status === 'inactive') return user.status === 'active';
  return user?.isActive !== false;
};

// ============ UserCard Component (Memoized) ============
const UserCard = memo(function UserCard({ user, onEdit }) {
  const RoleIcon = roleIcons[user.role] ?? UserCog;
  const isActive = isUserActive(user);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-lg font-bold text-on-primary-container transition-transform group-hover:scale-105">
              {getNameInitial(user)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-on-surface truncate">{getDisplayName(user)}</h3>
              <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-md hover:bg-surface-container transition-colors opacity-0 group-hover:opacity-100"
            title="Chỉnh sửa"
          >
            <MoreHorizontal className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <RoleIcon className="w-4 h-4 text-on-surface-variant shrink-0" />
            <span className="text-on-surface font-medium">{roleLabels[user.role] ?? user.role}</span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-on-surface-variant truncate">{user.department ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between">
            <StatusBadge variant={isActive ? 'active' : 'inactive'}>
              {isActive ? 'Hoạt động' : 'Không hoạt động'}
            </StatusBadge>
            <span className="text-xs text-on-surface-variant">
              {formatJoinDate(user)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ============ User Form Modal ============
function UserFormModal({ user, isAdd, isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'patient', department: '', status: 'active'
  });

  useEffect(() => {
    if (!isOpen) return;
    if (user) {
      const r = user.role || 'patient';
      setFormData({
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: r === 'staff' ? 'nurse' : r,
        department: user.department || '',
        status: isUserActive(user) ? 'active' : 'inactive',
      });
    } else {
      setFormData({ name: '', email: '', phone: '', role: 'patient', department: '', status: 'active' });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [user, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (isAdd && !formData.department) newErrors.department = 'Vui lòng chọn khoa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role === 'nurse' ? 'staff' : formData.role,
        department: formData.department,
        isActive: formData.status === 'active',
      };

      let response;
      if (isAdd) {
        response = await userService.createUser(payload);
      } else {
        response = await userService.updateUser(getUserId(user), payload);
      }

      if (response.success) {
        addToast(isAdd ? 'Đã thêm người dùng mới' : 'Đã cập nhật thông tin', 'success');
        onSuccess(response.data ?? { ...user, ...payload });
        onClose();
      } else {
        setErrors({ submit: response.message || 'Thao tác thất bại' });
      }
    } catch (error) {
      console.error('Error:', error);
      addToast('Đã xảy ra lỗi', 'error');
      setErrors({ submit: 'Đã xảy ra lỗi' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await userService.deleteUser(getUserId(user));
      if (response.success) {
        addToast('Đã xóa người dùng', 'success');
        onSuccess(null);
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setErrors({ submit: response.message || 'Xóa thất bại' });
      }
    } catch (error) {
      console.error('Error:', error);
      addToast('Đã xảy ra lỗi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col card-shadow">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface">{isAdd ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{isAdd ? 'Nhập thông tin để tạo tài khoản' : 'Cập nhật thông tin và quyền hạn'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <XIcon className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 pb-4 border-b border-outline-variant">
            <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-on-primary-container">{(formData.name || '?').trim().charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface truncate">{formData.name || 'Người dùng mới'}</p>
              {!isAdd && <p className="text-xs text-on-surface-variant truncate">{getUserId(user)}</p>}
            </div>
          </div>

          <FormField label="Họ tên" required error={errors.name}>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nhập họ tên đầy đủ"
              className={inputClass(errors.name)} autoFocus />
          </FormField>

          <FormField label="Email" required error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"
                className={inputClass(errors.name, 'pl-10')} />
            </div>
          </FormField>

          <FormField label="Số điện thoại" required error={errors.phone}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0xxxxxxxxx"
                className={inputClass(errors.phone, 'pl-10')} />
            </div>
          </FormField>

          <FormField label="Vai trò" required>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'doctor', 'nurse'].map((role) => (
                <label key={role}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.role === role ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/50'}`}>
                  <input type="radio" name="role" value={role} checked={formData.role === role} onChange={handleChange} className="sr-only" />
                  {role === 'admin' && <UserCog className="w-5 h-5" />}
                  {role === 'doctor' && <Stethoscope className="w-5 h-5" />}
                  {role === 'nurse' && <UserCheck className="w-5 h-5" />}
                  <span className="text-xs font-medium">{roleLabels[role]}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Khoa/Phòng ban" required error={errors.department}>
            <select name="department" value={formData.department} onChange={handleChange} className={inputClass(errors.department)}>
              <option value="">Chọn khoa/phòng ban</option>
              {ALL_DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </FormField>

          <FormField label="Trạng thái">
            <div className="flex gap-2">
              {[{ v: 'active', l: 'Hoạt động', c: 'primary' }, { v: 'inactive', l: 'Không hoạt động', c: 'error' }].map(({ v, l, c }) => (
                <label key={v}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.status === v ? `border-${c} bg-${c}-container` : 'border-outline-variant bg-surface-container-low'}`}>
                  <input type="radio" name="status" value={v} checked={formData.status === v} onChange={handleChange} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.status === v ? `border-${c}` : 'border-outline'}`}>
                    {formData.status === v && <div className={`w-2 h-2 rounded-full bg-${c}`} />}
                  </div>
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>
          </FormField>

          {!isAdd && (
            <div className="bg-surface-container-low rounded-lg p-3 space-y-1.5">
              <p className="text-xs text-on-surface-variant"><span className="font-medium">ID:</span> {getUserId(user)}</p>
              <p className="text-xs text-on-surface-variant"><span className="font-medium">Ngày tham gia:</span> {formatJoinDate(user)}</p>
            </div>
          )}

          {errors.submit && <p className="text-sm text-error text-center bg-error-container rounded-lg p-3">{errors.submit}</p>}

          <div className="flex gap-2 pt-2 shrink-0">
            {!isAdd && (
              <Button type="button" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="text-error hover:bg-error-container">
                <Trash2 className="w-4 h-4 mr-2" />Xóa
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
            <Button type="submit" variant="primary" loading={isLoading}>{isAdd ? 'Thêm mới' : 'Lưu thay đổi'}</Button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
            <div className="bg-surface-container-lowest rounded-xl p-6 m-4 max-w-sm w-full">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-error" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface text-center mb-2">Xóa người dùng?</h3>
              <p className="text-sm text-on-surface-variant text-center mb-6">
                Bạn có chắc chắn muốn xóa <strong>{getDisplayName(user)}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1" disabled={isLoading}>Hủy</Button>
                <Button type="button" onClick={handleDelete} className="flex-1 bg-error hover:bg-error/90 text-white" loading={isLoading}>Xóa</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

const inputClass = (hasError, extra = '') =>
  `w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary ${hasError ? 'ring-2 ring-error' : ''} ${extra}`;

// ============ Main UsersPage Component ============
export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const isAdmin = canManageUsers();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // API mặc định limit=10 — không truyền thì chỉ thấy 10 tài khoản đầu
      const response = await userService.getAllUsers(1, 500);
      if (response.success) setUsers(response.data || []);
      else setUsers([]);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [isAdmin, fetchUsers]);

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Card className="card-shadow">
          <CardContent className="py-10 px-6 text-center">
            <ShieldOff className="w-14 h-14 text-on-surface-variant mx-auto mb-4 opacity-80" />
            <h1 className="text-headline-sm font-semibold text-on-surface mb-2">Không có quyền truy cập</h1>
            <p className="text-sm text-on-surface-variant mb-6">
              Chỉ tài khoản quản trị viên mới xem và chỉnh sửa danh sách người dùng.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Về bảng điều khiển
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = debouncedSearch.toLowerCase();
      const matchesSearch =
        !term ||
        user.fullName?.toLowerCase().includes(term) ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term);
      const matchesFilter =
        filterRole === 'all' ||
        user.role === filterRole ||
        (filterRole === 'nurse' && user.role === 'staff');
      return matchesSearch && matchesFilter;
    });
  }, [users, debouncedSearch, filterRole]);

  const handleUserUpdate = useCallback((updatedUser) => {
    if (updatedUser === null) {
      const sid = getUserId(selectedUser);
      setUsers((prev) => prev.filter((u) => getUserId(u) !== sid));
      setSelectedUser(null);
    } else {
      const uid = getUserId(updatedUser);
      setUsers((prev) => prev.map((u) => (getUserId(u) === uid ? updatedUser : u)));
      setSelectedUser(updatedUser);
    }
  }, [selectedUser]);

  const handleEditUser = useCallback((user) => setSelectedUser(user), []);
  const handleCloseEditModal = useCallback(() => setSelectedUser(null), []);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => isUserActive(u)).length,
    doctors: users.filter((u) => u.role === 'doctor').length,
    nurses: users.filter((u) => u.role === 'staff' || u.role === 'nurse').length,
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Quản lý người dùng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {filteredUsers.length} người dùng{filterRole !== 'all' ? ` (${roleLabels[filterRole]})` : ''}
            {debouncedSearch ? ` • tìm kiếm: "${debouncedSearch}"` : ''}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng người dùng', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Đang hoạt động', value: stats.active, icon: UserCheck, color: 'text-success' },
          { label: 'Bác sĩ', value: stats.doctors, icon: Stethoscope, color: 'text-tertiary' },
          { label: 'Điều dưỡng', value: stats.nurses, icon: UserCog, color: 'text-secondary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{value}</p>
                <p className="text-xs text-on-surface-variant">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ v: 'all', l: 'Tất cả' }, { v: 'admin', l: 'Quản trị' }, { v: 'doctor', l: 'Bác sĩ' }, { v: 'nurse', l: 'Điều dưỡng' }].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setFilterRole(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterRole === v ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />Thêm người dùng
        </Button>
      </div>

      {/* User Grid */}
      {loading ? (
        <UserListSkeleton count={6} />
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard key={getUserId(user)} user={user} onEdit={handleEditUser} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-medium text-on-surface mb-1">Không tìm thấy</h3>
          <p className="text-sm text-on-surface-variant">
            {searchTerm || filterRole !== 'all'
              ? 'Không có người dùng nào phù hợp với bộ lọc'
              : 'Chưa có người dùng nào. Bắt đầu bằng cách thêm người dùng mới.'}
          </p>
          {(searchTerm || filterRole !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearchTerm(''); setFilterRole('all'); }}
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        user={selectedUser}
        isAdd={false}
        isOpen={!!selectedUser}
        onClose={handleCloseEditModal}
        onSuccess={handleUserUpdate}
      />

      <UserFormModal
        isAdd={true}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={async () => {
          setShowAddModal(false);
          await fetchUsers();
        }}
      />
    </div>
  );
}
