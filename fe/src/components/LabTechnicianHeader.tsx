import { Bell, LogOut, Home, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNotifications } from '../contexts/NotificationContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { authController } from '../controllers/AuthController';
import type { UserDTO } from '../models/User';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Logo } from './ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
    const [user, setUser] = useState<UserDTO | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
            return 'LT';
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
        return "Kỹ thuật viên";
    }, [user]);
    const avatarFallback = useMemo(
        () => (displayName ? getInitials(displayName) : "LT"),
        [displayName]
    );

    return (
        <header className="bg-white border-b border-[#e8e8e8] px-6 py-4 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <div className="flex items-center justify-between">
                <div
                    className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-20"
                    onClick={onGoHome}
                >
                    <Logo />
                    <div>
                        <h2 className="text-[#01304e]">Phòng khám Nha khoa DentalCareX</h2>
                        <p className="text-[#333333]/60 text-sm mt-1">
                            {new Date().toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
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
                                <p className="text-sm text-[#01304e]">{displayName || 'Kỹ thuật viên'}</p>
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
