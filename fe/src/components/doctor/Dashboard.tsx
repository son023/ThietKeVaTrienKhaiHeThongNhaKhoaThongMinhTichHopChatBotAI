import { useEffect, useMemo, useState, useRef } from 'react';
import { Clock, User, AlertCircle, FileCheck, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  appointmentController,
  AppointmentDTO,
} from '../../controllers/AppointmentController';
import { patientController } from '../../controllers/PatientController';
import { PatientWithUser } from '../../models';
import { connectWebSocket, subscribeToAppointmentRollback } from '../../services/websocketService';
import { toast } from 'sonner';

interface DashboardProps {
  onNavigateToPatient: (patientId: string, appointmentId: string) => void;
  doctorId?: string | null;
}

type AppointmentWithPatient = AppointmentDTO & {
  patient?: PatientWithUser;
  timeLabel: string;
};

export function Dashboard({ onNavigateToPatient, doctorId }: DashboardProps) {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [patientMap, setPatientMap] = useState<Record<string, PatientWithUser>>(
    {}
  );
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Appointment data and status helpers

  const statusMeta: Record<string, { label: string; className: string }> = {
    CHECKED: {
      label: 'Đã check-in',
      className: 'bg-yellow-500 text-white',
    },
    CONFIRMED: {
      label: 'Đã xác nhận',
      className: 'bg-blue-100 text-blue-800 border border-blue-300',
    },
    CANCELLED: {
      label: 'Đã huỷ',
      className: 'bg-red-100 text-red-800 border border-red-300',
    },
    IN_PROGRESS: {
      label: 'Đang khám',
      className: 'bg-[#3FB5FF] text-white',
    },
    COMPLETED: {
      label: 'Hoàn thành',
      className: 'bg-green-500 text-white',
    },
    COMPLETED_INVOICE: {
      label: 'Đã thanh toán',
      className: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    },
  };

  const getStatusBadge = (status: string) => {
    const meta = statusMeta[status] || statusMeta.CONFIRMED;
    return <Badge className={`${meta.className} h-7`}>{meta.label}</Badge>;
  };

  const isCheckedIn = (status: string) => {
    return status === 'CHECKED';
  };

  const isInProgress = (status: string) => {
    return status === 'IN_PROGRESS';
  };

  const isViewOnly = (status: string) => {
    return status === 'COMPLETED' || status === 'COMPLETED_INVOICE';
  };

  const isConfirmed = (status: string) => {
    return status === 'CONFIRMED';
  };

  const handleStartExamination = async (appointmentId: string, patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessingId(appointmentId);

      console.log(`[Dashboard] Starting examination for appointment: ${appointmentId}`);

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      console.log(`[Dashboard] Connecting WebSocket and subscribing...`);
      connectWebSocket();

      localStorage.setItem('currentAppointmentId', appointmentId);

      const unsubscribe = subscribeToAppointmentRollback(appointmentId, (notification) => {
        console.log('[Dashboard] Appointment rollback received:', notification);
        toast.error(notification.message || 'Bắt đầu khám thất bại. Vui lòng quay lại trang lịch hẹn.');
        localStorage.removeItem('currentAppointmentId');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      });
      unsubscribeRef.current = unsubscribe;
      
      console.log(`[Dashboard] Subscribed to rollback notifications, now starting appointment...`);
      
      await appointmentController.startAppointment(appointmentId);
      onNavigateToPatient(patientId, appointmentId);
    } catch (err) {
      setAppointmentError(
        err instanceof Error ? err.message : 'Khong the bat dau kham'
      );
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      localStorage.removeItem('currentAppointmentId');
    } finally {
      setProcessingId(null);
    }
  };

  const handleContinueExamination = (appointmentId: string, patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToPatient(patientId, appointmentId);
  };

  const handleView = (patientId: string, appointmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToPatient(patientId, appointmentId);
  };

 


  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoadingAppointments(true);
        setAppointmentError(null);

        if (!doctorId) {
          setAppointmentError('Khong tim thay thong tin bac si');
          setAppointments([]);
          setPatientMap({});
          return;
        }

        const data = await appointmentController.getByDoctorId(doctorId);
        setAppointments(data);

   
        const patientIds = Array.from(
          new Set(data.map((apt) => apt.patientId).filter(Boolean))
        );
        if (!patientIds.length) {
          setPatientMap({});
          return;
        }

      

        const patients = await Promise.all(
          patientIds.map(async (pid) => {
            try {
              return await patientController.getWithUserById(pid);
            } catch (err) {
              console.error('Failed to load patient', pid, err);
              return null;
            }
          })
        );

        const map: Record<string, PatientWithUser> = {};
        patients.forEach((p, index) => {
          if (p) {
            const pid = patientIds[index];
            if (pid) map[pid] = p;
          }
        });
        setPatientMap(map);
        
      } catch (err) {
        setAppointmentError(
          err instanceof Error ? err.message : 'Khong tai duoc lich hen'
        );
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [doctorId]);

  const todayAppointments: AppointmentWithPatient[] = useMemo(() => {
    const todayKey = new Date().toDateString();
    return appointments
      .filter((apt) => {
        const start = new Date(apt.appointmentStartTime);
        return !isNaN(start.getTime()) && start.toDateString() === todayKey;
      })
      .map((apt) => {
        const patient = apt.patientId ? patientMap[apt.patientId] : undefined;
        const start = new Date(apt.appointmentStartTime);
        const timeLabel = isNaN(start.getTime())
          ? 'N/A'
          : start.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });
        return { ...apt, patient, timeLabel };
      })
      .sort(
        (a, b) =>
          new Date(a.appointmentStartTime).getTime() -
          new Date(b.appointmentStartTime).getTime()
      );
  }, [appointments, patientMap]);

  const pendingRecords: AppointmentWithPatient[] = useMemo(() => {
    return appointments
      .filter((apt) => {
        const status = apt.status;
        return status === 'IN_PROGRESS' || status === 'CHECKED';
      })
      .map((apt) => {
        const patient = apt.patientId ? patientMap[apt.patientId] : undefined;
        const start = new Date(apt.appointmentStartTime);
        const dateLabel = isNaN(start.getTime())
          ? 'N/A'
          : start.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
        return { ...apt, patient, timeLabel: dateLabel };
      })
      .sort(
        (a, b) =>
          new Date(b.appointmentStartTime).getTime() -
          new Date(a.appointmentStartTime).getTime()
      );
  }, [appointments, patientMap]);

  return (
    <div className="p-6 space-y-6 bg-[var(--page-bg)] min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Bảng điều khiển</h1>
        <p className="text-neutral-text/60">Tổng quan công việc trong ngày của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Main: Today's Appointments */}
        <Card className="lg:col-span-2 rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 typo-h4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              Lịch hẹn hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {loadingAppointments ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-text/60">Đang tải lịch hẹn hôm nay...</p>
              </div>
            ) : appointmentError ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{appointmentError}</span>
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-neutral-text/40" />
                </div>
                <p className="text-neutral-text/60">Hôm nay không có lịch hẹn nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => {
                  const patientName =
                    appointment.patient?.user?.fullName || 'Benh nhan';
                  const phone =
                    appointment.patient?.contactPhone ||
                    appointment.patient?.user?.phone ||
                    'N/A';
                  const status = appointment.status;
                  const canClick = !isConfirmed(status);

                  return (
                    <div
                      key={appointment.id}
                      className={`group flex items-center justify-between p-4 bg-neutral-surface border border-neutral-border/30 rounded-xl transition-all duration-200 ${
                        canClick
                          ? 'hover:border-primary hover:shadow-md cursor-pointer'
                          : 'cursor-not-allowed opacity-75'
                      }`}
                      onClick={() => {
                        if (canClick && appointment.patientId) {
                          onNavigateToPatient(appointment.patientId, appointment.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[80px] px-3 py-2 rounded-lg bg-neutral-muted group-hover:bg-primary/10 transition-colors">
                          <Clock className="w-4 h-4 text-neutral-text/60 group-hover:text-primary transition-colors" />
                          <span className="font-medium text-neutral-text">
                            {appointment.timeLabel}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-text group-hover:text-primary transition-colors">{patientName}</p>
                          <div className="flex items-center gap-2 text-sm text-neutral-text/60 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(status)}
                        {isCheckedIn(status) && (
                          <Button
                            size="sm"
                            variant="default"
                            className="rounded-[10px] bg-[#3FB5FF] text-white hover:bg-[#2ea3e6]"
                            onClick={(e) => appointment.patientId && handleStartExamination(appointment.id, appointment.patientId, e)}
                            disabled={processingId === appointment.id || !appointment.patientId}
                          >
                            {processingId === appointment.id ? 'Đang xử lý...' : 'Bắt đầu khám'}
                          </Button>
                        )}
                        {isInProgress(status) && (
                          <Button
                            size="sm"
                            variant="default"
                            className="rounded-[10px] bg-[#3FB5FF] text-white hover:bg-[#2ea3e6]"
                            onClick={(e) => appointment.patientId && handleContinueExamination(appointment.id, appointment.patientId, e)}
                          >
                            Tiếp tục khám
                          </Button>
                        )}
                        {isViewOnly(status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-[10px] border-[#3FB5FF] text-[#3FB5FF]"
                            onClick={(e) => appointment.patientId && handleView(appointment.patientId, appointment.id, e)}
                          >
                            Xem
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Records */}
        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 typo-h4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              Hồ sơ chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {loadingAppointments ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-text/60">Đang tải hồ sơ...</p>
              </div>
            ) : pendingRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mb-4">
                  <FileCheck className="w-8 h-8 text-neutral-text/40" />
                </div>
                <p className="text-neutral-text/60">Không có hồ sơ chờ xử lý</p>
              </div>
            ) : (
              <div className="space-y-3 h-full">
                {pendingRecords.map((appointment) => {
                  const patientName =
                    appointment.patient?.user?.fullName || 'Bệnh nhân';
                  const dateLabel = appointment.timeLabel;
                  const status = appointment.status;

                  return (
                    <div
                      key={appointment.id}
                      className="group p-4 bg-neutral-surface border border-neutral-border/30 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() =>
                        appointment.patientId &&
                        onNavigateToPatient(appointment.patientId, appointment.id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-neutral-muted group-hover:bg-primary/10 transition-colors flex-shrink-0">
                          <User className="w-5 h-5 text-neutral-text/60 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-text group-hover:text-primary transition-colors truncate">
                            {patientName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-sm text-neutral-text/60 whitespace-nowrap">
                              Chưa hoàn tất khám
                            </p>
                            <div className="flex-shrink-0">
                              {getStatusBadge(status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-sm font-medium text-neutral-text/60 whitespace-nowrap">
                            {dateLabel}
                          </span>
                          {isCheckedIn(status) && (
                            <Button
                              size="sm"
                              variant="default"
                              className="rounded-[10px] bg-[#3FB5FF] text-white hover:bg-[#2ea3e6] whitespace-nowrap"
                              onClick={(e) => appointment.patientId && handleStartExamination(appointment.id, appointment.patientId, e)}
                              disabled={processingId === appointment.id || !appointment.patientId}
                            >
                              {processingId === appointment.id ? 'Đang xử lý...' : 'Bắt đầu khám'}
                            </Button>
                          )}
                          {isInProgress(status) && (
                            <Button
                              size="sm"
                              variant="default"
                              className="rounded-[10px] bg-[#3FB5FF] text-white hover:bg-[#2ea3e6] whitespace-nowrap"
                              onClick={(e) => appointment.patientId && handleContinueExamination(appointment.id, appointment.patientId, e)}
                            >
                              Tiếp tục khám
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
