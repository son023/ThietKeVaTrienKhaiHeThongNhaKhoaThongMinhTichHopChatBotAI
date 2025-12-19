import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { useState } from "react";

interface PublicHeaderProps {
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
  onBookingClick: () => void;
}

export function PublicHeader({
  onNavigate,
  onLoginClick,
  onBookingClick,
}: PublicHeaderProps) {
  const [activeMenu, setActiveMenu] = useState("home");

  const menuItems = [
    { id: "home", label: "Trang chủ" },
    { id: "services", label: "Dịch vụ" },
    { id: "doctors", label: "Bác sĩ" },
    { id: "about", label: "Về chúng tôi" },
    { id: "contact", label: "Liên hệ" },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    onNavigate(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#fcfeff] h-[104px] z-50 shadow-sm">
      <div className="container mx-auto px-20 h-full flex items-center justify-between">
        {/* Logo */}
        <div onClick={() => handleMenuClick("home")}>
          <Logo />
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-[30px]">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleMenuClick(item.id)}
              className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] tracking-[0.5px] ${
                activeMenu === item.id
                  ? "text-primary hover:text-primary hover:bg-accent"
                  : ""
              }`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {" "}
          {/* gap-[10px] ~ gap-2.5 hoặc gap-3 */}
          {/* BUTTON 1: Đăng nhập */}
          {/* Dùng variant "ghost" (hoặc "outline") như đã setup cho Navbar */}
          {/* Font Inter sẽ tự động nhận, không cần khai báo */}
          <Button onClick={onLoginClick} variant="outline">
            Đăng nhập
          </Button>
          {/* BUTTON 2: Đặt lịch hẹn */}
          {/* Không cần ghi variant="default" vì nó là mặc định */}
          {/* Xóa bg-[#3fb5ff], xóa font, xóa border... hệ thống tự lo */}
          <Button onClick={onBookingClick} variant="primary">
            Đặt lịch hẹn
          </Button>
        </div>
      </div>
    </header>
  );
}
