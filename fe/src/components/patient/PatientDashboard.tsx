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
    <div className="w-full bg-neutral-background py-[40px] px-[20px] md:px-[80px] min-h-screen">
      <div className="max-w-[1440px] mx-auto space-y-[32px]">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary to-primary-strong rounded-[24px] p-[32px] md:p-[40px] text-white shadow-[0px_8px_32px_0px_rgba(63,181,255,0.3)]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] md:text-[36px] mb-[8px]">
            Xin chào, Nguyễn Văn Minh! 👋
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[16px] opacity-90">
            Chào mừng bạn quay trở lại với DentalCareX
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[20px]">
          <Card className="p-[24px] border-neutral-border bg-neutral-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer" onClick={() => onNavigate('appointments')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-neutral-muted rounded-[12px] flex items-center justify-center">
                <Calendar className="w-[24px] h-[24px] text-primary" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-neutral-text mb-[4px]">
              {upcomingAppointments.length}
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-neutral-text/70">
              Lịch hẹn sắp tới
            </div>
          </Card>

          <Card className="p-[24px] border-neutral-border bg-neutral-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer" onClick={() => onNavigate('medical-records')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-neutral-muted rounded-[12px] flex items-center justify-center">
                <Activity className="w-[24px] h-[24px] text-primary" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-neutral-text mb-[4px]">
              1
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-neutral-text/70">
              Kế hoạch điều trị
            </div>
          </Card>

          <Card className="p-[24px] border-neutral-border bg-neutral-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer" onClick={() => onNavigate('medical-records')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-neutral-muted rounded-[12px] flex items-center justify-center">
                <FileText className="w-[24px] h-[24px] text-primary" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-neutral-text mb-[4px]">
              12
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-neutral-text/70">
              Lần khám
            </div>
          </Card>

          <Card className="p-[24px] border-neutral-border bg-neutral-surface hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer" onClick={() => onNavigate('payment')}>
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-accent-orange/10 rounded-[12px] flex items-center justify-center">
                <CreditCard className="w-[24px] h-[24px] text-accent-orange" />
              </div>
            </div>
            <div className="font-['Fz_Poppins:Bold',sans-serif] text-[28px] text-neutral-text mb-[4px]">
              1
            </div>
            <div className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-neutral-text/70">
              Hóa đơn chưa thanh toán
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          {/* Left Column - Appointments & Treatment */}
          <div className="lg:col-span-2 space-y-[24px]">
            {/* Upcoming Appointments */}
            <Card className="p-[24px] md:p-[32px] border-neutral-border bg-neutral-surface shadow-sm">
              <div className="flex items-center justify-between mb-[24px]">
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[20px]">
                  Lịch hẹn sắp tới
                </h2>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="text-primary font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:text-primary-strong hover:underline flex items-center gap-[4px] transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="w-[16px] h-[16px]" />
                </button>
              </div>

              <div className="space-y-[16px]">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-neutral-border rounded-[16px] p-[20px] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 bg-neutral-surface"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
                      <div className="flex-1">
                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[16px] mb-[4px]">
                          {appointment.service}
                        </h3>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[14px]">
                          {appointment.doctor}
                        </p>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <div className="flex items-center gap-[6px] text-neutral-text/70">
                          <Calendar className="w-[16px] h-[16px]" />
                          <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
                            {appointment.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-[6px] text-neutral-text/70">
                          <Clock className="w-[16px] h-[16px]" />
                          <span className="font-['Fz_Poppins:Medium',sans-serif] text-[14px]">
                            {appointment.time}
                          </span>
                        </div>
                        <span className="px-[12px] py-[4px] bg-green-100 text-green-600 rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[12px] flex items-center gap-[4px]">
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
            <Card className="p-[24px] md:p-[32px] border-neutral-border bg-gradient-to-br from-neutral-muted/50 to-neutral-surface shadow-sm">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[20px] mb-[20px]">
                Tiến độ điều trị
              </h2>
              <div className="bg-neutral-surface rounded-[16px] p-[24px] border border-neutral-border shadow-sm">
                <div className="flex items-start justify-between mb-[16px]">
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[16px] mb-[4px]">
                      {treatmentProgress.name}
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[14px]">
                      Đã hoàn thành {treatmentProgress.completed}/{treatmentProgress.total} lần tái khám
                    </p>
                  </div>
                  <span className="font-['Fz_Poppins:Bold',sans-serif] text-primary text-[20px]">
                    {treatmentProgress.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-[8px] bg-neutral-muted rounded-full overflow-hidden mb-[16px]">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-strong rounded-full transition-all duration-500"
                    style={{ width: `${treatmentProgress.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-[12px] border-t border-neutral-border">
                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[14px]">
                    Lần khám tiếp theo:
                  </span>
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[14px]">
                    {treatmentProgress.nextVisit}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Payment */}
          <div className="space-y-[24px]">
            {/* Quick Actions */}
            <Card className="p-[24px] border-neutral-border bg-neutral-surface shadow-sm">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[18px] mb-[20px]">
                Thao tác nhanh
              </h2>
              <div className="space-y-[12px]">
                <button className="w-full bg-gradient-to-r from-primary to-primary-strong text-white px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-[8px]">
                  <Calendar className="w-[18px] h-[18px]" />
                  Đặt lịch hẹn mới
                </button>
                <button
                  onClick={() => onNavigate('medical-records')}
                  className="w-full bg-neutral-surface border-2 border-primary text-primary px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:bg-neutral-muted transition-all duration-200 flex items-center justify-center gap-[8px]"
                >
                  <FileText className="w-[18px] h-[18px]" />
                  Xem hồ sơ bệnh án
                </button>
              </div>
            </Card>

            {/* Pending Payment */}
            {pendingPayment && (
              <Card className="p-[24px] border-accent-orange bg-accent-orange/10 shadow-sm">
                <div className="flex items-start gap-[12px] mb-[16px]">
                  <div className="w-[40px] h-[40px] bg-accent-orange rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-[20px] h-[20px] text-white" />
                  </div>
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-accent-orange text-[16px] mb-[4px]">
                      Hóa đơn chờ thanh toán
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[13px]">
                      Mã: {pendingPayment.invoiceNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-[8px] mb-[16px]">
                  <div className="flex justify-between">
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[14px]">
                      Dịch vụ:
                    </span>
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-neutral-text text-[14px]">
                      {pendingPayment.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[14px]">
                      Hạn thanh toán:
                    </span>
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-neutral-text text-[14px]">
                      {pendingPayment.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between pt-[8px] border-t border-accent-orange/30">
                    <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[16px]">
                      Tổng tiền:
                    </span>
                    <span className="font-['Fz_Poppins:Bold',sans-serif] text-accent-orange text-[18px]">
                      {pendingPayment.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('payment')}
                  className="w-full bg-accent-orange text-white px-[20px] py-[12px] rounded-[10px] font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-accent-orange/90 hover:shadow-md transition-all duration-200"
                >
                  Thanh toán ngay
                </button>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="p-[24px] border-neutral-border bg-gradient-to-br from-neutral-muted/50 to-neutral-surface shadow-sm">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-neutral-text text-[16px] mb-[16px]">
                Thông tin liên hệ
              </h3>
              <div className="space-y-[12px]">
                <div className="flex items-start gap-[12px]">
                  <Clock className="w-[18px] h-[18px] text-primary flex-shrink-0 mt-[2px]" />
                  <div>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-neutral-text text-[14px]">
                      9h00 - 21h00
                    </p>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-text/70 text-[12px]">
                      Tất cả các ngày trong tuần
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+84583891780"
                  className="flex items-center gap-[12px] text-primary hover:text-primary-strong hover:underline transition-colors"
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
