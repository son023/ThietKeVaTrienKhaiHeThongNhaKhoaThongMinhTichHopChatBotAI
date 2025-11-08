import { Bell, MessageCircle, User, LogOut, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PatientHeaderProps {
  onLogout: () => void;
  onGoHome: () => void;
  onOpenChatbot: () => void;
}

export function PatientHeader({ onLogout, onGoHome, onOpenChatbot }: PatientHeaderProps) {
  return (
    <header className="h-[80px] bg-white border-b border-[#ebf6fc] flex items-center justify-between px-[20px] md:px-[40px] sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-[12px]">
        <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[10px] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.3"/>
            <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="hidden sm:block">
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#05619a] text-[18px]">
            DentalCareX
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px]">
            Cổng thông tin bệnh nhân
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-[12px] md:gap-[16px]">
        {/* Chatbot Button */}
        <button
          onClick={onOpenChatbot}
          className="relative w-[40px] h-[40px] rounded-[10px] bg-[#ebf6fc] hover:bg-[#d6edfa] transition-colors flex items-center justify-center"
          aria-label="Mở trợ lý ảo"
        >
          <MessageCircle className="w-[20px] h-[20px] text-[#3fb5ff]" />
        </button>

        {/* Notifications */}
        <button
          className="relative w-[40px] h-[40px] rounded-[10px] bg-[#ebf6fc] hover:bg-[#d6edfa] transition-colors flex items-center justify-center"
          aria-label="Thông báo"
        >
          <Bell className="w-[20px] h-[20px] text-[#3fb5ff]" />
          <span className="absolute top-[8px] right-[8px] w-[8px] h-[8px] bg-[#ff6b6b] rounded-full"></span>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-[8px] hover:opacity-80 transition-opacity">
              <Avatar className="w-[40px] h-[40px] border-2 border-[#3fb5ff]">
                <AvatarImage src="" alt="Patient" />
                <AvatarFallback className="bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] text-white">
                  BN
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                Bệnh nhân
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel className="font-['Fz_Poppins:SemiBold',sans-serif]">
              Tài khoản
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onGoHome} className="cursor-pointer font-['Fz_Poppins:Regular',sans-serif]">
              <Home className="mr-2 h-4 w-4" />
              Trang chủ công khai
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer font-['Fz_Poppins:Regular',sans-serif] text-[#ff6b6b]">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
