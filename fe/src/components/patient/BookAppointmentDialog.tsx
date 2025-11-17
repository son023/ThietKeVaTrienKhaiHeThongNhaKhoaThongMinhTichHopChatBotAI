import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone, MessageSquare, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner';

interface BookAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// Mock data
const services = [
    { id: '1', name: 'Khám tổng quát', duration: '45 phút', price: '200.000đ' },
    { id: '2', name: 'Tẩy trắng răng', duration: '60 phút', price: '2.500.000đ' },
    { id: '3', name: 'Niềng răng Invisalign', duration: '90 phút', price: 'Tư vấn' },
    { id: '4', name: 'Cấy ghép Implant', duration: '120 phút', price: '25.000.000đ' },
    { id: '5', name: 'Bọc răng sứ', duration: '60 phút', price: '5.500.000đ' },
    { id: '6', name: 'Vệ sinh răng miệng', duration: '30 phút', price: '350.000đ' },
    { id: '7', name: 'Nhổ răng khôn', duration: '45 phút', price: '1.500.000đ' },
    { id: '8', name: 'Trám răng', duration: '30 phút', price: '500.000đ' },
];

const doctors = [
    { id: '1', name: 'BS. Nguyễn Văn A', specialty: 'Chuyên khoa Chỉnh nha' },
    { id: '2', name: 'BS. Trần Thị B', specialty: 'Chuyên khoa Implant' },
    { id: '3', name: 'BS. Lê Văn C', specialty: 'Chuyên khoa Thẩm mỹ' },
    { id: '4', name: 'BS. Phạm Thị D', specialty: 'Chuyên khoa Tổng quát' },
];

const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export function BookAppointmentDialog({ isOpen, onClose, onSuccess }: BookAppointmentDialogProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        service: '',
        doctor: '',
        date: undefined as Date | undefined,
        time: '',
        patientName: 'Nguyễn Văn B',
        patientPhone: '0901234567',
        patientEmail: 'patient@gmail.com',
        notes: ''
    });

    const handleClose = () => {
        setCurrentStep(1);
        setFormData({
            service: '',
            doctor: '',
            date: undefined,
            time: '',
            patientName: 'Nguyễn Văn B',
            patientPhone: '0901234567',
            patientEmail: 'patient@gmail.com',
            notes: ''
        });
        onClose();
    };

    const handleNext = () => {
        if (currentStep === 1 && !formData.service) {
            toast.error('Vui lòng chọn dịch vụ');
            return;
        }
        if (currentStep === 2 && !formData.doctor) {
            toast.error('Vui lòng chọn bác sĩ');
            return;
        }
        if (currentStep === 3 && (!formData.date || !formData.time)) {
            toast.error('Vui lòng chọn ngày và giờ khám');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = () => {
        // Validate
        if (!formData.patientName || !formData.patientPhone) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        // Submit booking
        console.log('Booking data:', formData);

        toast.success('Đặt lịch hẹn thành công!', {
            description: `Bạn đã đặt lịch khám ${services.find(s => s.id === formData.service)?.name} vào ${formData.date?.toLocaleDateString('vi-VN')} lúc ${formData.time}`
        });

        handleClose();
        if (onSuccess) {
            onSuccess();
        }
    };

    const selectedService = services.find(s => s.id === formData.service);
    const selectedDoctor = doctors.find(d => d.id === formData.doctor);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Đặt lịch hẹn khám</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Bước {currentStep}/4: {
                        currentStep === 1 ? 'Chọn dịch vụ' :
                            currentStep === 2 ? 'Chọn bác sĩ' :
                                currentStep === 3 ? 'Chọn thời gian' :
                                    'Xác nhận thông tin'
                    }
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`flex-1 h-2 rounded-full transition-colors ${
                                step <= currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                        />
                    ))}
                </div>

                {/* Step 1: Select Service */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <Label className="text-foreground">Chọn dịch vụ khám</Label>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setFormData({ ...formData, service: service.id })}
                                    className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                                        formData.service === service.id
                                            ? 'border-primary bg-accent'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-foreground mb-1">{service.name}</h4>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                            {service.duration}
                        </span>
                                                <span className="text-primary">{service.price}</span>
                                            </div>
                                        </div>
                                        {formData.service === service.id && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Doctor */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <Label className="text-foreground">Chọn bác sĩ</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {doctors.map((doctor) => (
                                <button
                                    key={doctor.id}
                                    onClick={() => setFormData({ ...formData, doctor: doctor.id })}
                                    className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                                        formData.doctor === doctor.id
                                            ? 'border-primary bg-accent'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-foreground mb-1">{doctor.name}</h4>
                                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                            </div>
                                        </div>
                                        {formData.doctor === doctor.id && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Select Date & Time */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-foreground mb-3 block">Chọn ngày khám</Label>
                            <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={(date) => setFormData({ ...formData, date })}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                }}
                                className="rounded-md border border-border"
                            />
                        </div>

                        {formData.date && (
                            <div>
                                <Label className="text-foreground mb-3 block">Chọn giờ khám</Label>
                                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                                    {timeSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setFormData({ ...formData, time })}
                                            className={`p-2 rounded-lg border text-sm transition-all ${
                                                formData.time === time
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-card text-foreground hover:border-primary'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Confirm Information */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        {/* Booking Summary */}
                        <div className="p-4 rounded-lg bg-accent border border-border">
                            <h4 className="text-foreground mb-3">Thông tin đặt lịch</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Dịch vụ:</span>
                                    <span className="text-foreground">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bác sĩ:</span>
                                    <span className="text-foreground">{selectedDoctor?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ngày khám:</span>
                                    <span className="text-foreground">{formData.date?.toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giờ khám:</span>
                                    <span className="text-foreground">{formData.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Thời gian:</span>
                                    <span className="text-foreground">{selectedService?.duration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="space-y-4">
                            <h4 className="text-foreground">Thông tin bệnh nhân</h4>

                            <div className="space-y-2">
                                <Label htmlFor="patientName" className="text-foreground">Họ và tên *</Label>
                                <Input
                                    id="patientName"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    placeholder="Nhập họ và tên"
                                    className="bg-background border-border text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="patientPhone" className="text-foreground">Số điện thoại *</Label>
                                <Input
                                    id="patientPhone"
                                    value={formData.patientPhone}
                                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                                    placeholder="Nhập số điện thoại"
                                    className="bg-background border-border text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="patientEmail" className="text-foreground">Email</Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    value={formData.patientEmail}
                                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                                    placeholder="Nhập email"
                                    className="bg-background border-border text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-foreground">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Nhập ghi chú (nếu có)"
                                    rows={3}
                                    className="bg-background border-border text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                    {currentStep > 1 && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="border-border text-foreground hover:bg-accent"
                        >
                            Quay lại
                        </Button>
                    )}

                    {currentStep < 4 ? (
                        <Button
                            onClick={handleNext}
                            className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Tiếp tục
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Xác nhận đặt lịch
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
