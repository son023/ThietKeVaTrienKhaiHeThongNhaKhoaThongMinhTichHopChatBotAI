import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Search } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MyAppointmentsProps {
  onNavigateToPatient: (id: string) => void;
}

export function MyAppointments({ onNavigateToPatient }: MyAppointmentsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');

  const appointments = [
    {
      id: '1',
      patientId: 'BN001',
      patientName: 'Nguyễn Văn An',
      date: '2025-10-26',
      time: '09:00',
      duration: 60,
      service: 'Khám tổng quát',
      status: 'confirmed',
    },
    {
      id: '2',
      patientId: 'BN002',
      patientName: 'Trần Thị Bình',
      date: '2025-10-26',
      time: '10:30',
      duration: 90,
      service: 'Trám răng',
      status: 'confirmed',
    },
    {
      id: '3',
      patientId: 'BN003',
      patientName: 'Lê Văn Cường',
      date: '2025-10-27',
      time: '14:00',
      duration: 120,
      service: 'Cấy ghép Implant',
      status: 'pending',
    },
    {
      id: '4',
      patientId: 'BN004',
      patientName: 'Phạm Thị Dung',
      date: '2025-10-28',
      time: '09:30',
      duration: 45,
      service: 'Tái khám niềng răng',
      status: 'confirmed',
    },
  ];

  // Mock patient list for search
  const allPatients = [
    { id: 'BN001', name: 'Nguyễn Văn An', phone: '0912 345 678' },
    { id: 'BN002', name: 'Trần Thị Bình', phone: '0923 456 789' },
    { id: 'BN003', name: 'Lê Văn Cường', phone: '0934 567 890' },
    { id: 'BN004', name: 'Phạm Thị Dung', phone: '0945 678 901' },
    { id: 'BN005', name: 'Hoàng Văn Em', phone: '0956 789 012' },
  ];

  const filteredPatients = allPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.id.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.phone.includes(searchPatient)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'no-show':
        return 'Không đến';
      default:
        return status;
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#01304e]">Lịch hẹn của tôi</h1>
          <Button 
            className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            onClick={() => setIsNewAppointmentDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Đặt lịch hẹn
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v as 'day' | 'week')}>
            <TabsList>
              <TabsTrigger value="day">Ngày</TabsTrigger>
              <TabsTrigger value="week">Tuần</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - (viewMode === 'week' ? 7 : 1));
                setCurrentDate(newDate);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[#333333] min-w-[200px] text-center">
              {viewMode === 'week'
                ? `Tuần ${Math.ceil(currentDate.getDate() / 7)} - Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`
                : currentDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + (viewMode === 'week' ? 7 : 1));
                setCurrentDate(newDate);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hôm nay
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* DoctorHeader */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 border-r bg-gray-50"></div>
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={index}
                        className={`p-3 text-center border-r ${isToday ? 'bg-[#3FB5FF]/10' : 'bg-gray-50'}`}
                      >
                        <p className={`text-sm ${isToday ? 'text-[#3FB5FF]' : 'text-[#333333]/60'}`}>
                          {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </p>
                        <p className={`${isToday ? 'text-[#3FB5FF]' : 'text-[#333333]'}`}>
                          {day.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b">
                    <div className="p-3 border-r bg-gray-50 text-sm text-[#333333]/60">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayAppointments = appointments.filter((apt) => {
                        const aptDate = new Date(apt.date);
                        return (
                          aptDate.toDateString() === day.toDateString() &&
                          apt.time.startsWith(time.split(':')[0])
                        );
                      });

                      return (
                        <div key={dayIndex} className="p-2 border-r min-h-[60px] hover:bg-gray-50 transition-colors">
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => onNavigateToPatient(apt.patientId)}
                              className={`p-2 rounded border cursor-pointer text-sm ${getStatusColor(apt.status)}`}
                            >
                              <p className="truncate">{apt.patientName}</p>
                              <p className="text-xs truncate">{apt.service}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments
            .filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate.toDateString() === currentDate.toDateString();
            })
            .map((apt) => (
              <Card
                key={apt.id}
                className="cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] hover:shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]"
                onClick={() => onNavigateToPatient(apt.patientId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-[#333333]">{apt.time}</div>
                      <div className="flex-1">
                        <p className="text-[#333333]">{apt.patientName}</p>
                        <p className="text-sm text-[#333333]/60">{apt.service}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(apt.status)}>
                      {getStatusLabel(apt.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[15px]">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Đặt lịch hẹn mới</DialogTitle>
            <DialogDescription>
              Tạo lịch hẹn cho bệnh nhân
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="patient-search">Tìm bệnh nhân</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#333333]/60" />
                <Input
                  id="patient-search"
                  placeholder="Tìm theo tên, mã BN, hoặc số điện thoại..."
                  className="rounded-[10px] pl-10"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                />
              </div>
              {searchPatient && filteredPatients.length > 0 && (
                <div className="mt-2 border border-[#e8e8e8] rounded-[10px] max-h-[200px] overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 hover:bg-[#d8f0ff]/30 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchPatient(patient.name);
                      }}
                    >
                      <p className="text-sm text-[#333333]">{patient.name}</p>
                      <p className="text-xs text-[#333333]/60">
                        {patient.id} • {patient.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-date">Ngày hẹn</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  className="rounded-[10px]"
                  defaultValue={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="appointment-time">Giờ hẹn</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger id="appointment-time" className="rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="appointment-service">Dịch vụ</Label>
              <Select defaultValue="general">
                <SelectTrigger id="appointment-service" className="rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Khám tổng quát</SelectItem>
                  <SelectItem value="filling">Trám răng</SelectItem>
                  <SelectItem value="cleaning">Cạo vôi răng</SelectItem>
                  <SelectItem value="extraction">Nhổ răng</SelectItem>
                  <SelectItem value="root-canal">Điều trị tủy</SelectItem>
                  <SelectItem value="crown">Bọc răng sứ</SelectItem>
                  <SelectItem value="implant">Cấy ghép Implant</SelectItem>
                  <SelectItem value="braces">Niềng răng</SelectItem>
                  <SelectItem value="whitening">Tẩy trắng răng</SelectItem>
                  <SelectItem value="recheck">Tái khám</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment-duration">Thời gian (phút)</Label>
              <Select defaultValue="60">
                <SelectTrigger id="appointment-duration" className="rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="45">45 phút</SelectItem>
                  <SelectItem value="60">60 phút</SelectItem>
                  <SelectItem value="90">90 phút</SelectItem>
                  <SelectItem value="120">120 phút</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment-note">Ghi chú</Label>
              <Textarea
                id="appointment-note"
                placeholder="Ghi chú về lịch hẹn..."
                className="rounded-[10px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsNewAppointmentDialogOpen(false);
                setSearchPatient('');
              }}
              className="rounded-[10px] border-[#e8e8e8]"
            >
              Hủy
            </Button>
            <Button
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              onClick={() => {
                alert('Đã đặt lịch hẹn thành công!');
                setIsNewAppointmentDialogOpen(false);
                setSearchPatient('');
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Xác nhận đặt lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
