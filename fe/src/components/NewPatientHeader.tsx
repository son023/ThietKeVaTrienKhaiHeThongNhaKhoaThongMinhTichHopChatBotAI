import svgPaths from "../imports/svg-rgty3nojwf";
import {
  Bell,
  User,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Logo } from "./ui/logo";
import { Button } from "./ui/button";
import { useNotifications } from "../contexts/NotificationContext";
import { appointmentController, authController } from "../controllers";

interface NewPatientHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenChatbot: () => void;
  onLogout: () => void;
}

interface Notification {
  id: string;
  type: "appointment" | "payment" | "medical" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
  timestamp?: number;
  appointmentId?: string; // Thêm field này để có thể tính toán lại thời gian
  appointmentStartTime?: string; // Thêm field này để lưu thời gian appointment
  userId?: string; // Thêm field này để filter
}

export function NewPatientHeader({
  currentPage,
  onNavigate,
  onOpenChatbot,
  onLogout,
}: NewPatientHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Sử dụng NotificationContext
  const {
    notifications: contextNotifications,
    unreadCount: contextUnreadCount,
    markAsRead: markAsReadContext,
    markAllAsRead: markAllAsReadContext,
  } = useNotifications();

  // State cho appointment reminders
  const [appointmentReminders, setAppointmentReminders] = useState<Notification[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);

  // Lấy current user để filter notifications
  const currentUser = authController.getCurrentUser();
  const currentUserId = currentUser?.id;

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  const [activeMenu, setActiveMenu] = useState("home");

  const menuItems = [
    { id: "home", label: "Trang chủ" },
    { id: "appointments", label: "Lịch hẹn" },
    { id: "payment", label: "Thanh toán" },
    { id: "medical-records", label: "Hồ sơ bệnh án" },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    onNavigate(id);
  };

  const handleLogoClick = () => {
    onNavigate("/");
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
    onNavigate("/");
  };

  // Helper functions cho localStorage
  const getStoredReminders = (): Notification[] => {
    try {
      const stored = localStorage.getItem('appointment_reminders');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to parse stored reminders:", error);
    }
    return [];
  };

  const saveStoredReminders = (reminders: Notification[]) => {
    try {
      localStorage.setItem('appointment_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
  };

  // Helper functions cho dismissed reminders
  const getDismissedReminders = (): Set<string> => {
    try {
      const stored = localStorage.getItem('dismissed_appointment_reminders');
      if (stored) {
        const dismissed = JSON.parse(stored);
        return new Set(dismissed.map((d: any) => d.reminderId));
      }
    } catch (error) {
      console.error("Failed to parse dismissed reminders:", error);
    }
    return new Set();
  };

  const saveDismissedReminder = (reminderId: string, appointmentId: string, appointmentStartTime: string) => {
    try {
      const stored = localStorage.getItem('dismissed_appointment_reminders');
      const dismissed = stored ? JSON.parse(stored) : [];

      // Thêm vào list nếu chưa có
      if (!dismissed.find((d: any) => d.reminderId === reminderId)) {
        dismissed.push({
          reminderId,
          appointmentId,
          dismissedAt: Date.now(),
          appointmentStartTime
        });

        localStorage.setItem('dismissed_appointment_reminders', JSON.stringify(dismissed));
        console.log(`Dismissed reminder saved: ${reminderId}`);
      }
    } catch (error) {
      console.error("Failed to save dismissed reminder:", error);
    }
  };

  const cleanupDismissedReminders = () => {
    try {
      const stored = localStorage.getItem('dismissed_appointment_reminders');
      if (!stored) return;

      const dismissed = JSON.parse(stored);
      const now = new Date();

      // Giữ lại những dismissed reminders cho appointments chưa diễn ra
      const active = dismissed.filter((d: any) => {
        const appointmentTime = new Date(d.appointmentStartTime);
        return appointmentTime > now;
      });

      if (active.length !== dismissed.length) {
        localStorage.setItem('dismissed_appointment_reminders', JSON.stringify(active));
        console.log(`Cleaned up ${dismissed.length - active.length} old dismissed reminders`);
      }
    } catch (error) {
      console.error("Failed to cleanup dismissed reminders:", error);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const isFuture = diffMs > 0;
    const absDiffMs = Math.abs(diffMs);
    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (isFuture) {
      // Thời gian trong tương lai (reminders)
      if (diffHours > 24) {
        const diffDays = Math.floor(diffHours / 24);
        return `Sau ${diffDays} ngày `;
      } else if (diffHours > 0) {
        return `Sau ${diffHours} giờ`;
      } else if (diffMinutes > 0) {
        return `Sau ${diffMinutes} phút`;
      } else {
        return "Sắp tới";
      }
    } else {
      // Thời gian trong quá khứ (notifications từ context)
      if (diffHours > 24) {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
      } else if (diffHours > 0) {
        return `${diffHours} giờ trước`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} phút trước`;
      } else {
        return "Vừa xong";
      }
    }
  };

  // Load appointment reminders từ upcoming appointments
  useEffect(() => {
    const loadAppointmentReminders = async () => {
      try {
        setIsLoadingReminders(true);
        const user = authController.getCurrentUser();
        if (!user?.id) return;

        // Lấy appointments từ backend
        const appointments = await appointmentController.getByPatientId(user.id);
        const now = new Date();

        // Lấy reminders hiện có từ localStorage
        const storedReminders = getStoredReminders();

        // Lấy dismissed list và cleanup cũ
        const dismissedSet = getDismissedReminders();
        cleanupDismissedReminders();

        // Tạo map để cập nhật reminders hiện có
        const remindersMap = new Map<string, Notification>();

        // Khôi phục reminders cũ và cập nhật thời gian
        storedReminders.forEach(reminder => {
          if (reminder.appointmentId) {
            const appointment = appointments.find(a => a.id === reminder.appointmentId);
            if (appointment) {
              const appointmentStart = new Date(appointment.appointmentStartTime);
              // Chỉ giữ reminders cho appointments chưa diễn ra
              if (appointmentStart > now &&
                (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED')) {
                remindersMap.set(reminder.id, {
                  ...reminder,
                  time: formatTimeAgo(appointmentStart), // Cập nhật lại thời gian
                  appointmentStartTime: appointment.appointmentStartTime,
                });
              }
            }
          } else {
            // Giữ lại reminders không có appointmentId (nếu có)
            remindersMap.set(reminder.id, reminder);
          }
        });

        // Tạo reminders mới cho appointments sắp tới
        for (const appointment of appointments) {
          const appointmentStart = new Date(appointment.appointmentStartTime);
          const timeDiff = appointmentStart.getTime() - now.getTime();
          const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);

          // Chỉ tạo reminder cho appointments chưa diễn ra và có status PENDING hoặc CONFIRMED
          if (
            appointmentStart > now &&
            (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') &&
            hoursUntilAppointment > 0 &&
            hoursUntilAppointment <= 48
          ) {
            const serviceName = appointment.medicalServices?.[0]?.serviceName || 'Khám bệnh';

            // Tạo reminder 24 giờ trước (trong khoảng 23.5 - 24 giờ)
            if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 1) {
              const reminderId = `reminder-24h-${appointment.id}`;
              // ✅ CHECK: Bỏ qua nếu đã bị dismissed
              if (!dismissedSet.has(reminderId) && !remindersMap.has(reminderId)) {
                remindersMap.set(reminderId, {
                  id: reminderId,
                  type: "reminder",
                  title: "Nhắc nhở lịch hẹn (24h)",
                  message: `Bạn có lịch hẹn "${serviceName}" vào ${appointmentStart.toLocaleDateString('vi-VN')} lúc ${appointmentStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
                  time: formatTimeAgo(appointmentStart),
                  read: false,
                  timestamp: Date.now(),
                  appointmentId: appointment.id,
                  appointmentStartTime: appointment.appointmentStartTime,
                });
              }
            }

            // Tạo reminder 1 giờ trước (trong khoảng 0 - 1 giờ, bao gồm cả 30 phút)
            if (hoursUntilAppointment <= 1 && hoursUntilAppointment > 0) {
              const reminderId = `reminder-1h-${appointment.id}`;
              // ✅ CHECK: Bỏ qua nếu đã bị dismissed
              if (!dismissedSet.has(reminderId) && !remindersMap.has(reminderId)) {
                remindersMap.set(reminderId, {
                  id: reminderId,
                  type: "reminder",
                  title: "Nhắc nhở lịch hẹn (1h)",
                  message: `Lịch hẹn "${serviceName}" của bạn sẽ bắt đầu trong 1 giờ tới. Vui lòng chuẩn bị đến phòng khám.`,
                  time: formatTimeAgo(appointmentStart),
                  read: false,
                  timestamp: Date.now(),
                  appointmentId: appointment.id,
                  appointmentStartTime: appointment.appointmentStartTime,
                });
              }
            }
          }
        }

        // Chuyển map thành array và lọc reminders hợp lệ
        const validReminders = Array.from(remindersMap.values()).filter(reminder => {
          // Giữ lại reminders chưa đọc hoặc mới tạo trong 7 ngày
          const reminderAge = Date.now() - (reminder.timestamp || 0);
          return !reminder.read || reminderAge < 7 * 24 * 60 * 60 * 1000;
        });

        saveStoredReminders(validReminders);
        setAppointmentReminders(validReminders);
      } catch (error) {
        console.error("Failed to load appointment reminders:", error);
      } finally {
        setIsLoadingReminders(false);
      }
    };

    // Load reminders khi component mount
    loadAppointmentReminders();

    // Load reminders mỗi 60 phút để cập nhật thời gian
    const interval = setInterval(loadAppointmentReminders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Kết hợp notifications từ context và appointment reminders
  const allNotifications = useMemo(() => {
    // Lấy notifications từ context, chỉ lấy những cái có userId trùng với current user
    const contextAppointmentNotifs = contextNotifications
      .filter(n => {
        // Chỉ lấy notifications về lịch hẹn
        const isAppointmentRelated = n.type === 'APPOINTMENT_CREATED' || n.appointmentId;
        // Chỉ lấy notifications có userId trùng với current user
        return isAppointmentRelated && n.userId === currentUserId;
      })
      .map(n => ({
        id: n.id,
        type: "appointment" as const,
        title: n.title,
        message: n.message,
        time: formatTimeAgo(new Date(n.timestamp)),
        read: n.read,
        timestamp: n.timestamp,
        userId: n.userId,
      }));

    // Kết hợp với reminders từ localStorage
    const combined = [...contextAppointmentNotifs, ...appointmentReminders];

    // Sắp xếp theo thời gian (mới nhất trước)
    return combined.sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return timeB - timeA;
    });
  }, [contextNotifications, appointmentReminders, currentUserId]);

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    // Đánh dấu trong context nếu là notification từ context
    const contextNotif = contextNotifications.find(n => n.id === id);
    if (contextNotif) {
      markAsReadContext(id);
    } else {
      // Đánh dấu trong localStorage
      const updated = appointmentReminders.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      );
      setAppointmentReminders(updated);
      saveStoredReminders(updated);
    }
  };

  const markAllAsRead = () => {
    // Đánh dấu tất cả trong context
    markAllAsReadContext();

    // Đánh dấu tất cả reminders
    const updated = appointmentReminders.map((notif) => ({ ...notif, read: true }));
    setAppointmentReminders(updated);
    saveStoredReminders(updated);
  };

  const deleteNotification = (id: string) => {
    // Xóa từ context nếu là notification từ context
    const contextNotif = contextNotifications.find(n => n.id === id);
    if (contextNotif) {
      // Context có thể không có delete function, chỉ đánh dấu đã đọc
      markAsReadContext(id);
    } else {
      // Tìm reminder để lấy appointmentId
      const reminder = appointmentReminders.find(notif => notif.id === id);

      if (reminder && reminder.appointmentId && reminder.appointmentStartTime) {
        // ✅ LƯU VÀO DISMISSED LIST
        saveDismissedReminder(id, reminder.appointmentId, reminder.appointmentStartTime);
      }

      // Xóa từ localStorage và state
      const updated = appointmentReminders.filter((notif) => notif.id !== id);
      setAppointmentReminders(updated);
      saveStoredReminders(updated);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-[18px] h-[18px] text-primary" />;
      case "payment":
        return <CreditCard className="w-[18px] h-[18px] text-primary" />;
      case "medical":
        return <FileText className="w-[18px] h-[18px] text-primary" />;
      case "reminder":
        return <Clock className="w-[18px] h-[18px] text-primary" />;
      default:
        return <Bell className="w-[18px] h-[18px] text-primary" />;
    }
  };
  return (
    <header
      className="fixed top-0 left-0 right-0 bg-[#fcfeff] h-[104px] z-50 shadow-sm"
      data-name="PatientHeader"
    >
      <div className="container mx-auto px-20 h-full flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <Logo />
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-[30px]">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleMenuClick(item.id)}
              className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] tracking-[0.5px] ${activeMenu === item.id
                ? "text-primary hover:text-primary hover:bg-accent"
                : ""
                }`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Action Buttons */}
        {/* Right Buttons - Notifications & User Menu */}
        <div className="flex items-center gap-[15px]">
          {/* Notification Button */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-neutral-muted hover:bg-neutral-tint transition-all duration-200 rounded-full shrink-0 size-[56px] relative"
              aria-label="Thông báo"
            >
              <div className="absolute aspect-[44/44] bottom-[21.43%] left-1/2 top-[21.43%] translate-x-[-50%]">
                <div className="absolute inset-[8.33%_18.4%_9.38%_18.4%]">
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 21 27"
                  >
                    <path
                      clipRule="evenodd"
                      d={svgPaths.pae7b300}
                      fill="#01304E"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="absolute top-[8px] right-[8px] bg-red-500 rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-[6px]">
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[11px]">
                    {unreadCount}
                  </span>
                </div>
              )}
            </button>
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-[calc(100%+10px)] right-0 w-[420px] bg-neutral-surface rounded-[16px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] overflow-hidden border border-neutral-border">
                {/* Header */}
                <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-neutral-border">
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-heading text-[18px]">
                    Thông báo
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="font-['Fz_Poppins:Medium',sans-serif] text-primary text-[13px] hover:text-primary-strong transition-colors"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                {/* Notifications List */}
                <div className="max-h-[480px] overflow-y-auto">
                  {allNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-[60px] px-[20px]">
                      <Bell className="w-[48px] h-[48px] text-neutral-tint mb-[16px]" />
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-neutral-text text-[15px]">
                        Không có thông báo mới
                      </p>
                    </div>
                  ) : (
                    allNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-[20px] py-[16px] border-b border-neutral-border hover:bg-neutral-muted/50 transition-colors cursor-pointer group ${!notif.read ? "bg-primary/5" : ""
                          }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="flex items-start gap-[12px]">
                          <div className="flex-shrink-0 w-[36px] h-[36px] rounded-[10px] bg-neutral-muted flex items-center justify-center mt-[2px]">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-[8px] mb-[4px]">
                              <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-heading text-[14px] flex items-center gap-[6px]">
                                {notif.title}
                                {!notif.read && (
                                  <span className="w-[6px] h-[6px] rounded-full bg-primary" />
                                )}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-[4px] hover:bg-neutral-muted rounded-[6px]"
                              >
                                <X className="w-[14px] h-[14px] text-neutral-text" />
                              </button>
                            </div>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text text-[13px] leading-[1.5] mb-[6px]">
                              {notif.message}
                            </p>
                            <span className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-gray-400 text-[12px]">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Footer removed as per requirements */}
              </div>
            )}
          </div>
          {/* User Menu Button with Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-neutral-muted hover:bg-neutral-tint transition-all duration-200 rounded-full shrink-0 size-[56px] relative flex items-center justify-center"
              aria-label="Menu người dùng"
            >
              <ChevronDown
                className={`w-[20px] h-[20px] text-neutral-heading transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
                  }`}
              />
            </button>
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-[calc(100%+10px)] right-0 w-[240px] bg-neutral-surface rounded-[12px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] overflow-hidden border border-neutral-border">
                <div className="py-[8px]">
                  {/* View Profile */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate("profile");
                    }}
                    className="w-full px-[20px] py-[12px] flex items-center gap-[12px] hover:bg-neutral-muted transition-colors text-left"
                  >
                    <User className="w-[18px] h-[18px] text-primary" />
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-neutral-heading text-[14px]">
                      Xem thông tin
                    </span>
                  </button>
                  {/* Divider */}
                  <div className="my-[8px] border-t border-neutral-border" />
                  {/* Logout */}
                  <button
                    onClick={onLogout}
                    className="w-full px-[20px] py-[12px] flex items-center gap-[12px] hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-[18px] h-[18px] text-red-600" />
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-red-600 text-[14px]">
                      Đăng xuất
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
