import { useState } from 'react';
import { Search, Filter, Upload, Clock, AlertCircle, User, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface TestQueueProps {
    selectedTestId?: string | null;
}

export function TestQueue({ selectedTestId }: TestQueueProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [testNotes, setTestNotes] = useState('');

    const tests = [
        {
            id: '1',
            patientName: 'Nguyễn Văn An',
            patientId: 'BN001',
            testType: 'X-quang răng',
            requestedBy: 'BS. Trần Minh',
            requestedAt: '10/11/2025 08:30',
            priority: 'normal',
            status: 'pending',
            notes: 'Kiểm tra răng số 6 phải trên',
        },
        {
            id: '2',
            patientName: 'Lê Thị Bình',
            patientId: 'BN002',
            testType: 'CT Scan hàm mặt',
            requestedBy: 'BS. Nguyễn Hà',
            requestedAt: '10/11/2025 09:15',
            priority: 'urgent',
            status: 'pending',
            notes: 'Chuẩn bị phẫu thuật implant',
        },
        {
            id: '3',
            patientName: 'Phạm Minh Châu',
            patientId: 'BN003',
            testType: 'Xét nghiệm máu',
            requestedBy: 'BS. Trần Minh',
            requestedAt: '10/11/2025 10:00',
            priority: 'normal',
            status: 'in-progress',
            notes: 'Xét nghiệm trước phẫu thuật',
        },
        {
            id: '4',
            patientName: 'Hoàng Thị Dung',
            patientId: 'BN004',
            testType: 'Panoramic X-ray',
            requestedBy: 'BS. Lê Thu',
            requestedAt: '10/11/2025 10:30',
            priority: 'normal',
            status: 'pending',
            notes: 'Kiểm tra tổng quát',
        },
        {
            id: '5',
            patientName: 'Nguyễn Minh Khải',
            patientId: 'BN005',
            testType: 'Cephalometric X-ray',
            requestedBy: 'BS. Phạm Lan',
            requestedAt: '10/11/2025 11:00',
            priority: 'urgent',
            status: 'pending',
            notes: 'Lập kế hoạch chỉnh nha',
        },
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleSubmitResult = () => {
        if (!uploadedFile) {
            toast.error('Vui lòng tải lên file kết quả');
            return;
        }
        toast.success('Kết quả xét nghiệm đã được gửi thành công');
        setShowUploadDialog(false);
        setUploadedFile(null);
        setTestNotes('');
    };

    const handleStartTest = (testId: string) => {
        toast.success('Đã bắt đầu thực hiện xét nghiệm');
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.testType.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'all') return matchesSearch;
        return matchesSearch && test.status === selectedFilter;
    });

    const getPriorityColor = (priority: string) => {
        return priority === 'urgent' ? 'bg-[#ff4444]' : 'bg-[#3fb5ff]';
    };

    return (
        <div className="p-6 space-y-6">
            {/* DoctorHeader */}
            <div>
                <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-2">
                    Hàng đợi xét nghiệm
                </h1>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Quản lý và thực hiện các yêu cầu xét nghiệm
                </p>
            </div>

            {/* Search and Filter */}
            <Card className="p-4 border-[#ebf6fc]">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân, mã BN, loại xét nghiệm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 border-[#ebf6fc]"
                        />
                    </div>
                    <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-auto">
                        <TabsList className="bg-[#f8fcff]">
                            <TabsTrigger value="all">Tất cả</TabsTrigger>
                            <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
                            <TabsTrigger value="in-progress">Đang thực hiện</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </Card>

            {/* Tests List */}
            <div className="grid gap-4">
                {filteredTests.map((test) => (
                    <Card key={test.id} className="border-[#ebf6fc] hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[#ebf6fc] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-[#3fb5ff]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px]">
                                                {test.patientName}
                                            </h3>
                                            <Badge variant="outline" className="text-[11px]">
                                                {test.patientId}
                                            </Badge>
                                            {test.priority === 'urgent' && (
                                                <Badge className="bg-[#ffe6e6] text-[#ff4444] hover:bg-[#ffe6e6]">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Khẩn cấp
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[15px] mb-2">
                                            {test.testType}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px] text-[#666666]">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>Yêu cầu: {test.requestedBy}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{test.requestedAt}</span>
                                            </div>
                                        </div>
                                        {test.notes && (
                                            <div className="mt-3 p-3 bg-[#f8fcff] rounded-lg">
                                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                                    <span className="font-['Fz_Poppins:Medium',sans-serif]">Ghi chú:</span> {test.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {test.status === 'pending' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleStartTest(test.id)}
                                            className="bg-[#3fb5ff] hover:bg-[#1e8bc3]"
                                        >
                                            Bắt đầu
                                        </Button>
                                    )}
                                    {test.status === 'in-progress' && (
                                        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-[#2ecc71] hover:bg-[#27ae60]">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Tải kết quả
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">
                                                        Tải lên kết quả xét nghiệm
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div>
                                                        <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                                            File hình ảnh/kết quả
                                                        </Label>
                                                        <Input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={handleFileUpload}
                                                            className="border-[#ebf6fc]"
                                                        />
                                                        {uploadedFile && (
                                                            <p className="text-[13px] text-[#2ecc71] mt-2">
                                                                ✓ Đã chọn: {uploadedFile.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                                            Ghi chú kết quả
                                                        </Label>
                                                        <Textarea
                                                            placeholder="Nhập nhận xét về kết quả xét nghiệm..."
                                                            value={testNotes}
                                                            onChange={(e) => setTestNotes(e.target.value)}
                                                            className="min-h-[100px] border-[#ebf6fc]"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleSubmitResult}
                                                        className="w-full bg-[#3fb5ff] hover:bg-[#1e8bc3]"
                                                    >
                                                        Gửi kết quả
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                    <Badge
                                        variant="outline"
                                        className={`${
                                            test.status === 'in-progress'
                                                ? 'border-[#3fb5ff] text-[#3fb5ff]'
                                                : 'border-[#ff9f43] text-[#ff9f43]'
                                        }`}
                                    >
                                        {test.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ xử lý'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredTests.length === 0 && (
                <Card className="p-12 border-[#ebf6fc]">
                    <div className="text-center">
                        <FileText className="w-16 h-16 text-[#d6edfa] mx-auto mb-4" />
                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#666666] text-[16px] mb-2">
                            Không tìm thấy xét nghiệm
                        </h3>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[14px]">
                            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
