import { useState } from 'react';
import { Search, Download, Eye, Calendar, User } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function TestResults() {
    const [searchQuery, setSearchQuery] = useState('');

    const results = [
        {
            id: '1',
            patientName: 'Trần Văn Em',
            patientId: 'BN010',
            testType: 'X-quang răng số 6',
            completedAt: '09/11/2025 14:20',
            completedBy: 'KTV. Nguyễn Thị Lan',
            result: 'Có dấu hiệu sâu răng, cần điều trị',
            hasImage: true,
        },
        {
            id: '2',
            patientName: 'Nguyễn Thị Phương',
            patientId: 'BN011',
            testType: 'CT Scan răng khôn',
            completedAt: '09/11/2025 13:45',
            completedBy: 'KTV. Nguyễn Thị Lan',
            result: 'Răng khôn mọc lệch 45°, khuyến nghị nhổ',
            hasImage: true,
        },
        {
            id: '3',
            patientName: 'Lê Minh Giang',
            patientId: 'BN012',
            testType: 'Xét nghiệm nước bọt',
            completedAt: '09/11/2025 12:30',
            completedBy: 'KTV. Nguyễn Thị Lan',
            result: 'Các chỉ số bình thường',
            hasImage: false,
        },
        {
            id: '4',
            patientName: 'Phạm Thị Hoa',
            patientId: 'BN013',
            testType: 'Panoramic X-ray',
            completedAt: '09/11/2025 11:15',
            completedBy: 'KTV. Nguyễn Thị Lan',
            result: 'Phát hiện 2 răng sâu, 1 răng khôn cần theo dõi',
            hasImage: true,
        },
        {
            id: '5',
            patientName: 'Hoàng Văn Tuấn',
            patientId: 'BN014',
            testType: 'Xét nghiệm máu',
            completedAt: '08/11/2025 16:45',
            completedBy: 'KTV. Nguyễn Thị Lan',
            result: 'Các chỉ số bình thường, có thể tiến hành phẫu thuật',
            hasImage: false,
        },
        {
            id: '6',
            patientName: 'Đỗ Thị Mai',
            patientId: 'BN015',
            testType: 'Cephalometric X-ray',
            completedAt: '08/11/2025 15:20',
            completedBy: 'KTV. Nguyễn Thị Lan',
            result: 'Phân tích cấu trúc xương hàm để lập kế hoạch chỉnh nha',
            hasImage: true,
        },
    ];

    const filteredResults = results.filter(result =>
        result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.testType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewResult = (id: string) => {
        toast.info('Đang mở kết quả xét nghiệm...');
    };

    const handleDownloadResult = (id: string) => {
        toast.success('Đã tải xuống kết quả xét nghiệm');
    };

    return (
        <div className="p-6 space-y-6">
            {/* DoctorHeader */}
            <div>
                <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-2">
                    Kết quả xét nghiệm
                </h1>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Lịch sử các xét nghiệm đã hoàn thành
                </p>
            </div>

            {/* Search */}
            <Card className="p-4 border-[#ebf6fc]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm bệnh nhân, mã BN, loại xét nghiệm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 border-[#ebf6fc]"
                    />
                </div>
            </Card>

            {/* Results List */}
            <div className="grid gap-4">
                {filteredResults.map((result) => (
                    <Card key={result.id} className="border-[#ebf6fc] hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px]">
                                            {result.patientName}
                                        </h3>
                                        <Badge variant="outline" className="text-[11px]">
                                            {result.patientId}
                                        </Badge>
                                        {result.hasImage && (
                                            <Badge className="bg-[#ebf6fc] text-[#3fb5ff] hover:bg-[#ebf6fc]">
                                                Có hình ảnh
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[15px] mb-3">
                                        {result.testType}
                                    </p>

                                    <div className="p-3 bg-[#f8fcff] rounded-lg mb-3">
                                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                            <span className="font-['Fz_Poppins:Medium',sans-serif]">Kết quả:</span> {result.result}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-[12px] text-[#666666]">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{result.completedAt}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>{result.completedBy}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewResult(result.id)}
                                        className="border-[#3fb5ff] text-[#3fb5ff] hover:bg-[#ebf6fc]"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Xem
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleDownloadResult(result.id)}
                                        className="bg-[#3fb5ff] hover:bg-[#1e8bc3]"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Tải về
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredResults.length === 0 && (
                <Card className="p-12 border-[#ebf6fc]">
                    <div className="text-center">
                        <Search className="w-16 h-16 text-[#d6edfa] mx-auto mb-4" />
                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#666666] text-[16px] mb-2">
                            Không tìm thấy kết quả
                        </h3>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[14px]">
                            Thử điều chỉnh từ khóa tìm kiếm
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
