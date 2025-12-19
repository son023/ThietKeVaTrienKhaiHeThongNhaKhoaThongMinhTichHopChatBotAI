import { useEffect, useMemo, useState } from 'react';
import { Clock, User, CheckCircle, AlertCircle, FileCheck, Calendar, X, FileText, Image as ImageIcon, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import {
  appointmentController,
  AppointmentDTO,
} from '../../controllers/AppointmentController';
import {
  patientController,
  PatientWithUser,
} from '../../controllers/PatientController';

interface DashboardProps {
  onNavigateToPatient: (id: string) => void;
  doctorId?: string | null;
}

type AppointmentWithPatient = AppointmentDTO & {
  patient?: PatientWithUser;
  timeLabel: string;
};

export function Dashboard({ onNavigateToPatient, doctorId }: DashboardProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
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


  const pendingRecords = [
    { id: '1', patientName: 'Nguyễn Văn An', type: 'Chưa hoàn tất ghi chú', date: '25/10/2025' },
    { id: '2', patientName: 'Hoàng Thị E', type: 'Chưa hoàn tất ghi chú', date: '24/10/2025' },
  ];

  const quickTasks = [
    { 
      id: '1', 
      title: 'Ký duyệt kết quả X-quang', 
      count: 3, 
      urgent: true,
      type: 'xray',
      items: [
        { patientId: 'BN001', patientName: 'Nguyễn Văn An', date: '28/10/2025', description: 'X-quang toàn cảnh hàm' },
        { patientId: 'BN005', patientName: 'Trần Văn Nam', date: '28/10/2025', description: 'X-quang răng số 6' },
        { patientId: 'BN012', patientName: 'Lê Thị Hoa', date: '27/10/2025', description: 'X-quang cắn cánh' },
      ]
    },
    { 
      id: '2', 
      title: 'Xác nhận kế hoạch điều trị', 
      count: 2, 
      urgent: false,
      type: 'treatment',
      items: [
        { patientId: 'BN002', patientName: 'Trần Thị Bình', date: '28/10/2025', description: 'Kế hoạch niềng răng' },
        { patientId: 'BN008', patientName: 'Phạm Văn Dũng', date: '27/10/2025', description: 'Kế hoạch cấy ghép Implant' },
      ]
    },
    { 
      id: '3', 
      title: 'Cập nhật sơ đồ răng', 
      count: 1, 
      urgent: false,
      type: 'dental-chart',
      items: [
        { patientId: 'BN004', patientName: 'Phạm Thị Dung', date: '28/10/2025', description: 'Cập nhật sau điều trị' },
      ]
    },
  ];
const handleOpenTaskDialog = (task: any) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setShowTaskDialog(false);
    setSelectedTask(null);
  };

  const handleApproveItem = (itemIndex: number) => {
    if (!selectedTask) return;
    
    toast.success(`Đã duyệt: ${selectedTask.items[itemIndex].patientName}`);
    
    // Update task count
    const updatedItems = [...selectedTask.items];
    updatedItems.splice(itemIndex, 1);
    
    if (updatedItems.length === 0) {
      handleCloseTaskDialog();
      toast.success('Đã hoàn thành tất cả công việc!');
    } else {
      setSelectedTask({
        ...selectedTask,
        items: updatedItems,
        count: updatedItems.length,
      });
    }
  };

  const handleRejectItem = (itemIndex: number) => {
    if (!selectedTask) return;
    
    toast.error(`Đã từ chối: ${selectedTask.items[itemIndex].patientName}`);
    
    // Update task count
    const updatedItems = [...selectedTask.items];
    updatedItems.splice(itemIndex, 1);
    
    if (updatedItems.length === 0) {
      handleCloseTaskDialog();
    } else {
      setSelectedTask({
        ...selectedTask,
        items: updatedItems,
        count: updatedItems.length,
      });
    }
  };

  const handleViewPatient = (patientId: string) => {
    handleCloseTaskDialog();
    onNavigateToPatient(patientId);
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'xray':
        return <ImageIcon className="w-5 h-5 text-[#3FB5FF]" />;
      case 'treatment':
        return <FileText className="w-5 h-5 text-[#3FB5FF]" />;
      case 'dental-chart':
        return <CheckCircle className="w-5 h-5 text-[#3FB5FF]" />;
      default:
        return <FileCheck className="w-5 h-5 text-[#3FB5FF]" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[var(--page-bg)]">
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Bảng điều khiển</h1>
        <p className="text-neutral-text/60">Tổng quan công việc trong ngày của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Today's Appointments */}
        <Card className="lg:col-span-2 rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 typo-h4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              Lịch hẹn hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Quick Tasks */}
        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 typo-h4">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              Việc cần làm nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    task.urgent
                      ? 'border-accent-orange/30 bg-accent-orange/5 hover:bg-accent-orange/10'
                      : 'border-neutral-border/30 bg-neutral-surface hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-text">{task.title}</p>
                      <p className="text-sm text-neutral-text/60 mt-1">{task.count} mục</p>
                    </div>
                    {task.urgent && (
                      <AlertCircle className="w-5 h-5 text-accent-orange flex-shrink-0" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all"
                    onClick={() => handleOpenTaskDialog(task)}
                  >
                    Xử lý
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Records */}
      <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 typo-h4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            Hồ sơ chờ xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRecords.map((record) => (
              <div
                key={record.id}
                className="group p-4 bg-neutral-surface border border-neutral-border/30 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onNavigateToPatient(record.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-neutral-muted group-hover:bg-primary/10 transition-colors">
                    <User className="w-5 h-5 text-neutral-text/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-text group-hover:text-primary transition-colors">{record.patientName}</p>
                    <p className="text-sm text-neutral-text/60 mt-0.5">{record.type}</p>
                  </div>
                  <span className="text-sm font-medium text-neutral-text/60">{record.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl border-neutral-border/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 typo-h3">
              {selectedTask && getTaskIcon(selectedTask.type)}
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription className="text-neutral-text/60 mt-2">
              Có {selectedTask?.count} mục cần xử lý
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {selectedTask?.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-neutral-surface border border-neutral-border/30 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-neutral-muted">
                        <User className="w-4 h-4 text-neutral-text/60" />
                      </div>
                      <p className="font-semibold text-neutral-text">
                        {item.patientName}
                      </p>
                      <span className="text-sm text-neutral-text/60">({item.patientId})</span>
                    </div>
                    <p className="text-sm text-neutral-text mb-2 ml-9">
                      {item.description}
                    </p>
                    <p className="text-xs text-neutral-text/60 ml-9">
                      Ngày: {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 min-w-[120px] border-primary/50 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                    onClick={() => handleViewPatient(item.patientId)}
                  >
                    Xem chi tiết
                  </Button>

                  {selectedTask.type === 'xray' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm hover:shadow transition-all"
                        onClick={() => handleApproveItem(index)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        onClick={() => handleRejectItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {selectedTask.type === 'treatment' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm hover:shadow transition-all"
                        onClick={() => handleApproveItem(index)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Xác nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-w-[140px] border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white rounded-lg transition-all"
                        onClick={() => handleRejectItem(index)}
                      >
                        Yêu cầu chỉnh sửa
                      </Button>
                    </>
                  )}

                  {selectedTask.type === 'dental-chart' && (
                    <Button
                      size="sm"
                      className="flex-1 min-w-[140px] bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all"
                      onClick={() => handleApproveItem(index)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Cập nhật xong
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleCloseTaskDialog}
              className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
