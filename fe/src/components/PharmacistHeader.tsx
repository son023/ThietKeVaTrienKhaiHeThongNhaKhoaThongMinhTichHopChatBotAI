import { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, Home, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { connectWebSocket, subscribeToInvoicePaid, InvoicePaidNotification } from '../services/websocketService';
import { authController } from '../controllers/AuthController';
import { useNotifications } from '../contexts/NotificationContext';
import { Logo } from './ui/logo';

interface PharmacistHeaderProps {
  onLogout: () => void;
  onGoHome?: () => void;
}


export function PharmacistHeader({ onLogout, onGoHome }: PharmacistHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();



  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);




  return (
    <div className="fixed top-0 left-0 right-0 h-[80px] bg-white border-b border-[#e5e7eb] shadow-sm z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <Logo />

        {/* Search Bar */}
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
          {/* ✅ Notifications với dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[#f0f9ff] transition-colors"
            >
              <Bell className="w-6 h-6 text-[#05619a]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#dc3545] rounded-full flex items-center justify-center">
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[11px]">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-[#e5e7eb] z-50 max-h-[500px] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">
                    Thông báo {notifications.length > 0 && `(${notifications.length})`}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#3fb5ff] hover:text-[#05619a]"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>
                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-[#d6edfa] mx-auto mb-3" />
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                        Chưa có thông báo
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e5e7eb]">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-[#f8f9fa] transition-colors cursor-pointer ${!notif.read ? 'bg-[#ecf8ff]' : ''
                            }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle
                                  className={`w-4 h-4 flex-shrink-0 ${notif.read ? 'text-[#6c757d]' : 'text-[#28a745]'
                                    }`}
                                />
                                <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-[#3fb5ff] rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#6c757d] mb-2">
                                {notif.message}
                              </p>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[11px] text-[#999999]">
                                {new Date(notif.timestamp).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-1 hover:bg-[#fff5f5] rounded transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 text-[#dc3545]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* ... existing user dropdown code ... */}
          </div>
        </div>
      </div>
    </div>
  );
}