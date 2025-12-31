import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Eye, Calendar, User, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { labTestController } from '../../controllers/LabTestController';
import { medicalAttachmentController } from '../../controllers/MedicalAttachmentController';
import { LabTestDTO } from '../../models/LabTest';
import { MedicalAttachmentDTO } from '../../models/MedicalAttachment';
import { LabTestDetailDialog } from '../doctor/LabTestDetailDialog';

export function TestResults() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [labTests, setLabTests] = useState<LabTestDTO[]>([]);
    const [attachments, setAttachments] = useState<MedicalAttachmentDTO[]>([]);
    const [selectedLabTest, setSelectedLabTest] = useState<LabTestDTO | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [testsRes, attachmentsRes] = await Promise.all([
                    labTestController.getAll().catch(() => []),
                    medicalAttachmentController.getAll().catch(() => []),
                ]);

                const completedTests = testsRes.filter(
                    (test) => test.status === 'COMPLETE'
                );

                setLabTests(completedTests);
                setAttachments(attachmentsRes);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Không tải được danh sách kết quả xét nghiệm');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredResults = useMemo(() => {
        return labTests.filter((test) => {
            const searchLower = searchQuery.toLowerCase();
            const patientName = test.patientName?.toLowerCase() || '';
            const testTypeName = test.labTestType?.name?.toLowerCase() || '';
            const patientId = test.appointmentId?.toLowerCase() || '';
            
            return (
                patientName.includes(searchLower) ||
                testTypeName.includes(searchLower) ||
                patientId.includes(searchLower)
            );
        });
    }, [labTests, searchQuery]);

    const getResultSummary = (test: LabTestDTO): string => {
        if (test.structureJson) {
            try {
                const parsed = JSON.parse(test.structureJson);
                if (typeof parsed === 'string') return parsed;
                if (typeof parsed === 'object' && parsed !== null) {
                    // Try to extract a summary from the structure
                    if (parsed.result || parsed.summary || parsed.conclusion) {
                        return parsed.result || parsed.summary || parsed.conclusion;
                    }
                    return JSON.stringify(parsed).substring(0, 100) + '...';
                }
            } catch {
                return test.structureJson.substring(0, 100) + '...';
            }
        }
        if (test.abnormalFlag) {
            return `Đánh giá: ${test.abnormalFlag}`;
        }
        return 'Kết quả đã hoàn thành';
    };

    const hasImageAttachment = (testId: string): boolean => {
        return attachments.some(
            (att) => att.labTestId === testId && (att.type === 'IMAGE' || 
                att.filePath?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i))
        );
    };

    const handleViewResult = (test: LabTestDTO) => {
        setSelectedLabTest(test);
        setIsDetailDialogOpen(true);
    };

    const handleDownloadResult = async (test: LabTestDTO) => {
        try {
            const testAttachments = attachments.filter((att) => att.labTestId === test.id);
            if (testAttachments.length === 0) {
                toast.info('Không có file đính kèm để tải xuống');
                return;
            }

            for (const attachment of testAttachments) {
                if (attachment.filePath) {
                    const { API_CONFIG } = await import('../../config/api');
                    const cleanPath = encodeURIComponent(attachment.filePath);
                    const fileUrl = `${API_CONFIG.BASE_URL}/labtest-service/medical-attachments/file?path=${cleanPath}`;
                    
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = attachment.filePath.split('/').pop() || 'file';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            toast.success('Đã tải xuống các file đính kèm');
        } catch (err) {
            toast.error('Không thể tải xuống file');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-bold text-neutral-heading text-3xl mb-2">
                    Kết quả xét nghiệm
                </h1>
                <p className="font-normal text-neutral-text/70 text-sm">
                    Lịch sử các xét nghiệm đã hoàn thành
                </p>
            </div>

            {/* Search */}
            <Card className="p-4 border-neutral-border bg-neutral-surface shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm bệnh nhân, mã BN, loại xét nghiệm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 border-neutral-border focus:border-primary focus:ring-primary/20"
                    />
                </div>
            </Card>

            {loading && (
                <Card className="p-12 border-neutral-border bg-neutral-surface">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                        <h3 className="font-semibold text-neutral-text/70 text-base mb-2">
                            Đang tải dữ liệu...
                        </h3>
                    </div>
                </Card>
            )}

            {/* Results List */}
            {!loading && (
                <>
                    <div className="grid gap-4">
                        {filteredResults.map((test) => {
                            const hasImage = hasImageAttachment(test.id);
                            const resultSummary = getResultSummary(test);
                            const completedDate = test.resultDate 
                                ? new Date(test.resultDate).toLocaleString('vi-VN')
                                : test.updatedAt 
                                ? new Date(test.updatedAt).toLocaleString('vi-VN')
                                : 'N/A';

                            return (
                                <Card key={test.id} className="border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-neutral-heading text-base">
                                                        {test.patientName || 'Bệnh nhân không xác định'}
                                                    </h3>
                                                    {test.appointmentId && (
                                                        <Badge variant="outline" className="text-xs border-neutral-border">
                                                            {test.appointmentId}
                                                        </Badge>
                                                    )}
                                                    {hasImage && (
                                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                                                            Có hình ảnh
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="font-medium text-primary text-sm mb-3">
                                                    {test.labTestType?.name || 'Xét nghiệm không xác định'}
                                                </p>

                                                <div className="p-3 bg-primary/5 rounded-lg mb-3 border border-primary/20">
                                                    <p className="font-normal text-neutral-text/70 text-sm">
                                                        <span className="font-medium text-neutral-heading">Kết quả:</span> {resultSummary}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-sm text-neutral-text/70">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{completedDate}</span>
                                                    </div>
                                                    {test.labTechnicianName && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            <span>KTV. {test.labTechnicianName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewResult(test)}
                                                    className="border-primary text-primary hover:bg-primary/10 transition-all duration-200"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Xem
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDownloadResult(test)}
                                                    className="bg-primary hover:bg-primary-strong transition-all duration-200"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Tải về
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredResults.length === 0 && !loading && (
                        <Card className="p-12 border-neutral-border bg-neutral-surface">
                            <div className="text-center">
                                <Search className="w-16 h-16 text-neutral-muted mx-auto mb-4" />
                                <h3 className="font-semibold text-neutral-text/70 text-base mb-2">
                                    {labTests.length === 0 
                                        ? 'Chưa có kết quả xét nghiệm nào'
                                        : 'Không tìm thấy kết quả'}
                                </h3>
                                <p className="font-normal text-neutral-text/60 text-sm">
                                    {labTests.length === 0
                                        ? 'Các xét nghiệm đã hoàn thành sẽ hiển thị ở đây'
                                        : 'Thử điều chỉnh từ khóa tìm kiếm'}
                                </p>
                            </div>
                        </Card>
                    )}
                </>
            )}

            <LabTestDetailDialog
                labTest={selectedLabTest}
                medicalAttachments={attachments}
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
            />
        </div>
    );
}
