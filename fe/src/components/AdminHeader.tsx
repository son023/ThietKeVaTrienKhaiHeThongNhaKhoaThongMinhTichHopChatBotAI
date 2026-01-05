import { useState } from 'react';
import { Bell, Search, LogOut, User, Settings, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AdminHeaderProps {
  onLogout?: () => void;
  onGoHome?: () => void;
}

export function AdminHeader({ onLogout, onGoHome }: AdminHeaderProps = {}) {
  const [notifications] = useState([
    {
      id: 1,
      type: 'inventory',
      message: '[Kho] Thuốc Amoxicillin sắp hết (còn 5 hộp)',
      time: '5 phút trước',
      unread: true,
    },
    {
      id: 2,
      type: 'finance',
      message: '[Tài chính] Có 3 hóa đơn quá hạn cần xử lý',
      time: '30 phút trước',
      unread: true,
    },
    {
      id: 3,
      type: 'complaint',
      message: '[Khiếu nại] Bệnh nhân Nguyễn Thị B vừa đánh giá 1 sao',
      time: '1 giờ trước',
      unread: true,
    },
    {
      id: 4,
      type: 'maintenance',
      message: '[Bảo trì] Thiết bị X-ray cần kiểm tra định kỳ',
      time: '2 giờ trước',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-[#e8e8e8] px-6 py-4 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
            <Input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, nhân viên, dịch vụ..."
              className="pl-10 rounded-[10px] border-[#e8e8e8] w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
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
                <h3 className="text-[#01304e]">Thông báo hệ thống</h3>
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
          
          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 pl-4 border-l border-[#e8e8e8] cursor-pointer hover:bg-[#d8f0ff]/30 rounded-[10px] pr-3 py-2 transition-colors">
                <div className="text-right">
                  <p className="text-[#333333]">Admin Lê Văn Nam</p>
                  <p className="text-sm text-[#333333]/60">Quản trị viên</p>
                </div>
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                  <AvatarFallback>LN</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-[10px] border-[#e8e8e8]" align="end">
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
