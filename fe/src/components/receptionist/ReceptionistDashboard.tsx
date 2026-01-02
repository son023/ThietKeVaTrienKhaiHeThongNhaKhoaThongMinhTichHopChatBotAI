import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { User, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import {
  appointmentController,
  AppointmentDTO,
} from "../../controllers/AppointmentController";
import CheckinDialog from "./CheckinDialog";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  doctor: string;
  phone: string;
  status:
    | "waiting_confirm"
    | "waiting_checkin"
    | "checked_in"
    | "in_treatment"
    | "waiting_payment"
    | "completed";
  service?: string;
}

type DisplayPatient = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  notes: string;
  lastVisit: string;
};

interface ReceptionistDashboardProps {
  onCreateInvoice?: (appointmentId: string) => void;
  refreshToken?: number;
}

export function ReceptionistDashboard({
  onCreateInvoice,
  refreshToken,
}: ReceptionistDashboardProps = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const mapStatus = (status: string): Appointment["status"] => {
    switch (status) {
      case "CONFIRMED":
        return "waiting_checkin";
      case "CHECKED":
        return "checked_in";
      case "IN_PROGRESS":
        return "in_treatment";
      default:
        return "waiting_confirm";
    }
  };

  const transformAppointment = (apt: AppointmentDTO): Appointment => {
    const startTime = new Date(apt.appointmentStartTime);
    const timeStr = startTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: `Bệnh nhân ${apt.patientId.substring(0, 8)}`,
      time: timeStr,
      doctor: `BS. ${apt.doctorId.substring(0, 8)}`,
      phone: "N/A",
      status: mapStatus(apt.status),
      service: apt.medicalServices?.[0]?.serviceName || "Khám tổng quát",
    };
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const appointmentDTOs = await appointmentController.getByDate(today);

        const transformed = appointmentDTOs.map(transformAppointment);
        setAppointments(transformed);
        setError(null);
      } catch (err) {
        console.error("Error loading appointments:", err);
        setError("Không thể tải danh sách lịch hẹn");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [refreshToken]);

  const statusConfig = {
    waiting_confirm: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      count: 2,
    },
    waiting_checkin: {
      label: "Chờ check-in",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      count: 2,
    },
    checked_in: {
      label: "Đã check-in",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      count: 1,
    },
    in_treatment: {
      label: "Đang khám",
      color: "bg-green-100 text-green-800 border-green-200",
      count: 1,
    },
    waiting_payment: {
      label: "Chờ thanh toán",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      count: 1,
    },
    completed: {
      label: "Hoàn tất",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      count: 0,
    },
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter((apt) => apt.status === status);
  };

  const handleAction = async (appointmentId: string, action: string) => {
    try {
      if (action === "checkin") {
        const target = appointments.find((apt) => apt.id === appointmentId);
        if (!target) return;
        setSelectedAppointment(target);
        setCheckinOpen(true);
      } else if (action === "invoice" && onCreateInvoice) {
        onCreateInvoice(appointmentId);
      } else {
        console.log(`Action ${action} on appointment ${appointmentId}`);
      }
    } catch (err) {
      console.error("Error performing action:", err);
      alert(`Lỗi: ${err instanceof Error ? err.message : "Có lỗi xảy ra"}`);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-text tracking-tight">
          Luồng Bệnh nhân hôm nay
        </h1>
        <p className="text-neutral-text/70 font-medium">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {loading && (
        <Card className="p-8 border-neutral-border bg-neutral-surface">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-neutral-text/70 font-medium">
              Đang tải dữ liệu...
            </p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Kanban Board */}
      {!loading && !error && (
        <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
            (status) => {
              const config = statusConfig[status];
              const statusAppointments = getAppointmentsByStatus(status);

              return (
                <div key={status} className="min-w-[240px]">
                  {/* Column Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-neutral-text">
                        {config.label}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${config.color} border-2 text-xs px-2.5 py-0.5 font-medium`}
                      >
                        {statusAppointments.length}
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-neutral-tint rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          config.color.split(" ")[0]
                        } transition-all duration-300`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {statusAppointments.map((apt) => (
                      <Card
                        key={apt.id}
                        className="p-3 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-neutral-border bg-neutral-surface"
                      >
                        <div className="space-y-2.5">
                          {/* Patient Info - Compact */}
                          <div>
                            <div className="flex items-start justify-between mb-1.5">
                              <h4 className="text-xs font-semibold text-neutral-text line-clamp-1 pr-1">
                                {apt.patientName}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 shrink-0 bg-neutral-muted border-neutral-border"
                              >
                                {apt.time}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-text/70">
                              <User className="w-3 h-3 shrink-0 text-neutral-subtle" />
                              <span className="truncate">{apt.doctor}</span>
                            </div>
                            {apt.service && (
                              <p
                                className="text-[10px] text-neutral-text/60 mt-1 truncate"
                                title={apt.service}
                              >
                                {apt.service}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons - Compact */}
                          <div className="pt-2 border-t border-neutral-border">
                            {status === "waiting_confirm" && (
                              <Button
                                size="sm"
                                className="w-full bg-primary hover:bg-primary-strong h-7 text-xs font-medium shadow-sm transition-all duration-200"
                                onClick={() => handleAction(apt.id, "confirm")}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Xác nhận
                              </Button>
                            )}
                            {status === "waiting_checkin" && (
                              <Button
                                size="sm"
                                className="w-full bg-secondary-deep hover:bg-secondary-deep/90 h-7 text-xs font-medium shadow-sm transition-all duration-200"
                                onClick={() => handleAction(apt.id, "checkin")}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Check-in
                              </Button>
                            )}
                            {status === "waiting_payment" && (
                              <Button
                                size="sm"
                                className="w-full bg-accent-orange hover:bg-accent-orange/90 h-7 text-xs font-medium shadow-sm transition-all duration-200"
                                onClick={() => handleAction(apt.id, "invoice")}
                              >
                                <DollarSign className="w-3 h-3 mr-1" />
                                Thanh toán
                              </Button>
                            )}
                            {(status === "checked_in" ||
                              status === "in_treatment" ||
                              status === "completed") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-[10px] border-neutral-border hover:bg-neutral-muted transition-all duration-200"
                                onClick={() => handleAction(apt.id, "view")}
                              >
                                Chi tiết
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}

                    {statusAppointments.length === 0 && (
                      <Card className="p-6 border-neutral-border bg-neutral-muted/50">
                        <div className="text-center text-xs text-neutral-text/40 font-medium">
                          Không có
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      <CheckinDialog
        open={checkinOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null);
          setCheckinOpen(open);
        }}
        appointment={
          selectedAppointment
            ? {
                id: selectedAppointment.id,
                patientId: selectedAppointment.patientId,
                patientName: selectedAppointment.patientName,
                serviceName: selectedAppointment.service,
              }
            : null
        }
        onCheckedIn={() => {
          if (!selectedAppointment) return;
          setAppointments((prev) =>
            prev.map((apt) =>
              apt.id === selectedAppointment.id
                ? { ...apt, status: "checked_in" }
                : apt
            )
          );
        }}
      />

      {/* Tasks Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-neutral-text mb-5 tracking-tight">
          Việc cần làm
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-text">
                Gọi điện xác nhận lịch hẹn ngày mai
              </h3>
              <Badge className="bg-accent-lime text-neutral-text font-medium px-3 py-1">
                5 BN
              </Badge>
            </div>
            <p className="text-xs text-neutral-text/70 mb-4 leading-relaxed">
              Nhắc nhở bệnh nhân về lịch hẹn vào ngày mai
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-neutral-border hover:bg-neutral-muted hover:text-strong hover:border-primary "
            >
              Xem danh sách
            </Button>
          </Card>

          <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-text">
                Theo dõi bệnh nhân trễ hẹn
              </h3>
              <Badge className="bg-accent-orange text-white font-medium px-3 py-1">
                2 BN
              </Badge>
            </div>
            <p className="text-xs text-neutral-text/70 mb-4 leading-relaxed">
              Liên hệ với bệnh nhân chưa đến theo lịch
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-neutral-border hover:text-strong hover:bg-neutral-muted hover:border-primary transition-all duration-200"
            >
              Xem danh sách
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
