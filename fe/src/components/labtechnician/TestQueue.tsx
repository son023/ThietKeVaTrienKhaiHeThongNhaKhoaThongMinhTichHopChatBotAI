import { useEffect, useMemo, useState } from 'react';
import { Search, Upload, Clock, AlertCircle, User, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { labTestController } from '../../controllers/LabTestController';
import { LabTestDTO } from '../../models/LabTest';
import { medicalAttachmentController } from '../../controllers/MedicalAttachmentController';

interface TestQueueProps {
    selectedTestId?: string | null;
}

export function TestQueue({ selectedTestId }: TestQueueProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [testNotes, setTestNotes] = useState('');
    const [resultUnits, setResultUnits] = useState('');
    const [resultRange, setResultRange] = useState('');
    const [resultAbnormal, setResultAbnormal] = useState('');
    const [resultStructure, setResultStructure] = useState('');
    const [loading, setLoading] = useState(false);
    const [tests, setTests] = useState<LabTestDTO[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await labTestController.getAll();
                const filteredData = data.filter(
                    (test) => test.status !== 'COMPLETE'
                );
                setTests(filteredData);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Không tải được danh sách lab test');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const applyLocalStatus = (id: string, status: string) => {
        setTests((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status } : t))
        );
    };

    const refreshTest = async (id: string, updated?: LabTestDTO, fallbackStatus?: string) => {
        if (updated) {
            if (updated.status === 'COMPLETE') {
                setTests((prev) => prev.filter((t) => t.id !== id));
                return;
            }
            setTests((prev) => prev.map((t) => (t.id === id ? updated : t)));
            return;
        }
        if (fallbackStatus) {
            if (fallbackStatus === 'COMPLETE') {
                setTests((prev) => prev.filter((t) => t.id !== id));
                return;
            }
            applyLocalStatus(id, fallbackStatus);
        }
        try {
            const data = await labTestController.getAll();
            const filteredData = data.filter(
                (test) => test.status !== 'COMPLETE'
            );
            setTests(filteredData);
        } catch {
            // ignore refresh error
        }
    };


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            console.log('Selected files:', newFiles.length, newFiles.map(f => f.name));
            setUploadedFiles(prev => {
                const combined = [...prev];
                newFiles.forEach(newFile => {
                    if (!combined.some(f => f.name === newFile.name && f.size === newFile.size)) {
                        combined.push(newFile);
                    }
                });
                console.log('Total files after selection:', combined.length, combined.map(f => f.name));
                return combined;
            });
        }
        e.target.value = '';
    };

    const handleAccept = async (id: string) => {
        try {
            setProcessingId(id);
            const { authController } = await import('../../controllers/AuthController');
            const currentUser = authController.getCurrentUser();
            const labTechnicianId = currentUser?.id;
            
            const res = await labTestController.accept(id, labTechnicianId);
    
            console.log("SERVER RETURN:", res);
    
            toast.success('Đã nhận yêu cầu');
    
            if (res && res.id) {
                setTests(prev => prev.map(t => t.id === id ? res : t));
            }
    
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Không nhận được yêu cầu');
        } finally {
            setProcessingId(null);
        }
    };
    

    const handleStartTest = async (id: string) => {
        try {
            setProcessingId(id);
            const res = await labTestController.start(id);
            toast.success('Đã bắt đầu xét nghiệm');
            refreshTest(id, res, 'IN_PROGRESS');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Không bắt đầu được');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSubmitResult = async (id: string) => {
        try {
            setProcessingId(id);

            if (uploadedFiles.length > 0) {
                await medicalAttachmentController.uploadMultipleFiles(uploadedFiles, id);
            }

            const payload = {
                units: resultUnits || undefined,
                referenceRange: resultRange || undefined,
                abnormalFlag: resultAbnormal || undefined,
                structureJson: resultStructure || undefined,
                instructions: testNotes || undefined,
            };
            const res = await labTestController.complete(id, payload);
            toast.success('Đã hoàn tất và gửi kết quả');
            setShowUploadDialog(false);
            setUploadedFiles([]);
            setTestNotes('');
            setResultUnits('');
            setResultRange('');
            setResultAbnormal('');
            setResultStructure('');
            refreshTest(id, res, 'COMPLETE');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Không thể gửi kết quả');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredTests = useMemo(() => {
        return tests.filter((test) => {
            if (test.status === 'COMPLETE') {
                return false;
            }

            const keyText =
                `${test.labTestType?.name || ''} ${test.appointmentId || ''} ${test.doctorName || test.doctorId || ''} ${test.patientName || ''} ${test.labTechnicianName || ''}`.toLowerCase();
            const matchesSearch = keyText.includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const st = test.status;
            if (selectedFilter === 'all') return true;
            if (selectedFilter === 'pending') return st === 'REQUEST';
            if (selectedFilter === 'in-progress') return st === 'IN_PROGRESS';
            return true;
        });
    }, [tests, searchQuery, selectedFilter]);

    const getStatusBadge = (status?: string) => {
        const st = status;
        if (st === 'COMPLETE') return { label: 'COMPLETE', className: 'border-green-600 text-green-600' };
        if (st === 'IN_PROGRESS') return { label: 'IN_PROGRESS', className: 'border-primary text-primary' };
        if (st === 'ACCEPTED') return { label: 'ACCEPTED', className: 'border-primary-strong text-primary-strong' };
        if (st === 'REQUEST') return { label: 'REQUEST', className: 'border-accent-orange text-accent-orange' };
        return { label: st || 'UNKNOWN', className: 'border-accent-orange text-accent-orange' };
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-bold text-neutral-heading text-3xl mb-2">
                    Hàng đợi xét nghiệm
                </h1>
                <p className="font-normal text-neutral-text/70 text-sm">
                    Quản lý và thực hiện các yêu cầu xét nghiệm
                </p>
            </div>

            {/* Search and Filter */}
            <Card className="p-4 border-neutral-border bg-neutral-surface shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân, mã BN, loại xét nghiệm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 border-neutral-border focus:border-primary focus:ring-primary/20"
                        />
                    </div>
                    <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-auto">
                        <TabsList className="bg-primary/5">
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
                    <Card key={test.id} className="border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-neutral-heading text-base">
                                                {test.labTestType?.name || 'Lab test'}
                                            </h3>
                                            <Badge variant="outline" className="text-xs border-neutral-border">
                                                {test.appointmentId || 'N/A'}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-primary text-sm mb-2">
                                            Bác sĩ: {test.doctorName || test.doctorId || 'N/A'}
                                        </p>
                                        <p className="font-medium text-green-600 text-sm mb-2">
                                            Bệnh nhân: {test.patientName || (test.appointmentId ? `Appointment: ${test.appointmentId.substring(0, 8)}...` : 'Chưa có thông tin')}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-text/70">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>Technician: {test.labTechnicianName || test.labTechnicianId || 'Chưa gán'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {test.createdAt
                                                        ? new Date(test.createdAt).toLocaleString('vi-VN')
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        {test.instructions && (
                                            <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                                <p className="font-normal text-neutral-text/70 text-sm">
                                                    <span className="font-medium text-neutral-heading">Ghi chú:</span> {test.instructions}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {test.status === 'REQUEST' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleAccept(test.id)}
                                            disabled={processingId === test.id}
                                            className="bg-accent-orange hover:bg-accent-orange/90 transition-all duration-200"
                                        >
                                            Nhận
                                        </Button>
                                    )}
                                    {test.status === 'ACCEPTED' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleStartTest(test.id)}
                                            disabled={processingId === test.id}
                                            className="bg-primary hover:bg-primary-strong transition-all duration-200"
                                        >
                                            Bắt đầu
                                        </Button>
                                    )}
                                    {test.status === 'IN_PROGRESS' && (
                                        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 transition-all duration-200">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Tải kết quả
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-[640px] bg-neutral-surface">
                                                <DialogHeader>
                                                    <DialogTitle className="font-semibold text-neutral-heading">
                                                        Tải lên kết quả xét nghiệm
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Label className="font-medium text-neutral-heading mb-2 block">
                                                            File hình ảnh/kết quả
                                                        </Label>
                                                        <div className="md:col-span-2">
                                                            <Input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                multiple
                                                                onChange={handleFileUpload}
                                                                className="border-neutral-border focus:border-primary focus:ring-primary/20"
                                                            />
                                                            {uploadedFiles.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-[13px] text-[#2ecc71] font-medium">
                                                                        ✓ Đã chọn {uploadedFiles.length} file:
                                                                    </p>
                                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                        {uploadedFiles.map((file, index) => (
                                                                            <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                                                                <span className="text-[#333333] truncate flex-1">{file.name}</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                                                                    }}
                                                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setUploadedFiles([])}
                                                                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                                                                    >
                                                                        Xóa tất cả
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Label className="font-medium text-neutral-heading mb-2 block">
                                                                Đơn vị (units)
                                                            </Label>
                                                        <select
                                                            value={resultUnits}
                                                            onChange={(e) => setResultUnits(e.target.value)}
                                                            className="w-full h-10 rounded-md border border-neutral-border bg-neutral-surface px-3 text-sm focus:border-primary focus:ring-primary/20"
                                                        >
                                                            <option value="">Chọn đơn vị</option>
                                                            <option value="mg/dL">mg/dL</option>
                                                            <option value="mmol/L">mmol/L</option>
                                                            <option value="g/L">g/L</option>
                                                            <option value="IU/L">IU/L</option>
                                                            <option value="ng/mL">ng/mL</option>
                                                        </select>
                                                        </div>
                                                        <div>
                                                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                                                Khoảng tham chiếu
                                                            </Label>
                                                            <Input
                                                                value={resultRange}
                                                                onChange={(e) => setResultRange(e.target.value)}
                                                                placeholder="70 - 110"
                                                                className="border-[#ebf6fc]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                                                Cờ bất thường
                                                            </Label>
                                                        <select
                                                            value={resultAbnormal}
                                                            onChange={(e) => setResultAbnormal(e.target.value)}
                                                            className="w-full h-10 rounded-md border border-[#ebf6fc] bg-white px-3 text-sm"
                                                        >
                                                            <option value="">Chọn</option>
                                                            <option value="HIGH">HIGH</option>
                                                            <option value="LOW">LOW</option>
                                                            <option value="NORMAL">NORMAL</option>
                                                        </select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                                                Cấu trúc kết quả (JSON)
                                                            </Label>
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                placeholder='{"glucose": 90}'
                                                                value={resultStructure}
                                                                onChange={(e) => setResultStructure(e.target.value)}
                                                                className="min-h-[80px] border-[#ebf6fc]"
                                                            />
                                                            <Input
                                                                type="file"
                                                                accept="application/json"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => {
                                                                        const text = ev.target?.result as string;
                                                                        setResultStructure(text || "");
                                                                    };
                                                                    reader.readAsText(file);
                                                                }}
                                                                className="border-[#ebf6fc]"
                                                            />
                                                        </div>
                                                        </div>
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
                                                        onClick={() => handleSubmitResult(test.id)}
                                                        disabled={processingId === test.id}
                                                        className="w-full bg-[#3fb5ff] hover:bg-[#1e8bc3]"
                                                    >
                                                        {processingId === test.id ? 'Đang gửi...' : 'Gửi kết quả'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                    {test.status === 'IN_PROGRESS' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSubmitResult(test.id)}
                                            disabled={processingId === test.id}
                                            className="border-green-600 text-green-600 hover:bg-green-50 transition-all duration-200"
                                        >
                                            {processingId === test.id ? 'Đang hoàn thành...' : 'Hoàn thành'}
                                        </Button>
                                    )}
                                    <Badge
                                        variant="outline"
                                        className={getStatusBadge(test.status).className}
                                    >
                                        {getStatusBadge(test.status).label}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredTests.length === 0 && (
                <Card className="p-12 border-neutral-border bg-neutral-surface">
                    <div className="text-center">
                        <FileText className="w-16 h-16 text-neutral-muted mx-auto mb-4" />
                        <h3 className="font-semibold text-neutral-text/70 text-base mb-2">
                            Không tìm thấy xét nghiệm
                        </h3>
                        <p className="font-normal text-neutral-text/60 text-sm">
                            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
