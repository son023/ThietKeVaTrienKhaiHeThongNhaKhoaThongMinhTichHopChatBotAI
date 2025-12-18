import svgPaths from "../../imports/svg-rgty3nojwf";
import {
  Bell,
  User,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Check,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Logo } from "../ui/logo";
import { Button } from "../ui/button";

interface NewPatientHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenChatbot: () => void;
}

interface Notification {
  id: string;
  type: "appointment" | "payment" | "medical" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NewPatientHeader({
  currentPage,
  onNavigate,
  onOpenChatbot,
}: NewPatientHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "appointment",
      title: "Lịch hẹn sắp tới",
      message: "Bạn có lịch hẹn khám răng vào ngày 05/11/2025 lúc 14:00",
      time: "2 giờ trước",
      read: false,
    },
    {
      id: "2",
      type: "payment",
      title: "Hoá đơn chưa thanh toán",
      message: "Bạn có 1 hoá đơn chưa thanh toán. Tổng: 2.500.000đ",
      time: "5 giờ trước",
      read: false,
    },
    {
      id: "3",
      type: "medical",
      title: "Kết quả xét nghiệm",
      message: "Kết quả xét nghiệm X-quang đã có. Vui lòng xem chi tiết",
      time: "1 ngày trước",
      read: true,
    },
    {
      id: "4",
      type: "reminder",
      title: "Nhắc nhở tái khám",
      message: "Đã đến thời gian tái khám định kỳ. Vui lòng đặt lịch",
      time: "2 ngày trước",
      read: true,
    },
  ]);

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
    { id: "dashboard", label: "Bảng điều khiển" },
    { id: "appointments", label: "Lịch hẹn" },
    { id: "payment", label: "Thanh toán" },
    { id: "medical-records", label: "Hồ sơ bệnh án" },
    { id: "chatbot", label: "Chatbot" },
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

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
              className={`min-w-0 px-3 font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] tracking-[0.5px] hover:text-[#3fb5ff] transition-colors ${
                activeMenu === item.id
                  ? "text-primary hover:text-primary hover:bg-accent"
                  : ""
              }`}
            >
              <span className="block max-w-[120px] truncate">{item.label}</span>
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
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-[60px] px-[20px]">
                      <Bell className="w-[48px] h-[48px] text-neutral-tint mb-[16px]" />
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-neutral-text text-[15px]">
                        Không có thông báo mới
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-[20px] py-[16px] border-b border-neutral-border hover:bg-neutral-muted/50 transition-colors cursor-pointer group ${
                          !notif.read ? "bg-primary/5" : ""
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
                className={`w-[20px] h-[20px] text-neutral-heading transition-transform duration-200 ${
                  showUserMenu ? "rotate-180" : ""
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
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
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
