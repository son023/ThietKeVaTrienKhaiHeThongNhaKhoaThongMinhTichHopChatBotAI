import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ChevronLeft, ChevronRight, ClipboardPlus, ShieldCheck } from 'lucide-react';
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
    waiting_confirm: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    waiting_checkin: 'bg-blue-100 text-blue-800 border-blue-300',
    checked_in: 'bg-purple-100 text-purple-800 border-purple-300',
    in_treatment: 'bg-green-100 text-green-800 border-green-300',
    waiting_payment: 'bg-orange-100 text-orange-800 border-orange-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
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
    <div className="p-8 space-y-6">
      {/* DoctorHeader */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#01304e] mb-1">Lịch hẹn (Tổng quan)</h1>
          <p className="text-gray-600">Quản lý lịch hẹn của tất cả bác sĩ</p>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
            className={viewMode === 'day' ? 'bg-[#3FB5FF]' : ''}
          >
            Ngày
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-[#3FB5FF]' : ''}
          >
            Tuần
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl text-[#01304e]">
              {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {loadingAppointments && (
        <div className="text-sm text-gray-600 px-1">Đang tải lịch hẹn...</div>
      )}
      {appointmentsError && (
        <div className="text-sm text-red-600 px-1">{appointmentsError}</div>
      )}

      {/* Doctor Filter */}
      <Card className="p-4">
        <h3 className="text-sm text-[#01304e] mb-3">Bộ lọc Bác sĩ</h3>
        <div className="flex flex-wrap gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center gap-2">
              <Checkbox
                id={`doctor-${doctor.id}`}
                checked={selectedDoctors.includes(doctor.id)}
                onCheckedChange={() => toggleDoctor(doctor.id)}
              />
              <label
                htmlFor={`doctor-${doctor.id}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: doctor.color }}
                />
                <span className="text-sm text-gray-700">{doctor.name}</span>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-6">
        <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {/* Time Column */}
          <div className="space-y-4">
            <div className="h-8" /> {/* DoctorHeader spacer */}
            {timeSlots.map((time) => (
              <div key={time} className="h-16 flex items-start justify-end pr-2 text-xs text-gray-500">
                {time}
              </div>
            ))}
          </div>

          {/* Doctor Columns */}
          {doctors
            .filter(doctor => selectedDoctors.includes(doctor.id))
            .map((doctor) => (
              <div key={doctor.id} className="space-y-4">
                {/* Doctor DoctorHeader */}
                <div className="h-8 flex items-center justify-center border-b-2 pb-2" style={{ borderColor: doctor.color }}>
                  <span className="text-sm text-[#01304e]">{doctor.name}</span>
                </div>

                {/* Time Slots */}
                <div className="relative space-y-1">
                  {timeSlots.map((time) => {
                    const doctorAppts = filteredAppointments.filter(
                      apt => apt.doctorId === doctor.id && apt.time === time
                    );

                    return (
                      <div key={time} className="h-16 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors relative">
                        {doctorAppts.map((apt) => (
                          <div
                            key={apt.id}
                            className={`absolute inset-0 p-2 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${statusColors[apt.status]}`}
                            style={{
                              height: `${(apt.duration / 30) * 32}px`,
                            }}
                          >
                            {apt.status !== 'checked_in' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-1 right-1 h-7 px-2 text-[11px] bg-white/80 hover:bg-white shadow-sm"
                                onClick={() => openCheckInDialog(apt)}
                              >
                                <ClipboardPlus className="w-3 h-3 mr-1" />
                                Check-in
                              </Button>
                            )}
                            {apt.status === 'checked_in' && (
                              <div className="absolute top-1 right-1 flex items-center gap-1 text-green-700 text-[11px] bg-white/80 px-2 py-1 rounded">
                                <ShieldCheck className="w-3 h-3" />
                                Đã check-in
                              </div>
                            )}
                            <p className="text-xs line-clamp-1">{apt.patientName}</p>
                            <p className="text-xs text-gray-600">{apt.service}</p>
                            <p className="text-xs mt-1">{apt.time} ({apt.duration}p)</p>
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
      <div className="flex items-center gap-6 text-xs">
        <span className="text-gray-600">Trạng thái:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-400" />
          <span>Chờ xác nhận</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-400" />
          <span>Đã xác nhận</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-400" />
          <span>Đã check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span>Đang khám</span>
        </div>
      </div>
    </div>
  );
}
