import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  X,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
  CalendarX,
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
import { toast } from "sonner";
import { authController } from "../../controllers/AuthController";
import { appointmentController, AppointmentDTO } from "../../controllers/AppointmentController";
import { userController } from "../../controllers/UserController";
import { UserDTO } from "../../models";

interface AppointmentDisplay {
  id: string;
  service: string;
  doctor: string;
  doctorPhone: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: string;
  notes: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
}

export function PatientAppointments() {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDisplay | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Backend data
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentDisplay[]>([]);
  const [pastAppointments, setPastAppointments] = useState<AppointmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  // Get current patient ID on mount
  useEffect(() => {
    const user = authController.getCurrentUser();
    if (user) {
      setCurrentPatientId(user.id);
    } else {
      toast.error("Vui lòng đăng nhập để xem lịch hẹn");
      setIsLoading(false);
    }
  }, []);

  // Load appointments when patientId is available
  useEffect(() => {
    if (currentPatientId) {
      loadAppointments();
    }
  }, [currentPatientId]);

  const loadAppointments = async () => {
    if (!currentPatientId) return;

    try {
      setIsLoading(true);
      const appointments = await appointmentController.getByPatientId(currentPatientId);

      // Get unique doctor IDs and service IDs
      const doctorIds = [...new Set(appointments.map(a => a.doctorId).filter(Boolean))];
      const doctors = await userController.getByIds(doctorIds);

      // Get current date/time
      const now = new Date();

      // Process appointments
      const upcoming: AppointmentDisplay[] = [];
      const past: AppointmentDisplay[] = [];

      for (const appointment of appointments) {
        const appointmentStart = new Date(appointment.appointmentStartTime);
        const appointmentEnd = new Date(appointment.appointmentEndTime);

        // Calculate duration in minutes
        const durationMs = appointmentEnd.getTime() - appointmentStart.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        const duration = durationMinutes >= 60
          ? `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60} phút`
          : `${durationMinutes} phút`;

        // Get doctor info
        const doctor = doctors[appointment.doctorId];
        const doctorName = doctor
          ? `BS. ${doctor.fullName || "Chưa có tên"}`
          : "Chưa có thông tin";
        const doctorPhone = doctor?.phone || "N/A";

        // Get service names
        const serviceNames = appointment.medicalServices
          ?.map(s => s.serviceName)
          .filter(Boolean)
          .join(", ") || "Khám tổng quát";

        // Format date and time
        const date = appointmentStart.toLocaleDateString('vi-VN');
        const time = appointmentStart.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Map status
        const statusMap: Record<string, string> = {
          'PENDING': 'pending',
          'CONFIRMED': 'confirmed',
          'CHECKED': 'confirmed',
          'IN_PROGRESS': 'confirmed',
          'PROGRESSING': 'confirmed',
          'COMPLETED': 'completed',
          'CANCELLED': 'cancelled',
          'FAILED': 'cancelled',
        };
        const displayStatus = statusMap[appointment.status] || appointment.status.toLowerCase();

        const appointmentDisplay: AppointmentDisplay = {
          id: appointment.id,
          service: serviceNames,
          doctor: doctorName,
          doctorPhone: doctorPhone,
          date: date,
          time: time,
          duration: duration,
          location: "Phòng khám", // Default location, có thể lấy từ appointment nếu có
          status: displayStatus,
          notes: "", // Có thể thêm notes nếu có trong AppointmentDTO
          appointmentStartTime: appointment.appointmentStartTime,
          appointmentEndTime: appointment.appointmentEndTime,
        };

        // Separate upcoming and past appointments
        if (displayStatus === 'completed' || displayStatus === 'cancelled' || appointmentStart < now) {
          past.push(appointmentDisplay);
        } else if (displayStatus === 'pending' || displayStatus === 'confirmed') {
          upcoming.push(appointmentDisplay);
        }
      }

      // Sort upcoming by date (ascending)
      upcoming.sort((a, b) =>
        new Date(a.appointmentStartTime).getTime() - new Date(b.appointmentStartTime).getTime()
      );

      // Sort past by date (descending)
      past.sort((a, b) =>
        new Date(b.appointmentStartTime).getTime() - new Date(a.appointmentStartTime).getTime()
      );

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Không thể tải danh sách lịch hẹn");
      setUpcomingAppointments([]);
      setPastAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = (appointment: AppointmentDisplay) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      setIsCancelling(true);
      await appointmentController.updateStatus(selectedAppointment.id, "CANCELLED");
      toast.success("Đã hủy lịch hẹn thành công");
      setShowCancelDialog(false);
      setSelectedAppointment(null);
      // Reload appointments
      await loadAppointments();
    } catch (error: any) {
      console.error("Failed to cancel appointment:", error);
      toast.error(error?.message || "Không thể hủy lịch hẹn. Vui lòng thử lại");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBookAgain = (appointment: AppointmentDisplay) => {
    // Navigate to booking page with pre-filled service and doctor
    console.log("Book again:", appointment);
    toast.info("Chức năng đặt lại lịch hẹn sẽ được cập nhật sớm");
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
            {isLoading ? (
              <Card className="p-10 text-center border-[var(--border-soft)] bg-[var(--surface-bg)]">
                <Loader2 className="w-8 h-8 text-[var(--accent-light)] animate-spin mx-auto mb-4" />
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  Đang tải lịch hẹn...
                </p>
              </Card>
            ) : upcomingAppointments.length === 0 ? (
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
                              {appointment.doctorPhone && appointment.doctorPhone !== "N/A" && (
                                <a
                                  href={`tel:${appointment.doctorPhone}`}
                                  className="text-[var(--accent-light)] text-xs hover:underline flex items-center gap-1 mt-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  {appointment.doctorPhone}
                                </a>
                              )}
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
            {isLoading ? (
              <Card className="p-10 text-center border-[var(--border-soft)] bg-[var(--surface-bg)]">
                <Loader2 className="w-8 h-8 text-[var(--accent-light)] animate-spin mx-auto mb-4" />
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  Đang tải lịch sử...
                </p>
              </Card>
            ) : pastAppointments.length === 0 ? (
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
                      </div>


                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog - Cải thiện giao diện */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
            {/* Header với gradient background */}
            <div className="bg-gradient-to-br from-red-50 via-red-50/80 to-orange-50 px-6 py-5 border-b border-red-100">
              <div className="flex items-start gap-4">
                {/* Icon cảnh báo với animation */}
                <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-7 h-7 text-red-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold text-[var(--text-strong)] mb-1.5">
                    Xác nhận hủy lịch hẹn
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[var(--text-regular)] opacity-80 leading-relaxed">
                    Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hủy lịch hẹn này không?
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Thông tin appointment với card đẹp hơn */}
            {selectedAppointment && (
              <div className="px-6 py-5 bg-[var(--surface-bg)]">
                <div className="bg-gradient-to-br from-[var(--accent-ghost)] to-white border-2 border-[var(--border-soft)] rounded-xl p-5 shadow-sm">
                  {/* Service name với icon */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-[var(--accent-light)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarX className="w-5 h-5 text-[var(--accent-light)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-regular)] opacity-70 mb-1">
                        Dịch vụ
                      </p>
                      <p className="font-bold text-base text-[var(--text-strong)] leading-tight">
                        {selectedAppointment.service}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[var(--border-soft)] my-4" />

                  {/* Thông tin chi tiết */}
                  <div className="space-y-3">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-regular)] opacity-70 mb-0.5">
                          Ngày & Giờ
                        </p>
                        <p className="font-semibold text-sm text-[var(--text-strong)]">
                          {selectedAppointment.date}
                        </p>
                        <p className="text-sm text-[var(--text-regular)] opacity-80">
                          {selectedAppointment.time} • {selectedAppointment.duration}
                        </p>
                      </div>
                    </div>

                    {/* Doctor */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-regular)] opacity-70 mb-0.5">
                          Bác sĩ
                        </p>
                        <p className="font-semibold text-sm text-[var(--text-strong)]">
                          {selectedAppointment.doctor}
                        </p>
                        {selectedAppointment.doctorPhone && selectedAppointment.doctorPhone !== "N/A" && (
                          <a
                            href={`tel:${selectedAppointment.doctorPhone}`}
                            className="text-xs text-[var(--accent-light)] hover:underline flex items-center gap-1 mt-1"
                          >
                            <Phone className="w-3 h-3" />
                            {selectedAppointment.doctorPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-regular)] opacity-70 mb-0.5">
                          Địa điểm
                        </p>
                        <p className="font-semibold text-sm text-[var(--text-strong)]">
                          {selectedAppointment.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Footer với buttons */}
            <DialogFooter className="px-6 py-4 bg-[var(--surface-bg)] border-t border-[var(--border-soft)] flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setSelectedAppointment(null);
                }}
                className="flex-1 font-medium border-2 hover:bg-[var(--accent-ghost)] transition-all"
                disabled={isCancelling}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy bỏ
              </Button>
              <Button
                onClick={handleConfirmCancel}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Xác nhận hủy
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
