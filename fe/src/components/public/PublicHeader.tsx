import { Button } from '../ui/button';
import { useState } from 'react';

interface PublicHeaderProps {
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
  onBookingClick: () => void;
}

export function PublicHeader({ onNavigate, onLoginClick, onBookingClick }: PublicHeaderProps) {
  const [activeMenu, setActiveMenu] = useState('home');

  const menuItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'services', label: 'Dịch vụ' },
    { id: 'doctors', label: 'Bác sĩ' },
    { id: 'about', label: 'Về chúng tôi' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    onNavigate(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#fcfeff] h-[104px] z-50 shadow-sm">
      <div className="container mx-auto px-20 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-[9px] cursor-pointer" onClick={() => handleMenuClick('home')}>
          <div className="w-[24px] h-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d="M17.499 6.00098L17.7031 6.01562H17.8057L17.8281 6.2334L17.9307 6.64551C17.9671 6.7918 18.016 7.18517 17.9941 7.78613C17.9851 8.03442 17.9647 8.25966 17.9443 8.44434C17.8173 8.71365 17.6829 8.98008 17.5479 9.22656C17.4365 9.42976 17.3335 9.60535 17.25 9.74316C17.2085 9.81172 17.1735 9.8678 17.1465 9.91016C17.1368 9.92533 17.1279 9.93775 17.1211 9.94824C16.7691 10.4425 16.4865 10.947 16.2617 11.4414C15.0559 10.5417 13.3534 9.7862 11.291 10.0293C9.78735 10.1798 8.58479 10.7405 7.64941 11.4209C7.35969 10.7539 7.03138 10.159 6.7168 9.68652L6.55078 9.4375L6.36133 9.20605L6.28418 9.10352C6.20872 8.99436 6.13732 8.86526 6.0791 8.73242C6.07067 8.71317 6.06433 8.69425 6.05762 8.67773C6.00509 8.17624 5.99323 7.73024 6.00293 7.37891C6.00874 7.16889 6.0217 7.00758 6.03223 6.90527C6.04112 6.81887 6.04589 6.79888 6.03906 6.83789L6.06836 6.70215L6.09668 6.49023C6.1173 6.33539 6.15954 6.17402 6.21484 6.01562H6.27441C6.63755 6.01562 6.94088 6.06552 7.14258 6.11523C7.17759 6.12386 7.20661 6.13375 7.23047 6.14062L7.58887 6.33496L8.2207 6.51562C11.2039 7.36893 14.0541 6.90708 15.4346 6.48828L15.959 6.3291L16.3633 6.12012C16.3693 6.1184 16.3761 6.11634 16.3838 6.11426C16.4688 6.09135 16.6025 6.06365 16.7783 6.04102C16.9511 6.0188 17.1247 6.00644 17.2754 6.00195C17.4328 5.99727 17.5142 6.00202 17.499 6.00098Z" stroke="#002035" strokeWidth="12" />
            </svg>
          </div>
          <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
            DentalCareX
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-[30px]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] tracking-[0.5px] transition-colors ${
                activeMenu === item.id ? 'text-[#01304e]' : 'text-[#666666] hover:text-[#01304e]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-[10px]">
          <Button
            onClick={onLoginClick}
            variant="outline"
            className="bg-[#fcfeff] text-[#1882c3] border-0 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] h-[50px] px-[20px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#f0f9ff]"
          >
            Đăng nhập
          </Button>
          <Button
            onClick={onBookingClick}
            className="bg-[#3fb5ff] text-[#fcfeff] border-0 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] h-[51px] px-[20px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#3fb5ff]/90"
          >
            Đặt lịch hẹn
          </Button>
        </div>
      </div>
    </header>
  );
}
