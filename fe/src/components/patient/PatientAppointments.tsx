import { useState } from 'react';
import { Calendar, Clock, User, Phone, MapPin, Edit, X, RotateCcw, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

export function PatientAppointments() {
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Mock data - Upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      service: 'Khám tổng quát',
      doctor: 'BS. Nguyễn Văn A',
      doctorPhone: '0912345678',
      date: '15/11/2024',
      time: '09:00',
      duration: '45 phút',
      location: 'Phòng 101, Tầng 2',
      status: 'confirmed',
      notes: 'Nhớ mang theo sổ khám bệnh'
    },
    {
      id: 2,
      service: 'Tái khám niềng răng',
      doctor: 'BS. Trần Thị B',
      doctorPhone: '0987654321',
      date: '20/11/2024',
      time: '14:30',
      duration: '30 phút',
      location: 'Phòng 203, Tầng 2',
      status: 'confirmed',
      notes: ''
    },
    {
      id: 3,
      service: 'Lấy cao răng',
      doctor: 'BS. Lê Văn C',
      doctorPhone: '0923456789',
      date: '25/11/2024',
      time: '10:00',
      duration: '60 phút',
      location: 'Phòng 105, Tầng 1',
      status: 'pending',
      notes: 'Chờ xác nhận từ phòng khám'
    }
  ];

  // Mock data - Past appointments
  const pastAppointments = [
    {
      id: 4,
      service: 'Khám tổng quát',
      doctor: 'BS. Nguyễn Văn A',
      date: '01/11/2024',
      time: '09:30',
      status: 'completed',
      diagnosis: 'Viêm nướu nhẹ',
      nextVisit: '15/11/2024'
    },
    {
      id: 5,
      service: 'Tẩy trắng răng',
      doctor: 'BS. Phạm Thị D',
      date: '15/10/2024',
      time: '14:00',
      status: 'completed',
      diagnosis: 'Hoàn thành tẩy trắng răng',
      nextVisit: null
    },
    {
      id: 6,
      service: 'Cạo vôi răng',
      doctor: 'BS. Lê Văn C',
      date: '01/10/2024',
      time: '10:30',
      status: 'completed',
      diagnosis: 'Vôi răng nhiều, đã làm sạch',
      nextVisit: '01/04/2025'
    },
    {
      id: 7,
      service: 'Khám định kỳ',
      doctor: 'BS. Nguyễn Văn A',
      date: '15/09/2024',
      time: '09:00',
      status: 'cancelled',
      diagnosis: null,
      nextVisit: null
    }
  ];

  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const handleRescheduleAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowRescheduleDialog(true);
  };

  const handleBookAgain = (appointment: any) => {
    // Navigate to booking page with pre-filled service and doctor
    console.log('Book again:', appointment);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-[12px] py-[6px] bg-[#e8f5e9] text-[#4caf50] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] flex items-center gap-[6px]">
            <CheckCircle className="w-[14px] h-[14px]" />
            Đã xác nhận
          </span>
        );
      case 'pending':
        return (
          <span className="px-[12px] py-[6px] bg-[#fff3e0] text-[#ff9800] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] flex items-center gap-[6px]">
            <AlertCircle className="w-[14px] h-[14px]" />
            Chờ xác nhận
          </span>
        );
      case 'completed':
        return (
          <span className="px-[12px] py-[6px] bg-[#e3f2fd] text-[#2196f3] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]">
            Đã hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-[12px] py-[6px] bg-[#ffebee] text-[#f44336] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-neutral-background py-[40px] px-[20px] md:px-[80px] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-neutral-text text-[28px] md:text-[32px] mb-[8px]">
            Quản lý lịch hẹn
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[16px]">
            Xem và quản lý tất cả các lịch hẹn của bạn
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-[32px]">
            <TabsTrigger value="upcoming" className="font-['Fz_Poppins:Medium',sans-serif]">
              Lịch hẹn sắp tới ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="font-['Fz_Poppins:Medium',sans-serif]">
              Lịch sử khám ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments Tab */}
          <TabsContent value="upcoming" className="space-y-[20px]">
            {upcomingAppointments.length === 0 ? (
              <Card className="p-[40px] text-center border-neutral-border bg-neutral-surface">
                <Calendar className="w-[64px] h-[64px] text-neutral-text/20 mx-auto mb-[16px]" />
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[18px] mb-[8px]">
                  Chưa có lịch hẹn
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[14px] mb-[24px]">
                  Bạn chưa có lịch hẹn nào sắp tới
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary-strong text-white hover:shadow-lg transition-all duration-200">
                  <Calendar className="w-[18px] h-[18px] mr-[8px]" />
                  Đặt lịch hẹn mới
                </Button>
              </Card>
            ) : (
              <>
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-[24px] md:p-[32px] border-neutral-border bg-neutral-surface hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
                    <div className="flex flex-col lg:flex-row gap-[24px]">
                      {/* Left side - Main info */}
                      <div className="flex-1 space-y-[16px]">
                        <div className="flex items-start justify-between gap-[16px]">
                          <div>
                            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[8px]">
                              {appointment.service}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                          <div className="flex items-start gap-[12px]">
                            <div className="w-[40px] h-[40px] bg-[#ebf6fc] rounded-[10px] flex items-center justify-center flex-shrink-0">
                              <User className="w-[20px] h-[20px] text-[#3fb5ff]" />
                            </div>
                            <div>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mb-[2px]">
                                Bác sĩ
                              </p>
                              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                                {appointment.doctor}
                              </p>
                              <a
                                href={`tel:${appointment.doctorPhone}`}
                                className="font-['Fz_Poppins:Regular',sans-serif] text-[#3fb5ff] text-[13px] hover:underline flex items-center gap-[4px] mt-[4px]"
                              >
                                <Phone className="w-[12px] h-[12px]" />
                                {appointment.doctorPhone}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-[12px]">
                            <div className="w-[40px] h-[40px] bg-[#ebf6fc] rounded-[10px] flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-[20px] h-[20px] text-[#3fb5ff]" />
                            </div>
                            <div>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mb-[2px]">
                                Ngày & Giờ
                              </p>
                              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                                {appointment.date}
                              </p>
                              <div className="flex items-center gap-[8px] mt-[4px]">
                                <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                  {appointment.time}
                                </span>
                                <span className="text-[#d6edfa]">•</span>
                                <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                  {appointment.duration}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-[12px] sm:col-span-2">
                            <div className="w-[40px] h-[40px] bg-[#ebf6fc] rounded-[10px] flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-[20px] h-[20px] text-[#3fb5ff]" />
                            </div>
                            <div>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mb-[2px]">
                                Địa điểm
                              </p>
                              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                                {appointment.location}
                              </p>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mt-[2px]">
                                Tầng 2, TTTM Mandarin Garden 2, Hà Nội
                              </p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="bg-[#fffbf0] border border-[#ffe082] rounded-[12px] p-[16px]">
                            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#ff9800] text-[13px] mb-[4px]">
                              Lưu ý:
                            </p>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex lg:flex-col gap-[12px] lg:w-[160px]">
                        <button
                          onClick={() => handleRescheduleAppointment(appointment)}
                          className="flex-1 lg:flex-none bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] px-[16px] py-[12px] rounded-[10px] font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#ebf6fc] transition-all flex items-center justify-center gap-[8px]"
                        >
                          <Edit className="w-[16px] h-[16px]" />
                          Đổi lịch
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment)}
                          className="flex-1 lg:flex-none bg-white border-2 border-[#f44336] text-[#f44336] px-[16px] py-[12px] rounded-[10px] font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#ffebee] transition-all flex items-center justify-center gap-[8px]"
                        >
                          <X className="w-[16px] h-[16px]" />
                          Hủy lịch
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Past Appointments Tab */}
          <TabsContent value="history" className="space-y-[20px]">
            {pastAppointments.length === 0 ? (
              <Card className="p-[40px] text-center border-[#ebf6fc]">
                <Clock className="w-[64px] h-[64px] text-[#d6edfa] mx-auto mb-[16px]" />
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[8px]">
                  Chưa có lịch sử khám
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                  Bạn chưa có lịch sử khám bệnh nào
                </p>
              </Card>
            ) : (
              <>
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-[24px] md:p-[32px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all">
                    <div className="flex flex-col lg:flex-row gap-[24px]">
                      {/* Left side - Main info */}
                      <div className="flex-1 space-y-[16px]">
                        <div className="flex items-start justify-between gap-[16px] flex-wrap">
                          <div>
                            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[8px]">
                              {appointment.service}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="text-right">
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mb-[2px]">
                              Ngày khám
                            </p>
                            <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                              {appointment.date} • {appointment.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-[12px]">
                          <User className="w-[18px] h-[18px] text-[#666666]" />
                          <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                            {appointment.doctor}
                          </span>
                        </div>

                        {appointment.diagnosis && (
                          <div className="bg-[#f5fbff] border border-[#d6edfa] rounded-[12px] p-[16px]">
                            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[13px] mb-[4px]">
                              Kết quả khám:
                            </p>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                              {appointment.diagnosis}
                            </p>
                            {appointment.nextVisit && (
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] mt-[8px]">
                                Tái khám: <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff]">{appointment.nextVisit}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right side - Actions */}
                      {appointment.status === 'completed' && (
                        <div className="flex lg:flex-col gap-[12px] lg:w-[160px]">
                          <button
                            onClick={() => handleBookAgain(appointment)}
                            className="flex-1 lg:flex-none bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] text-white px-[16px] py-[12px] rounded-[10px] font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all flex items-center justify-center gap-[8px]"
                          >
                            <RotateCcw className="w-[16px] h-[16px]" />
                            Đặt lại
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">
                Xác nhận hủy lịch hẹn
              </DialogTitle>
              <DialogDescription className="font-['Fz_Poppins:Regular',sans-serif]">
                Bạn có chắc chắn muốn hủy lịch hẹn này không?
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="bg-[#f5fbff] rounded-[12px] p-[16px] space-y-[8px]">
                <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                  {selectedAppointment.service}
                </p>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                  {selectedAppointment.date} • {selectedAppointment.time}
                </p>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                  Bác sĩ: {selectedAppointment.doctor}
                </p>
              </div>
            )}
            <DialogFooter className="flex gap-[12px]">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 font-['Fz_Poppins:Medium',sans-serif]"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  // Handle cancel logic
                  setShowCancelDialog(false);
                }}
                className="flex-1 bg-[#f44336] hover:bg-[#d32f2f] font-['Fz_Poppins:SemiBold',sans-serif]"
              >
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">
                Đổi lịch hẹn
              </DialogTitle>
              <DialogDescription className="font-['Fz_Poppins:Regular',sans-serif]">
                Chức năng đổi lịch sẽ được cập nhật sớm. Vui lòng liên hệ với phòng khám để đổi lịch hẹn.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-[#fffbf0] border border-[#ffe082] rounded-[12px] p-[16px]">
              <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#ff9800] text-[14px] mb-[8px]">
                Liên hệ:
              </p>
              <a
                href="tel:+84583891780"
                className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[15px] hover:underline"
              >
                +84 583891780
              </a>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowRescheduleDialog(false)}
                className="w-full bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] font-['Fz_Poppins:SemiBold',sans-serif]"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
