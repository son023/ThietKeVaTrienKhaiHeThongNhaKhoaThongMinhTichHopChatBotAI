import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Doctor {
  id: string;
  name: string;
  color: string;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: number;
  doctorId: string;
  status: 'waiting_confirm' | 'confirmed' | 'checked_in' | 'in_treatment' | 'completed';
  service: string;
}

export function ReceptionistAppointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  const doctors: Doctor[] = [
    { id: '1', name: 'BS. Phạm Thị Ngọc Mai', color: '#3FB5FF' },
    { id: '2', name: 'BS. Lê Văn Anh', color: '#10B981' },
    { id: '3', name: 'BS. Nguyễn Thu Hà', color: '#F59E0B' },
  ];

  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(doctors.map(d => d.id));

  const appointments: Appointment[] = [
    { id: '1', patientName: 'Nguyễn Văn A', time: '09:00', duration: 60, doctorId: '1', status: 'confirmed', service: 'Khám tổng quát' },
    { id: '2', patientName: 'Trần Thị B', time: '09:30', duration: 30, doctorId: '2', status: 'waiting_confirm', service: 'Trám răng' },
    { id: '3', patientName: 'Lê Văn C', time: '10:00', duration: 90, doctorId: '1', status: 'confirmed', service: 'Tẩy trắng răng' },
    { id: '4', patientName: 'Phạm Thị D', time: '10:30', duration: 45, doctorId: '3', status: 'checked_in', service: 'Nhổ răng khôn' },
    { id: '5', patientName: 'Hoàng Văn E', time: '14:00', duration: 30, doctorId: '2', status: 'confirmed', service: 'Cạo vôi' },
    { id: '6', patientName: 'Võ Thị F', time: '14:30', duration: 60, doctorId: '1', status: 'in_treatment', service: 'Niềng răng' },
  ];

  const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  const statusColors = {
    waiting_confirm: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    checked_in: 'bg-purple-100 text-purple-800 border-purple-300',
    in_treatment: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const filteredAppointments = appointments.filter(apt => selectedDoctors.includes(apt.doctorId));

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
