import { Home, Calendar, CreditCard, FileText, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface PatientSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function PatientSidebar({ currentPage, onNavigate }: PatientSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
    { id: 'medical-records', label: 'Hồ sơ bệnh án', icon: FileText },
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-[20px] right-[20px] z-50 lg:hidden w-[56px] h-[56px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-full shadow-[0px_4px_20px_0px_rgba(63,181,255,0.4)] flex items-center justify-center"
      >
        {isMobileMenuOpen ? (
          <X className="w-[24px] h-[24px] text-white" />
        ) : (
          <Menu className="w-[24px] h-[24px] text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[280px] bg-white border-r border-[#ebf6fc]
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="p-[20px] space-y-[8px] mt-[80px] lg:mt-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`
                  w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px]
                  transition-all duration-200
                  font-['Fz_Poppins:Medium',sans-serif] text-[15px]
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] text-white shadow-[0px_4px_16px_0px_rgba(63,181,255,0.3)]'
                      : 'text-[#333333] hover:bg-[#ebf6fc]'
                  }
                `}
              >
                <Icon className="w-[20px] h-[20px] flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="absolute bottom-[20px] left-[20px] right-[20px]">
          <div className="bg-gradient-to-br from-[#ebf6fc] to-[#d6edfa] rounded-[16px] p-[20px]">
            <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#05619a] text-[14px] mb-[8px]">
              Cần hỗ trợ?
            </h4>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[12px]">
              Liên hệ với chúng tôi để được giúp đỡ
            </p>
            <a
              href="tel:+84583891780"
              className="block text-center bg-white text-[#3fb5ff] px-[16px] py-[8px] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] hover:shadow-md transition-all"
            >
              Gọi ngay
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
