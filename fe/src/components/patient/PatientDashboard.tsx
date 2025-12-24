import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Activity,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Card } from "../ui/card";

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  // Mock data
  const upcomingAppointments = [
    {
      id: 1,
      service: "Khám tổng quát",
      doctor: "BS. Nguyễn Văn A",
      date: "15/11/2024",
      time: "09:00",
      status: "confirmed",
    },
    {
      id: 2,
      service: "Tái khám niềng răng",
      doctor: "BS. Trần Thị B",
      date: "20/11/2024",
      time: "14:30",
      status: "confirmed",
    },
  ];

  const treatmentProgress = {
    name: "Gói Niềng răng Invisalign",
    progress: 25,
    completed: 2,
    total: 8,
    nextVisit: "20/11/2024",
  };

  const pendingPayment = {
    invoiceNumber: "HD001234",
    amount: 2500000,
    dueDate: "30/11/2024",
    service: "Khám tổng quát + Cạo vôi",
  };

  return (
    <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] rounded-3xl p-8 md:p-10 text-white shadow-[var(--shadow-lifted)]">
          <h1 className="typo-h2 mb-2">Xin chào, Nguyễn Văn Minh! 👋</h1>
          <p className="text-base opacity-90">
            Chào mừng bạn quay trở lại với DentalCareX
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <Card
            className="p-6 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            onClick={() => onNavigate("appointments")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[var(--surface-muted)] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--accent-light)]" />
              </div>
            </div>
            <div className="typo-h2 text-[var(--text-regular)] mb-1">
              {upcomingAppointments.length}
            </div>
            <div className="text-sm text-[var(--text-regular)] opacity-70">
              Lịch hẹn sắp tới
            </div>
          </Card>

          <Card
            className="p-6 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            onClick={() => onNavigate("medical-records")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[var(--surface-muted)] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-[var(--accent-light)]" />
              </div>
            </div>
            <div className="typo-h2 text-[var(--text-regular)] mb-1">1</div>
            <div className="text-sm text-[var(--text-regular)] opacity-70">
              Kế hoạch điều trị
            </div>
          </Card>

          <Card
            className="p-6 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            onClick={() => onNavigate("medical-records")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[var(--surface-muted)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[var(--accent-light)]" />
              </div>
            </div>
            <div className="typo-h2 text-[var(--text-regular)] mb-1">12</div>
            <div className="text-sm text-[var(--text-regular)] opacity-70">
              Lần khám
            </div>
          </Card>

          <Card
            className="p-6 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            onClick={() => onNavigate("payment")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="typo-h2 text-[var(--text-regular)] mb-1">1</div>
            <div className="text-sm text-[var(--text-regular)] opacity-70">
              Hóa đơn chưa thanh toán
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointments & Treatment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="typo-h3 text-[var(--text-strong)]">
                  Lịch hẹn sắp tới
                </h2>
                <button
                  onClick={() => onNavigate("appointments")}
                  className="text-[var(--accent-light)] font-medium text-sm hover:text-[var(--accent)] hover:underline flex items-center gap-1 transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-[var(--border-soft)] rounded-2xl p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 bg-[var(--surface-bg)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="typo-h4 text-[var(--text-strong)] mb-1">
                          {appointment.service}
                        </h3>
                        <p className="text-sm text-[var(--text-regular)] opacity-70">
                          {appointment.doctor}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[var(--text-regular)] opacity-70">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {appointment.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-regular)] opacity-70">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {appointment.time}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg font-medium text-xs flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Đã xác nhận
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Treatment Progress
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-gradient-to-br from-[var(--surface-muted)]/50 to-[var(--surface-bg)] shadow-sm">
              <h2 className="typo-h3 text-[var(--text-strong)] mb-5">
                Tiến độ điều trị
              </h2>
              <div className="bg-[var(--surface-bg)] rounded-2xl p-6 border border-[var(--border-soft)] shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="typo-h4 text-[var(--text-strong)] mb-1">
                      {treatmentProgress.name}
                    </h3>
                    <p className="text-sm text-[var(--text-regular)] opacity-70">
                      Đã hoàn thành {treatmentProgress.completed}/{treatmentProgress.total} lần tái khám
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-[var(--accent-light)]">
                    {treatmentProgress.progress}%
                  </span>
                </div>
                */}
            {/* Progress Bar 
                <div className="w-full h-2 bg-[var(--surface-muted)] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] rounded-full transition-all duration-500"
                    style={{ width: `${treatmentProgress.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)]">
                  <span className="text-sm text-[var(--text-regular)] opacity-70">
                    Lần khám tiếp theo:
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-strong)]">
                    {treatmentProgress.nextVisit}
                  </span>
                </div>
              </div>
            </Card> */}
          </div>

          {/* Right Column - Quick Actions & Payment */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <h2 className="typo-h4 text-[var(--text-strong)] mb-5">
                Thao tác nhanh
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] text-white px-5 py-3.5 rounded-xl font-semibold text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                  <Calendar className="w-4.5 h-4.5" />
                  Đặt lịch hẹn mới
                </button>
                <button
                  onClick={() => onNavigate("medical-records")}
                  className="w-full bg-[var(--surface-bg)] border-2 border-[var(--accent-light)] text-[var(--accent-light)] px-5 py-3.5 rounded-xl font-semibold text-base hover:bg-[var(--surface-muted)] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4.5 h-4.5" />
                  Xem hồ sơ bệnh án
                </button>
              </div>
            </Card>

            {/* Pending Payment */}
            {pendingPayment && (
              <Card className="p-6 border-orange-200 bg-orange-50/50 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-600 text-base mb-1">
                      Hóa đơn chờ thanh toán
                    </h3>
                    <p className="text-sm text-[var(--text-regular)] opacity-70">
                      Mã: {pendingPayment.invoiceNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-regular)] opacity-70">
                      Dịch vụ:
                    </span>
                    <span className="text-sm font-medium text-[var(--text-regular)]">
                      {pendingPayment.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-regular)] opacity-70">
                      Hạn thanh toán:
                    </span>
                    <span className="text-sm font-medium text-[var(--text-regular)]">
                      {pendingPayment.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-orange-200">
                    <span className="font-semibold text-[var(--text-strong)] text-base">
                      Tổng tiền:
                    </span>
                    <span className="font-bold text-orange-600 text-lg">
                      {pendingPayment.amount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("payment")}
                  className="w-full bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 hover:shadow-md transition-all duration-200"
                >
                  Thanh toán ngay
                </button>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="p-6 border-[var(--border-soft)] bg-gradient-to-br from-[var(--surface-muted)]/50 to-[var(--surface-bg)] shadow-sm">
              <h3 className="typo-h4 text-[var(--text-strong)] mb-4">
                Thông tin liên hệ
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-4.5 h-4.5 text-[var(--accent-light)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-regular)] text-sm">
                      9h00 - 21h00
                    </p>
                    <p className="text-xs text-[var(--text-regular)] opacity-70">
                      Tất cả các ngày trong tuần
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+84583891780"
                  className="flex items-center gap-3 text-[var(--accent-light)] hover:text-[var(--accent)] hover:underline transition-colors"
                >
                  <svg
                    className="w-4.5 h-4.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="font-medium text-sm">+84 583891780</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
