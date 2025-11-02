import { useState } from 'react';
import { Search, Bell, ChevronDown, Home } from 'lucide-react';

interface PharmacistHeaderProps {
  onLogout: () => void;
  onGoHome?: () => void;
}

export function PharmacistHeader({ onLogout, onGoHome }: PharmacistHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="fixed top-0 left-0 right-0 h-[80px] bg-white border-b border-[#e5e7eb] shadow-sm z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3fb5ff] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
              DentalCareX
            </h1>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#05619a]">
              Dược sĩ
            </p>
          </div>
        </div>

        {/* Search Bar - Toàn cục tìm kiếm thuốc */}
        <div className="flex-1 max-w-[500px] mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#05619a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thuốc, hoạt chất, đơn thuốc..."
              className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[#f0f9ff] transition-colors">
            <Bell className="w-6 h-6 text-[#05619a]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#dc3545] rounded-full"></span>
          </button>

          {/* User Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f9ff] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#3fb5ff] flex items-center justify-center">
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[16px]">
                  DS
                </span>
              </div>
              <div className="text-left">
                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                  Dược sĩ Nguyễn Văn A
                </p>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#05619a]">
                  Dược sĩ
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#05619a]" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-[200px] bg-white rounded-lg shadow-lg border border-[#e5e7eb] py-2 z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onGoHome?.();
                  }}
                  className="w-full px-4 py-2 text-left font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#3fb5ff] hover:bg-[#ecf8ff] transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Trang chủ
                </button>
                <div className="border-t border-[#e5e7eb] my-2" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#dc3545] hover:bg-[#fff5f5] transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
