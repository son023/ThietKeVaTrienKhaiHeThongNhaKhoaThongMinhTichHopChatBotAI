import { Bell, LogOut, Home } from 'lucide-react';
import { Button } from './ui/button';

interface LabTechnicianHeaderProps {
    onLogout: () => void;
    onGoHome: () => void;
}

export function LabTechnicianHeader({ onLogout, onGoHome }: LabTechnicianHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-[#ebf6fc] flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px]">
                    DentalCareX Laboratory
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-[#f8fcff] transition-colors relative">
                    <Bell className="w-5 h-5 text-[#666666]" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff4444] rounded-full"></span>
                </button>

                <div className="flex items-center gap-2 px-3 py-2 bg-[#f8fcff] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#3fb5ff] flex items-center justify-center">
            <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[14px]">
              LT
            </span>
                    </div>
                    <div>
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[14px]">
                            Nguyễn Thị Lan
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[11px]">
                            Kỹ thuật viên
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGoHome}
                    className="text-[#666666] hover:text-[#3fb5ff]"
                >
                    <Home className="w-4 h-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-[#666666] hover:text-[#ff4444]"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
