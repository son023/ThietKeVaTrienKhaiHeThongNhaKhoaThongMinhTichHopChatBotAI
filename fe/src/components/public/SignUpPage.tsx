import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authController } from '../../controllers';
import { RegisterFormData, UserRole } from '../../models';

interface SignUpPageProps {
  onBack: () => void;
  onNavigateToLogin: () => void;
}

export function SignUpPage({ onBack, onNavigateToLogin }: SignUpPageProps) {
  const [signupData, setSignupData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!signupData.email && !signupData.phone) {
      toast.error('Vui lòng nhập ít nhất email hoặc số điện thoại');
      return;
    }

    setIsLoading(true);

    try {
      const formData: RegisterFormData = {

        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        fullName: signupData.fullName,
        phone: signupData.phone,
        role: UserRole.PATIENT
      };

      const response = await authController.register(formData);
      
      toast.success(response.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      
      setTimeout(() => {
        onNavigateToLogin();
      }, 1500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-[8px]">
              Tạo tài khoản
            </h1>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
              Đăng ký để quản lý lịch hẹn dễ dàng hơn
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-[20px]">
  <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                placeholder="Nhập họ và tên đầy đủ"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
                disabled={isLoading}
              />
            </div>



            <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                placeholder="Nhập email"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] h-[56px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-[32px] text-center">
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
              Đã có tài khoản?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-[#3fb5ff] font-['Fz_Poppins:SemiBold',sans-serif] hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
