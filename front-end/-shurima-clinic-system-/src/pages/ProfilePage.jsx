import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, StatusBadge } from '@/components/ui';
import { userService, authService } from '@/api';
import { Mail, Phone, MapPin, Calendar, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Debug: Check token
        const token = localStorage.getItem('accessToken');
        console.log('📋 ProfilePage - Token from localStorage:', token ? '✅ Token exists' : '❌ No token');
        
        const response = await userService.getProfile();
        console.log('📦 Backend Response:', response);
        
        if (response.success) {
          console.log('✅ Profile loaded successfully:', response.data);
          setProfile(response.data);
          // Populate form with profile data
          setFormData({
            fullName: response.data.fullName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : '',
            gender: response.data.gender || '',
            address: {
              street: response.data.address?.street || '',
              city: response.data.address?.city || '',
              state: response.data.address?.state || '',
              zipCode: response.data.address?.zipCode || '',
              country: response.data.address?.country || '',
            },
          });
        } else {
          console.log('⚠️ Response not successful:', response);
          setError(response.message || 'Không thể tải thông tin hồ sơ');
        }
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });
        setError('Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        setSuccessMessage('Cập nhật hồ sơ thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
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
      setLoading(true);
      setError(null);
      const response = await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      if (response.success) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        setSuccessMessage('Thay đổi mật khẩu thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Thay đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ và thử lại.');
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <p className="text-on-surface mb-4">Không thể tải thông tin hồ sơ</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90"
            >
              Thử lại
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-headline-lg text-on-surface">Hồ sơ của tôi</h1>
          <p className="text-on-surface-variant mt-2">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-primary-container text-on-primary-container rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary text-headline-md font-bold">
              {profile.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-headline-sm text-on-surface">
                {profile.fullName}
              </h3>
              <p className="text-on-surface-variant">{profile.email}</p>
              <div className="mt-2">
                <StatusBadge
                  status={profile.isActive ? 'active' : 'inactive'}
                  label={profile.isActive ? 'Hoạt động' : 'Tạm dừng'}
                />
              </div>
            </div>
          </div>

          {/* Account Info Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-label-sm text-on-surface-variant">Email</p>
                <p className="text-body-md text-on-surface">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-label-sm text-on-surface-variant">Điện thoại</p>
                <p className="text-body-md text-on-surface">{profile.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
            {profile.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Ngày sinh</p>
                  <p className="text-body-md text-on-surface">
                    {new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
            {profile.address?.street && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Địa chỉ</p>
                  <p className="text-body-md text-on-surface">{profile.address.street}</p>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Chỉnh sửa thông tin
            </button>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Name and Email Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">
                    Họ tên
                  </label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    disabled
                  />
                </div>
              </div>

              {/* Phone, Date of Birth, Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">
                    Điện thoại
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">
                    Ngày sinh
                  </label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t pt-4">
                <h3 className="text-label-lg text-on-surface font-medium mb-4">Địa chỉ</h3>

                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">
                    Đường
                  </label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Nhập tên đường"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2">
                      Thành phố
                    </label>
                    <Input
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Nhập thành phố"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2">
                      Tỉnh/Bang
                    </label>
                    <Input
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="Nhập tỉnh/bang"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2">
                      Mã bưu điện
                    </label>
                    <Input
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      placeholder="Nhập mã bưu điện"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2">
                      Quốc gia
                    </label>
                    <Input
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      placeholder="Nhập quốc gia"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-surface-container-highest text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <div className="space-y-4">
              <p className="text-body-sm text-on-surface-variant">
                Thay đổi mật khẩu của bạn để bảo vệ tài khoản
              </p>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg hover:bg-tertiary-fixed/90 transition-colors"
              >
                Thay đổi mật khẩu
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">
                  Mật khẩu hiện tại
                </label>
                <Input
                  name="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">
                  Mật khẩu mới
                </label>
                <Input
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">
                  Xác nhận mật khẩu
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg hover:bg-tertiary-fixed/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-6 py-3 bg-surface-container-highest text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Account Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div>
                <p className="text-label-md text-on-surface-variant">Trạng thái</p>
                <p className="text-body-md text-on-surface">
                  {profile.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản bị tạm dừng'}
                </p>
              </div>
              <StatusBadge
                status={profile.isActive ? 'active' : 'inactive'}
                label={profile.isActive ? 'Hoạt động' : 'Tạm dừng'}
              />
            </div>

            {profile.role && (
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-label-md text-on-surface-variant">Quyền hạn</p>
                <p className="text-body-md text-on-surface capitalize">
                  {profile.role === 'patient'
                    ? 'Bệnh nhân'
                    : profile.role === 'doctor'
                    ? 'Bác sĩ'
                    : profile.role === 'admin'
                    ? 'Quản trị viên'
                    : 'Nhân viên'}
                </p>
              </div>
            )}

            {profile.createdAt && (
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-label-md text-on-surface-variant">Ngày tạo tài khoản</p>
                <p className="text-body-md text-on-surface">
                  {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
