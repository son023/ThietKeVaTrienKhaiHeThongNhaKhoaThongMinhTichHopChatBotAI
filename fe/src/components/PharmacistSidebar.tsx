import { LayoutDashboard, FileText, Package, TruckIcon, BarChart3, Settings } from 'lucide-react';
import { Logo } from './ui/logo';

interface PharmacistSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function PharmacistSidebar({ currentPage, onPageChange }: PharmacistSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'prescriptions', label: 'Đơn thuốc', icon: FileText },
    { id: 'inventory', label: 'Kho thuốc', icon: Package },
    { id: 'import-export', label: 'Nhập/Xuất thuốc', icon: TruckIcon },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'account', label: 'Tài khoản của tôi', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e8e8e8] flex flex-col">
      <div className="p-6 border-b border-[#e8e8e8]">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-[10px] transition-all ${
                isActive
                  ? 'bg-[#3FB5FF] text-white shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]'
                  : 'text-[#333333] hover:bg-[#d8f0ff]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
