import { Calendar, Clock, FileText, CreditCard, Activity, ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  // Mock data
  const upcomingAppointments = [
    {
      id: 1,
      service: 'Khám tổng quát',
      doctor: 'BS. Nguyễn Văn A',
      date: '15/11/2024',
      time: '09:00',
      status: 'confirmed'
    },
    {
      id: 2,
      service: 'Tái khám niềng răng',
      doctor: 'BS. Trần Thị B',
      date: '20/11/2024',
      time: '14:30',
      status: 'confirmed'
    }
  ];

  const treatmentProgress = {
    name: 'Gói Niềng răng Invisalign',
    progress: 25,
    completed: 2,
    total: 8,
    nextVisit: '20/11/2024'
  };

  const pendingPayment = {
    invoiceNumber: 'HD001234',
    amount: 2500000,
    dueDate: '30/11/2024',
    service: 'Khám tổng quát + Cạo vôi'
  };

  return (
    <div className="w-full bg-[#fcfeff] py-[40px] px-[20px] md:px-[80px]">
      <div className="max-w-[1440px] mx-auto space-y-[32px]">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[24px] p-[32px] md:p-[40px] text-white shadow-[0px_8px_32px_0px_rgba(63,181,255,0.3)]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] md:text-[36px] mb-[8px]">
            Xin chào, Nguyễn Văn Minh! 👋
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[16px] opacity-90">
            Chào mừng bạn quay trở lại với DentalCareX
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[20px]">
          <Card className="p-[24px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer" onClick={() => onNavigate('appointments')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-[#ebf6fc] rounded-[12px] flex items-center justify-center">
                <Calendar className="w-[24px] h-[24px] text-[#3fb5ff]" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-[#01304e] mb-[4px]">
              {upcomingAppointments.length}
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#666666]">
              Lịch hẹn sắp tới
            </div>
          </Card>

          <Card className="p-[24px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer" onClick={() => onNavigate('medical-records')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-[#ebf6fc] rounded-[12px] flex items-center justify-center">
                <Activity className="w-[24px] h-[24px] text-[#3fb5ff]" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-[#01304e] mb-[4px]">
              1
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#666666]">
              Kế hoạch điều trị
            </div>
          </Card>

          <Card className="p-[24px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer" onClick={() => onNavigate('medical-records')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-[#ebf6fc] rounded-[12px] flex items-center justify-center">
                <FileText className="w-[24px] h-[24px] text-[#3fb5ff]" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-[#01304e] mb-[4px]">
              12
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#666666]">
              Lần khám
            </div>
          </Card>

          <Card className="p-[24px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer" onClick={() => onNavigate('payment')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-[#fff3cd] rounded-[12px] flex items-center justify-center">
                <CreditCard className="w-[24px] h-[24px] text-[#ff9800]" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-[#01304e] mb-[4px]">
              1
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#666666]">
              Hóa đơn chưa thanh toán
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          {/* Left Column - Appointments & Treatment */}
          <div className="lg:col-span-2 space-y-[24px]">
            {/* Upcoming Appointments */}
            <Card className="p-[24px] md:p-[32px] border-[#ebf6fc]">
              <div className="flex items-center justify-between mb-[24px]">
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px]">
                  Lịch hẹn sắp tới
                </h2>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="text-[#3fb5ff] font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:underline flex items-center gap-[4px]"
                >
                  Xem tất cả
                  <ArrowRight className="w-[16px] h-[16px]" />
                </button>
              </div>

              <div className="space-y-[16px]">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-[#ebf6fc] rounded-[16px] p-[20px] hover:shadow-[0px_4px_16px_0px_rgba(63,181,255,0.1)] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
                      <div className="flex-1">
                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px] mb-[4px]">
                          {appointment.service}
                        </h3>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                          {appointment.doctor}
                        </p>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <div className="flex items-center gap-[6px] text-[#666666]">
                          <Calendar className="w-[16px] h-[16px]" />
                          <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
                            {appointment.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-[6px] text-[#666666]">
                          <Clock className="w-[16px] h-[16px]" />
                          <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
                            {appointment.time}
                          </span>
                        </div>
                        <span className="px-[12px] py-[4px] bg-[#e8f5e9] text-[#4caf50] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[12px] flex items-center gap-[4px]">
                          <CheckCircle className="w-[14px] h-[14px]" />
                          Đã xác nhận
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Treatment Progress */}
            <Card className="p-[24px] md:p-[32px] border-[#ebf6fc] bg-gradient-to-br from-[#f5fbff] to-white">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[20px]">
                Tiến độ điều trị
              </h2>
              <div className="bg-white rounded-[16px] p-[24px] border border-[#ebf6fc]">
                <div className="flex items-start justify-between mb-[16px]">
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px] mb-[4px]">
                      {treatmentProgress.name}
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      Đã hoàn thành {treatmentProgress.completed}/{treatmentProgress.total} lần tái khám
                    </p>
                  </div>
                  <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#3fb5ff] text-[20px]">
                    {treatmentProgress.progress}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-[8px] bg-[#ebf6fc] rounded-full overflow-hidden mb-[16px]">
                  <div
                    className="h-full bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] rounded-full transition-all duration-500"
                    style={{ width: `${treatmentProgress.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-[12px] border-t border-[#ebf6fc]">
                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Lần khám tiếp theo:
                  </span>
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                    {treatmentProgress.nextVisit}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Payment */}
          <div className="space-y-[24px]">
            {/* Quick Actions */}
            <Card className="p-[24px] border-[#ebf6fc]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[20px]">
                Thao tác nhanh
              </h2>
              <div className="space-y-[12px]">
                <button className="w-full bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] text-white px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all flex items-center justify-center gap-[8px]">
                  <Calendar className="w-[18px] h-[18px]" />
                  Đặt lịch hẹn mới
                </button>
                <button
                  onClick={() => onNavigate('medical-records')}
                  className="w-full bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:bg-[#ebf6fc] transition-all flex items-center justify-center gap-[8px]"
                >
                  <FileText className="w-[18px] h-[18px]" />
                  Xem hồ sơ bệnh án
                </button>
              </div>
            </Card>

            {/* Pending Payment */}
            {pendingPayment && (
              <Card className="p-[24px] border-[#ffc107] bg-[#fffbf0]">
                <div className="flex items-start gap-[12px] mb-[16px]">
                  <div className="w-[40px] h-[40px] bg-[#ffc107] rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-[20px] h-[20px] text-white" />
                  </div>
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#ff9800] text-[16px] mb-[4px]">
                      Hóa đơn chờ thanh toán
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                      Mã: {pendingPayment.invoiceNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-[8px] mb-[16px]">
                  <div className="flex justify-between">
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      Dịch vụ:
                    </span>
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                      {pendingPayment.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      Hạn thanh toán:
                    </span>
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                      {pendingPayment.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between pt-[8px] border-t border-[#ffe082]">
                    <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#333333] text-[16px]">
                      Tổng tiền:
                    </span>
                    <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#ff9800] text-[18px]">
                      {pendingPayment.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('payment')}
                  className="w-full bg-[#ff9800] text-white px-[20px] py-[12px] rounded-[10px] font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#f57c00] transition-all"
                >
                  Thanh toán ngay
                </button>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="p-[24px] border-[#ebf6fc] bg-gradient-to-br from-[#f5fbff] to-white">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px] mb-[16px]">
                Thông tin liên hệ
              </h3>
              <div className="space-y-[12px]">
                <div className="flex items-start gap-[12px]">
                  <Clock className="w-[18px] h-[18px] text-[#3fb5ff] flex-shrink-0 mt-[2px]" />
                  <div>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                      9h00 - 21h00
                    </p>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px]">
                      Tất cả các ngày trong tuần
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+84583891780"
                  className="flex items-center gap-[12px] text-[#3fb5ff] hover:underline"
                >
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
                    +84 583891780
                  </span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
