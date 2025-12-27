import { Bell, Plus, Search, LogOut, Home, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Logo } from "./ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useNotifications } from "../contexts/NotificationContext";
import { useState, useEffect, useRef } from "react";

interface ReceptionistHeaderProps {
  onLogout: () => void;
  onGoHome?: () => void;
  onNewAppointment: () => void;
  onNewPatient: () => void;
  onSearch: (query: string) => void;
}

export function ReceptionistHeader({
  onLogout,
  onGoHome,
  onNewAppointment,
  onNewPatient,
  onSearch,
}: ReceptionistHeaderProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  const handleNotificationClick = async (notification: { id: string; read: boolean }) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setShowNotifications(false);
  };

  return (
    <header className="fixed top-0 right-0 left-[260px] h-[80px] bg-white border-b border-gray-200 z-40 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm bệnh nhân (Tên, SĐT, Mã BN...)"
            className="pl-10 bg-[#f8f9fa] border-gray-200"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* New Appointment Button */}
        <Button
          onClick={onNewAppointment}
          className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Đặt lịch mới
        </Button>

        {/* New Patient Button */}
        <Button
          onClick={onNewPatient}
          variant="outline"
          className="border-[#3FB5FF] text-[#3FB5FF] hover:bg-[#3FB5FF]/10 gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm Bệnh nhân
        </Button>

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
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-[#01304e] text-base">
                  Thông báo {notifications.length > 0 && `(${notifications.length})`}
                </h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className={`text-xs font-medium whitespace-nowrap transition-colors ${
                        unreadCount > 0
                          ? 'text-[#3fb5ff] hover:text-[#05619a] cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                    aria-label="Đóng"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
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
                <AvatarFallback className="bg-[#3FB5FF] text-white">
                  LT
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm text-[#01304e]">Lễ tân</p>
                <p className="text-xs text-gray-500">Receptionist</p>
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
    </header>
  );
}
