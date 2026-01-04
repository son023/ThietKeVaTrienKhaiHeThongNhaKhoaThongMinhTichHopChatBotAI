import { Home, Calendar, Users, UserCog, Briefcase, Package, Receipt, BarChart3, Settings, LogOut } from 'lucide-react';
import { Logo } from './ui/logo';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminSidebar({ currentPage, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { id: 'admin-patients', label: 'Quản lý Bệnh nhân', icon: Users },
    { id: 'admin-staff', label: 'Quản lý Nhân viên', icon: UserCog },
    { id: 'admin-services', label: 'Quản lý Dịch vụ', icon: Briefcase },
    { id: 'admin-finance', label: 'Quản lý Tài chính', icon: Receipt },
    { id: 'admin-reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
    { id: 'admin-settings', label: 'Cài đặt Hệ thống', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e8e8e8] flex flex-col">
      <div className="p-6 border-b border-[#e8e8e8]">
        <Logo />
      </div>
      
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-[10px] transition-all ${
                isActive
                  ? 'bg-[#3FB5FF] text-white shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]'
                  : 'text-[#333333] hover:bg-[#d8f0ff]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#e8e8e8]">
        <button
          onClick={() => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
              console.log('Đăng xuất');
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
