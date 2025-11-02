import { Bell, Plus, Search, LogOut, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ReceptionistHeaderProps {
  onLogout: () => void;
  onGoHome?: () => void;
  onNewAppointment: () => void;
  onNewPatient: () => void;
  onSearch: (query: string) => void;
}

export function ReceptionistHeader({ onLogout, onGoHome, onNewAppointment, onNewPatient, onSearch }: ReceptionistHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-[260px] h-[80px] bg-white border-b border-gray-200 z-40 flex items-center justify-between px-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3FB5FF] rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🦷</span>
        </div>
        <h1 className="text-xl text-[#01304e]">DentalCareX</h1>
      </div>

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
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#3FB5FF] text-white">LT</AvatarFallback>
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
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
