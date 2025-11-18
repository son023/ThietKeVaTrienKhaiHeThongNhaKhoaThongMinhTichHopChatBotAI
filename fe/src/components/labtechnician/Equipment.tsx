import { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Calendar, Settings } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

export function Equipment() {
    const equipment = [
        {
            id: '1',
            name: 'Máy X-quang kỹ thuật số',
            model: 'Planmeca ProMax 3D',
            status: 'operational',
            lastMaintenance: '15/10/2025',
            nextMaintenance: '15/01/2026',
            usageCount: 1250,
            maxUsage: 2000,
            location: 'Phòng X-quang 1',
        },
        {
            id: '2',
            name: 'Máy CT Scan',
            model: 'Carestream CS 8100 3D',
            status: 'operational',
            lastMaintenance: '20/09/2025',
            nextMaintenance: '20/12/2025',
            usageCount: 450,
            maxUsage: 1000,
            location: 'Phòng X-quang 2',
        },
        {
            id: '3',
            name: 'Máy xét nghiệm máu',
            model: 'Abbott i-STAT',
            status: 'maintenance',
            lastMaintenance: '05/11/2025',
            nextMaintenance: '05/02/2026',
            usageCount: 890,
            maxUsage: 1500,
            location: 'Phòng xét nghiệm',
        },
        {
            id: '4',
            name: 'Máy Panoramic X-ray',
            model: 'Dentsply Sirona Orthophos XG',
            status: 'operational',
            lastMaintenance: '10/10/2025',
            nextMaintenance: '10/01/2026',
            usageCount: 1680,
            maxUsage: 2000,
            location: 'Phòng X-quang 1',
        },
        {
            id: '5',
            name: 'Máy Cephalometric',
            model: 'Vatech PaX-i3D',
            status: 'warning',
            lastMaintenance: '01/08/2025',
            nextMaintenance: '01/11/2025',
            usageCount: 580,
            maxUsage: 800,
            location: 'Phòng X-quang 3',
        },
        {
            id: '6',
            name: 'Máy xét nghiệm nước bọt',
            model: 'Saliva Testing Kit Pro',
            status: 'operational',
            lastMaintenance: '25/10/2025',
            nextMaintenance: '25/01/2026',
            usageCount: 320,
            maxUsage: 1000,
            location: 'Phòng xét nghiệm',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'operational':
                return (
                    <Badge className="bg-[#e8f8f5] text-[#2ecc71] hover:bg-[#e8f8f5]">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hoạt động tốt
                    </Badge>
                );
            case 'maintenance':
                return (
                    <Badge className="bg-[#fff5e6] text-[#ff9f43] hover:bg-[#fff5e6]">
                        <Wrench className="w-3 h-3 mr-1" />
                        Đang bảo trì
                    </Badge>
                );
            case 'warning':
                return (
                    <Badge className="bg-[#ffe6e6] text-[#ff4444] hover:bg-[#ffe6e6]">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Cần bảo trì
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getUsagePercentage = (current: number, max: number) => {
        return (current / max) * 100;
    };

    const getUsageColor = (percentage: number) => {
        if (percentage < 60) return 'bg-[#2ecc71]';
        if (percentage < 80) return 'bg-[#ff9f43]';
        return 'bg-[#ff4444]';
    };

    const handleScheduleMaintenance = (id: string) => {
        toast.success('Đã lên lịch bảo trì thiết bị');
    };

    return (
        <div className="p-6 space-y-6">
            {/* DoctorHeader */}
            <div>
                <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-2">
                    Quản lý thiết bị
                </h1>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Theo dõi trạng thái và bảo trì thiết bị xét nghiệm
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#e8f8f5] rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-[#2ecc71]" />
                        </div>
                        <div>
                            <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px]">
                                {equipment.filter(e => e.status === 'operational').length}
                            </h3>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                Hoạt động tốt
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#fff5e6] rounded-xl flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-[#ff9f43]" />
                        </div>
                        <div>
                            <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px]">
                                {equipment.filter(e => e.status === 'maintenance').length}
                            </h3>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                Đang bảo trì
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#ffe6e6] rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-[#ff4444]" />
                        </div>
                        <div>
                            <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px]">
                                {equipment.filter(e => e.status === 'warning').length}
                            </h3>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                Cần bảo trì
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Equipment List */}
            <div className="grid gap-4">
                {equipment.map((item) => {
                    const usagePercentage = getUsagePercentage(item.usageCount, item.maxUsage);

                    return (
                        <Card key={item.id} className="border-[#ebf6fc] hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px]">
                                                {item.name}
                                            </h3>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] mb-1">
                                            Model: {item.model}
                                        </p>
                                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[13px]">
                                            📍 {item.location}
                                        </p>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleScheduleMaintenance(item.id)}
                                        className="border-[#3fb5ff] text-[#3fb5ff] hover:bg-[#ebf6fc]"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Bảo trì
                                    </Button>
                                </div>

                                {/* Usage Progress */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px]">
                      Mức độ sử dụng
                    </span>
                                        <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[13px]">
                      {item.usageCount} / {item.maxUsage} lần
                    </span>
                                    </div>
                                    <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getUsageColor(usagePercentage)} transition-all`}
                                            style={{ width: `${usagePercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Maintenance Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#ebf6fc]">
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <Calendar className="w-4 h-4 text-[#666666]" />
                                        <div>
                                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999]">
                                                Bảo trì lần cuối
                                            </p>
                                            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666]">
                                                {item.lastMaintenance}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <Calendar className="w-4 h-4 text-[#666666]" />
                                        <div>
                                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999]">
                                                Bảo trì tiếp theo
                                            </p>
                                            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666]">
                                                {item.nextMaintenance}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
