import { Bell, LogOut, Home, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNotifications } from '../contexts/NotificationContext';
import { useState, useEffect, useRef } from 'react';

interface LabTechnicianHeaderProps {
    onLogout: () => void;
    onGoHome: () => void;
}

export function LabTechnicianHeader({ onLogout, onGoHome }: LabTechnicianHeaderProps) {
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

    return (
        <header className="h-16 bg-neutral-surface border-b border-neutral-border flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <h1 className="font-semibold text-neutral-heading text-lg">
                    DentalCareX Laboratory
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg hover:bg-neutral-muted transition-all duration-200"
                    >
                        <Bell className="w-5 h-5 text-neutral-text/70" />
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
                                <h3 className="font-semibold text-neutral-heading text-base">
                                    Thông báo {notifications.length > 0 && `(${notifications.length})`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0}
                                            className={`text-xs font-medium whitespace-nowrap transition-colors ${
                                                unreadCount > 0
                                                    ? 'text-primary hover:text-primary/80 cursor-pointer'
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
                                                    <p className="font-semibold text-sm text-neutral-heading mb-1">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-sm text-gray-700">{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatTime(notif.timestamp)}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="font-semibold text-white text-sm">
              LT
            </span>
                    </div>
                    <div>
                        <p className="font-medium text-neutral-heading text-sm">
                            Nguyễn Thị Lan
                        </p>
                        <p className="font-normal text-neutral-text/60 text-xs">
                            Kỹ thuật viên
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGoHome}
                    className="text-neutral-text/70 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                    <Home className="w-4 h-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-neutral-text/70 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
