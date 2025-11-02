import { Home, Calendar, Users, FileText, TrendingUp, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: Home },
    { id: 'appointments', label: 'Lịch hẹn của tôi', icon: Calendar },
    { id: 'patients', label: 'Bệnh nhân của tôi', icon: Users },
    { id: 'treatment-plans', label: 'Kế hoạch điều trị', icon: FileText },
    { id: 'performance', label: 'Hiệu suất cá nhân', icon: TrendingUp },
    { id: 'account', label: 'Tài khoản của tôi', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e8e8e8] flex flex-col">
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#3FB5FF] rounded-full" />
          <h1 className="text-[#01304e]">DentalCareX</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4">
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
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#e8e8e8]">
        <button
          onClick={() => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
              // Handle logout logic here
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
