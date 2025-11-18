import { useState } from 'react';
import { Bell, LogOut, User, Settings, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onLogout?: () => void;
  onGoHome?: () => void;
}

export function DoctorHeader({ onLogout, onGoHome }: HeaderProps = {}) {
  const [notifications] = useState([
    {
      id: 1,
      type: 'appointment',
      message: 'Bệnh nhân Nguyễn Văn A đã đặt lịch khám lúc 14:00 hôm nay',
      time: '10 phút trước',
      unread: true,
    },
    {
      id: 2,
      type: 'xray',
      message: 'Kết quả X-quang của bệnh nhân Trần Thị B đã sẵn sàng',
      time: '1 giờ trước',
      unread: true,
    },
    {
      id: 3,
      type: 'appointment',
      message: 'Bệnh nhân Lê Văn C đã xác nhận lịch hẹn ngày mai',
      time: '2 giờ trước',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-[#e8e8e8] px-6 py-4 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
      <div className="flex items-center justify-between">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onGoHome}
        >
          <h2 className="text-[#01304e]">Phòng khám Nha khoa DentalCareX</h2>
          <p className="text-[#333333]/60 text-sm mt-1">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
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
            <PopoverContent className="w-96 p-0 rounded-[15px] border-[#e8e8e8]" align="end">
              <div className="p-4 border-b border-[#e8e8e8]">
                <h3 className="text-[#01304e]">Thông báo</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-[#e8e8e8] hover:bg-[#d8f0ff]/30 transition-colors ${
                      notif.unread ? 'bg-[#d8f0ff]/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-[#333333]">{notif.message}</p>
                      {notif.unread && (
                        <div className="w-2 h-2 bg-[#3FB5FF] rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-[#333333]/60 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-[#d8f0ff]/30 rounded-[10px] px-3 py-2 transition-colors">
                <div className="text-right">
                  <p className="text-[#333333]">BS. Nguyễn Văn Hùng</p>
                  <p className="text-sm text-[#333333]/60">Bác sĩ Nha khoa</p>
                </div>
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" />
                  <AvatarFallback>NH</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-[10px] border-[#e8e8e8]" align="end">
              <DropdownMenuLabel className="text-[#01304e]">Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e8e8e8]" />
              <DropdownMenuItem className="cursor-pointer rounded-[8px]">
                <User className="mr-2 h-4 w-4 text-[#3FB5FF]" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-[8px]">
                <Settings className="mr-2 h-4 w-4 text-[#3FB5FF]" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#e8e8e8]" />
              <DropdownMenuItem 
                className="cursor-pointer rounded-[8px]"
                onClick={onGoHome}
              >
                <Home className="mr-2 h-4 w-4 text-[#3FB5FF]" />
                <span>Trang chủ</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#e8e8e8]" />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-[8px]"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
