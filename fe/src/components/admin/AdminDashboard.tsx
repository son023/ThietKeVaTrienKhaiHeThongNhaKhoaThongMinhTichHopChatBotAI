import { DollarSign, Users, Calendar, FileText, AlertTriangle, TrendingUp, Clock, Check, X, Package, Wrench, ClipboardCheck, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';

interface Alert {
  id: number;
  type: string;
  title: string;
  detail: string;
  urgent: boolean;
}

export function AdminDashboard() {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);

  const kpis = [
    {
      title: 'Doanh thu hôm nay',
      value: '12,500,000 ₫',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Số bệnh nhân',
      value: '24',
      subtitle: '15 mới / 9 tái khám',
      icon: Users,
      color: 'text-[#3FB5FF]',
    },
    {
      title: 'Tỷ lệ lấp đầy slot',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Hóa đơn chờ thanh toán',
      value: '7',
      subtitle: '3 quá hạn',
      icon: FileText,
      color: 'text-orange-600',
    },
  ];

  const todaySchedule = [
    { doctor: 'BS. Nguyễn Văn Hùng', status: 'busy', patients: 8, slots: 10, current: 'Đang khám (BN003)' },
    { doctor: 'BS. Trần Thị Mai', status: 'available', patients: 5, slots: 10, current: 'Rảnh' },
    { doctor: 'BS. Lê Văn Phong', status: 'busy', patients: 9, slots: 10, current: 'Đang khám (BN012)' },
    { doctor: 'BS. Phạm Thị Lan', status: 'break', patients: 6, slots: 10, current: 'Nghỉ trưa' },
  ];

  const alerts = [
    { id: 1, type: 'inventory', title: 'Hàng tồn kho sắp hết', detail: '5 sản phẩm dưới ngưỡng tối thiểu', urgent: true },
    { id: 2, type: 'maintenance', title: 'Thiết bị cần bảo trì', detail: 'Máy X-ray phòng 2 cần kiểm tra', urgent: false },
    { id: 3, type: 'approval', title: 'Duyệt yêu cầu nhập kho', detail: '2 phiếu nhập chờ phê duyệt', urgent: false },
    { id: 4, type: 'payroll', title: 'Xác nhận bảng lương', detail: 'Bảng lương tháng 10 cần xác nhận', urgent: false },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'busy':
        return <Badge className="bg-red-500">Bận</Badge>;
      case 'available':
        return <Badge className="bg-green-500">Rảnh</Badge>;
      case 'break':
        return <Badge className="bg-gray-500">Nghỉ</Badge>;
      default:
        return null;
    }
  };

  const handleAlertAction = (alert: Alert) => {
    setCurrentAlert(alert);
    setIsAlertDialogOpen(true);
  };

  const renderAlertDialogContent = () => {
    if (!currentAlert) return null;

    switch (currentAlert.type) {
      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-[10px]">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm text-orange-900">Danh sách sản phẩm sắp hết:</p>
                  <ul className="text-xs text-orange-700 mt-2 space-y-1">
                    <li>• Amoxicillin 500mg - Còn 5 hộp (Tối thiểu: 20)</li>
                    <li>• Kim tiêm nha khoa - Còn 8 hộp (Tối thiểu: 30)</li>
                    <li>• Găng tay y tế size M - Còn 12 hộp (Tối thiểu: 50)</li>
                    <li>• Composite Filtek A2 - Còn 3 tuýp (Tối thiểu: 10)</li>
                    <li>• Bông gòn y tế - Còn 6 gói (Tối thiểu: 25)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <Label>Hành động</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]">
                  <Package className="w-4 h-4 mr-2" />
                  Tạo phiếu nhập
                </Button>
                <Button variant="outline" className="rounded-[10px]">
                  Xem kho hàng
                </Button>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-[10px]">
              <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">Thông tin thiết bị:</p>
                  <div className="text-xs text-blue-700 mt-2 space-y-1">
                    <p><strong>Tên thiết bị:</strong> Máy X-ray CBCT</p>
                    <p><strong>Vị trí:</strong> Phòng khám số 2</p>
                    <p><strong>Lần bảo trì cuối:</strong> 15/09/2025</p>
                    <p><strong>Chu kỳ bảo trì:</strong> 30 ngày</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="maintenance-date">Lên lịch bảo trì</Label>
              <Input 
                id="maintenance-date" 
                type="date" 
                className="rounded-[10px] border-[#e8e8e8] mt-2" 
              />
            </div>
            <div>
              <Label htmlFor="maintenance-notes">Ghi chú</Label>
              <Textarea 
                id="maintenance-notes" 
                placeholder="Nhập ghi chú về tình trạng thiết bị..."
                className="rounded-[10px] border-[#e8e8e8] mt-2"
                rows={3}
              />
            </div>
          </div>
        );

      case 'approval':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-[10px]">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-purple-900">Phiếu nhập chờ duyệt:</p>
                  <div className="mt-3 space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-purple-900"><strong>Phiếu #NKH-001</strong></p>
                        <Badge variant="outline" className="text-xs">Chờ duyệt</Badge>
                      </div>
                      <p className="text-xs text-purple-700">Nhập thuốc và vật tư - 15,500,000 ₫</p>
                      <p className="text-xs text-purple-600 mt-1">Người tạo: Admin Nam • 20/10/2025</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-purple-900"><strong>Phiếu #NKH-002</strong></p>
                        <Badge variant="outline" className="text-xs">Chờ duyệt</Badge>
                      </div>
                      <p className="text-xs text-purple-700">Nhập vật tư nha khoa - 8,200,000 ₫</p>
                      <p className="text-xs text-purple-600 mt-1">Người tạo: Admin Lan • 22/10/2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="approval-notes">Ghi chú phê duyệt</Label>
              <Textarea 
                id="approval-notes" 
                placeholder="Nhập ghi chú (nếu có)..."
                className="rounded-[10px] border-[#e8e8e8] mt-2"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-green-600 hover:bg-green-700 rounded-[10px]">
                <Check className="w-4 h-4 mr-2" />
                Duyệt tất cả
              </Button>
              <Button variant="outline" className="rounded-[10px] text-red-600 border-red-300 hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-[10px]">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-900">Tổng quan Bảng lương Tháng 10/2025:</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600">Tổng nhân viên</p>
                      <p className="text-green-900">12 người</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600">Tổng chi phí</p>
                      <p className="text-green-900">145,600,000 ₫</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600">Bác sĩ</p>
                      <p className="text-green-900">4 người • 85.2M ₫</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600">Nhân viên</p>
                      <p className="text-green-900">8 người • 60.4M ₫</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Vui lòng kiểm tra kỹ trước khi xác nhận. Sau khi xác nhận, bảng lương sẽ được gửi đến kế toán để thanh toán.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="payroll-notes">Ghi chú</Label>
              <Textarea 
                id="payroll-notes" 
                placeholder="Nhập ghi chú về bảng lương (nếu có)..."
                className="rounded-[10px] border-[#e8e8e8] mt-2"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-[10px]">
                Xem chi tiết
              </Button>
              <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]">
                <Check className="w-4 h-4 mr-2" />
                Xác nhận
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#fcfeff]">
      <div>
        <h1 className="text-[#01304e] mb-2">Bảng điều khiển tổng quan</h1>
        <p className="text-[#333333]/60">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-[#333333]/60">{kpi.title}</p>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[#01304e] mb-1">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="text-xs text-[#333333]/60">{kpi.subtitle}</p>
                  )}
                  {kpi.change && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">{kpi.change}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Overview */}
        <Card className="lg:col-span-2 rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#01304e]">
              <Calendar className="w-5 h-5 text-[#3FB5FF]" />
              Tổng quan Lịch hẹn hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((schedule, index) => (
                <div key={index} className="p-4 bg-white border border-[#e8e8e8] rounded-[10px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#3FB5FF]/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#3FB5FF]" />
                      </div>
                      <div>
                        <p className="text-[#333333]">{schedule.doctor}</p>
                        <p className="text-sm text-[#333333]/60">{schedule.current}</p>
                      </div>
                    </div>
                    {getStatusBadge(schedule.status)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm text-[#333333]/60 mb-1">
                      <span>{schedule.patients}/{schedule.slots} bệnh nhân</span>
                      <span>{Math.round((schedule.patients / schedule.slots) * 100)}%</span>
                    </div>
                    <Progress value={(schedule.patients / schedule.slots) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Quick Actions */}
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#01304e]">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Cảnh báo & Hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-[10px] border ${
                    alert.urgent ? 'border-orange-300 bg-orange-50' : 'border-[#e8e8e8] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-[#333333]">{alert.title}</p>
                      <p className="text-xs text-[#333333]/60 mt-1">{alert.detail}</p>
                    </div>
                    {alert.urgent && (
                      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full rounded-[10px] text-xs"
                    onClick={() => handleAlertAction(alert)}
                  >
                    Xử lý
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Action Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#01304e] flex items-center gap-2">
              {currentAlert?.type === 'inventory' && <Package className="w-5 h-5 text-orange-600" />}
              {currentAlert?.type === 'maintenance' && <Wrench className="w-5 h-5 text-blue-600" />}
              {currentAlert?.type === 'approval' && <ClipboardCheck className="w-5 h-5 text-purple-600" />}
              {currentAlert?.type === 'payroll' && <Wallet className="w-5 h-5 text-green-600" />}
              {currentAlert?.title}
            </DialogTitle>
            <DialogDescription>
              {currentAlert?.detail}
            </DialogDescription>
          </DialogHeader>
          {renderAlertDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
