import { useState } from 'react';
import { Clock, User, CheckCircle, AlertCircle, FileCheck, Calendar, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface DashboardProps {
  onNavigateToPatient: (id: string) => void;
}

export function Dashboard({ onNavigateToPatient }: DashboardProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const todayAppointments = [
    {
      id: '1',
      time: '09:00',
      patientName: 'Nguyễn Văn An',
      patientId: 'BN001',
      service: 'Khám tổng quát',
      status: 'waiting',
    },
    {
      id: '2',
      time: '10:30',
      patientName: 'Trần Thị Bình',
      patientId: 'BN002',
      service: 'Trám răng',
      status: 'in-progress',
    },
    {
      id: '3',
      time: '14:00',
      patientName: 'Lê Văn Cường',
      patientId: 'BN003',
      service: 'Lấy tủy',
      status: 'completed',
    },
    {
      id: '4',
      time: '15:30',
      patientName: 'Phạm Thị Dung',
      patientId: 'BN004',
      service: 'Tái khám niềng răng',
      status: 'waiting',
    },
  ];

  const pendingRecords = [
    { id: '1', patientName: 'Nguyễn Văn An', type: 'Chưa hoàn tất ghi chú', date: '25/10/2025' },
    { id: '2', patientName: 'Hoàng Thị E', type: 'Kế hoạch điều trị chưa xong', date: '24/10/2025' },
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Chờ khám</Badge>;
      case 'in-progress':
        return <Badge className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">Đang khám</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Hoàn thành</Badge>;
      default:
        return null;
    }
  };

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
    <div className="p-6 space-y-6 bg-[#fcfeff]">
      <div>
        <h1 className="text-[#01304e] mb-2">Bảng điều khiển - Hôm nay</h1>
        <p className="text-[#333333]/60">Tổng quan công việc trong ngày của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Today's Appointments */}
        <Card className="lg:col-span-2 rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#01304e]">
              <Calendar className="w-5 h-5 text-[#3FB5FF]" />
              Lịch hẹn hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-white border border-[#e8e8e8] rounded-[10px] hover:border-[#3FB5FF] hover:shadow-[0px_4px_12px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer"
                  onClick={() => onNavigateToPatient(appointment.patientId)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 w-20">
                      <Clock className="w-4 h-4 text-[#333333]/60" />
                      <span className="text-[#333333]">{appointment.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#333333]">{appointment.patientName}</p>
                      <p className="text-sm text-[#333333]/60">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(appointment.status)}
                    {appointment.status === 'waiting' && (
                      <Button size="sm" className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                        Bắt đầu khám
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tasks */}
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#01304e]">
              <CheckCircle className="w-5 h-5 text-[#3FB5FF]" />
              Việc cần làm nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-[10px] border ${
                    task.urgent ? 'border-orange-300 bg-orange-50' : 'border-[#e8e8e8] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[#333333]">{task.title}</p>
                      <p className="text-sm text-[#333333]/60 mt-1">{task.count} mục</p>
                    </div>
                    {task.urgent && (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-3 bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
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
      <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#01304e]">
            <FileCheck className="w-5 h-5 text-[#3FB5FF]" />
            Hồ sơ chờ xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 bg-white border border-[#e8e8e8] rounded-[10px] hover:border-[#3FB5FF] hover:shadow-[0px_4px_12px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer"
                onClick={() => onNavigateToPatient(record.id)}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#333333]/60" />
                  <div className="flex-1">
                    <p className="text-[#333333]">{record.patientName}</p>
                    <p className="text-sm text-[#333333]/60">{record.type}</p>
                  </div>
                  <span className="text-sm text-[#333333]/60">{record.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#01304e]">
              {selectedTask && getTaskIcon(selectedTask.type)}
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Có {selectedTask?.count} mục cần xử lý
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedTask?.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-white border border-[#e8e8e8] rounded-[10px] hover:border-[#3FB5FF] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-[#333333]/60" />
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        {item.patientName}
                      </p>
                      <span className="text-sm text-[#333333]/60">({item.patientId})</span>
                    </div>
                    <p className="text-sm text-[#333333] mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-[#333333]/60">
                      Ngày: {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-[#3FB5FF] text-[#3FB5FF] hover:bg-[#3FB5FF] hover:text-white rounded-[10px]"
                    onClick={() => handleViewPatient(item.patientId)}
                  >
                    Xem chi tiết
                  </Button>
                  
                  {selectedTask.type === 'xray' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600 rounded-[10px]"
                        onClick={() => handleApproveItem(index)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-[10px]"
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
                        className="flex-1 bg-green-500 hover:bg-green-600 rounded-[10px]"
                        onClick={() => handleApproveItem(index)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Xác nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-[10px]"
                        onClick={() => handleRejectItem(index)}
                      >
                        Yêu cầu chỉnh sửa
                      </Button>
                    </>
                  )}

                  {selectedTask.type === 'dental-chart' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseTaskDialog}
              className="rounded-[10px]"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
