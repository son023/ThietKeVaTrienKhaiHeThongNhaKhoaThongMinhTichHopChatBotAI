import { useMemo, useState, useEffect, useRef } from "react";
import { Bell, LogOut, User, Settings, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { DoctorWithUser } from "../controllers/DoctorController";
import { notificationController, type NotificationDTO } from "../controllers/NotificationController";
import { connectWebSocket, subscribeToDoctorNotifications } from "../services/websocketService";

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
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const loadNotifications = async (userId: string) => {
    try {
      console.log("Loading notifications for userId:", userId);
      const [notifs, unread] = await Promise.all([
        notificationController.getByUserId(userId),
        notificationController.getUnreadCount(userId),
      ]);
      console.log("Notifications loaded:", notifs.length, "total,", unread, "unread");
      setNotifications(notifs);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  useEffect(() => {
    if (!doctor?.userId) {
      console.log("Doctor userId not available yet, waiting...");
      return;
    }

    const userId = doctor.userId;
    console.log("Setting up notifications for doctor userId:", userId);

    loadNotifications(userId);

    console.log("Connecting to websocket...");
    connectWebSocket();

    const subscribeTimeout = setTimeout(() => {
      console.log("Subscribing to websocket notifications for userId:", userId);
      const unsubscribe = subscribeToDoctorNotifications(userId, (notification) => {
        console.log("New notification received via websocket:", notification);
        setTimeout(() => {
          console.log("Reloading notifications after websocket message...");
          loadNotifications(userId);
        }, 1000);
      });
      unsubscribeRef.current = unsubscribe;
    }, 1000);

    return () => {
      clearTimeout(subscribeTimeout);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [doctor?.userId]);

  const handleNotificationClick = async (notification: NotificationDTO) => {
    if (notification.status === "sent") {
      try {
        await notificationController.markAsRead(notification.id);
        if (doctor?.userId) {
          loadNotifications(doctor.userId);
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
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
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 hover:bg-[#d8f0ff] rounded-[10px] transition-colors">
                <Bell className="w-6 h-6 text-[#333333]" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-[#3FB5FF] text-white rounded-full flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 rounded-[15px] border-[#e8e8e8]"
              align="end"
              onOpenAutoFocus={() => {
                // Reload notifications when popover opens
                if (doctor?.userId) {
                  console.log("🔄 Popover opened, reloading notifications...");
                  loadNotifications(doctor.userId);
                }
              }}
            >
              <div className="p-4 border-b border-[#e8e8e8]">
                <h3 className="text-[#01304e]">Thong bao</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[#333333]/60 text-sm">
                    Không có thông báo
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-[#e8e8e8] hover:bg-[#d8f0ff]/30 transition-colors cursor-pointer ${
                        notif.status === "sent" ? "bg-[#d8f0ff]/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-[#333333]">{notif.message}</p>
                        {notif.status === "sent" && (
                          <div className="w-2 h-2 bg-[#3FB5FF] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-[#333333]/60 mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

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
