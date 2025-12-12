import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, User, Phone, Calendar, CreditCard, Plus, Trash2, Save, Printer, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { authController } from "../../controllers/AuthController";
import { prescriptionController } from "../../controllers/PrescriptionController";
import { patientController } from "../../controllers/PatientController";
import { PatientWithUser } from "../../models/Patient";
import { medicalHistoryController, MedicalHistoryDTO } from "../../controllers/MedicalHistoryController";
import { subscribeToPrescriptionError, PrescriptionErrorNotification, connectWebSocket } from "../../services/websocketService";
import { MedicineSearchInput } from "./MedicineSearchInput";
import { MedicineWithStock } from "../../controllers/InventoryController";

interface CreatePrescriptionEnhancedProps {
    appointmentId: string;
    medicalHistoryId: string;
    patientId: string;
    onCreated?: (id: string) => void;
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

    const currentUser = authController.getCurrentUser();
    const doctorId = currentUser?.id;

    useEffect(() => {
        loadPatientData();
        connectWebSocket();
        if (doctorId) {
            const unsub = subscribeToPrescriptionError(doctorId, (n) => {
                setErrorDetail(n);
                setShowErrorPopup(true);
                toast.error(n.message);
            });
            return () => unsub();
        }
    }, [doctorId, patientId]);

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

    const handleSubmit = async () => {
        if (!doctorId) return toast.error("Không xác định bác sĩ");
        if (!medicalHistoryId || !patientId) return toast.error("Thiếu thông tin");
        if (items.length === 0) return toast.error("Chưa có thuốc trong đơn");

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
            const res = await prescriptionController.createPrescription(payload);
            toast.success("Đã tạo đơn thuốc thành công");
            onCreated?.(res.id);
        } catch (e: any) {
            toast.error(e.message || "Lỗi tạo đơn thuốc");
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#fcfeff]">
            {/* Header */}
            <div className="bg-white border-b border-[#e8e8e8] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="outline" size="sm" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-semibold text-[#01304e]">Kê Đơn Thuốc</h1>
                        <p className="text-sm text-[#333333]/60">Mã lịch hẹn: {appointmentId.slice(-8)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(true)} disabled={items.length === 0}>
                        <Printer className="w-4 h-4 mr-2" />
                        Xem trước
                    </Button>
                    <Button onClick={handleSubmit} disabled={items.length === 0}>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu đơn thuốc
                    </Button>
                </div>
            </div>

            {/* Main Content - 2 Columns */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Column - Patient Info (30%) */}
                <div className="w-[30%] border-r border-[#e8e8e8] overflow-y-auto bg-[#f8f9fa]">
                    <div className="p-6 space-y-4">
                        {/* Patient Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#3FB5FF]" />
                                    Thông Tin Bệnh Nhân
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-[#333333]/60">Họ và tên</p>
                                    <p className="font-semibold text-[#01304e]">{patient?.user?.fullName || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-[#333333]/60">Giới tính</p>
                                        <p className="text-sm">{patient?.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#333333]/60">Tuổi</p>
                                        <p className="text-sm">
                                            {patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-[#333333]/60 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Điện thoại
                                    </p>
                                    <p className="text-sm">{patient?.contactPhone || patient?.user?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#333333]/60 flex items-center gap-1">
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Tổng Quan Đơn Thuốc</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Medical History Info */}
                                {medicalHistory && (
                                    <div className="pb-3 border-b space-y-2">
                                        {medicalHistory.diagnosis && (
                                            <div>
                                                <p className="text-xs text-[#333333]/60">Chẩn đoán</p>
                                                <p className="text-sm font-medium text-[#01304e]">{medicalHistory.diagnosis}</p>
                                            </div>
                                        )}
                                        {medicalHistory.disease && (
                                            <div>
                                                <p className="text-xs text-[#333333]/60">Bệnh</p>
                                                <p className="text-sm font-medium text-[#01304e]">{medicalHistory.disease}</p>
                                            </div>
                                        )}
                                        {medicalHistory.treatment && (
                                            <div>
                                                <p className="text-xs text-[#333333]/60">Điều trị</p>
                                                <p className="text-sm text-[#333333]">{medicalHistory.treatment}</p>
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
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Medicine Search */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tìm kiếm và thêm thuốc</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MedicineSearchInput
                                    onSelect={handleAddMedicine}
                                    disabled={false}
                                />
                                <p className="text-xs text-[#333333]/60 mt-2">
                                    Tìm kiếm thuốc theo tên hoặc mô tả, chọn để thêm vào đơn
                                </p>
                            </CardContent>
                        </Card>

                        {/* Prescription Items */}
                        {items.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p className="text-[#333333]/60">Chưa có thuốc trong đơn. Vui lòng tìm kiếm và thêm thuốc.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, idx) => {
                                    const isExpanded = expandedItems.has(idx);

                                    return (
                                        <Card key={idx} className="border-l-4 border-l-[#3FB5FF]">
                                            <CardContent className="p-4">
                                                {/* Header - Always visible */}
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleExpandItem(idx)}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-4 h-4 text-[#3FB5FF]" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-[#3FB5FF]" />
                                                                )}
                                                            </button>
                                                            <h3 className="font-semibold text-[#01304e]">{item.name}</h3>
                                                        </div>
                                                        <div className="flex gap-3 text-xs text-[#333333]/60 ml-7 mt-1">
                                                            <span>Đơn vị: {item.unit}</span>
                                                            <span>•</span>
                                                            <span>SL: {item.quantity}</span>
                                                            <span>•</span>
                                                            <span>Đơn giá: {item.unitPrice.toLocaleString('vi-VN')} đ</span>
                                                            {item.stockQuantity !== undefined && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Tồn kho: {item.stockQuantity}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(idx)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {/* Expandable Details */}
                                                {isExpanded && (
                                                    <div className="ml-7 mt-4 space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                    Số lượng *
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    max={item.stockQuantity}
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                    Thành tiền
                                                                </label>
                                                                <Input
                                                                    value={(item.unitPrice * item.quantity).toLocaleString('vi-VN') + ' đ'}
                                                                    disabled
                                                                    className="bg-[#f8f9fa]"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Dosage Templates */}
                                                        <div>
                                                            <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                Liều dùng mẫu:
                                                            </label>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {dosageTemplates.map((template, tIdx) => (
                                                                    <Button
                                                                        key={tIdx}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => applyDosageTemplate(idx, template)}
                                                                        className="text-xs"
                                                                    >
                                                                        {template.label}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                    Liều dùng
                                                                </label>
                                                                <Input
                                                                    placeholder="VD: 1 viên/lần"
                                                                    value={item.dosage}
                                                                    onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                    Tần suất
                                                                </label>
                                                                <Input
                                                                    placeholder="VD: 3 lần/ngày"
                                                                    value={item.frequency}
                                                                    onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                    Thời gian
                                                                </label>
                                                                <Input
                                                                    placeholder="VD: 7 ngày"
                                                                    value={item.duration}
                                                                    onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-medium text-[#333333]/80 block mb-1">
                                                                Hướng dẫn sử dụng
                                                            </label>
                                                            <Textarea
                                                                placeholder="VD: Uống sau ăn, tránh dùng với sữa..."
                                                                value={item.instruction}
                                                                onChange={(e) => updateItem(idx, 'instruction', e.target.value)}
                                                                rows={2}
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
            <Dialog open={showErrorPopup} onOpenChange={setShowErrorPopup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Lỗi khi tạo đơn thuốc</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        <p>{errorDetail?.message || "Có lỗi xảy ra"}</p>
                        {errorDetail?.reason && <p className="text-gray-600">Chi tiết: {errorDetail.reason}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowErrorPopup(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Xem trước đơn thuốc</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-4 border rounded">
                        <div className="text-center border-b pb-4">
                            <h2 className="text-xl font-bold">ĐƠN THUỐC</h2>
                            <p className="text-sm text-gray-600">Ngày {new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                            <p><strong>Bệnh nhân:</strong> {patient?.user?.fullName}</p>
                            <p><strong>Năm sinh:</strong> {patient?.dob ? new Date(patient.dob).getFullYear() : 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> {patient?.address || 'N/A'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Danh sách thuốc:</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">STT</th>
                                        <th className="text-left p-2">Tên thuốc</th>
                                        <th className="text-center p-2">SL</th>
                                        <th className="text-left p-2">Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="p-2">{idx + 1}</td>
                                            <td className="p-2">{item.name}</td>
                                            <td className="text-center p-2">{item.quantity}</td>
                                            <td className="p-2 text-xs">
                                                {item.dosage} - {item.frequency} - {item.duration}
                                                {item.instruction && <div className="text-gray-600 mt-1">{item.instruction}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-right pt-4 border-t">
                            <p className="font-bold">Tổng tiền: {totalAmount.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="text-right pt-8">
                            <p className="font-semibold">Bác sĩ</p>
                            <p className="text-sm text-gray-600">{currentUser?.fullName || 'N/A'}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPreview(false)}>Đóng</Button>
                        <Button onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" />
                            In đơn
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

