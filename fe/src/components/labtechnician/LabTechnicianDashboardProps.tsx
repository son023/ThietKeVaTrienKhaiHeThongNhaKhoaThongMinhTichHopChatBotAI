import { Calendar, Clock, CheckCircle2, AlertCircle, Microscope, Activity } from 'lucide-react';
import { Card } from '../ui/card';

interface LabTechnicianDashboardProps {
    onNavigateToTest: (id: string) => void;
}

export function LabTechnicianDashboard({ onNavigateToTest }: LabTechnicianDashboardProps) {
    const stats = [
        {
            title: 'Xét nghiệm chờ xử lý',
            value: '12',
            icon: Clock,
            color: 'text-[#ff9f43]',
            bgColor: 'bg-[#fff5e6]',
        },
        {
            title: 'Đang thực hiện',
            value: '5',
            icon: Activity,
            color: 'text-[#3fb5ff]',
            bgColor: 'bg-[#ebf6fc]',
        },
        {
            title: 'Hoàn thành hôm nay',
            value: '28',
            icon: CheckCircle2,
            color: 'text-[#2ecc71]',
            bgColor: 'bg-[#e8f8f5]',
        },
        {
            title: 'Cần xử lý khẩn',
            value: '3',
            icon: AlertCircle,
            color: 'text-[#ff4444]',
            bgColor: 'bg-[#ffe6e6]',
        },
    ];

    const pendingTests = [
        {
            id: '1',
            patientName: 'Nguyễn Văn An',
            testType: 'X-quang răng',
            requestedBy: 'BS. Trần Minh',
            requestedAt: '08:30',
            priority: 'normal',
            status: 'pending',
        },
        {
            id: '2',
            patientName: 'Lê Thị Bình',
            testType: 'CT Scan hàm mặt',
            requestedBy: 'BS. Nguyễn Hà',
            requestedAt: '09:15',
            priority: 'urgent',
            status: 'pending',
        },
        {
            id: '3',
            patientName: 'Phạm Minh Châu',
            testType: 'Xét nghiệm máu',
            requestedBy: 'BS. Trần Minh',
            requestedAt: '10:00',
            priority: 'normal',
            status: 'in-progress',
        },
        {
            id: '4',
            patientName: 'Hoàng Thị Dung',
            testType: 'Panoramic X-ray',
            requestedBy: 'BS. Lê Thu',
            requestedAt: '10:30',
            priority: 'normal',
            status: 'pending',
        },
    ];

    const recentResults = [
        {
            id: '1',
            patientName: 'Trần Văn Em',
            testType: 'X-quang răng số 6',
            completedAt: '14:20',
            result: 'Có dấu hiệu sâu răng',
        },
        {
            id: '2',
            patientName: 'Nguyễn Thị Phương',
            testType: 'CT Scan răng khôn',
            completedAt: '13:45',
            result: 'Răng khôn mọc lệch 45°',
        },
        {
            id: '3',
            patientName: 'Lê Minh Giang',
            testType: 'Xét nghiệm nước bọt',
            completedAt: '12:30',
            result: 'Bình thường',
        },
    ];

    const getPriorityBadge = (priority: string) => {
        if (priority === 'urgent') {
            return (
                <span className="px-2 py-1 bg-[#ffe6e6] text-[#ff4444] rounded-md font-['Fz_Poppins:Medium',sans-serif] text-[11px]">
          Khẩn cấp
        </span>
            );
        }
        return (
            <span className="px-2 py-1 bg-[#f0f9ff] text-[#3fb5ff] rounded-md font-['Fz_Poppins:Medium',sans-serif] text-[11px]">
        Bình thường
      </span>
        );
    };

    const getStatusBadge = (status: string) => {
        if (status === 'in-progress') {
            return (
                <span className="px-2 py-1 bg-[#ebf6fc] text-[#3fb5ff] rounded-md font-['Fz_Poppins:Medium',sans-serif] text-[11px]">
          Đang thực hiện
        </span>
            );
        }
        return (
            <span className="px-2 py-1 bg-[#fff5e6] text-[#ff9f43] rounded-md font-['Fz_Poppins:Medium',sans-serif] text-[11px]">
        Chờ xử lý
      </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* DoctorHeader */}
            <div>
                <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-2">
                    Bảng điều khiển
                </h1>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Tổng quan công việc hôm nay
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="p-5 border-[#ebf6fc] hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-1">
                                {stat.value}
                            </h3>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                {stat.title}
                            </p>
                        </Card>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Tests */}
                <Card className="lg:col-span-2 border-[#ebf6fc]">
                    <div className="p-6 border-b border-[#ebf6fc]">
                        <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px]">
                            Xét nghiệm cần xử lý
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {pendingTests.map((test) => (
                                <div
                                    key={test.id}
                                    onClick={() => onNavigateToTest(test.id)}
                                    className="p-4 bg-[#f8fcff] rounded-xl hover:bg-[#ebf6fc] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#3fb5ff] rounded-lg flex items-center justify-center">
                                                <Microscope className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                                                    {test.patientName}
                                                </h3>
                                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                                    {test.testType}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getPriorityBadge(test.priority)}
                                            {getStatusBadge(test.status)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#666666] text-[12px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Yêu cầu bởi: {test.requestedBy}
                    </span>
                                        <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                                            {test.requestedAt}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Recent Results */}
                <Card className="border-[#ebf6fc]">
                    <div className="p-6 border-b border-[#ebf6fc]">
                        <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px]">
                            Kết quả gần đây
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentResults.map((result) => (
                                <div key={result.id} className="pb-4 border-b border-[#ebf6fc] last:border-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-[#2ecc71]" />
                                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                                            {result.patientName}
                                        </h3>
                                    </div>
                                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mb-1">
                                        {result.testType}
                                    </p>
                                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[12px] mb-1">
                                        {result.result}
                                    </p>
                                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[11px]">
                                        Hoàn thành lúc {result.completedAt}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
