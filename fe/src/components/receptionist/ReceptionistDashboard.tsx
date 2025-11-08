import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, User, Phone, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  doctor: string;
  phone: string;
  status: 'waiting_confirm' | 'waiting_checkin' | 'checked_in' | 'in_treatment' | 'waiting_payment' | 'completed';
  service?: string;
}

interface ReceptionistDashboardProps {
  onCreateInvoice?: (appointmentId: string) => void;
}

export function ReceptionistDashboard({ onCreateInvoice }: ReceptionistDashboardProps = {}) {
  const [appointments] = useState<Appointment[]>([
    { id: '1', patientName: 'Nguyễn Văn A', time: '09:00', doctor: 'BS. Phạm Mai', phone: '0901234567', status: 'waiting_confirm', service: 'Khám tổng quát' },
    { id: '2', patientName: 'Trần Thị B', time: '09:30', doctor: 'BS. Lê Anh', phone: '0902345678', status: 'waiting_confirm', service: 'Trám răng' },
    { id: '3', patientName: 'Lê Văn C', time: '10:00', doctor: 'BS. Phạm Mai', phone: '0903456789', status: 'waiting_checkin', service: 'Tẩy trắng răng' },
    { id: '4', patientName: 'Phạm Thị D', time: '10:30', doctor: 'BS. Lê Anh', phone: '0904567890', status: 'waiting_checkin', service: 'Nhổ răng khôn' },
    { id: '5', patientName: 'Hoàng Văn E', time: '11:00', doctor: 'BS. Phạm Mai', phone: '0905678901', status: 'checked_in', service: 'Cạo vôi' },
    { id: '6', patientName: 'Võ Thị F', time: '14:00', doctor: 'BS. Lê Anh', phone: '0906789012', status: 'in_treatment', service: 'Niềng răng' },
    { id: '7', patientName: 'Đặng Văn G', time: '14:30', doctor: 'BS. Phạm Mai', phone: '0907890123', status: 'waiting_payment', service: 'Bọc răng sứ' },
  ]);

  const statusConfig = {
    waiting_confirm: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', count: 2 },
    waiting_checkin: { label: 'Chờ check-in', color: 'bg-blue-100 text-blue-800 border-blue-200', count: 2 },
    checked_in: { label: 'Đã check-in', color: 'bg-purple-100 text-purple-800 border-purple-200', count: 1 },
    in_treatment: { label: 'Đang khám', color: 'bg-green-100 text-green-800 border-green-200', count: 1 },
    waiting_payment: { label: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-800 border-orange-200', count: 1 },
    completed: { label: 'Hoàn tất', color: 'bg-gray-100 text-gray-800 border-gray-200', count: 0 },
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(apt => apt.status === status);
  };

  const handleAction = (appointmentId: string, action: string) => {
    console.log(`Action ${action} on appointment ${appointmentId}`);
    
    if (action === 'invoice' && onCreateInvoice) {
      onCreateInvoice(appointmentId);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Notifications */}
      <div className="space-y-3">
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>Bệnh nhân Nguyễn Văn A</strong> đã đặt lịch online lúc 08:45
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm text-orange-900">
                <strong>Bệnh nhân Lê Văn C</strong> trễ hẹn 10 phút (10:00 AM)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#01304e] mb-2">Luồng Bệnh nhân hôm nay</h1>
        <p className="text-gray-600">Thứ Ba, 28 tháng 10, 2025</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-4">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
          const config = statusConfig[status];
          const statusAppointments = getAppointmentsByStatus(status);
          
          return (
            <div key={status} className="min-w-[240px]">
              {/* Column Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs text-gray-700">{config.label}</h3>
                  <Badge variant="outline" className={`${config.color} border text-xs px-2 py-0`}>
                    {statusAppointments.length}
                  </Badge>
                </div>
                <div className="h-1 bg-gray-200 rounded-full">
                  <div className={`h-1 rounded-full ${config.color.split(' ')[0]}`} style={{ width: '100%' }} />
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {statusAppointments.map((apt) => (
                  <Card key={apt.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer border-[#e8e8e8]">
                    <div className="space-y-2">
                      {/* Patient Info - Compact */}
                      <div>
                        <div className="flex items-start justify-between mb-1.5">
                          <h4 className="text-xs text-[#01304e] line-clamp-1 pr-1">{apt.patientName}</h4>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {apt.time}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate">{apt.doctor}</span>
                        </div>
                        {apt.service && (
                          <p className="text-[10px] text-gray-500 mt-1 truncate" title={apt.service}>
                            {apt.service}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons - Compact */}
                      <div className="pt-2 border-t">
                        {status === 'waiting_confirm' && (
                          <Button
                            size="sm"
                            className="w-full bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 h-7 text-xs"
                            onClick={() => handleAction(apt.id, 'confirm')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Xác nhận
                          </Button>
                        )}
                        {status === 'waiting_checkin' && (
                          <Button
                            size="sm"
                            className="w-full bg-purple-600 hover:bg-purple-700 h-7 text-xs"
                            onClick={() => handleAction(apt.id, 'checkin')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Check-in
                          </Button>
                        )}
                        {status === 'waiting_payment' && (
                          <Button
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-700 h-7 text-xs"
                            onClick={() => handleAction(apt.id, 'invoice')}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Thanh toán
                          </Button>
                        )}
                        {(status === 'checked_in' || status === 'in_treatment' || status === 'completed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-[10px]"
                            onClick={() => handleAction(apt.id, 'view')}
                          >
                            Chi tiết
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {statusAppointments.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-400">
                    Không có
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tasks Section */}
      <div className="mt-8">
        <h2 className="text-xl text-[#01304e] mb-4">Việc cần làm</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-[#01304e]">Gọi điện xác nhận lịch hẹn ngày mai</h3>
              <Badge className="bg-yellow-500">5 BN</Badge>
            </div>
            <p className="text-xs text-gray-600 mb-3">Nhắc nhở bệnh nhân về lịch hẹn vào ngày mai</p>
            <Button size="sm" variant="outline" className="w-full">
              Xem danh sách
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-[#01304e]">Theo dõi bệnh nhân trễ hẹn</h3>
              <Badge className="bg-orange-500">2 BN</Badge>
            </div>
            <p className="text-xs text-gray-600 mb-3">Liên hệ với bệnh nhân chưa đến theo lịch</p>
            <Button size="sm" variant="outline" className="w-full">
              Xem danh sách
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
