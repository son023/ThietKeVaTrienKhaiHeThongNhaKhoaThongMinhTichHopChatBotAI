import { LayoutDashboard, Calendar, Users, DollarSign, BarChart3, Settings } from 'lucide-react';
import { Logo } from './ui/logo';

interface ReceptionistSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function ReceptionistSidebar({ currentPage, onPageChange }: ReceptionistSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'appointments', label: 'Lịch hẹn (Tổng quan)', icon: Calendar },
    { id: 'patients', label: 'Quản lý Bệnh nhân', icon: Users },
    { id: 'invoices', label: 'Thanh toán & Hóa đơn', icon: DollarSign },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'account', label: 'Tài khoản của tôi', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-gray-200 z-50">
      <div className="p-6 border-b border-gray-200">
        <Logo />
      </div>
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#3FB5FF] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
