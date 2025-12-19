import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ChevronLeft, ChevronRight, ClipboardPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { appointmentController } from '../../controllers/AppointmentController';
import CheckinDialog from './CheckinDialog';

interface Doctor {
  id: string;
  name: string;
  color: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  duration: number;
  doctorId: string;
  status:
    | 'waiting_confirm'
    | 'waiting_checkin'
    | 'checked_in'
    | 'in_treatment'
    | 'waiting_payment'
    | 'completed';
  service: string;
}

interface ReceptionistAppointmentsProps {
  refreshToken?: number;
}

export function ReceptionistAppointments({ refreshToken }: ReceptionistAppointmentsProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const doctors: Doctor[] = [
    { id: '1', name: 'BS. Phạm Thị Ngọc Mai', color: '#3FB5FF' },
    { id: '2', name: 'BS. Lê Văn Anh', color: '#10B981' },
    { id: '3', name: 'BS. Nguyễn Thu Hà', color: '#F59E0B' },
  ];

  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(doctors.map(d => d.id));

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  const statusColors = {
    waiting_confirm: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    waiting_checkin: 'bg-primary/10 text-primary-strong border-primary/30',
    checked_in: 'bg-purple-50 text-purple-700 border-purple-200',
    in_treatment: 'bg-green-50 text-green-700 border-green-200',
    waiting_payment: 'bg-accent-orange/10 text-accent-orange border-accent-orange/30',
    completed: 'bg-neutral-muted text-neutral-text border-neutral-border',
  };

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const openCheckInDialog = async (apt: Appointment) => {
    setSelectedAppointment(apt);
    setCheckInDialogOpen(true);
  };

  const filteredAppointments = useMemo(
    () => appointments.filter(apt => selectedDoctors.includes(apt.doctorId)),
    [appointments, selectedDoctors]
  );

  const mapStatus = (status: string): Appointment['status'] => {
    switch (status) {
      case 'CONFIRMED':
        return 'waiting_checkin';
      case 'CHECKED':
        return 'checked_in';
      case 'IN_PROGRESS':
        return 'in_treatment';
      case 'COMPLETED':
        return 'completed';
      default:
        return 'waiting_confirm';
    }
  };

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      setAppointmentsError(null);
      const today = selectedDate;
      const data = await appointmentController.getByDate(today);
      const mapped: Appointment[] = data.map((apt) => {
        const start = new Date(apt.appointmentStartTime);
        return {
          id: apt.id,
          patientId: apt.patientId,
          patientName: `Bệnh nhân ${apt.patientId?.slice(0, 8) || ''}`,
          time: start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          duration: 60,
          doctorId: apt.doctorId,
          status: mapStatus(apt.status),
          service: apt.medicalServices?.[0]?.serviceName || 'Khám tổng quát',
        };
      });
      setAppointments(mapped);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể tải lịch hẹn';
      setAppointmentsError(msg);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, refreshToken]);

  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">Lịch hẹn (Tổng quan)</h1>
          <p className="text-neutral-text/70 font-medium">Quản lý lịch hẹn của tất cả bác sĩ</p>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-2 bg-neutral-surface border border-neutral-border rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            onClick={() => setViewMode('day')}
            className={viewMode === 'day' ? 'bg-primary hover:bg-primary-strong text-white' : 'hover:bg-neutral-muted text-neutral-text'}
          >
            Ngày
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-primary hover:bg-primary-strong text-white' : 'hover:bg-neutral-muted text-neutral-text'}
          >
            Tuần
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all">
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-text">
              {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <Button variant="outline" size="icon" className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {loadingAppointments && (
        <Card className="p-6 border-neutral-border bg-neutral-surface">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-text/70 font-medium">Đang tải lịch hẹn...</p>
          </div>
        </Card>
      )}
      {appointmentsError && (
        <Card className="p-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{appointmentsError}</p>
          </div>
        </Card>
      )}

      {/* Doctor Filter */}
      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-text mb-4">Bộ lọc Bác sĩ</h3>
        <div className="flex flex-wrap gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-muted transition-colors">
              <Checkbox
                id={`doctor-${doctor.id}`}
                checked={selectedDoctors.includes(doctor.id)}
                onCheckedChange={() => toggleDoctor(doctor.id)}
                className="border-neutral-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={`doctor-${doctor.id}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-neutral-border"
                  style={{ backgroundColor: doctor.color }}
                />
                <span className="text-sm text-neutral-text font-medium">{doctor.name}</span>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {/* Time Column */}
          <div className="space-y-4">
            <div className="h-10" /> {/* Header spacer */}
            {timeSlots.map((time) => (
              <div key={time} className="h-16 flex items-start justify-end pr-2 text-xs text-neutral-text/60 font-medium">
                {time}
              </div>
            ))}
          </div>

          {/* Doctor Columns */}
          {doctors
            .filter(doctor => selectedDoctors.includes(doctor.id))
            .map((doctor) => (
              <div key={doctor.id} className="space-y-4">
                {/* Doctor Header */}
                <div className="h-10 flex items-center justify-center border-b-2 pb-2 transition-colors" style={{ borderColor: doctor.color }}>
                  <span className="text-sm font-semibold text-neutral-text">{doctor.name}</span>
                </div>

                {/* Time Slots */}
                <div className="relative space-y-1">
                  {timeSlots.map((time) => {
                    const doctorAppts = filteredAppointments.filter(
                      apt => apt.doctorId === doctor.id && apt.time === time
                    );

                    return (
                      <div key={time} className="h-16 border border-neutral-border bg-neutral-muted/20 rounded-lg hover:bg-neutral-muted/40 transition-all relative">
                        {doctorAppts.map((apt) => (
                          <div
                            key={apt.id}
                            className={`absolute inset-0 p-2 rounded-lg border-2 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${statusColors[apt.status]}`}
                            style={{
                              height: `${(apt.duration / 30) * 32}px`,
                            }}
                          >
                            {apt.status !== 'checked_in' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-1 right-1 h-7 px-2 text-[11px] bg-neutral-surface/90 hover:bg-neutral-surface shadow-md border border-neutral-border"
                                onClick={() => openCheckInDialog(apt)}
                              >
                                <ClipboardPlus className="w-3 h-3 mr-1" />
                                Check-in
                              </Button>
                            )}
                            {apt.status === 'checked_in' && (
                              <div className="absolute top-1 right-1 flex items-center gap-1 text-green-700 text-[11px] bg-neutral-surface/90 px-2 py-1 rounded shadow-sm border border-green-200">
                                <ShieldCheck className="w-3 h-3" />
                                Đã check-in
                              </div>
                            )}
                            <p className="text-xs font-medium line-clamp-1">{apt.patientName}</p>
                            <p className="text-xs text-neutral-text/70">{apt.service}</p>
                            <p className="text-xs mt-1 text-neutral-text/60">{apt.time} ({apt.duration}p)</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </Card>

      <CheckinDialog
        open={checkInDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null);
          setCheckInDialogOpen(open);
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
              apt.id === selectedAppointment.id ? { ...apt, status: 'checked_in' } : apt
            )
          );
        }}
      />

      {/* Legend */}
      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <span className="text-neutral-text font-semibold">Trạng thái:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 ring-2 ring-offset-1 ring-yellow-200" />
            <span className="text-neutral-text">Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary ring-2 ring-offset-1 ring-primary/30" />
            <span className="text-neutral-text">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500 ring-2 ring-offset-1 ring-purple-200" />
            <span className="text-neutral-text">Đã check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 ring-2 ring-offset-1 ring-green-200" />
            <span className="text-neutral-text">Đang khám</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
