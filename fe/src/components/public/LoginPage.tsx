import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authController } from '../../controllers';
import { LoginFormData, UserRole } from '../../models';
import { medicalServiceController, doctorController } from '../../controllers';
import type { MedicalServiceDTO } from '../../controllers/MedicalServiceController';
import type { DoctorWithUser } from '../../controllers/DoctorController';

interface LoginPageProps {
  onBack: () => void;
  onNavigateToSignup: () => void;
  onLoginSuccess: (userRole: UserRole) => void;
}

export function LoginPage({ onBack, onNavigateToSignup, onLoginSuccess }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ 
    phone: '',
    password: '', 
    rememberMe: false 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<MedicalServiceDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData: LoginFormData = {
        phone: loginData.phone,
        password: loginData.password,
        rememberMe: loginData.rememberMe
      };

      const response = await authController.login(formData);
      
      toast.success(response.message || 'Đăng nhập thành công!');
      
      // Navigate based on user role
      const primaryRole = response.user.primaryRole as UserRole;
      onLoginSuccess(primaryRole);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadLists = async () => {
      try {
        setIsLoadingLists(true);
        const [serviceRes, doctorRes] = await Promise.all([
          medicalServiceController.getAll().catch(() => []),
          doctorController.getWithUserDetails().catch(() => []),
        ]);
        setServices(serviceRes || []);
        setDoctors(doctorRes || []);
      } finally {
        setIsLoadingLists(false);
      }
    };

    loadLists();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf6fc] to-[#fcfeff] flex flex-col">
      {/* DoctorHeader */}
      <div className="bg-[#fcfeff] border-b border-[#ebf6fc]">
        <div className="max-w-[1400px] mx-auto px-[20px] sm:px-[40px] py-[20px]">
          <button
            onClick={onBack}
            className="flex items-center gap-[8px] text-[#3fb5ff] hover:text-[#3fb5ff]/80 transition-colors"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
            <span className="font-['Fz_Poppins:Medium',sans-serif] text-[15px]">
              Quay lại
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-[20px] sm:p-[40px]">
        <div className="bg-[#fcfeff] rounded-[24px] w-full max-w-[520px] p-[40px] sm:p-[60px] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.08)]">
          {/* Logo or Icon */}
          <div className="text-center mb-[32px]">
            <div className="w-[80px] h-[80px] mx-auto mb-[20px] bg-gradient-to-br from-[#3fb5ff] to-[#3fb5ff]/70 rounded-[20px] flex items-center justify-center shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
              <svg className="w-[40px] h-[40px] text-[#fcfeff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-[8px]">
              Chào mừng trở lại!
            </h1>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
              Đăng nhập để quản lý lịch hẹn của bạn
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-[24px]">
            <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Số điện thoại
              </label>
              <Input
                type="text"
                value={loginData.phone}
                onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  className="rounded border-[#ebf6fc] text-[#3fb5ff] focus:ring-[#3fb5ff]"
                  disabled={isLoading}
                />
                <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px] hover:underline"
                onClick={() => toast.info('Chức năng đang được phát triển')}
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] h-[56px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-[32px] text-center">
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
              Chưa có tài khoản?{' '}
              <button
                onClick={onNavigateToSignup}
                className="text-[#3fb5ff] font-['Fz_Poppins:SemiBold',sans-serif] hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
        <div className="mt-8 w-full max-w-[960px]">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-2xl border border-[#ebf6fc] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#01304e] font-semibold text-lg">Dịch vụ nổi bật</h3>
                {isLoadingLists && <span className="text-xs text-gray-500">Đang tải...</span>}
              </div>
              <div className="space-y-2 max-h-[260px] overflow-auto">
                {(services || []).slice(0, 6).map((svc) => (
                  <div key={svc.id} className="p-3 rounded-xl bg-[#f7fbff] border border-[#ebf6fc]">
                    <div className="text-sm text-[#01304e] font-medium">{svc.serviceName}</div>
                    <div className="text-xs text-gray-600">
                      {(svc.serviceType || '').toUpperCase()} • {svc.price ? `${svc.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </div>
                  </div>
                ))}
                {!isLoadingLists && services.length === 0 && (
                  <div className="text-sm text-gray-500">Chưa có dịch vụ để hiển thị.</div>
                )}
              </div>
            </div>
            <div className="bg-white/70 rounded-2xl border border-[#ebf6fc] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#01304e] font-semibold text-lg">Bác sĩ</h3>
                {isLoadingLists && <span className="text-xs text-gray-500">Đang tải...</span>}
              </div>
              <div className="space-y-2 max-h-[260px] overflow-auto">
                {(doctors || []).slice(0, 6).map((doc) => (
                  <div key={doc.userId} className="p-3 rounded-xl bg-[#f7fbff] border border-[#ebf6fc]">
                    <div className="text-sm text-[#01304e] font-medium">
                      {doc.user?.fullName || 'Bác sĩ'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {doc.specializationCodes?.[0]?.displayName || doc.specializationCodes?.[0]?.code || doc.workingHospital || 'Nha khoa'}
                    </div>
                  </div>
                ))}
                {!isLoadingLists && doctors.length === 0 && (
                  <div className="text-sm text-gray-500">Chưa có bác sĩ để hiển thị.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
