import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, User, Phone, Calendar, CreditCard, Plus, Trash2, Save, Printer, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { authController } from "../../controllers/AuthController";
import { prescriptionController } from "../../controllers/PrescriptionController";
import { patientController } from "../../controllers/PatientController";
import { PatientWithUser } from "../../models/Patient";
import { medicalHistoryController, MedicalHistoryDTO } from "../../controllers/MedicalHistoryController";
import { subscribeToPrescriptionError, PrescriptionErrorNotification, connectWebSocket, isConnected } from "../../services/websocketService";
import { MedicineSearchInput } from "./MedicineSearchInput";
import { MedicineWithStock } from "../../controllers/InventoryController";

interface CreatePrescriptionEnhancedProps {
    appointmentId: string;
    medicalHistoryId: string;
    patientId: string;
    onCreated?: (id: string) => void;
    onViewPrescription?: (dispenseOrderId: string) => void;
    onBack?: () => void;
}

type PrescriptionItem = {
    medicineId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
    stockQuantity?: number;
};

const dosageTemplates = [
    { label: "1 viên x 3 lần/ngày x 7 ngày", dosage: "1 viên/lần", frequency: "3 lần/ngày", duration: "7 ngày" },
    { label: "2 viên x 2 lần/ngày x 5 ngày", dosage: "2 viên/lần", frequency: "2 lần/ngày", duration: "5 ngày" },
    { label: "1 viên x 1 lần/ngày x 10 ngày", dosage: "1 viên/lần", frequency: "1 lần/ngày", duration: "10 ngày" },
];

export function CreatePrescriptionEnhanced({
    appointmentId,
    medicalHistoryId,
    patientId,
    onCreated,
    onViewPrescription,
    onBack,
}: CreatePrescriptionEnhancedProps) {
    const [patient, setPatient] = useState<PatientWithUser | null>(null);
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryDTO | null>(null);
    const [items, setItems] = useState<PrescriptionItem[]>([]);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorDetail, setErrorDetail] = useState<PrescriptionErrorNotification | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [statusInfo, setStatusInfo] = useState<{ status: string; prescriptionId?: string; dispenseOrderId?: string }>({ status: 'LOADING' });
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = authController.getCurrentUser();
    const doctorId = currentUser?.id;

    useEffect(() => {
        loadPatientData();
        checkPrescriptionStatus();

        // ✅ Đảm bảo WebSocket được kết nối trước khi subscribe
        if (!isConnected()) {
            console.log('[CreatePrescription] Connecting WebSocket...');
            connectWebSocket();
        }

        if (doctorId) {
            console.log('[CreatePrescription] Subscribing to prescription errors for doctor:', doctorId);
            const unsub = subscribeToPrescriptionError(doctorId, (n) => {
                console.log('[CreatePrescription] Received prescription error notification:', n);
                setErrorDetail(n);
                setShowErrorPopup(true);
                toast.error(
                    <div style={{ whiteSpace: "pre-line" }}>
                        {n.message}
                    </div>,
                    {
                        duration: 5000,
                    }
                );

                if (n.status === 'SUCCESS') {
                    // Tự động onBack sau 1.5 giây để người dùng kịp đọc thông báo
                    setTimeout(() => {
                        onBack?.();
                    }, 1500);

                }

            });

            return () => {
                console.log('[CreatePrescription] Cleaning up WebSocket subscription');
                unsub();
            };
        }
    }, [doctorId, patientId]);

    const checkPrescriptionStatus = async () => {
        if (!medicalHistoryId) return;
        try {
            setCheckingStatus(true);
            const status = await prescriptionController.getPrescriptionStatusByMedicalHistoryId(medicalHistoryId);
            setStatusInfo(status);
        } catch (err) {
            console.warn('Không thể lấy trạng thái đơn thuốc', err);
            setStatusInfo({ status: 'NONE' });
        } finally {
            setCheckingStatus(false);
        }
    };

    const loadPatientData = async () => {
        try {
            setLoading(true);
            const data = await patientController.getWithUserById(patientId);
            setPatient(data);

            // Load medical history
            try {
                const mhData = await medicalHistoryController.getById(medicalHistoryId);
                setMedicalHistory(mhData);
            } catch (err) {
                console.warn('Could not load medical history:', err);
            }
        } catch (error) {
            console.error('Error loading patient:', error);
            toast.error('Không thể tải thông tin bệnh nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = (medicine: MedicineWithStock) => {
        // Kiểm tra trùng
        if (items.some(item => item.medicineId === medicine.id)) {
            toast.warning('Thuốc này đã có trong đơn');
            return;
        }

        const newItem: PrescriptionItem = {
            medicineId: medicine.id,
            name: medicine.name,
            quantity: 1,
            unitPrice: medicine.salePrice || 0,
            unit: medicine.unit || 'viên',
            dosage: '',
            frequency: '',
            duration: '',
            instruction: '',
            stockQuantity: medicine.stockQuantity,
        };

        setItems([...items, newItem]);
        toast.success(`Đã thêm ${medicine.name}`);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    // Validate số lượng khi rời khỏi ô nhập (onBlur)
    const validateQuantity = (index: number, value: any) => {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 1) {
            updateItem(index, 'quantity', 1);
        }
    };

    const applyDosageTemplate = (index: number, template: typeof dosageTemplates[0]) => {
        setItems(items.map((item, i) =>
            i === index
                ? {
                    ...item,
                    dosage: template.dosage,
                    frequency: template.frequency,
                    duration: template.duration
                }
                : item
        ));
    };

    const toggleExpandItem = (index: number) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const formatGender = (gender?: string) => {
        if (!gender) return "-";
        const g = gender.toLowerCase();
        if (g === "male") return "Nam";
        if (g === "female") return "Nữ";
        return "Khác";
    };

    const handleSubmit = async () => {
        if (!doctorId) return toast.error("Không xác định bác sĩ");
        if (!medicalHistoryId || !patientId) return toast.error("Thiếu thông tin");
        if (items.length === 0) return toast.error("Chưa có thuốc trong đơn");
        if (isBlocked) return toast.error("Hồ sơ đã có đơn thuốc ở trạng thái không cho phép tạo mới");
        if (isSubmitting) return; // Prevent double submission

        // Validate
        for (const item of items) {
            if (!item.medicineId || !item.unit || item.quantity <= 0) {
                toast.error(`Vui lòng điền đầy đủ thông tin cho thuốc: ${item.name}`);
                return;
            }
            if (item.stockQuantity && item.quantity > item.stockQuantity) {
                toast.error(`Số lượng ${item.name} vượt quá tồn kho (${item.stockQuantity})`);
                return;
            }
        }

        const payload = {
            medicalHistoryId,
            appointmentId,
            patientId,
            doctorId,
            items: items.map(i => ({
                medicineId: i.medicineId,
                name: i.name,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                unit: i.unit,
                dosage: i.dosage,
                frequency: i.frequency,
                duration: i.duration,
                instruction: i.instruction,
            })),
        };

        try {
            setIsSubmitting(true);
            const res = await prescriptionController.createPrescription(payload)
            //toast.success("Đã tạo đơn thuốc thành công")
            // Nếu tạo đơn thành công thì mới callback để màn hình cha chuyển trang
            //onCreated?.(res.id);
        } catch (e: any) {
            // Lỗi sẽ được báo qua websocket (PrescriptionProcessNotificationEvent)
            //toast.error(e.message || "Lỗi tạo đơn thuốc");
            setIsSubmitting(false);
        } finally {
            // Reset sau khi nhận phản hồi (thành công hoặc lỗi)
            // Note: WebSocket sẽ gửi notification, sau đó component có thể unmount
            setTimeout(() => setIsSubmitting(false), 3000);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const isBlocked = statusInfo.status === 'SOLD' || statusInfo.status === 'RELEASED';

    if (checkingStatus) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-background">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-text/60">Đang kiểm tra trạng thái đơn thuốc...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-background">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-text/60">Đang tải thông tin...</p>
            </div>
        );
    }

    if (isBlocked) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-neutral-background">
                <h2 className="typo-h3 mb-2">Hồ sơ đã có đơn thuốc</h2>
                <p className="text-neutral-text/60 mb-4">Trạng thái: {statusInfo.status}</p>
                <div className="flex gap-3">
                    {statusInfo.dispenseOrderId && (
                        <Button
                            onClick={() => onViewPrescription?.(statusInfo.dispenseOrderId!)}
                            className="bg-primary text-white"
                        >
                            Xem / Sửa đơn thuốc
                        </Button>
                    )}
                    {onBack && (
                        <Button variant="outline" onClick={onBack}>
                            Quay lại
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[var(--page-bg)]">
            {/* Header */}
            <div className="bg-neutral-surface border-b border-neutral-border/30 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="outline" size="sm" onClick={onBack} className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    )}
                    <div>
                        <h1 className="typo-h3">Kê Đơn Thuốc</h1>
                        <p className="text-sm text-neutral-text/60 mt-1">Mã lịch hẹn: <span className="font-mono">{appointmentId.slice(-8)}</span></p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* <Button variant="outline" onClick={() => setShowPreview(true)} disabled={items.length === 0} className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">
                        <Printer className="w-4 h-4 mr-2" />
                        Xem trước
                    </Button> */}
                    <Button
                        onClick={handleSubmit}
                        disabled={items.length === 0 || isSubmitting}
                        className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Lưu đơn thuốc
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Content - 2 Columns */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Column - Patient Info (30%) */}
                <div className="w-[30%] border-r border-neutral-border/30 overflow-y-auto bg-neutral-muted/30">
                    <div className="p-6 space-y-5">
                        {/* Patient Info Card */}
                        <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 typo-h4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    Thông Tin Bệnh Nhân
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-neutral-text/60 mb-1">Họ và tên</p>
                                    <p className="font-semibold text-neutral-text">{patient?.user?.fullName || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-neutral-text/60 mb-1">Giới tính</p>
                                        <p className="text-sm text-neutral-text">{formatGender(patient?.gender) || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-text/60 mb-1">Tuổi</p>
                                        <p className="text-sm text-neutral-text">
                                            {patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-text/60 flex items-center gap-1 mb-1">
                                        <Phone className="w-3 h-3" /> Điện thoại
                                    </p>
                                    <p className="text-sm text-neutral-text">{patient?.contactPhone || patient?.user?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-text/60 flex items-center gap-1 mb-1">
                                        <CreditCard className="w-3 h-3" /> Nhóm máu
                                    </p>
                                    <p className="text-sm font-semibold text-red-600">{patient?.bloodType || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Allergies Warning */}
                        {patient?.patientAllergies && patient.patientAllergies.length > 0 && (
                            <Alert className="border-red-500 bg-red-50">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <AlertDescription>
                                    <p className="font-semibold text-red-800 mb-2">⚠️ CẢNH BÁO DỊ ỨNG</p>
                                    <ul className="space-y-1">
                                        {patient.patientAllergies.map((allergy, idx) => (
                                            <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                                                <Shield className="w-3 h-3" />
                                                {allergy.allergyName || allergy.allergyCode}
                                            </li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Summary */}
                        <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="typo-h4">Tổng Quan Đơn Thuốc</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Medical History Info */}
                                {medicalHistory && (
                                    <div className="pb-3 border-b space-y-2">
                                        {medicalHistory.symptoms && (
                                            <div>
                                                <p className="text-xs text-[#333333]/60">Triệu chứng</p>
                                                <p className="text-sm font-medium text-[#01304e]">{medicalHistory.symptoms}</p>
                                            </div>
                                        )}
                                        {medicalHistory.conditions && medicalHistory.conditions.length > 0 && (
                                            <div>
                                                <p className="text-xs text-[#333333]/60">Tình trạng ({medicalHistory.conditions.length})</p>
                                                {medicalHistory.conditions.map((cond, idx) => (
                                                    <div key={idx} className="text-sm text-[#333333] mt-1">
                                                        {cond.toothNumber && <span className="font-medium">Răng {cond.toothNumber}: </span>}
                                                        <span>{cond.name}</span>
                                                        {cond.status && <span className="text-[#666666]"> ({cond.status})</span>}
                                                        {cond.treatment && <div className="text-xs text-[#666666] mt-0.5">- {cond.treatment}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Summary Stats */}
                                {/* <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#333333]/60">Số loại thuốc:</span>
                                        <span className="font-semibold">{items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#333333]/60">Tổng số lượng:</span>
                                        <span className="font-semibold">{items.reduce((s, i) => s + i.quantity, 0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-sm font-semibold">Tổng tiền:</span>
                                        <span className="text-lg font-bold text-[#3FB5FF]">
                                            {totalAmount.toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div> */}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Prescription Form (70%) */}
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-background">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Medicine Search */}
                        <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="typo-h4">Tìm kiếm và thêm thuốc</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MedicineSearchInput
                                    onSelect={handleAddMedicine}
                                    disabled={false}
                                />
                                <p className="text-xs text-neutral-text/60 mt-3">
                                    Tìm kiếm thuốc theo tên hoặc mô tả, chọn để thêm vào đơn
                                </p>
                            </CardContent>
                        </Card>

                        {/* Prescription Items */}
                        {items.length === 0 ? (
                            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                                <CardContent className="p-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mx-auto mb-4">
                                        <Plus className="w-8 h-8 text-neutral-text/40" />
                                    </div>
                                    <p className="text-neutral-text/60">Chưa có thuốc trong đơn. Vui lòng tìm kiếm và thêm thuốc.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, idx) => {
                                    const isExpanded = expandedItems.has(idx);

                                    return (
                                        <Card key={idx} className="border-l-4 border-l-primary rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                                            <CardContent className="p-5">
                                                {/* Header - Always visible */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleExpandItem(idx)}
                                                                className="p-1.5 hover:bg-neutral-muted rounded-lg transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-4 h-4 text-primary" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-primary" />
                                                                )}
                                                            </button>
                                                            <h3 className="font-semibold text-neutral-text">{item.name}</h3>
                                                        </div>
                                                        <div className="flex gap-3 text-xs text-neutral-text/60 ml-9 mt-2">
                                                            <span>Đơn vị: <span className="font-medium text-neutral-text">{item.unit}</span></span>
                                                            <span>•</span>
                                                            <span>SL: <span className="font-medium text-neutral-text">{item.quantity}</span></span>
                                                            <span>•</span>
                                                            <span>Đơn giá: <span className="font-medium text-primary">{item.unitPrice.toLocaleString('vi-VN')} đ</span></span>
                                                            {item.stockQuantity !== undefined && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Tồn kho: <span className="font-medium text-neutral-text">{item.stockQuantity}</span></span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(idx)}
                                                        className="text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {/* Expandable Details */}
                                                {isExpanded && (
                                                    <div className="ml-9 mt-5 space-y-4 p-4 bg-neutral-muted/30 rounded-lg">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Số lượng *
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={item.stockQuantity}
                                                                    value={item.quantity || ''}
                                                                    onChange={(e) => updateItem(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                                                                    onBlur={(e) => validateQuantity(idx, e.target.value)}
                                                                    className="rounded-lg border-neutral-border/30 focus:border-primary"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Thành tiền
                                                                </label>
                                                                <Input
                                                                    value={(item.unitPrice * item.quantity).toLocaleString('vi-VN') + ' đ'}
                                                                    disabled
                                                                    className="bg-neutral-muted border-neutral-border/30 rounded-lg font-semibold text-primary"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Dosage Templates */}
                                                        <div>
                                                            <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                Liều dùng mẫu:
                                                            </label>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {dosageTemplates.map((template, tIdx) => (
                                                                    <Button
                                                                        key={tIdx}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => applyDosageTemplate(idx, template)}
                                                                        className="text-xs rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                                                                    >
                                                                        {template.label}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Liều dùng
                                                                </label>
                                                                <Input
                                                                    placeholder="VD: 1 viên/lần"
                                                                    value={item.dosage}
                                                                    onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                                                                    className="rounded-lg border-neutral-border/30 focus:border-primary"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Tần suất
                                                                </label>
                                                                <Input
                                                                    placeholder="VD: 3 lần/ngày"
                                                                    value={item.frequency}
                                                                    onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                                                                    className="rounded-lg border-neutral-border/30 focus:border-primary"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Thời gian
                                                                </label>
                                                                <Input
                                                                    placeholder="VD: 7 ngày"
                                                                    value={item.duration}
                                                                    onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                                                                    className="rounded-lg border-neutral-border/30 focus:border-primary"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                Hướng dẫn sử dụng
                                                            </label>
                                                            <Textarea
                                                                placeholder="VD: Uống sau ăn, tránh dùng với sữa..."
                                                                value={item.instruction}
                                                                onChange={(e) => updateItem(idx, 'instruction', e.target.value)}
                                                                rows={2}
                                                                className="rounded-lg border-neutral-border/30 focus:border-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Dialog */}
            {/*<Dialog open={showErrorPopup} onOpenChange={setShowErrorPopup}>*/}
            {/*    <DialogContent className="rounded-2xl border-neutral-border/20 bg-neutral-surface">*/}
            {/*        <DialogHeader>*/}
            {/*            <DialogTitle className="text-red-600 typo-h3 flex items-center gap-2">*/}
            {/*                <AlertTriangle className="w-5 h-5" />*/}
            {/*                Lỗi khi tạo đơn thuốc*/}
            {/*            </DialogTitle>*/}
            {/*        </DialogHeader>*/}
            {/*        <div className="space-y-3 text-sm p-4 bg-red-50 rounded-lg border border-red-200">*/}
            {/*            <p className="text-neutral-text font-semibold">{errorDetail?.message || "Có lỗi xảy ra"}</p>*/}
            {/*            {errorDetail?.step && (*/}
            {/*                <p className="text-neutral-text/70">*/}
            {/*                    <span className="font-medium">Bước xử lý:</span> {errorDetail.step}*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*            {errorDetail?.status && (*/}
            {/*                <p className="text-neutral-text/70">*/}
            {/*                    <span className="font-medium">Trạng thái:</span> {errorDetail.status}*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*            {errorDetail?.prescriptionId && (*/}
            {/*                <p className="text-neutral-text/70">*/}
            {/*                    <span className="font-medium">Mã đơn thuốc:</span> <span className="font-mono">{errorDetail.prescriptionId.slice(-8)}</span>*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*        </div>*/}
            {/*        <DialogFooter>*/}
            {/*            <Button variant="outline" onClick={() => setShowErrorPopup(false)} className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">Đóng</Button>*/}
            {/*        </DialogFooter>*/}
            {/*    </DialogContent>*/}
            {/*</Dialog>*/}

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border-neutral-border/20 bg-white">
                    <DialogHeader>
                        <DialogTitle className="typo-h3">Xem trước đơn thuốc</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 p-6 border border-neutral-border/30 rounded-xl bg-neutral-surface">
                        <div className="text-center border-b border-neutral-border/30 pb-5">
                            <h2 className="text-2xl font-bold text-neutral-text">ĐƠN THUỐC</h2>
                            <p className="text-sm text-neutral-text/60 mt-2">Ngày {new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="space-y-2 text-neutral-text">
                            <p><strong className="font-semibold">Bệnh nhân:</strong> {patient?.user?.fullName}</p>
                            <p><strong className="font-semibold">Năm sinh:</strong> {patient?.dob ? new Date(patient.dob).getFullYear() : 'N/A'}</p>
                            <p><strong className="font-semibold">Địa chỉ:</strong> {patient?.address || 'N/A'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-text mb-3">Danh sách thuốc:</h3>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-neutral-muted border-b border-neutral-border/30">
                                        <th className="text-left p-3 font-semibold text-neutral-text">STT</th>
                                        <th className="text-left p-3 font-semibold text-neutral-text">Tên thuốc</th>
                                        <th className="text-center p-3 font-semibold text-neutral-text">SL</th>
                                        <th className="text-left p-3 font-semibold text-neutral-text">Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-neutral-border/20 hover:bg-neutral-muted/30 transition-colors">
                                            <td className="p-3 text-neutral-text">{idx + 1}</td>
                                            <td className="p-3 font-medium text-neutral-text">{item.name}</td>
                                            <td className="text-center p-3 text-neutral-text">{item.quantity}</td>
                                            <td className="p-3 text-xs text-neutral-text">
                                                {item.dosage} - {item.frequency} - {item.duration}
                                                {item.instruction && <div className="text-neutral-text/60 mt-1">{item.instruction}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-right pt-4 border-t border-neutral-border/30">
                            <p className="text-lg font-bold text-primary">Tổng tiền: {totalAmount.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="text-right pt-6">
                            <p className="font-semibold text-neutral-text">Bác sĩ</p>
                            <p className="text-sm text-neutral-text/60 mt-1">{currentUser?.fullName || 'N/A'}</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowPreview(false)} className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">Đóng</Button>
                        <Button onClick={() => window.print()} className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
                            <Printer className="w-4 h-4 mr-2" />
                            In đơn
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

