import { useEffect, useMemo, useState } from 'react';
import { Clock, User, AlertCircle, FileCheck, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  appointmentController,
  AppointmentDTO,
} from '../../controllers/AppointmentController';
import { patientController } from '../../controllers/PatientController';
import { PatientWithUser } from '../../models';

interface DashboardProps {
  onNavigateToPatient: (id: string) => void;
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

  // Appointment data and status helpers

    const statusMeta: Record<string, { label: string; className: string }> = {
      progressing: {
      label: 'Chờ xác nhận',
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    },
    confirmed: {
      label: 'Đã xác nhận',
      className: 'bg-blue-100 text-blue-800 border border-blue-300',
    },
    checked: {
      label: 'Đã check-in',
      className: 'bg-yellow-500 text-white',
    },
    'in_progress': {
      label: 'Đang khám',
      className: 'bg-[#3FB5FF] text-white',
    },
    completed: {
      label: 'Hoàn thành',
      className: 'bg-green-500 text-white',
    },
    cancelled: {
      label: 'Đã huỷ',
      className: 'bg-red-100 text-red-800 border border-red-300',
    },
    'no_show': {
      label: 'Không đến',
      className: 'bg-gray-200 text-gray-800 border border-gray-300',
    },
  };

  const getStatusBadge = (status: string) => {
    const meta = statusMeta[status.toLowerCase()] || statusMeta.progressing;
    return <Badge className={`${meta.className} h-7`}>{meta.label}</Badge>;
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
        patients.forEach((p) => {
          if (p?.userId) {
            map[p.userId] = p;
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
        const status = apt.status?.toLowerCase();
        return status === 'in_progress' || status === 'IN_PROGRESS';
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

                  return (
                    <div
                      key={appointment.id}
                      className="group flex items-center justify-between p-4 bg-neutral-surface border border-neutral-border/30 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() =>
                        appointment.patientId &&
                        onNavigateToPatient(appointment.patientId)
                      }
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
                        {getStatusBadge(appointment.status)}
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

                  return (
                    <div
                      key={appointment.id}
                      className="group p-4 bg-neutral-surface border border-neutral-border/30 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() =>
                        appointment.patientId &&
                        onNavigateToPatient(appointment.patientId)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-neutral-muted group-hover:bg-primary/10 transition-colors">
                          <User className="w-5 h-5 text-neutral-text/60 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-text group-hover:text-primary transition-colors">
                            {patientName}
                          </p>
                          <p className="text-sm text-neutral-text/60 mt-0.5">
                            Chưa hoàn tất khám
                          </p>
                        </div>
                        <span className="text-sm font-medium text-neutral-text/60">
                          {dateLabel}
                        </span>
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
