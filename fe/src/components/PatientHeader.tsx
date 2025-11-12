import svgPaths from "../../src/imports/svg-rgty3nojwf";
import { Bell, User, Calendar, CreditCard, FileText, Clock, Check, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';


interface NewPatientHeaderProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onOpenChatbot: () => void;
}

interface Notification {
    id: string;
    type: 'appointment' | 'payment' | 'medical' | 'reminder';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export default function PatientHeader({ currentPage, onNavigate, onOpenChatbot }: NewPatientHeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'appointment',
            title: 'Lịch hẹn sắp tới',
            message: 'Bạn có lịch hẹn khám răng vào ngày 05/11/2025 lúc 14:00',
            time: '2 giờ trước',
            read: false
        },
        {
            id: '2',
            type: 'payment',
            title: 'Hoá đơn chưa thanh toán',
            message: 'Bạn có 1 hoá đơn chưa thanh toán. Tổng: 2.500.000đ',
            time: '5 giờ trước',
            read: false
        },
        {
            id: '3',
            type: 'medical',
            title: 'Kết quả xét nghiệm',
            message: 'Kết quả xét nghiệm X-quang đã có. Vui lòng xem chi tiết',
            time: '1 ngày trước',
            read: true
        },
        {
            id: '4',
            type: 'reminder',
            title: 'Nhắc nhở tái khám',
            message: 'Đã đến thời gian tái khám định kỳ. Vui lòng đặt lịch',
            time: '2 ngày trước',
            read: true
        }
    ]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const menuItems = [
        { id: 'home', label: 'Trang chủ' },
        { id: 'dashboard', label: 'Bảng điều khiển' },
        { id: 'appointments', label: 'Lịch hẹn' },
        { id: 'payment', label: 'Thanh toán' },
        { id: 'medical-records', label: 'Hồ sơ bệnh án' },
        { id: 'chatbot', label: 'Chatbot' },
    ];

    const handleMenuClick = (id: string) => {
        if (id === 'chatbot') {
            onOpenChatbot();
        } else {
            onNavigate(id);
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'appointment':
                return <Calendar className="w-[18px] h-[18px] text-[#3fb5ff]" />;
            case 'payment':
                return <CreditCard className="w-[18px] h-[18px] text-[#3fb5ff]" />;
            case 'medical':
                return <FileText className="w-[18px] h-[18px] text-[#3fb5ff]" />;
            case 'reminder':
                return <Clock className="w-[18px] h-[18px] text-[#3fb5ff]" />;
            default:
                return <Bell className="w-[18px] h-[18px] text-[#3fb5ff]" />;
        }
    };

    return (
        <div className="bg-card h-[104px] relative w-full border-b border-border" data-name="Header/2">
            {/* Right Buttons - Theme Toggle, Notifications & User */}
            <div className="absolute box-border content-stretch flex gap-[15px] h-[64px] items-center justify-end pl-[6px] pr-0 py-[30px] right-[35px] rounded-[15px] top-[20px] z-50" data-name="Button DangNhap">
                {/* Notification Button */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="bg-[#ecf8ff] overflow-clip relative rounded-[100px] shrink-0 size-[56px] hover:bg-[#d6edfa] transition-colors"
                        aria-label="Thông báo"
                    >
                        <div className="absolute aspect-[44/44] bottom-[21.43%] left-1/2 top-[21.43%] translate-x-[-50%]" data-name="Solid/Status/Notification">
                            <div className="absolute inset-[8.33%_18.4%_9.38%_18.4%]" data-name="Icon">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 27">
                                    <path clipRule="evenodd" d={svgPaths.pae7b300} fill="#002035" fillRule="evenodd" id="Icon" />
                                </svg>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <div className="absolute top-[8px] right-[8px] bg-[#ff4444] rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-[6px]">
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[11px]">
                  {unreadCount}
                </span>
                            </div>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-[calc(100%+10px)] right-0 w-[420px] bg-white rounded-[16px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#ebf6fc]">
                                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px]">
                                    Thông báo
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[13px] hover:text-[#1e8bc3] transition-colors"
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-[480px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-[60px] px-[20px]">
                                        <Bell className="w-[48px] h-[48px] text-[#d6edfa] mb-[16px]" />
                                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[15px]">
                                            Không có thông báo mới
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`px-[20px] py-[16px] border-b border-[#ebf6fc] hover:bg-[#f8fcff] transition-colors cursor-pointer group ${
                                                !notif.read ? 'bg-[#f0f9ff]' : ''
                                            }`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className="flex items-start gap-[12px]">
                                                <div className="flex-shrink-0 w-[36px] h-[36px] rounded-[10px] bg-[#ebf6fc] flex items-center justify-center mt-[2px]">
                                                    {getNotificationIcon(notif.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-[8px] mb-[4px]">
                                                        <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px] flex items-center gap-[6px]">
                                                            {notif.title}
                                                            {!notif.read && (
                                                                <span className="w-[6px] h-[6px] rounded-full bg-[#3fb5ff]" />
                                                            )}
                                                        </h4>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notif.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-[4px] hover:bg-[#ebf6fc] rounded-[6px]"
                                                        >
                                                            <X className="w-[14px] h-[14px] text-[#666666]" />
                                                        </button>
                                                    </div>
                                                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] leading-[1.5] mb-[6px]">
                                                        {notif.message}
                                                    </p>
                                                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[12px]">
                            {notif.time}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="px-[20px] py-[14px] bg-[#f8fcff] border-t border-[#ebf6fc]">
                                    <button className="w-full font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px] hover:text-[#1e8bc3] transition-colors">
                                        Xem tất cả thông báo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Menu Button */}
                <button
                    onClick={() => onNavigate('profile')}
                    className="bg-[#ecf8ff] overflow-clip relative rounded-[100px] shrink-0 size-[56px] hover:bg-[#d6edfa] transition-colors"
                    aria-label="Tài khoản"
                >
                    <div className="absolute aspect-[21.6774/21.6774] bottom-[30.64%] flex items-center justify-center left-1/2 top-[30.64%] translate-x-[-50%]">
                        <div className="flex-none rotate-[270deg] size-[21.677px]">
                            <div className="bg-[#002035] overflow-clip relative rounded-[100px] size-full" data-name="ic_arrow_left 2">
                                <div className="absolute inset-[23.29%_35.1%_23.43%_31.76%]" data-name="Vector">
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 12">
                                        <path d={svgPaths.pfaecf00} fill="#ECF8FF" id="Vector" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Logo */}
            <div className="absolute content-stretch flex gap-[9px] h-[64px] items-center left-[80px] top-[20px] cursor-pointer" data-name="Logo" onClick={() => onNavigate('home')}>
                <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p2d52d100} id="Vector 2" stroke="#002035" strokeWidth="12" />
                    </svg>
                </div>
                <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px] w-[165px]">
                    <p className="leading-[normal]">DentalCareX</p>
                </div>
            </div>

            {/* Header Menu */}
            <div className="absolute content-stretch flex font-['Fz_Poppins:SemiBold',sans-serif] gap-[30px] h-[64px] items-center justify-center leading-[0] left-1/2 not-italic text-[#01304e] text-[16px] text-center top-[20px] tracking-[0.5px] translate-x-[-50%] w-[734.4px]" data-name="Header">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`flex flex-col h-full justify-center relative shrink-0 hover:text-[#3fb5ff] transition-colors ${
                            currentPage === item.id && item.id !== 'chatbot' ? 'text-[#3fb5ff]' : ''
                        }`}
                    >
                        <p className="leading-[normal] whitespace-nowrap">{item.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
