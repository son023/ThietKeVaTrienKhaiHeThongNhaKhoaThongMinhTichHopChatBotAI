import {
  LayoutDashboard,
  Microscope,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { Logo } from "./ui/logo";

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
    { id: "reports", label: "Báo cáo", icon: BarChart3 },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-neutral-surface border-r border-neutral-border flex flex-col shadow-sm">
      <div className="p-6 border-b border-neutral-border">
        <Logo />
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-neutral-text hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
