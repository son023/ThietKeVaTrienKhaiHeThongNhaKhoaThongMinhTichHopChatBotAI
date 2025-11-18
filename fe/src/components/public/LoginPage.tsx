import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onBack: () => void;
  onNavigateToSignup: () => void;
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onBack, onNavigateToSignup, onLogin }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginData.email, loginData.password);
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
                Số điện thoại / Email
              </label>
              <Input
                type="text"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="Nhập số điện thoại hoặc email"
                className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                required
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
              />
            </div>

            <div className="flex justify-end">
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
              className="w-full bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] h-[56px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.5)]"
            >
              Đăng nhập
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
      </div>
    </div>
  );
}
