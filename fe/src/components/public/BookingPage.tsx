import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Sparkles, Crown, Activity, Stethoscope } from 'lucide-react';
import { DoctorCard } from './DoctorCard';
import { toast } from 'sonner';

interface BookingPageProps {
  onBack: () => void;
  preselectedService?: string;
  preselectedDoctor?: string;
}

const mockServices = [
  { id: '1', name: 'Tẩy trắng răng', price: '2.500.000đ', icon: <Sparkles className="w-[20px] h-[20px]" /> },
  { id: '2', name: 'Niềng răng Invisalign', price: '85.000.000đ', icon: <Activity className="w-[20px] h-[20px]" /> },
  { id: '3', name: 'Cấy ghép Implant', price: '25.000.000đ', icon: <Stethoscope className="w-[20px] h-[20px]" /> },
  { id: '4', name: 'Bọc răng sứ thẩm mỹ', price: '5.500.000đ', icon: <Crown className="w-[20px] h-[20px]" /> },
  { id: '5', name: 'Vệ sinh răng miệng', price: '350.000đ', icon: <Sparkles className="w-[20px] h-[20px]" /> },
  { id: '6', name: 'Nhổ răng khôn', price: '1.500.000đ', icon: <Stethoscope className="w-[20px] h-[20px]" /> },
];

const mockDoctors = [
  { id: 'any', name: 'Bác sĩ bất kỳ', specialty: 'Hệ thống sẽ chọn bác sĩ phù hợp', image: '' },
  { id: '1', name: 'BS. Nguyễn Văn An', specialty: 'Chuyên gia Niềng răng', image: 'https://images.unsplash.com/photo-1631596577204-53ad0d6e6978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZW50aXN0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYyMTQ0MzU5fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '2', name: 'BS. Trần Thị Bình', specialty: 'Chuyên gia Răng sứ thẩm mỹ', image: 'https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkZW50aXN0JTIwc21pbGluZ3xlbnwxfHx8fDE3NjIwNzcyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '3', name: 'BS. Lê Hoàng Cường', specialty: 'Chuyên gia Cấy ghép Implant', image: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MjA2OTA2OXww&ixlib=rb-4.1.0&q=80&w=1080' },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export function BookingPage({ onBack, preselectedService, preselectedDoctor }: BookingPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(preselectedService || '');
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || 'any');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [searchService, setSearchService] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 5;

  const filteredServices = mockServices.filter(service =>
    service.name.toLowerCase().includes(searchService.toLowerCase())
  );

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Vui lòng hoàn thành thông tin trước khi tiếp tục');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    toast.success('Đặt lịch thành công!');
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedService !== '';
      case 2: return selectedDoctor !== '';
      case 3: return selectedDate !== undefined && selectedTime !== '';
      case 4: return formData.fullName && formData.phone;
      default: return true;
    }
  };

  const getSelectedServiceName = () => {
    return mockServices.find(s => s.id === selectedService)?.name || '';
  };

  const getSelectedDoctorName = () => {
    return mockDoctors.find(d => d.id === selectedDoctor)?.name || '';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ebf6fc] to-[#fcfeff] flex flex-col">
        {/* DoctorHeader */}
        <div className="bg-[#fcfeff] border-b border-[#ebf6fc]">
          <div className="max-w-[1400px] mx-auto px-[20px] sm:px-[40px] py-[20px]">
            <button
              onClick={onBack}
              className="flex items-center gap-[8px] text-[#3fb5ff] hover:text-[#3fb5ff]/80 transition-colors"
            >
              <ArrowLeft className="w-[20px] h-[20px]" />
              <span className="font-['Fz_Poppins:Medium',sans-serif] text-[15px]">
                Về trang chủ
              </span>
            </button>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center p-[20px] sm:p-[40px]">
          <div className="bg-[#fcfeff] rounded-[24px] w-full max-w-[600px] p-[40px] sm:p-[60px] text-center shadow-[0px_10px_40px_0px_rgba(0,0,0,0.08)]">
            <div className="w-[100px] h-[100px] bg-gradient-to-br from-[#3fb5ff] to-[#3fb5ff]/70 rounded-full flex items-center justify-center mx-auto mb-[24px] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
              <Check className="w-[60px] h-[60px] text-[#fcfeff]" strokeWidth={3} />
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[32px] mb-[12px]">
              Đặt lịch thành công!
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px] leading-[26px] mb-[32px]">
              Cảm ơn bạn đã đặt lịch hẹn tại DentalCareX. Chúng tôi sẽ gọi điện xác nhận trong thời gian sớm nhất.
            </p>

            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-[#ebf6fc] to-[#fcfeff] rounded-[20px] p-[32px] space-y-[16px] mb-[32px] border border-[#d6edfa]">
              <div className="flex justify-between items-start pb-[16px] border-b border-[#d6edfa]">
                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[15px]">Dịch vụ:</span>
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px] text-right max-w-[250px]">
                  {getSelectedServiceName()}
                </span>
              </div>
              <div className="flex justify-between items-start pb-[16px] border-b border-[#d6edfa]">
                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[15px]">Bác sĩ:</span>
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px] text-right max-w-[250px]">
                  {getSelectedDoctorName()}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[15px]">Ngày giờ:</span>
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[15px] text-right">
                  {selectedDate?.toLocaleDateString('vi-VN')} - {selectedTime}
                </span>
              </div>
            </div>

            <Button
              onClick={onBack}
              className="w-full bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] h-[56px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.5)]"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfeff] flex flex-col">
      {/* DoctorHeader */}
      <div className="bg-[#fcfeff] border-b border-[#ebf6fc] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[40px] py-[20px]">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-[8px] text-[#3fb5ff] hover:text-[#3fb5ff]/80 transition-colors"
            >
              <ArrowLeft className="w-[20px] h-[20px]" />
              <span className="font-['Fz_Poppins:Medium',sans-serif] text-[15px]">
                Quay lại
              </span>
            </button>
            <div className="text-right">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px]">
                Đặt lịch hẹn
              </h2>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                Bước {currentStep} / {totalSteps}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] sticky top-[80px] z-10">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[40px] py-[24px]">
          <div className="flex items-center justify-between mb-[12px]">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] transition-all ${
                  step <= currentStep 
                    ? 'bg-[#3fb5ff] text-[#fcfeff] shadow-[0px_4px_12px_0px_rgba(63,181,255,0.4)]' 
                    : 'bg-[#fcfeff] text-[#999999] border-2 border-[#d6edfa]'
                }`}>
                  {step < currentStep ? <Check className="w-[20px] h-[20px]" /> : step}
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-[4px] mx-[8px] rounded-full transition-all ${
                    step < currentStep ? 'bg-[#3fb5ff]' : 'bg-[#d6edfa]'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[13px] font-['Fz_Poppins:Medium',sans-serif]">
            <span className={currentStep === 1 ? 'text-[#3fb5ff]' : 'text-[#999999]'}>Dịch vụ</span>
            <span className={currentStep === 2 ? 'text-[#3fb5ff]' : 'text-[#999999]'}>Bác sĩ</span>
            <span className={currentStep === 3 ? 'text-[#3fb5ff]' : 'text-[#999999]'}>Ngày giờ</span>
            <span className={currentStep === 4 ? 'text-[#3fb5ff]' : 'text-[#999999]'}>Thông tin</span>
            <span className={currentStep === 5 ? 'text-[#3fb5ff]' : 'text-[#999999]'}>Xác nhận</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-[#fcfeff] to-[#ebf6fc]">
        <div className="max-w-[1200px] mx-auto px-[20px] sm:px-[40px] py-[40px]">
          <div className="bg-[#fcfeff] rounded-[24px] p-[32px] sm:p-[48px] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.05)] min-h-[500px]">
            
            {/* Step 1: Select Service */}
            {currentStep === 1 && (
              <div className="space-y-[32px]">
                <div>
                  <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[8px]">
                    Chọn dịch vụ
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                    Vui lòng chọn dịch vụ bạn muốn sử dụng
                  </p>
                </div>
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  {filteredServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-[24px] rounded-[16px] border-2 transition-all text-left hover:shadow-lg ${
                        selectedService === service.id
                          ? 'border-[#3fb5ff] bg-[#ebf6fc] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.2)]'
                          : 'border-[#ebf6fc] bg-[#fcfeff] hover:border-[#3fb5ff]/50'
                      }`}
                    >
                      <div className="flex items-start gap-[16px]">
                        <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center ${
                          selectedService === service.id ? 'bg-[#3fb5ff] text-[#fcfeff]' : 'bg-[#ebf6fc] text-[#3fb5ff]'
                        }`}>
                          {service.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px] mb-[4px]">
                            {service.name}
                          </h4>
                          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[15px]">
                            {service.price}
                          </p>
                        </div>
                        {selectedService === service.id && (
                          <Check className="w-[24px] h-[24px] text-[#3fb5ff]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Doctor */}
            {currentStep === 2 && (
              <div className="space-y-[32px]">
                <div>
                  <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[8px]">
                    Chọn bác sĩ
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                    Chọn bác sĩ bạn muốn thăm khám hoặc để hệ thống tự động sắp xếp
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  {mockDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className={`p-[24px] rounded-[16px] border-2 transition-all text-left hover:shadow-lg ${
                        selectedDoctor === doctor.id
                          ? 'border-[#3fb5ff] bg-[#ebf6fc] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.2)]'
                          : 'border-[#ebf6fc] bg-[#fcfeff] hover:border-[#3fb5ff]/50'
                      }`}
                    >
                      <div className="flex items-start gap-[16px]">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-[60px] h-[60px] rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#3fb5ff] to-[#3fb5ff]/70 flex items-center justify-center">
                            <svg className="w-[30px] h-[30px] text-[#fcfeff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px] mb-[4px]">
                            {doctor.name}
                          </h4>
                          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                            {doctor.specialty}
                          </p>
                        </div>
                        {selectedDoctor === doctor.id && (
                          <Check className="w-[24px] h-[24px] text-[#3fb5ff]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Date & Time */}
            {currentStep === 3 && (
              <div className="space-y-[32px]">
                <div>
                  <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[8px]">
                    Chọn ngày và giờ
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                    Chọn thời gian phù hợp với lịch trình của bạn
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-[32px]">
                  <div>
                    <label className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#333333] text-[15px] mb-[12px] block">
                      Chọn ngày
                    </label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date: Date) => date < new Date()}
                      className="rounded-[16px] border-2 border-[#ebf6fc] p-[16px] bg-[#fcfeff]"
                    />
                  </div>
                  <div>
                    <label className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#333333] text-[15px] mb-[12px] block">
                      Chọn giờ
                    </label>
                    <div className="grid grid-cols-3 gap-[12px] max-h-[380px] overflow-y-auto p-[4px]">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-[12px] px-[16px] rounded-[10px] font-['Fz_Poppins:Medium',sans-serif] text-[15px] transition-all ${
                            selectedTime === time
                              ? 'bg-[#3fb5ff] text-[#fcfeff] shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]'
                              : 'bg-[#ebf6fc] text-[#333333] hover:bg-[#3fb5ff]/20'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Patient Information */}
            {currentStep === 4 && (
              <div className="space-y-[32px]">
                <div>
                  <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[8px]">
                    Thông tin của bạn
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                    Vui lòng cung cấp thông tin để chúng tôi liên hệ xác nhận
                  </p>
                </div>
                <div className="space-y-[24px] max-w-[600px]">
                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nhập họ và tên đầy đủ"
                      className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Nhập email (không bắt buộc)"
                      className="h-[52px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff]"
                    />
                  </div>
                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px] mb-[8px] block">
                      Ghi chú
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ghi chú thêm về tình trạng răng miệng hoặc yêu cầu đặc biệt..."
                      className="min-h-[120px] rounded-[12px] border-[#ebf6fc] focus:border-[#3fb5ff] focus:ring-[#3fb5ff] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-[32px]">
                <div>
                  <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[8px]">
                    Xác nhận thông tin
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                    Vui lòng kiểm tra lại thông tin trước khi xác nhận
                  </p>
                </div>
                <div className="max-w-[700px] space-y-[24px]">
                  <div className="bg-gradient-to-br from-[#ebf6fc] to-[#fcfeff] rounded-[20px] p-[32px] space-y-[20px] border border-[#d6edfa]">
                    <div className="pb-[20px] border-b border-[#d6edfa]">
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                        Dịch vụ
                      </p>
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px]">
                        {getSelectedServiceName()}
                      </p>
                    </div>
                    <div className="pb-[20px] border-b border-[#d6edfa]">
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                        Bác sĩ
                      </p>
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px]">
                        {getSelectedDoctorName()}
                      </p>
                    </div>
                    <div className="pb-[20px] border-b border-[#d6edfa]">
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                        Thời gian
                      </p>
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[17px]">
                        {selectedDate?.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {' - '}
                        {selectedTime}
                      </p>
                    </div>
                    <div className="pb-[20px] border-b border-[#d6edfa]">
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                        Thông tin liên hệ
                      </p>
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px] mb-[4px]">
                        {formData.fullName}
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
                        {formData.phone}
                        {formData.email && ` • ${formData.email}`}
                      </p>
                    </div>
                    {formData.notes && (
                      <div>
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                          Ghi chú
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[15px] leading-[24px]">
                          {formData.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-[#fff8e6] border border-[#ffeaa7] rounded-[16px] p-[20px]">
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#d68910] text-[14px] leading-[22px]">
                      💡 Lưu ý: Chúng tôi sẽ gọi điện xác nhận lịch hẹn trong vòng 30 phút. Vui lòng giữ máy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-[32px] gap-[16px]">
            <Button
              onClick={handleBackStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-[32px] h-[56px] rounded-[12px] border-2 border-[#ebf6fc] hover:border-[#3fb5ff] hover:bg-[#ebf6fc] disabled:opacity-50 disabled:cursor-not-allowed font-['Fz_Poppins:SemiBold',sans-serif] text-[16px]"
            >
              <ChevronLeft className="w-[20px] h-[20px] mr-[8px]" />
              Quay lại
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-[48px] h-[56px] bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.5)]"
              >
                Tiếp tục
                <ChevronRight className="w-[20px] h-[20px] ml-[8px]" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="px-[48px] h-[56px] bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.5)]"
              >
                <Check className="w-[20px] h-[20px] mr-[8px]" />
                Xác nhận đặt lịch
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
