import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, Home, X, CheckCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { connectWebSocket, subscribeToInvoicePaid, InvoicePaidNotification } from '../services/websocketService';
import { authController } from '../controllers/AuthController';
import { useNotifications } from '../contexts/NotificationContext';
import { Logo } from './ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { UserDTO } from '../models/User';

interface PharmacistHeaderProps {
  onLogout: () => void;
  onGoHome?: () => void;
}


export function PharmacistHeader({ onLogout, onGoHome }: PharmacistHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    loading,
  } = useNotifications();

  // Load user data and avatar from localStorage
  useEffect(() => {
    const currentUser = authController.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Load avatar preview from localStorage
      const savedAvatar = localStorage.getItem(`avatar_preview_${currentUser.id}`);
      if (savedAvatar) {
        setAvatarPreview(savedAvatar);
      }
    }

    // Listen for storage changes to update avatar when changed in AccountSettings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('avatar_preview_')) {
        const currentUser = authController.getCurrentUser();
        if (currentUser && e.key === `avatar_preview_${currentUser.id}`) {
          setAvatarPreview(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);



  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  useEffect(() => {
    if (showNotifications) {
      refreshNotifications();
    }
  }, [showNotifications, refreshNotifications]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getInitials = (name: string | undefined) => {
    if (!name || name.trim() === '') {
      return 'DS';
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleNotificationClick = async (notification: { id: string; read: boolean }) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setShowNotifications(false);
  };

  // Use useMemo for displayName like ReceptionistHeader
  const displayName = useMemo(() => user?.fullName, [user]);
  const subtitle = useMemo(() => {
    if (user?.primaryRole) return user.primaryRole;
    return "Dược sĩ";
  }, [user]);
  const avatarFallback = useMemo(
    () => (displayName ? getInitials(displayName) : "DS"),
    [displayName]
  );




  return (
    <header className="bg-white border-b border-[#e8e8e8] px-6 py-4 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
      <div className="flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl mr-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thuốc, hoạt chất, đơn thuốc..."
            className="w-full pl-10 bg-[#f8f9fa] border-gray-200 h-10 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
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
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Đang tải thông báo...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Không có thông báo
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-[#01304e] mb-1">
                              {notif.title}
                            </p>
                            <p className="text-sm text-gray-700">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(notif.timestamp)}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-[#3FB5FF] rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                <Avatar className="w-10 h-10">
                  {(avatarPreview || user?.imageUrl) ? (
                    <AvatarImage src={avatarPreview || user?.imageUrl} alt={displayName || 'Avatar'} />
                  ) : null}
                  <AvatarFallback className="bg-[#3FB5FF] text-white">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm text-[#01304e]">{displayName || 'Dược sĩ'}</p>
                  <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                Tài khoản của tôi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onGoHome && (
                <>
                  <DropdownMenuItem onClick={onGoHome} className="cursor-pointer">
                    <Home className="w-4 h-4 mr-2" />
                    Trang chủ
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}