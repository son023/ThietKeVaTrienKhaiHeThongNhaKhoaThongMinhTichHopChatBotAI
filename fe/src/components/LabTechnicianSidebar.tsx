import { LayoutDashboard, Microscope, FileText, Wrench, BarChart3, Settings } from 'lucide-react';

interface LabTechnicianSidebarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export function LabTechnicianSidebar({ currentPage, onNavigate }: LabTechnicianSidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
        { id: 'test-queue', label: 'Hàng đợi xét nghiệm', icon: Microscope },
        { id: 'test-results', label: 'Kết quả xét nghiệm', icon: FileText },
        { id: 'equipment', label: 'Thiết bị', icon: Wrench },
        { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-[#ebf6fc] flex flex-col">
            <div className="p-6 border-b border-[#ebf6fc]">
                <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[20px]">
                    Lab Dashboard
                </h2>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mt-1">
                    Kỹ thuật viên xét nghiệm
                </p>
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
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        isActive
                                            ? 'bg-[#3fb5ff] text-white shadow-md'
                                            : 'text-[#666666] hover:bg-[#f8fcff] hover:text-[#3fb5ff]'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
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
