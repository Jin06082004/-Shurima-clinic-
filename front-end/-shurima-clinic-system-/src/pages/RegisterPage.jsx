import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/api';
import { Button } from '@/components/ui';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [validationError, setValidationError] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
    setValidationError({ ...validationError, [name]: '' });
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng';
    }

    setValidationError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsLoading(true);
      setError('');
      
      console.log('📝 RegisterPage - Attempting registration:', formData.email);
      const response = await authService.register({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'patient', // Default role - admin will assign actual role
      });
      console.log('📦 RegisterPage - Register response:', response);
      
      if (response.success) {
        console.log('✅ RegisterPage - Registration successful');
        // If backend returns token, save it
        if (response.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          console.log('💾 RegisterPage - Token and user saved to localStorage');
          navigate('/dashboard');
        } else {
          // Otherwise redirect to login
          console.log('ℹ️ RegisterPage - No token returned, redirecting to login');
          navigate('/login');
        }
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('❌ RegisterPage - Error:', err.message);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại đăng nhập</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 5v5a2 2 0 002 2h2a2 2 0 002-2v-5a6 6 0 006-5V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3" />
              <path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4" />
              <circle cx="17" cy="7" r="2" />
            </svg>
          </div>
          <h1 className="text-headline-lg text-on-surface">Đăng ký tài khoản</h1>
          <p className="text-on-surface-variant mt-2">Tạo tài khoản để sử dụng dịch vụ</p>
        </div>

        {/* Register Form */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Họ tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  validationError.name ? 'ring-2 ring-error' : ''
                }`}
                placeholder="Nhập họ tên của bạn"
              />
              {validationError.name && (
                <p className="text-xs text-error mt-1">{validationError.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  validationError.email ? 'ring-2 ring-error' : ''
                }`}
                placeholder="email@example.com"
              />
              {validationError.email && (
                <p className="text-xs text-error mt-1">{validationError.email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed ${
                  validationError.phone ? 'ring-2 ring-error' : ''
                }`}
                placeholder="0912345678"
              />
              {validationError.phone && (
                <p className="text-xs text-error mt-1">{validationError.phone}</p>
              )}
            </div>

            {/* Note: Role will be assigned by admin after registration */}
            <div className="p-3 bg-tertiary-container/20 rounded-lg border border-tertiary-fixed/30">
              <p className="text-xs text-on-surface-variant">
                💡 Vai trò sẽ được admin cấp quyền sau khi bạn tạo tài khoản
              </p>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed pr-12 ${
                    validationError.password ? 'ring-2 ring-error' : ''
                  }`}
                  placeholder="Ít nhất 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationError.password && (
                <p className="text-xs text-error mt-1">{validationError.password}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed pr-12 ${
                    validationError.confirmPassword ? 'ring-2 ring-error' : ''
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationError.confirmPassword && (
                <p className="text-xs text-error mt-1">{validationError.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">
                  Tôi đồng ý với{' '}
                  <button type="button" className="text-tertiary-fixed hover:underline">
                    Điều khoản sử dụng
                  </button>{' '}
                  và{' '}
                  <button type="button" className="text-tertiary-fixed hover:underline">
                    Chính sách bảo mật
                  </button>
                </span>
              </label>
              {validationError.agreeTerms && (
                <p className="text-xs text-error mt-1">{validationError.agreeTerms}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Đăng ký
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-on-surface-variant mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-tertiary-fixed hover:underline font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
