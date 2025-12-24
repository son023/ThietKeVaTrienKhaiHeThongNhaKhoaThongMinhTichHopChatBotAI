import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, User, Phone, Calendar, CreditCard, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { patientController } from "../../controllers/PatientController";
import { PatientWithUser } from "../../models/Patient";
import { medicalHistoryController, MedicalHistoryDTO } from "../../controllers/MedicalHistoryController";
import { inventoryController, DispenseOrderDTO, DispenseItemDTO } from "../../controllers/InventoryController";

interface ViewPrescriptionProps {
    dispenseOrderId: string;
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

export function ViewPrescription({
    dispenseOrderId,
    onBack,
}: ViewPrescriptionProps) {
    const [patient, setPatient] = useState<PatientWithUser | null>(null);
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryDTO | null>(null);
    const [items, setItems] = useState<PrescriptionItem[]>([]);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [dispenseOrder, setDispenseOrder] = useState<DispenseOrderDTO | null>(null);
    const [appointmentId, setAppointmentId] = useState<string>('');

    useEffect(() => {
        loadPrescriptionData();
    }, [dispenseOrderId]);

    const loadPrescriptionData = async () => {
        try {
            setLoading(true);
            
            // 1. Lấy dispense order
            const order = await inventoryController.getDispenseOrderById(dispenseOrderId);
            setDispenseOrder(order);

            // 2. Lấy medical history
            const mh = await medicalHistoryController.getById(order.medicalHistoryId);
            setMedicalHistory(mh);
            setAppointmentId(mh.appointmentId || '');

            // 3. Lấy thông tin bệnh nhân
            const patientData = await patientController.getWithUserById(mh.patientId);
            setPatient(patientData);

            // 4. Lấy danh sách thuốc trong đơn
            const dispenseItems = await inventoryController.getDispenseItemsByOrderId(dispenseOrderId);
            
            // 5. Chuyển đổi DispenseItemDTO sang PrescriptionItem
            const prescriptionItems: PrescriptionItem[] = await Promise.all(
                dispenseItems.map(async (item) => {
                    // Lấy thông tin thuốc từ inventory lot
                    try {
                        const lot = await inventoryController.getInventoryLotById(item.inventoryLotId);
                        
                        // Lấy thông tin medicine đầy đủ nếu có medicineId
                        let unit = 'viên';
                        let salePrice = item.priceAtDispense;
                        
                        if (lot.medicineId) {
                            try {
                                const medicine = await inventoryController.getMedicineById(lot.medicineId);
                                unit = medicine.unit || 'viên';
                                salePrice = medicine.salePrice || item.priceAtDispense;
                            } catch (err) {
                                console.warn('Error loading medicine info:', err);
                            }
                        }
                        
                        return {
                            medicineId: lot.medicineId || item.id,
                            name: lot.medicineName || 'Không xác định',
                            quantity: item.quantity,
                            unitPrice: salePrice,
                            unit: unit,
                            dosage: item.dosage || '',
                            frequency: item.frequency || '',
                            duration: item.duration || '',
                            instruction: item.usageInstructions || '',
                            stockQuantity: lot.quantityOnHand,
                        };
                    } catch (err) {
                        console.warn('Error loading lot info:', err);
                        return {
                            medicineId: item.id,
                            name: 'Không xác định',
                            quantity: item.quantity,
                            unitPrice: item.priceAtDispense,
                            unit: 'viên',
                            dosage: item.dosage || '',
                            frequency: item.frequency || '',
                            duration: item.duration || '',
                            instruction: item.usageInstructions || '',
                        };
                    }
                })
            );

            setItems(prescriptionItems);
        } catch (error) {
            console.error('Error loading prescription:', error);
            toast.error('Không thể tải thông tin đơn thuốc');
        } finally {
            setLoading(false);
        }
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

    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-neutral-background">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-text/60">Đang tải thông tin...</p>
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
                        <h1 className="typo-h3">Xem Đơn Thuốc</h1>
                        <p className="text-sm text-neutral-text/60 mt-1">
                            {appointmentId && `Mã lịch hẹn: ${appointmentId.slice(-8)}`}
                            {dispenseOrder && ` • Trạng thái: ${dispenseOrder.status}`}
                        </p>
                    </div>
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
                                        <p className="text-sm text-neutral-text">{patient?.gender || 'N/A'}</p>
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
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Prescription Items (70%) */}
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-background">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Prescription Items */}
                        {items.length === 0 ? (
                            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                                <CardContent className="p-16 text-center">
                                    <p className="text-neutral-text/60">Đơn thuốc không có thuốc nào.</p>
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
                                                </div>

                                                {/* Expandable Details */}
                                                {isExpanded && (
                                                    <div className="ml-9 mt-5 space-y-4 p-4 bg-neutral-muted/30 rounded-lg">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Số lượng
                                                                </label>
                                                                <Input
                                                                    value={item.quantity}
                                                                    disabled
                                                                    className="bg-neutral-muted border-neutral-border/30 rounded-lg"
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

                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Liều dùng
                                                                </label>
                                                                <Input
                                                                    value={item.dosage}
                                                                    disabled
                                                                    className="bg-neutral-muted border-neutral-border/30 rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Tần suất
                                                                </label>
                                                                <Input
                                                                    value={item.frequency}
                                                                    disabled
                                                                    className="bg-neutral-muted border-neutral-border/30 rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                    Thời gian
                                                                </label>
                                                                <Input
                                                                    value={item.duration}
                                                                    disabled
                                                                    className="bg-neutral-muted border-neutral-border/30 rounded-lg"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-semibold text-neutral-text block mb-2">
                                                                Hướng dẫn sử dụng
                                                            </label>
                                                            <Textarea
                                                                value={item.instruction}
                                                                disabled
                                                                rows={2}
                                                                className="bg-neutral-muted border-neutral-border/30 rounded-lg"
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
        </div>
    );
}

