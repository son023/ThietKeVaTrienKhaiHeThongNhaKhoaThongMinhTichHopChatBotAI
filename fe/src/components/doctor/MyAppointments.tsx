import { useState, useEffect } from 'react';
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
import { appointmentController, AppointmentWithDetails } from '../../controllers/AppointmentController';
import { authController } from '../../controllers/AuthController';
import { patientController, PatientWithUser } from '../../controllers/PatientController';

interface MyAppointmentsProps {
  onNavigateToPatient: (id: string) => void;
}

export function MyAppointments({ onNavigateToPatient }: MyAppointmentsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allPatients, setAllPatients] = useState<PatientWithUser[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const currentUser = authController.getCurrentUser();
      if (!currentUser) {
        setError("Không tìm thấy người dùng hiện tại. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [appointmentData, patientData] = await Promise.all([
          appointmentController.getAppointmentsForDoctorWithDetails(currentUser.id),
          patientController.getWithUserDetails(),
        ]);
        setAppointments(appointmentData);
        setAllPatients(patientData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredPatients = allPatients.filter(
    (p) =>
      p.user?.fullName?.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.userId.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.contactPhone?.includes(searchPatient)
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'no-show': return 'Không đến';
      default: return status;
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

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-12">Đang tải lịch hẹn...</div>;
    }
    if (error) {
      return <div className="text-center p-12 text-red-500">{error}</div>;
    }
    
    // The rest of the rendering logic goes here
    if (viewMode === 'week') {
      return (
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 border-r bg-gray-50"></div>
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div key={index} className={`p-3 text-center border-r ${isToday ? 'bg-[#3FB5FF]/10' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${isToday ? 'text-[#3FB5FF]' : 'text-[#333333]/60'}`}>{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                        <p className={`${isToday ? 'text-[#3FB5FF]' : 'text-[#333333]'}`}>{day.getDate()}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b">
                    <div className="p-3 border-r bg-gray-50 text-sm text-[#333333]/60">{time}</div>
                    {weekDays.map((day, dayIndex) => {
                      const dayAppointments = appointments.filter((apt) => {
                        const aptDate = new Date(apt.appointmentStartTime);
                        const aptTime = aptDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return (
                          aptDate.toDateString() === day.toDateString() &&
                          aptTime.startsWith(time.split(':')[0])
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
                              <p className="truncate">{apt.patient?.user?.fullName || 'Bệnh nhân không tên'}</p>
                              <p className="text-xs truncate">{apt.medicalServices?.map(s => s.name).join(', ') || 'Không có dịch vụ'}</p>
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
      )
    } else { // Day view
        const dayAppointments = appointments.filter((apt) => {
            const aptDate = new Date(apt.appointmentStartTime);
            return aptDate.toDateString() === currentDate.toDateString();
        });
        return (
            <div className="space-y-3">
            {dayAppointments.length > 0 ? dayAppointments.map((apt) => (
                <Card
                key={apt.id}
                className="cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] hover:shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]"
                onClick={() => onNavigateToPatient(apt.patientId)}
                >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-[#333333]">{new Date(apt.appointmentStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="flex-1">
                        <p className="text-[#333333]">{apt.patient?.user?.fullName || 'Bệnh nhân không tên'}</p>
                        <p className="text-sm text-[#333333]/60">{apt.medicalServices?.map(s => s.name).join(', ') || 'Không có dịch vụ'}</p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(apt.status)}>
                        {getStatusLabel(apt.status)}
                    </Badge>
                    </div>
                </CardContent>
                </Card>
            )) : <div className="text-center p-12">Không có lịch hẹn nào cho ngày này.</div>}
            </div>
        )
    }
  }


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
            <Button variant="outline" size="sm" onClick={() => {/* ... */}}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[#333333] min-w-[200px] text-center">{/* ... */}</span>
            <Button variant="outline" size="sm" onClick={() => {/* ... */}}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hôm nay
            </Button>
          </div>
        </div>
      </div>

      {renderContent()}

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
                      key={patient.userId}
                      className="p-3 hover:bg-[#d8f0ff]/30 cursor-pointer transition-colors"
                      onClick={() => { setSearchPatient(patient.user?.fullName || ''); }}
                    >
                      <p className="text-sm text-[#333333]">{patient.user?.fullName}</p>
                      <p className="text-xs text-[#333333]/60">
                        {patient.userId} • {patient.contactPhone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other form fields... */}

          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsNewAppointmentDialogOpen(false)}
              className="rounded-[10px] border-[#e8e8e8]"
            >
              Hủy
            </Button>
            <Button
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              onClick={() => { alert('Chức năng này sẽ được thêm vào sau.'); }}
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
