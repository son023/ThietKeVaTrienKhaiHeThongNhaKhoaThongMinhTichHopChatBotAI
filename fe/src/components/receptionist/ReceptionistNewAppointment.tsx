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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl text-[#01304e]">Đặt lịch hẹn mới</h1>
            <p className="text-gray-600">
              Bước {step} / 2: {step === 1 ? 'Thông tin Bệnh nhân' : 'Thông tin Lịch hẹn'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#3FB5FF] text-white' : 'bg-gray-200'}`}>
            {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <span className="text-sm">Thông tin BN</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200">
          <div className={`h-full ${step > 1 ? 'bg-[#3FB5FF]' : 'bg-gray-200'}`} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#3FB5FF] text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="text-sm">Lịch hẹn</span>
        </div>
      </div>

      {/* Step 1: Patient Info */}
      {step === 1 && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Search Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearchPhone} className="gap-2">
                  <Search className="w-4 h-4" />
                  Tìm kiếm
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Nhập SĐT để tìm kiếm bệnh nhân cũ. Nếu là bệnh nhân mới, vui lòng điền thông tin bên dưới.
              </p>
            </div>

            {existingPatient && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-green-900">Tìm thấy bệnh nhân!</p>
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
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên"
                  defaultValue={existingPatient?.name}
                  disabled={!!existingPatient}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  defaultValue={existingPatient?.email}
                  disabled={!!existingPatient}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  defaultValue={existingPatient?.birthDate}
                  disabled={!!existingPatient}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Input
                  id="gender"
                  placeholder="Nam/Nữ"
                  disabled={!!existingPatient}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  placeholder="Địa chỉ liên hệ"
                  defaultValue={existingPatient?.address}
                  disabled={!!existingPatient}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 gap-2"
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
        <Card className="p-6">
          <div className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label>Chọn Dịch vụ *</Label>
              <div className="grid grid-cols-3 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedService === service.id
                        ? 'border-[#3FB5FF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm text-[#01304e]">{service.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{service.duration} phút</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label>Chọn Bác sĩ *</Label>
              <div className="grid grid-cols-3 gap-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedDoctor === doctor.id
                        ? 'border-[#3FB5FF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm text-[#01304e]">{doctor.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{doctor.specialty}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Chọn Ngày *</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Chọn Giờ *</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2 rounded border text-sm ${
                        selectedTime === slot
                          ? 'bg-[#3FB5FF] text-white border-[#3FB5FF]'
                          : 'border-gray-200 hover:border-gray-300'
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
              <Label htmlFor="notes">Ghi chú cho lịch hẹn</Label>
              <Textarea
                id="notes"
                placeholder="Thêm ghi chú (nếu có)..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 gap-2"
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
