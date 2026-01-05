import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Clock, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { doctorController, DoctorWithUser } from '../../controllers/DoctorController';
import { userController } from '../../controllers/UserController';
import { patientController } from '../../controllers/PatientController';
import { toast } from 'sonner';
import CheckinDialog from './CheckinDialog';

interface Doctor {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  endTime: string;
  duration: number;
  doctorId: string;
  status:
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // State for doctors
  const [doctors, setDoctors] = useState<Doctor[]>([{ id: 'all', name: 'Tất cả bác sĩ' }]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_checkin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'checked_in':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'in_treatment':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'waiting_payment':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting_checkin':
        return 'Chờ check-in';
      case 'checked_in':
        return 'Đã check-in';
      case 'in_treatment':
        return 'Đang khám';
      case 'waiting_payment':
        return 'Chờ thanh toán';
      case 'completed':
        return 'Hoàn tất';
      default:
        return status;
    }
  };

  const filteredDoctors = selectedDoctor === 'all'
    ? doctors.filter(d => d.id !== 'all')
    : doctors.filter(d => d.id === selectedDoctor);

  const filteredAppointments = useMemo(
    () => selectedDoctor === 'all'
      ? appointments
      : appointments.filter(apt => apt.doctorId === selectedDoctor),
    [appointments, selectedDoctor]
  );

  // Generate week dates
  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(new Date(currentDate));

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const openCheckInDialog = async (apt: Appointment) => {
    // Only allow check-in for waiting_checkin status
    if (apt.status !== 'waiting_checkin') {
      toast.error('Chỉ có thể check-in cho lịch hẹn đang chờ check-in');
      return;
    }

    setSelectedAppointment(apt);
    setCheckInDialogOpen(true);
  };

  // Helper function to assign appointments to rows (prevent overlap)
  const assignAppointmentsToRows = (appointments: Appointment[]) => {
    // Sort by start time
    const sorted = [...appointments].sort((a, b) => {
      const aTime = parseInt(a.time.replace(':', ''));
      const bTime = parseInt(b.time.replace(':', ''));
      return aTime - bTime;
    });

    const rows: Array<{ appointments: Appointment[]; endTime: number }> = [];
    const appointmentRowMap = new Map<string, number>();

    sorted.forEach((apt) => {
      const [hours, minutes] = apt.time.split(':').map(Number);
      const startTime = hours * 60 + minutes; // Convert to minutes
      const endTime = startTime + apt.duration;

      // Find first available row
      let assignedRow = -1;
      for (let i = 0; i < rows.length; i++) {
        if (startTime >= rows[i].endTime) {
          // No overlap, can use this row
          assignedRow = i;
          break;
        }
      }

      // If no row available, create new row
      if (assignedRow === -1) {
        assignedRow = rows.length;
        rows.push({ appointments: [], endTime: 0 });
      }

      // Assign appointment to row
      rows[assignedRow].appointments.push(apt);
      rows[assignedRow].endTime = endTime;
      appointmentRowMap.set(apt.id, assignedRow);
    });

    return {
      rowCount: rows.length,
      getRow: (aptId: string) => appointmentRowMap.get(aptId) || 0,
    };
  };

  const mapStatus = (status: string): Appointment['status'] => {
    switch (status) {
      case 'CONFIRMED':
        return 'waiting_checkin';      // Chờ check-in
      case 'CHECKED':
        return 'checked_in';            // Đã check-in
      case 'IN_PROGRESS':
        return 'in_treatment';          // Đang khám
      case 'COMPLETED':
        return 'waiting_payment';       // Chờ thanh toán
      case 'COMPLETED_INVOICE':
        return 'completed';             // Hoàn tất
      default:
        // Nếu có status không xác định, mặc định là waiting_checkin
        return 'waiting_checkin';
    }
  };

  // Load doctors from backend
  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const doctorsData = await doctorController.getWithUserDetails();

      const mappedDoctors: Doctor[] = doctorsData.map((doc: DoctorWithUser) => ({
        id: doc.userId,
        name: doc.user?.fullName ? `BS. ${doc.user.fullName}` : `BS. ${doc.userId.substring(0, 8)}`,
      }));

      setDoctors([{ id: 'all', name: 'Tất cả bác sĩ' }, ...mappedDoctors]);
    } catch (error) {
      console.error('Error loading doctors:', error);
      // Fallback to default doctors if API fails
      setDoctors([
        { id: 'all', name: 'Tất cả bác sĩ' },
        { id: '1', name: 'BS. Phạm Thị Ngọc Mai' },
        { id: '2', name: 'BS. Lê Văn Anh' },
        { id: '3', name: 'BS. Nguyễn Thu Hà' },
      ]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Load appointments from backend
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      setAppointmentsError(null);

      const data = await appointmentController.getByDate(currentDate);

      const mapped: Appointment[] = await Promise.all(
          data.map(async (apt: AppointmentDTO) => {
            const start = new Date(apt.appointmentStartTime);
            const end = new Date(apt.appointmentEndTime);

            // 1️⃣ Tính duration
            let durationMinutes = Math.round(
                (end.getTime() - start.getTime()) / 60000
            );

            if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
              const servicesTime =
                  apt.medicalServices?.reduce(
                      (sum, sv) => sum + (sv.serviceTime || 0),
                      0
                  ) ?? 0;

              durationMinutes = servicesTime > 0 ? servicesTime : 60;
            }

            durationMinutes = Math.min(Math.max(durationMinutes, 15), 240);

            // 2️⃣ Format time
            const startLabel = start.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const endLabel = end.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            // 3️⃣ Gộp service
            const serviceNames =
                apt.medicalServices?.map((s) => s.serviceName).filter(Boolean) ?? [];

            let serviceLabel = 'Khám tổng quát';
            if (serviceNames.length > 0) {
              const firstTwo = serviceNames.slice(0, 2).join(', ');
              const moreCount = serviceNames.length - 2;
              serviceLabel =
                  moreCount > 0
                      ? `${firstTwo} +${moreCount} dịch vụ khác`
                      : firstTwo;
            }

            // 4️⃣ Fetch patient name
            let patientName = `Bệnh nhân ${apt.patientId?.slice(0, 8) || ''}`;
            try {
              const patientData =
                  await patientController.getWithUserById(apt.patientId);
              if (patientData.user?.fullName) {
                patientName = patientData.user.fullName;
              }
            } catch (err) {
              console.warn(
                  `Cannot fetch patient data for ${apt.patientId}:`,
                  err
              );
            }

            return {
              id: apt.id,
              patientId: apt.patientId,
              patientName,
              time: startLabel,
              endTime: endLabel,
              duration: durationMinutes,
              doctorId: apt.doctorId,
              status: mapStatus(apt.status),
              service: serviceLabel,
            };
          })
      );

      setAppointments(mapped);
    } catch (error) {
      const msg =
          error instanceof Error ? error.message : 'Không thể tải lịch hẹn';
      setAppointmentsError(msg);
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };


  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Load appointments when date or refreshToken changes
  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, refreshToken]);

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Lịch hẹn</h1>
            <p className="text-sm text-[#333333]/60">Điều phối lịch hẹn toàn phòng khám</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#333333]/60" />
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={loadingDoctors}>
              <SelectTrigger className="w-48 rounded-[10px] border-[#e8e8e8] bg-white">
                <SelectValue placeholder={loadingDoctors ? "Đang tải..." : "Chọn bác sĩ"} />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="day">Ngày</TabsTrigger>
              <TabsTrigger value="week">Tuần</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="rounded-[10px]"
              disabled={loadingAppointments}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[#333333] min-w-[200px] text-center">
              {viewMode === 'day'
                ? currentDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
                : `${weekDates[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}`
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="rounded-[10px]"
              disabled={loadingAppointments}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="rounded-[10px]"
              disabled={loadingAppointments}
            >
              Hôm nay
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingAppointments && (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#3FB5FF]/30 border-t-[#3FB5FF] rounded-full animate-spin"></div>
              <p className="text-[#333333]/70 font-medium">Đang tải lịch hẹn...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {appointmentsError && !loadingAppointments && (
        <Card className="rounded-[15px] border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-600 flex-shrink-0">⚠️</div>
              <p className="text-red-700 font-medium">{appointmentsError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {!loadingAppointments && !appointmentsError && viewMode === 'day' && (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* DoctorHeader */}
                <div className="grid grid-cols-[200px_1fr] border-b border-[#e8e8e8]">
                  <div className="p-4 bg-gray-50 border-r border-[#e8e8e8]">
                    <p className="text-sm text-[#01304e]">Bác sĩ / Phòng</p>
                  </div>
                  <div className="grid grid-cols-10 bg-gray-50">
                    {timeSlots.map((time) => (
                      <div key={time} className="p-4 border-r border-[#e8e8e8] text-center">
                        <p className="text-sm text-[#333333]/60">{time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Rows */}
                {filteredDoctors.length === 0 && (
                  <div className="p-8 text-center text-[#333333]/60">
                    Không có bác sĩ nào được chọn
                  </div>
                )}
                {filteredDoctors.map((doctor) => {
                  const doctorAppointments = filteredAppointments.filter(a => a.doctorId === doctor.id);

                  // ✅ Assign appointments to rows
                  const { rowCount, getRow } = assignAppointmentsToRows(doctorAppointments);
                  const rowHeight = 80; // Base height per row
                  const totalHeight = rowCount * rowHeight;

                  return (
                    <div key={doctor.id} className="grid grid-cols-[200px_1fr] border-b border-[#e8e8e8]">
                      <div className="p-4 bg-white border-r border-[#e8e8e8]">
                        <p className="text-sm text-[#333333]">{doctor.name}</p>
                        <p className="text-xs text-[#333333]/60 mt-1">
                          {doctorAppointments.length} lịch hẹn
                        </p>
                      </div>
                      <div
                        className="grid grid-cols-10 bg-white relative"
                        style={{ minHeight: `${totalHeight}px` }} // ✅ Dynamic height
                      >
                        {timeSlots.map((time, index) => (
                          <div key={time} className="border-r border-[#e8e8e8] hover:bg-[#d8f0ff]/30 transition-colors" />
                        ))}

                        {/* Appointments */}
                        {doctorAppointments.map((apt) => {
                          const startHour = parseInt(apt.time.split(':')[0]);
                          const startMin = parseInt(apt.time.split(':')[1]);
                          const startCol = (startHour - 8) + (startMin / 60);
                          const widthCols = apt.duration / 60;

                          const row = getRow(apt.id);  // ✅ Get assigned row
                          const top = row * rowHeight + 4;  // ✅ Calculate Y position
                          const height = rowHeight - 8;

                          return (
                            <div
                              key={apt.id}
                              className={`absolute p-2 rounded-[8px] border cursor-pointer hover:shadow-lg transition-all ${getStatusColor(apt.status)}`}
                              style={{
                                left: `${startCol * 10}%`,
                                width: `${widthCols * 10}%`,
                                top: `${top}px`,      // ✅ Row-based position
                                height: `${height}px`, // ✅ Fixed height
                              }}
                              onClick={() => openCheckInDialog(apt)}
                            >
                              <p className="text-xs truncate">{apt.patientName}</p>
                              <p className="text-xs truncate opacity-80">{apt.service}</p>
                              <p className="text-xs opacity-60">
                                {apt.time} - {apt.endTime}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {!loadingAppointments && !appointmentsError && viewMode === 'week' && (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* DoctorHeader with days */}
                <div className="grid grid-cols-8 border-b border-[#e8e8e8] bg-gray-50">
                  <div className="p-4 border-r border-[#e8e8e8]">
                    <p className="text-sm text-[#01304e]">Bác sĩ</p>
                  </div>
                  {weekDates.map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div key={index} className={`p-4 border-r border-[#e8e8e8] text-center ${isToday ? 'bg-[#d8f0ff]/50' : ''}`}>
                        <p className="text-xs text-[#333333]/60">
                          {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </p>
                        <p className={`text-sm ${isToday ? 'text-[#3FB5FF]' : 'text-[#333333]'}`}>
                          {date.getDate()}/{date.getMonth() + 1}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Doctor rows with appointments */}
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="grid grid-cols-8 border-b border-[#e8e8e8] min-h-[120px]">
                    <div className="p-4 bg-white border-r border-[#e8e8e8]">
                      <p className="text-sm text-[#333333]">{doctor.name}</p>
                    </div>
                    {weekDates.map((date, dayIndex) => {
                      const dayAppointments = filteredAppointments.filter(
                        a => a.doctorId === doctor.id &&
                          new Date(currentDate).toDateString() === date.toDateString()
                      );
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 border-r border-[#e8e8e8] hover:bg-[#d8f0ff]/30 transition-colors ${isToday ? 'bg-[#d8f0ff]/10' : 'bg-white'}`}
                        >
                          <div className="space-y-1">
                            {dayAppointments.map((apt) => {
                              return (
                                <div
                                  key={apt.id}
                                  className={`p-2 rounded-[6px] border text-xs cursor-pointer hover:shadow-md transition-all ${getStatusColor(
                                    apt.status
                                  )}`}
                                  onClick={() => openCheckInDialog(apt)}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="truncate">
                                      {apt.time} - {apt.endTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">{apt.patientName}</span>
                                  </div>
                                </div>
                              );
                            })}
                            {dayAppointments.length === 0 && (
                              <p className="text-xs text-[#333333]/40 text-center py-4">Không có lịch</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
        <span className="text-[#333333]/60">Trạng thái:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
          <span>Chờ check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded" />
          <span>Đã check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Đang khám</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
          <span>Chờ thanh toán</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span>Hoàn tất</span>
        </div>
      </div>

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
    </div>
  );
}
