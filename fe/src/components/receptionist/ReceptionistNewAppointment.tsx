import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';

interface ReceptionistNewAppointmentProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ReceptionistNewAppointment({ onBack, onComplete }: ReceptionistNewAppointmentProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [existingPatient, setExistingPatient] = useState<any>(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const services = [
    { id: '1', name: 'Khám tổng quát', duration: 30 },
    { id: '2', name: 'Trám răng Composite', duration: 60 },
    { id: '3', name: 'Tẩy trắng răng', duration: 90 },
    { id: '4', name: 'Nhổ răng khôn', duration: 45 },
    { id: '5', name: 'Cạo vôi răng', duration: 30 },
    { id: '6', name: 'Niềng răng (Tư vấn)', duration: 60 },
  ];

  const doctors = [
    { id: '1', name: 'BS. Phạm Thị Ngọc Mai', specialty: 'Chỉnh nha' },
    { id: '2', name: 'BS. Lê Văn Anh', specialty: 'Nha khoa tổng quát' },
    { id: '3', name: 'BS. Nguyễn Thu Hà', specialty: 'Răng sứ thẩm mỹ' },
  ];

  const availableSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  const handleSearchPhone = () => {
    // Mock search
    if (phone === '0901234567') {
      setExistingPatient({
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@gmail.com',
        birthDate: '15/03/1985',
        address: '123 Nguyễn Huệ, Q1, TP.HCM',
      });
    } else {
      setExistingPatient(null);
    }
  };

  const handleComplete = () => {
    // Validate and submit
    onComplete();
  };

  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text tracking-tight">Đặt lịch hẹn mới</h1>
            <p className="text-neutral-text/70 font-medium mt-1">
              Bước {step} / 2: {step === 1 ? 'Thông tin Bệnh nhân' : 'Thông tin Lịch hẹn'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${step >= 1 ? 'bg-primary text-white shadow-md' : 'bg-neutral-muted text-neutral-text/40'}`}>
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium text-neutral-text">Thông tin BN</span>
          </div>
          <div className="flex-1 h-1.5 bg-neutral-tint rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${step > 1 ? 'bg-primary' : 'bg-neutral-tint'}`} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${step >= 2 ? 'bg-primary text-white shadow-md' : 'bg-neutral-muted text-neutral-text/40'}`}>
              2
            </div>
            <span className="text-sm font-medium text-neutral-text">Lịch hẹn</span>
          </div>
        </div>
      </Card>

      {/* Step 1: Patient Info */}
      {step === 1 && (
        <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
          <div className="space-y-6">
            {/* Search Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-neutral-text font-medium">Số điện thoại *</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
                />
                <Button onClick={handleSearchPhone} className="gap-2 bg-primary hover:bg-primary-strong shadow-sm transition-all">
                  <Search className="w-4 h-4" />
                  Tìm kiếm
                </Button>
              </div>
              <p className="text-xs text-neutral-text/60 leading-relaxed">
                Nhập SĐT để tìm kiếm bệnh nhân cũ. Nếu là bệnh nhân mới, vui lòng điền thông tin bên dưới.
              </p>
            </div>

            {existingPatient && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-900 font-semibold">Tìm thấy bệnh nhân!</p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>{existingPatient.name}</strong> - {existingPatient.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-text font-medium">Họ và tên *</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên"
                  defaultValue={existingPatient?.name}
                  disabled={!!existingPatient}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted disabled:text-neutral-text/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-text font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  defaultValue={existingPatient?.email}
                  disabled={!!existingPatient}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted disabled:text-neutral-text/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-neutral-text font-medium">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  defaultValue={existingPatient?.birthDate}
                  disabled={!!existingPatient}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted disabled:text-neutral-text/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-neutral-text font-medium">Giới tính</Label>
                <Input
                  id="gender"
                  placeholder="Nam/Nữ"
                  disabled={!!existingPatient}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted disabled:text-neutral-text/60"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address" className="text-neutral-text font-medium">Địa chỉ</Label>
                <Input
                  id="address"
                  placeholder="Địa chỉ liên hệ"
                  defaultValue={existingPatient?.address}
                  disabled={!!existingPatient}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted disabled:text-neutral-text/60"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                className="bg-primary hover:bg-primary-strong gap-2 shadow-sm transition-all duration-200"
                disabled={!phone}
              >
                Tiếp theo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Appointment Info */}
      {step === 2 && (
        <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
          <div className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-3">
              <Label className="text-neutral-text font-semibold text-base">Chọn Dịch vụ *</Label>
              <div className="grid grid-cols-3 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                      selectedService === service.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-neutral-border hover:border-neutral-subtle bg-neutral-surface'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-text">{service.name}</p>
                    <p className="text-xs text-neutral-text/60 mt-1.5">{service.duration} phút</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-3">
              <Label className="text-neutral-text font-semibold text-base">Chọn Bác sĩ *</Label>
              <div className="grid grid-cols-3 gap-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                      selectedDoctor === doctor.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-neutral-border hover:border-neutral-subtle bg-neutral-surface'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-text">{doctor.name}</p>
                    <p className="text-xs text-neutral-text/60 mt-1.5">{doctor.specialty}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-neutral-text font-medium">Chọn Ngày *</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-text font-medium">Chọn Giờ *</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-3 border-2 border-neutral-border rounded-lg bg-neutral-muted/20">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        selectedTime === slot
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'border-neutral-border hover:border-primary hover:bg-neutral-muted bg-neutral-surface'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-neutral-text font-medium">Ghi chú cho lịch hẹn</Label>
              <Textarea
                id="notes"
                placeholder="Thêm ghi chú (nếu có)..."
                rows={3}
                className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-neutral-border">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2 border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-primary hover:bg-primary-strong gap-2 shadow-sm transition-all duration-200"
                disabled={!selectedService || !selectedDoctor || !selectedDate || !selectedTime}
              >
                <CheckCircle2 className="w-4 h-4" />
                Hoàn tất Đặt lịch
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
