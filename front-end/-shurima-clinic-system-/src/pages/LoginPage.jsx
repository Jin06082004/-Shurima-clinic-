import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/api';
import { Button } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔐 LoginPage - Attempting login:', formData.email);
      const response = await authService.login(formData.email, formData.password);
      console.log('📦 LoginPage - Login response:', response);
      
      if (response.success && response.data?.accessToken) {
        console.log('✅ LoginPage - Login successful, saving token...');
        // Save token to localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        // Save user info to localStorage
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        console.log('💾 LoginPage - Token and user saved to localStorage');
        navigate('/dashboard');
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('❌ LoginPage - Error:', err.message);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 5v5a2 2 0 002 2h2a2 2 0 002-2v-5a6 6 0 006-5V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3" />
              <path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4" />
              <circle cx="17" cy="7" r="2" />
            </svg>
          </div>
          <h1 className="text-headline-lg text-on-surface">Shurima Clinic</h1>
          <p className="text-on-surface-variant mt-2">Hệ thống quản lý phòng khám</p>
        </div>

        {/* Login Form */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 card-shadow">
          <h2 className="text-headline-sm text-on-surface mb-6">Đăng nhập</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError('');
                }}
                className="w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed"
                placeholder="admin@shurimaclinic.com"
                required
              />
            </div>

            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-tertiary-fixed pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">Ghi nhớ đăng nhập</span>
              </label>
              <button type="button" className="text-sm text-tertiary-fixed hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-tertiary-fixed hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <p className="text-center text-xs text-on-surface-variant mt-6">
          Demo: admin@shurimaclinic.com / ••••••••
        </p>
      </div>
    </div>
  );
}
