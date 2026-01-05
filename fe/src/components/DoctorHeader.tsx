import { useMemo, useState, useEffect, useRef } from "react";
import { Bell, LogOut, User, Settings, Home, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { DoctorWithUser } from "../controllers/DoctorController";
import { useNotifications } from "../contexts/NotificationContext";

interface HeaderProps {
  onLogout?: () => void;
  onGoHome?: () => void;
  doctor?: DoctorWithUser;
  isLoading?: boolean;
}

export function DoctorHeader({
  onLogout,
  onGoHome,
  doctor,
  isLoading,
}: HeaderProps = {}) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
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
  const displayName = useMemo(() => doctor?.user?.fullName, [doctor]);
  const subtitle = useMemo(() => {
    const specialization = doctor?.specializationCodes?.[0];
    if (specialization) return `Chuyen khoa: ${specialization}`;
    if (doctor?.workingHospital) return doctor.workingHospital;
    return "Ho so bac si";
  }, [doctor]);
  const avatarFallback = useMemo(
    () => (displayName ? displayName.slice(0, 2).toUpperCase() : "DR"),
    [displayName]
  );

  return (
    <header className="bg-white border-b border-[#e8e8e8] px-6 py-4 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
      <div className="flex items-center justify-between">
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onGoHome}
        >
          <h2 className="text-[#01304e]">Phong kham Nha khoa DentalCareX</h2>
          <p className="text-[#333333]/60 text-sm mt-1">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[#d8f0ff] transition-all duration-200"
            >
                <Bell className="w-6 h-6 text-[#333333]" />
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
                            ? 'text-[#3FB5FF] hover:text-[#3FB5FF]/80 cursor-pointer'
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#d8f0ff]/30 rounded-[10px] px-3 py-2 transition-colors">
                <div className="text-right">
                  <p className="text-[#333333]">
                    {isLoading ? "Dang tai..." : displayName}
                  </p>
                  <p className="text-sm text-[#333333]/60">
                    {isLoading ? "" : subtitle}
                  </p>
                </div>
                <Avatar>
                  <AvatarImage src={doctor?.user?.imageUrl || undefined} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-[10px] border-[#e8e8e8]"
              align="end"
            >
              <DropdownMenuLabel className="text-[#01304e]">
                Tai khoan
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e8e8e8]" />
              <DropdownMenuItem className="cursor-pointer rounded-[8px]">
                <User className="mr-2 h-4 w-4 text-[#3FB5FF]" />
                <span>Ho so ca nhan</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-[8px]">
                <Settings className="mr-2 h-4 w-4 text-[#3FB5FF]" />
                <span>Cai dat</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#e8e8e8]" />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-[8px]"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Dang xuat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
