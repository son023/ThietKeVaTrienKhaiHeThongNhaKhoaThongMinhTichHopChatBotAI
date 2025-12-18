import { LayoutDashboard, Calendar, Users, DollarSign, BarChart3, Settings } from 'lucide-react';

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
        <div className="fixed left-0 top-[80px] h-[calc(100vh-80px)] w-[260px] bg-white border-r border-[#e5e7eb] shadow-sm overflow-y-auto">
            <div className="p-4">
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-[#3fb5ff] text-white shadow-md'
                                        : 'text-[#333333] hover:bg-[#f0f9ff] hover:text-[#3fb5ff]'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#05619a]'}`} />
                                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
                  {item.label}
                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
