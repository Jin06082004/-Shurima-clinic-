import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, StatusBadge, Button } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { userService, authService } from '@/api';
import { cn } from '@/lib/utils';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  AlertCircle,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';

const ROLE_LABELS = {
  patient: 'Bệnh nhân',
  doctor: 'Bác sĩ',
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  nurse: 'Điều dưỡng',
};

function roleLabel(role) {
  if (!role) return '—';
  return ROLE_LABELS[role] ?? role;
}

function ProfilePageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/60',
        className
      )}
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-container/50 flex items-center justify-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">{label}</p>
        <p className="text-body-md text-on-surface font-medium mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

function StatTile({ kicker, value, children }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/60">
      <div className="min-w-0">
        <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">{kicker}</p>
        <p className="text-body-md text-on-surface font-medium mt-1">{value}</p>
      </div>
      {children}
    </div>
  );
}

export function ProfilePage() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getProfile();
      if (response.success && response.data) {
        const data = response.data;
        setProfile(data);
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || '',
          },
        });
      } else {
        setError(response.message || 'Không thể tải thông tin hồ sơ');
      }
    } catch {
      setError('Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError(null);
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        addToast('Cập nhật hồ sơ thành công', 'success');
      } else {
        const msg = response.message || 'Cập nhật hồ sơ thất bại';
        setError(msg);
        addToast(msg, 'error');
      }
    } catch {
      setError('Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
      addToast('Cập nhật hồ sơ thất bại', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setError('Vui lòng điền đầy đủ thông tin mật khẩu.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới không khớp. Vui lòng kiểm tra lại.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    try {
      setSavingPassword(true);
      setError(null);
      const response = await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      if (response.success) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        addToast('Thay đổi mật khẩu thành công', 'success');
      } else {
        const msg = response.message || 'Thay đổi mật khẩu thất bại';
        setError(msg);
        addToast(msg, 'error');
      }
    } catch {
      setError('Thay đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ và thử lại.');
      addToast('Thay đổi mật khẩu thất bại', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const initial = profile?.fullName?.trim().charAt(0)?.toUpperCase() || 'U';

  if (loading && !profile) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16">
        <Card className="card-shadow">
          <CardContent className="text-center py-10 px-6">
            <AlertCircle className="w-14 h-14 text-error mx-auto mb-4 opacity-90" />
            <p className="text-on-surface font-medium mb-1">Không thể tải hồ sơ</p>
            <p className="text-sm text-on-surface-variant mb-6">{error}</p>
            <Button variant="primary" onClick={() => fetchProfile()}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Tiêu đề */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-semibold text-on-surface tracking-tight">Hồ sơ của tôi</h1>
          <p className="text-on-surface-variant mt-1.5 text-body-md max-w-xl">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>
      </header>

      {error && (
        <div
          className="p-4 bg-error-container text-on-error-container rounded-xl flex items-start gap-3 border border-error/20"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-sm underline opacity-80 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Hero — dùng hết chiều ngang */}
      <section
        className={cn(
          'relative overflow-hidden rounded-2xl border border-outline-variant',
          'bg-gradient-to-br from-primary-container/35 via-surface-container-lowest to-tertiary-fixed/15',
          'p-6 sm:p-8 md:p-10 card-shadow'
        )}
      >
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-tertiary-fixed/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex items-center gap-5 min-w-0">
            <div
              className={cn(
                'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0',
                'bg-primary-container flex items-center justify-center',
                'text-on-primary-container text-headline-lg font-bold shadow-sm ring-4 ring-surface-container-lowest/80'
              )}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Tài khoản của bạn
              </p>
              <h2 className="text-title-lg sm:text-headline-sm font-semibold text-on-surface truncate mt-1">
                {profile.fullName}
              </h2>
              <p className="text-on-surface-variant text-sm truncate mt-0.5">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusBadge variant={profile.isActive ? 'active' : 'inactive'}>
                  {profile.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </StatusBadge>
                {profile.role && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-high text-on-surface border border-outline-variant/50">
                    <User className="w-3.5 h-3.5" />
                    {roleLabel(profile.role)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hai cột: nội dung chính | cạnh phải bảo mật + trạng thái */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="card-shadow overflow-hidden">
            <CardHeader className="border-b border-outline-variant/60 pb-4">
              <CardTitle className="text-title-md">Thông tin tài khoản</CardTitle>
              <p className="text-sm text-on-surface-variant font-normal mt-1">
                Email, điện thoại và thông tin liên hệ
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow
                  icon={Phone}
                  label="Điện thoại"
                  value={profile.phone || 'Chưa cập nhật'}
                />
                {profile.dateOfBirth && (
                  <InfoRow
                    icon={Calendar}
                    label="Ngày sinh"
                    value={new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')}
                  />
                )}
                {(profile.address?.street || profile.address?.city) && (
                  <InfoRow
                    icon={MapPin}
                    label="Địa chỉ"
                    value={[profile.address?.street, profile.address?.city].filter(Boolean).join(', ')}
                    className={profile.dateOfBirth ? '' : 'sm:col-span-2'}
                  />
                )}
              </div>

              {!isEditing && (
                <div className="pt-2">
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa thông tin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isEditing && (
            <Card className="card-shadow border-2 border-primary/20">
              <CardHeader className="border-b border-outline-variant/60 pb-4">
                <CardTitle className="text-title-md">Chỉnh sửa thông tin</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">Họ tên</label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">Điện thoại</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">Ngày sinh</label>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">Giới tính</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-tertiary-fixed"
                      >
                        <option value="">Chọn</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="border-t border-outline-variant/60 pt-5 space-y-4">
                    <h3 className="text-label-lg font-medium text-on-surface">Địa chỉ</h3>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">Đường</label>
                      <Input
                        value={formData.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        placeholder="Số nhà, đường"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1.5">Thành phố</label>
                        <Input
                          value={formData.address.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          placeholder="Thành phố"
                        />
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1.5">Tỉnh / Bang</label>
                        <Input
                          value={formData.address.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          placeholder="Tỉnh"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1.5">Mã bưu điện</label>
                        <Input
                          value={formData.address.zipCode}
                          onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                          placeholder="Mã ZIP"
                        />
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-1.5">Quốc gia</label>
                        <Input
                          value={formData.address.country}
                          onChange={(e) => handleAddressChange('country', e.target.value)}
                          placeholder="Quốc gia"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" variant="primary" loading={savingProfile}>
                      Lưu thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={savingProfile}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
          <Card className="card-shadow">
            <CardHeader className="border-b border-outline-variant/60 pb-4">
              <CardTitle className="text-title-md flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-tertiary-fixed/15 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-tertiary-fixed" />
                </div>
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {!isChangingPassword ? (
                <div className="space-y-4">
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Thay đổi mật khẩu của bạn để bảo vệ tài khoản an toàn hơn.
                  </p>
                  <Button variant="primary" className="w-full sm:w-auto" onClick={() => setIsChangingPassword(true)}>
                    Thay đổi mật khẩu
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1.5">Mật khẩu hiện tại</label>
                    <Input
                      name="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1.5">Mật khẩu mới</label>
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1.5">Xác nhận mật khẩu</label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button type="submit" variant="primary" loading={savingPassword} className="flex-1">
                      Cập nhật mật khẩu
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsChangingPassword(false)}
                      disabled={savingPassword}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader className="border-b border-outline-variant/60 pb-4">
              <CardTitle className="text-title-md flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary-container/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                Trạng thái tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <StatTile
                kicker="Trạng thái"
                value={profile.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản bị tạm dừng'}
              >
                <span
                  className={cn(
                    'shrink-0 w-2.5 h-2.5 rounded-full',
                    profile.isActive ? 'bg-primary' : 'bg-on-surface-variant'
                  )}
                  aria-hidden
                />
              </StatTile>
              {profile.role && (
                <StatTile kicker="Quyền hạn" value={roleLabel(profile.role)} />
              )}
              {profile.createdAt && (
                <StatTile
                  kicker="Ngày tạo tài khoản"
                  value={new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
