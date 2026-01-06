import {
  LayoutDashboard,
  Microscope,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

interface LabTechnicianSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function LabTechnicianSidebar({
  currentPage,
  onNavigate,
}: LabTechnicianSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
    { id: "test-queue", label: "Hàng đợi xét nghiệm", icon: Microscope },
    { id: "test-results", label: "Kết quả xét nghiệm", icon: FileText },
    { id: "reports", label: "Báo cáo thống kê", icon: BarChart3 },
    { id: "settings", label: "Tài khoản của tôi", icon: Settings },
  ];

  return (
    <aside className="w-75 bg-white border-r border-[#e8e8e8] flex flex-col">
      <nav className="flex-1 px-4 py-4 pt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-[10px] transition-all ${
                isActive
                  ? "bg-[#3FB5FF] text-white shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]"
                  : "text-[#333333] hover:bg-[#d8f0ff]"
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
