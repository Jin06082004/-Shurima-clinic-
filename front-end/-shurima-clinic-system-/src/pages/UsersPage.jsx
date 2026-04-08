import { useState, useEffect } from 'react';
import { useUserStore, useUIStore } from '@/stores';
import { Card, CardContent, Button, StatusBadge } from '@/components/ui';
import { Plus, Search, MoreHorizontal, UserCog, Stethoscope, UserCheck, X as XIcon, Trash2 } from 'lucide-react';

const roleIcons = {
  admin: UserCog,
  doctor: Stethoscope,
  nurse: UserCheck,
};

const roleLabels = {
  admin: 'Quản trị',
  doctor: 'Bác sĩ',
  nurse: 'Điều dưỡng',
};

const ALL_DEPARTMENTS = [
  'Quản trị',
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
  'Hồi sức',
];

function EditUserModal({ user, isOpen, onClose }) {
  const { updateUser, deleteUser } = useUserStore();
  const { showToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    department: '',
    status: 'active',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'patient',
        department: user.department || '',
        status: user.status || 'active',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.role) newErrors.role = 'Vui lòng chọn vai trò';
    if (!formData.department) newErrors.department = 'Vui lòng chọn khoa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      updateUser(user.id, formData);

      // TODO: Gọi API backend khi có backend
      // const response = await fetch(`/api/users/${user.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      showToast({ type: 'success', message: 'Cập nhật người dùng thành công' });
      onClose();
    } catch (error) {
      showToast({ type: 'error', message: 'Cập nhật thất bại' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    deleteUser(user.id);
    showToast({ type: 'success', message: 'Đã xóa người dùng' });
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto card-shadow">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest p-6 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface">Chỉnh sửa người dùng</h2>
            <p className="text-sm text-on-surface-variant mt-1">Cập nhật thông tin và quyền hạn</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <XIcon className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b border-outline-variant">
            <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="text-2xl font-bold text-on-primary-container">
                {formData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-on-surface">{formData.name}</p>
              <p className="text-sm text-on-surface-variant">{user.id}</p>
            </div>
          </div>

          {/* Họ tên */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Họ tên <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.name ? 'ring-2 ring-error' : ''
              }`}
            />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Email <span className="text-error">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.email ? 'ring-2 ring-error' : ''
              }`}
            />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Số điện thoại <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.phone ? 'ring-2 ring-error' : ''
              }`}
            />
            {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
          </div>

          {/* Vai trò */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Vai trò <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['admin', 'doctor', 'nurse'].map((role) => (
                <label
                  key={role}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.role === role
                      ? 'border-primary bg-primary-container text-on-primary-container'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {role === 'admin' && <UserCog className="w-5 h-5" />}
                  {role === 'doctor' && <Stethoscope className="w-5 h-5" />}
                  {role === 'nurse' && <UserCheck className="w-5 h-5" />}
                  <span className="text-xs font-medium">{roleLabels[role]}</span>
                </label>
              ))}
            </div>
            {errors.role && <p className="text-xs text-error mt-1">{errors.role}</p>}
          </div>

          {/* Khoa */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Khoa/Phòng ban <span className="text-error">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                errors.department ? 'ring-2 ring-error' : ''
              }`}
            >
              <option value="">Chọn khoa/phòng ban</option>
              {ALL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-xs text-error mt-1">{errors.department}</p>}
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1.5">
              Trạng thái
            </label>
            <div className="flex gap-3">
              <label
                className={`flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.status === 'active'
                    ? 'border-primary bg-primary-container'
                    : 'border-outline-variant bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.status === 'active' ? 'border-primary' : 'border-outline'
                  }`}
                >
                  {formData.status === 'active' && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    formData.status === 'active' ? 'text-on-primary-container' : 'text-on-surface-variant'
                  }`}
                >
                  Hoạt động
                </span>
              </label>
              <label
                className={`flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.status === 'inactive'
                    ? 'border-error bg-error-container'
                    : 'border-outline-variant bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.status === 'inactive' ? 'border-error' : 'border-outline'
                  }`}
                >
                  {formData.status === 'inactive' && (
                    <div className="w-2 h-2 rounded-full bg-error" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    formData.status === 'inactive' ? 'text-on-error-container' : 'text-on-surface-variant'
                  }`}
                >
                  Không hoạt động
                </span>
              </label>
            </div>
          </div>

          {/* Thông tin thêm */}
          <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
            <p className="text-xs text-on-surface-variant">
              <span className="font-medium">ID:</span> {user.id}
            </p>
            <p className="text-xs text-on-surface-variant">
              <span className="font-medium">Ngày tham gia:</span> {user.joinDate}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-error hover:bg-error-container"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Lưu thay đổi
            </Button>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
            <div className="bg-surface-container-lowest rounded-xl p-6 m-4 max-w-sm w-full">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-error" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface text-center mb-2">
                Xóa người dùng?
              </h3>
              <p className="text-sm text-on-surface-variant text-center mb-6">
                Bạn có chắc chắn muốn xóa <strong>{user.name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDelete}
                  className="flex-1 bg-error hover:bg-error/90"
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function UsersPage() {
  const { users, searchTerm, setSearchTerm, filterRole, setFilterRole } = useUserStore();
  const { showToast } = useUIStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const handleAddUser = () => {
    setShowAddModal(false);
    showToast({ type: 'success', message: 'Thêm người dùng thành công' });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
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
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-tertiary-fixed"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'admin', 'doctor', 'nurse'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === role
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {role === 'all' ? 'Tất cả' : roleLabels[role]}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const RoleIcon = roleIcons[user.role];
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                      <span className="text-lg font-semibold text-on-primary-container">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">{user.name}</h3>
                      <p className="text-sm text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-1.5 rounded-md hover:bg-surface-container transition-colors"
                    title="Chỉnh sửa"
                  >
                    <MoreHorizontal className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RoleIcon className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-sm text-on-surface">{roleLabels[user.role]}</span>
                    <span className="text-on-surface-variant">•</span>
                    <span className="text-sm text-on-surface-variant">{user.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge variant={user.status}>
                      {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </StatusBadge>
                    <span className="text-xs text-on-surface-variant">
                      Tham gia: {user.joinDate}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-30" />
          <p className="text-on-surface-variant">Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md card-shadow">
            <h2 className="text-headline-sm text-on-surface mb-6">Thêm người dùng mới</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Họ tên</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Số điện thoại</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed"
                  placeholder="Nhập số điện thoại"
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

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
