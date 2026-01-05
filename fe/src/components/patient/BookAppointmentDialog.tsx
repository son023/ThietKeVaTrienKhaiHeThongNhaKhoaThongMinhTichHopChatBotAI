import { useEffect, useMemo, useState } from 'react';
import { Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner';
import { medicalServiceController, MedicalServiceDTO } from '../../controllers/MedicalServiceController';
import { doctorController, DoctorWithUser } from '../../controllers/DoctorController';
import { appointmentController } from '../../controllers/AppointmentController';

interface BookAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
}

const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export function BookAppointmentDialog({
    isOpen,
    onClose,
    onSuccess,
    patientId,
    patientName,
    patientPhone,
    patientEmail,
}: BookAppointmentDialogProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [services, setServices] = useState<MedicalServiceDTO[]>([]);
    const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [holdingSlot, setHoldingSlot] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        services: [] as string[],
        doctor: '',
        date: undefined as Date | undefined,
        time: '',
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        notes: ''
    });

    const resetForm = () => {
        setCurrentStep(1);
        setFormData({
            services: [],
            doctor: '',
            date: undefined,
            time: '',
            patientName: patientName ?? '',
            patientPhone: patientPhone ?? '',
            patientEmail: patientEmail ?? '',
            notes: '',
        });
        setAvailableTimes([]);
    };

    const loadData = async () => {
        setLoadingData(true);
        try {
            const [serviceRes, doctorRes] = await Promise.all([
                medicalServiceController.getAll(),
                doctorController.getWithUserDetails(),
            ]);
            setServices(serviceRes);
            setDoctors(doctorRes);
        } catch (error) {
            toast.error('Không tải được dữ liệu lịch hẹn', {
                description: error instanceof Error ? error.message : undefined,
            });
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
            loadData();
        }
    }, [isOpen, patientId, patientName, patientPhone, patientEmail]);

    const combineDateTime = (date: Date, time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);
        return start;
    };

    const handleSelectService = (serviceId: string) => {
        setFormData(prev => {
            const exists = prev.services.includes(serviceId);
            const nextServices = exists
                ? prev.services.filter(id => id !== serviceId)
                : [...prev.services, serviceId];
            return { ...prev, services: nextServices, time: '', date: undefined };
        });
        setAvailableTimes([]);
    };

    const handleSelectDoctor = (doctorId: string) => {
        setFormData(prev => ({ ...prev, doctor: doctorId, time: '', date: undefined }));
        setAvailableTimes([]);
    };

    const handleSelectDate = (date?: Date) => {
        setFormData(prev => ({ ...prev, date, time: '' }));
        setAvailableTimes([]);
        if (date && formData.doctor && formData.services.length) {
            loadAvailableTimes(date, formData.doctor, formData.services);
        }
    };

    const loadAvailableTimes = async (date: Date, doctorId: string, serviceIds: string[]) => {
        setLoadingTimes(true);
        try {
            const appointments = await appointmentController.getByDoctorId(doctorId);
            const sameDayAppointments = appointments.filter(appt => {
                const start = new Date(appt.appointmentStartTime);
                return start.toDateString() === date.toDateString();
            });

            const duration = serviceIds
                .map(id => services.find(s => s.id === id)?.serviceTime || 30)
                .reduce((a, b) => a + b, 0) || 30;

            const freeSlots = timeSlots.filter(time => {
                const start = combineDateTime(date, time);
                const end = new Date(start.getTime() + duration * 60 * 1000);
                const overlap = sameDayAppointments.some(appt => {
                    const apptStart = new Date(appt.appointmentStartTime);
                    const apptEnd = new Date(appt.appointmentEndTime);
                    return start < apptEnd && end > apptStart;
                });
                return !overlap;
            });

            setAvailableTimes(freeSlots);
        } catch (error) {
            toast.error('Không tải được giờ trống', {
                description: error instanceof Error ? error.message : undefined,
            });
        } finally {
            setLoadingTimes(false);
        }
    };

    const handleSelectTime = async (time: string) => {
        if (!formData.services.length) {
            toast.error('Vui lòng chọn ít nhất 1 dịch vụ trước');
            return;
        }
        if (!formData.doctor) {
            toast.error('Vui lòng chọn bác sĩ trước');
            return;
        }
        if (!formData.date) {
            toast.error('Vui lòng chọn ngày khám');
            return;
        }
        if (!patientId) {
            toast.error('Thông tin bệnh nhân không hợp lệ');
            return;
        }

        const start = combineDateTime(formData.date, time);
        setHoldingSlot(true);
        try {
            await appointmentController.holdSlot({
                doctorId: formData.doctor,
                patientId: patientId,
                appointmentStartTime: start.toISOString(),
                medicalServiceIds: formData.services,
            });
            setFormData(prev => ({ ...prev, time }));
            toast.success('Đã giữ slot trong 15 phút');
        } catch (error) {
            toast.error('Không thể giữ slot', {
                description: error instanceof Error ? error.message : undefined,
            });
        } finally {
            setHoldingSlot(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleNext = () => {
        if (currentStep === 1 && !formData.services.length) {
            toast.error('Vui lòng chọn ít nhất 1 dịch vụ');
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

        if (!patientId) {
            toast.error('Thông tin bệnh nhân không hợp lệ');
            return;
        }

        if (!formData.services.length || !formData.doctor || !formData.date || !formData.time) {
            toast.error('Vui lòng chọn đầy đủ dịch vụ, bác sĩ, ngày và giờ khám');
            return;
        }

        const start = combineDateTime(formData.date, formData.time);

        setSubmitting(true);
        appointmentController.create({
            doctorId: formData.doctor,
            patientId: patientId,
            appointmentStartTime: start.toISOString(),
            medicalServiceIds: formData.services,
        })
            .then(() => {
                // toast.success('Đặt lịch hẹn thành công!', {
                //     description: `Bạn đã đặt lịch ${formData.services.length} dịch vụ vào ${formData.date?.toLocaleDateString('vi-VN')} lúc ${formData.time}`,
                // });
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                toast.error('Không thể đặt lịch hẹn', {
                    description: error instanceof Error ? error.message : undefined,
                });
            })
            .finally(() => setSubmitting(false));
    };

    const selectedServices = useMemo(
        () => services.filter(s => formData.services.includes(s.id)),
        [services, formData.services]
    );
    const selectedDoctor = doctors.find(d => d.userId === formData.doctor || d.user?.id === formData.doctor);
    const totalDuration = useMemo(
        () => selectedServices.reduce((sum, s) => sum + (s.serviceTime || 0), 0),
        [selectedServices]
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-[900px] sm:max-w-none sm:max-w-[700px] min-h-[70vh] max-h-[90vh] overflow-y-auto bg-white border-border"
                onInteractOutside={(e) => {
                    // Ngăn đóng dialog khi click ra ngoài
                    e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    //Ngăn đóng bằng phím ESC
                    e.preventDefault();
                }}
            >
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

                <div className="flex items-center gap-2 my-2">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`
                                flex-1 h-2 rounded-full 
                                ${step <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}
                            `}
                        />
                    ))}
                </div>

                {/* Step 1: Select Service */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <Label className="text-foreground">Chọn dịch vụ khám</Label>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                            {loadingData && <p className="text-sm text-muted-foreground">Đang tải dịch vụ...</p>}
                            {!loadingData && services.length === 0 && (
                                <p className="text-sm text-muted-foreground">Chưa có dịch vụ khả dụng.</p>
                            )}
                            {!loadingData && services.map((service) => {
                                const isSelected = formData.services.includes(service.id);
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => handleSelectService(service.id)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${isSelected
                                                ? 'border-primary bg-accent shadow-md ring-2 ring-primary/40'
                                                : 'border-border bg-card hover:shadow-sm'
                                            }`}
                                        aria-pressed={isSelected}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-foreground mb-1">{service.serviceName}</h4>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {service.serviceTime ? `${service.serviceTime} phút` : 'N/A'}
                                                    </span>
                                                    <span className="text-primary">
                                                        {service.price ? `${service.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Doctor */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <Label className="text-foreground">Chọn bác sĩ</Label>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                            {loadingData && <p className="text-sm text-muted-foreground">Đang tải bác sĩ...</p>}
                            {!loadingData && doctors.length === 0 && (
                                <p className="text-sm text-muted-foreground">Chưa có bác sĩ khả dụng.</p>
                            )}
                            {!loadingData && doctors.map((doctor) => (
                                <button
                                    key={doctor.userId}
                                    onClick={() => handleSelectDoctor(doctor.userId)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${formData.doctor === doctor.userId
                                            ? 'border-primary bg-accent shadow-md ring-2 ring-primary/40'
                                            : 'border-border bg-card hover:shadow-sm'
                                        }`}
                                    aria-pressed={formData.doctor === doctor.userId}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-foreground mb-1">{doctor.user?.fullName || 'Bác sĩ'}</h4>
                                                <p className="text-sm text-muted-foreground">{doctor.user?.email || ''}</p>
                                            </div>
                                        </div>
                                        {formData.doctor === doctor.userId && (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-foreground mb-3 block">Chọn ngày khám</Label>
                                <Calendar
                                    mode="single"
                                    selected={formData.date}
                                    onSelect={handleSelectDate}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                    }}
                                    className="rounded-md border border-border"
                                />
                            </div>

                            <div>
                                <Label className="text-foreground mb-3 block">Chọn giờ khám</Label>
                                {formData.date ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[240px] overflow-y-auto">
                                        {availableTimes.length === 0 && !loadingTimes && (
                                            <p className="text-sm text-muted-foreground col-span-full">Không còn giờ trống</p>
                                        )}
                                        {loadingTimes && (
                                            <p className="text-sm text-muted-foreground col-span-full">Đang tải giờ trống...</p>
                                        )}
                                        {!loadingTimes && availableTimes.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => handleSelectTime(time)}
                                                disabled={holdingSlot}
                                                className={`p-2 rounded-lg border text-sm transition-all ${formData.time === time
                                                        ? 'border-primary bg-primary text-primary-foreground shadow ring-2 ring-primary/50'
                                                        : 'border-border bg-card text-foreground hover:border-primary hover:shadow-sm'
                                                    }`}
                                                aria-pressed={formData.time === time}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Chọn ngày để xem giờ trống</p>
                                )}
                            </div>
                        </div>
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
                                    <span className="text-foreground">
                                        {selectedServices.length
                                            ? selectedServices.map(s => s.serviceName).join(', ')
                                            : 'Chưa chọn'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bác sĩ:</span>
                                    <span className="text-foreground">{selectedDoctor?.user?.fullName || selectedDoctor?.userId}</span>
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
                                    <span className="text-muted-foreground">Tổng thời gian:</span>
                                    <span className="text-foreground">
                                        {totalDuration ? `${totalDuration} phút` : 'N/A'}
                                    </span>
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
                                    readOnly
                                    disabled
                                    placeholder="Nhập họ và tên"
                                    className="bg-muted border-border text-foreground cursor-not-allowed opacity-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="patientPhone" className="text-foreground">Số điện thoại *</Label>
                                <Input
                                    id="patientPhone"
                                    value={formData.patientPhone}
                                    readOnly
                                    disabled
                                    placeholder="Nhập số điện thoại"
                                    className="bg-muted border-border text-foreground cursor-not-allowed opacity-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="patientEmail" className="text-foreground">Email</Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    value={formData.patientEmail}
                                    readOnly
                                    disabled
                                    placeholder="Nhập email"
                                    className="bg-muted border-border text-foreground cursor-not-allowed opacity-100"
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
                            disabled={submitting}
                        >
                            Quay lại
                        </Button>
                    )}

                    {currentStep < 4 ? (
                        <Button
                            onClick={handleNext}
                            className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={loadingData || submitting}
                        >
                            Tiếp tục
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={submitting || holdingSlot}
                        >
                            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
