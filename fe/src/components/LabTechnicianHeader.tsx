import { Bell, LogOut, Home } from 'lucide-react';
import { Button } from './ui/button';

interface LabTechnicianHeaderProps {
    onLogout: () => void;
    onGoHome: () => void;
}

export function LabTechnicianHeader({ onLogout, onGoHome }: LabTechnicianHeaderProps) {
    return (
        <header className="h-16 bg-neutral-surface border-b border-neutral-border flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <h1 className="font-semibold text-neutral-heading text-lg">
                    DentalCareX Laboratory
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-neutral-muted transition-all duration-200 relative">
                    <Bell className="w-5 h-5 text-neutral-text/70" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="font-semibold text-white text-sm">
              LT
            </span>
                    </div>
                    <div>
                        <p className="font-medium text-neutral-heading text-sm">
                            Nguyễn Thị Lan
                        </p>
                        <p className="font-normal text-neutral-text/60 text-xs">
                            Kỹ thuật viên
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGoHome}
                    className="text-neutral-text/70 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                    <Home className="w-4 h-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-neutral-text/70 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
