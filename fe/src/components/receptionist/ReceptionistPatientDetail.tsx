import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface ReceptionistPatientDetailProps {
  patientId: string;
  onBack: () => void;
  onNewAppointment: () => void;
  onCreateInvoice: () => void;
}

export function ReceptionistPatientDetail({ patientId, onBack, onNewAppointment, onCreateInvoice }: ReceptionistPatientDetailProps) {
  // Mock data
  const patient = {
    id: patientId,
    code: 'BN001',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@gmail.com',
    birthDate: '15/03/1985',
    age: 40,
    gender: 'Nam',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    source: 'Facebook',
    notes: 'Khách hàng VIP, ưu tiên phục vụ',
  };

  const appointments = [
    { id: '1', date: '20/10/2025', time: '09:00', doctor: 'BS. Phạm Mai', service: 'Khám tổng quát', status: 'completed' },
    { id: '2', date: '15/10/2025', time: '14:00', doctor: 'BS. Lê Anh', service: 'Trám răng', status: 'completed' },
    { id: '3', date: '30/10/2025', time: '10:00', doctor: 'BS. Phạm Mai', service: 'Tái khám', status: 'confirmed' },
  ];

  const invoices = [
    { id: '1', date: '20/10/2025', amount: 500000, status: 'paid', services: 'Khám tổng quát' },
    { id: '2', date: '15/10/2025', amount: 800000, status: 'paid', services: 'Trám răng Composite' },
    { id: '3', date: '10/10/2025', amount: 300000, status: 'unpaid', services: 'Cạo vôi răng' },
  ];

  const treatmentPlans = [
    {
      id: '1',
      name: 'Kế hoạch chỉnh nha',
      doctor: 'BS. Phạm Thị Ngọc Mai',
      startDate: '15/10/2025',
      status: 'in_progress',
      totalCost: 25000000,
      paidAmount: 10000000,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* DoctorHeader */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl text-[#01304e]">{patient.name}</h1>
              <Badge variant="outline">{patient.age} tuổi</Badge>
              <Badge variant="outline" className="font-mono">{patient.code}</Badge>
            </div>
            <p className="text-gray-600">{patient.phone} • {patient.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onNewAppointment}
          >
            <Calendar className="w-4 h-4" />
            Đặt lịch hẹn
          </Button>
          <Button
            className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 gap-2"
            onClick={onCreateInvoice}
          >
            <DollarSign className="w-4 h-4" />
            Tạo Hóa đơn
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Thông tin Hành chính</TabsTrigger>
          <TabsTrigger value="history">Lịch sử Hẹn & Thanh toán</TabsTrigger>
          <TabsTrigger value="treatment">Kế hoạch điều trị</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Info */}
        <TabsContent value="info" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg text-[#01304e] mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <Input id="name" defaultValue={patient.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input id="phone" defaultValue={patient.phone} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={patient.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input id="birthDate" defaultValue={patient.birthDate} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Input id="gender" defaultValue={patient.gender} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Nguồn biết đến phòng khám</Label>
                <Input id="source" defaultValue={patient.source} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" defaultValue={patient.address} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Ghi chú (của Lễ tân)</Label>
                <Textarea
                  id="notes"
                  defaultValue={patient.notes}
                  placeholder="Ví dụ: Bệnh nhân khó tính, Gọi nhắc trước 2 ngày..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">
                Lưu thay đổi
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: History */}
        <TabsContent value="history" className="space-y-6">
          {/* Appointments History */}
          <Card className="p-6">
            <h3 className="text-lg text-[#01304e] mb-4">Lịch sử Lịch hẹn</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>{apt.date}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{apt.doctor}</TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell>
                      <Badge variant={apt.status === 'completed' ? 'default' : 'outline'}>
                        {apt.status === 'completed' ? 'Hoàn tất' : 'Đã xác nhận'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Invoices History */}
          <Card className="p-6">
            <h3 className="text-lg text-[#01304e] mb-4">Lịch sử Thanh toán</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">HD{invoice.id.padStart(4, '0')}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.services}</TableCell>
                    <TableCell className="text-right">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                        className={invoice.status === 'paid' ? 'bg-green-600' : ''}
                      >
                        {invoice.status === 'paid' ? 'Đã thanh toán' : 'Còn nợ'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab 3: Treatment Plans (Read-only) */}
        <TabsContent value="treatment" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#01304e]">Kế hoạch điều trị</h3>
              <Badge variant="outline" className="text-xs">Chỉ xem</Badge>
            </div>

            {treatmentPlans.map((plan) => (
              <Card key={plan.id} className="p-4 bg-gray-50">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[#01304e]">{plan.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Bác sĩ phụ trách: {plan.doctor}
                      </p>
                    </div>
                    <Badge className="bg-blue-600">Đang thực hiện</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ngày bắt đầu</p>
                      <p className="text-sm text-[#01304e]">{plan.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tổng chi phí</p>
                      <p className="text-sm text-[#01304e]">
                        {plan.totalCost.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Đã thanh toán</p>
                      <p className="text-sm text-green-600">
                        {plan.paidAmount.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600">Tiến độ thanh toán</span>
                      <span className="text-[#01304e]">
                        {Math.round((plan.paidAmount / plan.totalCost) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3FB5FF]"
                        style={{ width: `${(plan.paidAmount / plan.totalCost) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    Xem chi tiết kế hoạch
                  </Button>
                </div>
              </Card>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
