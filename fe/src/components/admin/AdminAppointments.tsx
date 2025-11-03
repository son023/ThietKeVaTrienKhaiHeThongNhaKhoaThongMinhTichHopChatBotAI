import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus, Clock, User, Save } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function AdminAppointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const doctors = [
    { id: 'all', name: 'Tất cả bác sĩ' },
    { id: 'doc1', name: 'BS. Nguyễn Văn Hùng' },
    { id: 'doc2', name: 'BS. Trần Thị Mai' },
    { id: 'doc3', name: 'BS. Lê Văn Phong' },
    { id: 'doc4', name: 'BS. Phạm Thị Lan' },
  ];

  const appointments = [
    {
      id: '1',
      doctorId: 'doc1',
      doctorName: 'BS. Nguyễn Văn Hùng',
      patientName: 'Nguyễn Văn An',
      patientPhone: '0901234567',
      time: '09:00',
      duration: 60,
      service: 'Khám tổng quát',
      status: 'confirmed',
      room: 'Phòng 1',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '2',
      doctorId: 'doc1',
      doctorName: 'BS. Nguyễn Văn Hùng',
      patientName: 'Trần Thị Bình',
      patientPhone: '0912345678',
      time: '10:30',
      duration: 90,
      service: 'Trám răng',
      status: 'in-progress',
      room: 'Phòng 1',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '3',
      doctorId: 'doc2',
      doctorName: 'BS. Trần Thị Mai',
      patientName: 'Lê Văn Cường',
      patientPhone: '0923456789',
      time: '09:00',
      duration: 120,
      service: 'Cấy ghép Implant',
      status: 'confirmed',
      room: 'Phòng 2',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '4',
      doctorId: 'doc3',
      doctorName: 'BS. Lê Văn Phong',
      patientName: 'Phạm Thị Dung',
      patientPhone: '0934567890',
      time: '09:30',
      duration: 45,
      service: 'Tái khám niềng răng',
      status: 'confirmed',
      room: 'Phòng 3',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: '5',
      doctorId: 'doc3',
      doctorName: 'BS. Lê Văn Phong',
      patientName: 'Hoàng Văn Em',
      patientPhone: '0945678901',
      time: '11:00',
      duration: 60,
      service: 'Cạo vôi răng',
      status: 'pending',
      room: 'Phòng 3',
      date: new Date().toISOString().split('T')[0],
    },
  ];

  const timeSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
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
      case 'in-progress':
        return 'Đang khám';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const filteredDoctors = selectedDoctor === 'all' 
    ? doctors.filter(d => d.id !== 'all')
    : doctors.filter(d => d.id === selectedDoctor);

  // Generate week dates
  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
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

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Lịch hẹn</h1>
            <p className="text-sm text-[#333333]/60">Điều phối lịch hẹn toàn phòng khám</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <Plus className="w-4 h-4 mr-2" />
                Tạo lịch hẹn mới
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[15px] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#01304e]">Tạo lịch hẹn mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin để tạo lịch hẹn mới cho bệnh nhân
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="patient-search">Bệnh nhân <span className="text-red-500">*</span></Label>
                    <Input 
                      id="patient-search" 
                      placeholder="Tìm kiếm hoặc nhập tên bệnh nhân" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                    <p className="text-xs text-[#333333]/60 mt-1">
                      Nhập tên hoặc số điện thoại để tìm bệnh nhân
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="appointment-date">Ngày hẹn <span className="text-red-500">*</span></Label>
                    <Input 
                      id="appointment-date" 
                      type="date"
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="appointment-time">Giờ hẹn <span className="text-red-500">*</span></Label>
                    <Input 
                      id="appointment-time" 
                      type="time"
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="doctor-select">Bác sĩ <span className="text-red-500">*</span></Label>
                    <Select>
                      <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                        <SelectValue placeholder="Chọn bác sĩ" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.id !== 'all').map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="room-select">Phòng khám</Label>
                    <Select>
                      <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room1">Phòng 1</SelectItem>
                        <SelectItem value="room2">Phòng 2</SelectItem>
                        <SelectItem value="room3">Phòng 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="service-select">Dịch vụ <span className="text-red-500">*</span></Label>
                    <Select>
                      <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkup">Khám tổng quát</SelectItem>
                        <SelectItem value="filling">Trám răng</SelectItem>
                        <SelectItem value="cleaning">Cạo vôi răng</SelectItem>
                        <SelectItem value="rootcanal">Điều trị tủy</SelectItem>
                        <SelectItem value="implant">Cấy ghép Implant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Thời lượng dự kiến (phút)</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      defaultValue="30"
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="status-select">Trạng thái</Label>
                    <Select defaultValue="confirmed">
                      <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Ghi chú về lịch hẹn..."
                      className="rounded-[10px] border-[#e8e8e8] min-h-[80px]" 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#e8e8e8]">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)} 
                    className="rounded-[10px]"
                  >
                    Hủy
                  </Button>
                  <Button 
                    className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                    onClick={() => {
                      console.log('Creating appointment...');
                      setIsAddDialogOpen(false);
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Tạo lịch hẹn
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#333333]/60" />
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-48 rounded-[10px] border-[#e8e8e8]">
                <SelectValue placeholder="Chọn bác sĩ" />
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

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
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
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="rounded-[10px]"
            >
              Hôm nay
            </Button>
          </div>
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Header */}
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
                {filteredDoctors.map((doctor) => {
                  const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id);
                  
                  return (
                    <div key={doctor.id} className="grid grid-cols-[200px_1fr] border-b border-[#e8e8e8]">
                      <div className="p-4 bg-white border-r border-[#e8e8e8]">
                        <p className="text-sm text-[#333333]">{doctor.name}</p>
                        <p className="text-xs text-[#333333]/60 mt-1">
                          {doctorAppointments.length} lịch hẹn
                        </p>
                      </div>
                      <div className="grid grid-cols-10 bg-white relative min-h-[80px]">
                        {timeSlots.map((time, index) => (
                          <div key={time} className="border-r border-[#e8e8e8] hover:bg-[#d8f0ff]/30 transition-colors" />
                        ))}
                        
                        {/* Appointments */}
                        {doctorAppointments.map((apt) => {
                          const startHour = parseInt(apt.time.split(':')[0]);
                          const startMin = parseInt(apt.time.split(':')[1]);
                          const startCol = (startHour - 8) + (startMin / 60);
                          const widthCols = apt.duration / 60;
                          
                          return (
                            <div
                              key={apt.id}
                              className={`absolute top-2 bottom-2 p-2 rounded-[8px] border cursor-pointer hover:shadow-lg transition-all ${getStatusColor(apt.status)}`}
                              style={{
                                left: `${startCol * 10}%`,
                                width: `${widthCols * 10}%`,
                              }}
                            >
                              <p className="text-xs truncate">{apt.patientName}</p>
                              <p className="text-xs truncate opacity-80">{apt.service}</p>
                              <p className="text-xs opacity-60">{apt.time}</p>
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
      {viewMode === 'week' && (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Header with days */}
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
                      const dayAppointments = appointments.filter(
                        a => a.doctorId === doctor.id && 
                        new Date(a.date).toDateString() === date.toDateString()
                      );
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <div 
                          key={dayIndex} 
                          className={`p-2 border-r border-[#e8e8e8] hover:bg-[#d8f0ff]/30 transition-colors ${isToday ? 'bg-[#d8f0ff]/10' : 'bg-white'}`}
                        >
                          <div className="space-y-1">
                            {dayAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className={`p-2 rounded-[6px] border text-xs cursor-pointer hover:shadow-md transition-all ${getStatusColor(apt.status)}`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="truncate">{apt.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span className="truncate">{apt.patientName}</span>
                                </div>
                              </div>
                            ))}
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
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="text-[#333333]/60">Trạng thái:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
          <span>Chờ xác nhận</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Đã xác nhận</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
          <span>Đang khám</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span>Hoàn thành</span>
        </div>
      </div>
    </div>
  );
}
