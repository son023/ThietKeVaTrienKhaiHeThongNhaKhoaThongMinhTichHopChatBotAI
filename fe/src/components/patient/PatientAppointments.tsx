import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Edit,
  X,
  RotateCcw,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

export function PatientAppointments() {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Mock data - Upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      service: "Khám tổng quát",
      doctor: "BS. Nguyễn Văn A",
      doctorPhone: "0912345678",
      date: "15/11/2024",
      time: "09:00",
      duration: "45 phút",
      location: "Phòng 101, Tầng 2",
      status: "confirmed",
      notes: "Nhớ mang theo sổ khám bệnh",
    },
    {
      id: 2,
      service: "Tái khám niềng răng",
      doctor: "BS. Trần Thị B",
      doctorPhone: "0987654321",
      date: "20/11/2024",
      time: "14:30",
      duration: "30 phút",
      location: "Phòng 203, Tầng 2",
      status: "confirmed",
      notes: "",
    },
    {
      id: 3,
      service: "Lấy cao răng",
      doctor: "BS. Lê Văn C",
      doctorPhone: "0923456789",
      date: "25/11/2024",
      time: "10:00",
      duration: "60 phút",
      location: "Phòng 105, Tầng 1",
      status: "pending",
      notes: "Chờ xác nhận từ phòng khám",
    },
  ];

  // Mock data - Past appointments
  const pastAppointments = [
    {
      id: 4,
      service: "Khám tổng quát",
      doctor: "BS. Nguyễn Văn A",
      date: "01/11/2024",
      time: "09:30",
      status: "completed",
      diagnosis: "Viêm nướu nhẹ",
      nextVisit: "15/11/2024",
    },
    {
      id: 5,
      service: "Tẩy trắng răng",
      doctor: "BS. Phạm Thị D",
      date: "15/10/2024",
      time: "14:00",
      status: "completed",
      diagnosis: "Hoàn thành tẩy trắng răng",
      nextVisit: null,
    },
    {
      id: 6,
      service: "Cạo vôi răng",
      doctor: "BS. Lê Văn C",
      date: "01/10/2024",
      time: "10:30",
      status: "completed",
      diagnosis: "Vôi răng nhiều, đã làm sạch",
      nextVisit: "01/04/2025",
    },
    {
      id: 7,
      service: "Khám định kỳ",
      doctor: "BS. Nguyễn Văn A",
      date: "15/09/2024",
      time: "09:00",
      status: "cancelled",
      diagnosis: null,
      nextVisit: null,
    },
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
    console.log("Book again:", appointment);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg font-medium text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Đã xác nhận
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1.5 bg-orange-50 text-orange-500 rounded-lg font-medium text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Chờ xác nhận
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs">
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium text-xs">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="typo-h1 text-[var(--text-strong)] mb-2">
            Quản lý lịch hẹn
          </h1>
          <p className="text-base text-[var(--text-regular)] opacity-70">
            Xem và quản lý tất cả các lịch hẹn của bạn
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="upcoming" className="font-medium">
              Lịch hẹn sắp tới ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="font-medium">
              Lịch sử khám ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments Tab */}
          <TabsContent value="upcoming" className="space-y-5">
            {upcomingAppointments.length === 0 ? (
              <Card className="p-10 text-center border-[var(--border-soft)] bg-[var(--surface-bg)]">
                <Calendar className="w-16 h-16 text-[var(--text-regular)] opacity-20 mx-auto mb-4" />
                <h3 className="typo-h4 text-[var(--text-strong)] mb-2">
                  Chưa có lịch hẹn
                </h3>
                <p className="text-sm text-[var(--text-regular)] opacity-70 mb-6">
                  Bạn chưa có lịch hẹn nào sắp tới
                </p>
                <Button className="bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] text-white hover:shadow-lg transition-all duration-200">
                  <Calendar className="w-4.5 h-4.5 mr-2" />
                  Đặt lịch hẹn mới
                </Button>
              </Card>
            ) : (
              <>
                {upcomingAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left side - Main info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="typo-h3 text-[var(--text-strong)] mb-2">
                              {appointment.service}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[var(--accent-ghost)] rounded-xl flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-[var(--accent-light)]" />
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-regular)] opacity-70 mb-0.5">
                                Bác sĩ
                              </p>
                              <p className="font-semibold text-[var(--text-strong)] text-sm">
                                {appointment.doctor}
                              </p>
                              <a
                                href={`tel:${appointment.doctorPhone}`}
                                className="text-[var(--accent-light)] text-xs hover:underline flex items-center gap-1 mt-1"
                              >
                                <Phone className="w-3 h-3" />
                                {appointment.doctorPhone}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[var(--accent-ghost)] rounded-xl flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-[var(--accent-light)]" />
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-regular)] opacity-70 mb-0.5">
                                Ngày & Giờ
                              </p>
                              <p className="font-semibold text-[var(--text-strong)] text-sm">
                                {appointment.date}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[var(--text-regular)] opacity-70">
                                  {appointment.time}
                                </span>
                                <span className="text-[var(--border-soft)]">
                                  •
                                </span>
                                <span className="text-xs text-[var(--text-regular)] opacity-70">
                                  {appointment.duration}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 sm:col-span-2">
                            <div className="w-10 h-10 bg-[var(--accent-ghost)] rounded-xl flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-[var(--accent-light)]" />
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-regular)] opacity-70 mb-0.5">
                                Địa điểm
                              </p>
                              <p className="font-semibold text-[var(--text-strong)] text-sm">
                                {appointment.location}
                              </p>
                              <p className="text-xs text-[var(--text-regular)] opacity-70 mt-0.5">
                                Tầng 2, TTTM Mandarin Garden 2, Hà Nội
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex lg:flex-col gap-3 lg:w-40">
                        <button
                          onClick={() =>
                            handleRescheduleAppointment(appointment)
                          }
                          className="flex-1 lg:flex-none bg-[var(--surface-bg)] border-2 border-[var(--accent-light)] text-[var(--accent-light)] px-4 py-3 rounded-xl font-semibold text-sm hover:bg-[var(--accent-ghost)] transition-all flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Đổi lịch
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment)}
                          className="flex-1 lg:flex-none bg-[var(--surface-bg)] border-2 border-red-500 text-red-500 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
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
          <TabsContent value="history" className="space-y-5">
            {pastAppointments.length === 0 ? (
              <Card className="p-10 text-center border-[var(--border-soft)] bg-[var(--surface-bg)]">
                <Clock className="w-16 h-16 text-[var(--text-regular)] opacity-20 mx-auto mb-4" />
                <h3 className="typo-h4 text-[var(--text-strong)] mb-2">
                  Chưa có lịch sử khám
                </h3>
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  Bạn chưa có lịch sử khám bệnh nào
                </p>
              </Card>
            ) : (
              <>
                {pastAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left side - Main info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className="typo-h4 text-[var(--text-strong)] mb-2">
                              {appointment.service}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[var(--text-regular)] opacity-70 mb-0.5">
                              Ngày khám
                            </p>
                            <p className="font-semibold text-[var(--text-strong)] text-sm">
                              {appointment.date} • {appointment.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <User className="w-4.5 h-4.5 text-[var(--text-regular)] opacity-70" />
                          <span className="font-medium text-[var(--text-regular)] text-sm">
                            {appointment.doctor}
                          </span>
                        </div>

                        {appointment.diagnosis && (
                          <div className="bg-[var(--accent-ghost)] border border-[var(--border-soft)] rounded-xl p-4">
                            <p className="font-medium text-[var(--accent-light)] text-xs mb-2">
                              Kết quả khám:
                            </p>
                            <p className="text-sm text-[var(--text-regular)]">
                              {appointment.diagnosis}
                            </p>
                            {appointment.nextVisit && (
                              <p className="text-xs text-[var(--text-regular)] opacity-70 mt-2">
                                Tái khám:{" "}
                                <span className="font-semibold text-[var(--accent-light)]">
                                  {appointment.nextVisit}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right side - Actions */}
                      {appointment.status === "completed" && (
                        <div className="flex lg:flex-col gap-3 lg:w-40">
                          <button
                            onClick={() => handleBookAgain(appointment)}
                            className="flex-1 lg:flex-none bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] text-white px-4 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-semibold text-[var(--text-strong)]">
                Xác nhận hủy lịch hẹn
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn hủy lịch hẹn này không?
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="bg-[var(--accent-ghost)] rounded-xl p-4 space-y-2">
                <p className="font-semibold text-[var(--text-strong)] text-sm">
                  {selectedAppointment.service}
                </p>
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  {selectedAppointment.date} • {selectedAppointment.time}
                </p>
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  Bác sĩ: {selectedAppointment.doctor}
                </p>
              </div>
            )}
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 font-medium"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  // Handle cancel logic
                  setShowCancelDialog(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 font-semibold"
              >
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-semibold text-[var(--text-strong)]">
                Đổi lịch hẹn
              </DialogTitle>
              <DialogDescription>
                Chức năng đổi lịch sẽ được cập nhật sớm. Vui lòng liên hệ với
                phòng khám để đổi lịch hẹn.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="font-medium text-orange-600 text-sm mb-2">
                Liên hệ:
              </p>
              <a
                href="tel:+84583891780"
                className="font-semibold text-[var(--accent-light)] text-base hover:underline"
              >
                +84 583891780
              </a>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowRescheduleDialog(false)}
                className="w-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] font-semibold"
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
