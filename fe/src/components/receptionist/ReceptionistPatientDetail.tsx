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
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-text tracking-tight">{patient.name}</h1>
              <Badge variant="outline" className="border-neutral-border bg-neutral-muted text-neutral-text font-medium">{patient.age} tuổi</Badge>
              <Badge variant="outline" className="font-mono border-primary bg-primary/10 text-primary font-medium">{patient.code}</Badge>
            </div>
            <p className="text-neutral-text/70 font-medium">{patient.phone} • {patient.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all"
            onClick={onNewAppointment}
          >
            <Calendar className="w-4 h-4" />
            Đặt lịch hẹn
          </Button>
          <Button
            className="bg-primary hover:bg-primary-strong gap-2 shadow-sm transition-all duration-200"
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
          <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-text mb-5">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-text font-medium">Họ và tên *</Label>
                <Input id="name" defaultValue={patient.name} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-neutral-text font-medium">Số điện thoại *</Label>
                <Input id="phone" defaultValue={patient.phone} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-text font-medium">Email</Label>
                <Input id="email" type="email" defaultValue={patient.email} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-neutral-text font-medium">Ngày sinh</Label>
                <Input id="birthDate" defaultValue={patient.birthDate} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-neutral-text font-medium">Giới tính</Label>
                <Input id="gender" defaultValue={patient.gender} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-neutral-text font-medium">Nguồn biết đến phòng khám</Label>
                <Input id="source" defaultValue={patient.source} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address" className="text-neutral-text font-medium">Địa chỉ</Label>
                <Input id="address" defaultValue={patient.address} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes" className="text-neutral-text font-medium">Ghi chú (của Lễ tân)</Label>
                <Textarea
                  id="notes"
                  defaultValue={patient.notes}
                  placeholder="Ví dụ: Bệnh nhân khó tính, Gọi nhắc trước 2 ngày..."
                  rows={3}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button className="bg-primary hover:bg-primary-strong shadow-sm transition-all duration-200">
                Lưu thay đổi
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: History */}
        <TabsContent value="history" className="space-y-6">
          {/* Appointments History */}
          <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-text mb-5">Lịch sử Lịch hẹn</h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-muted/30">
                  <TableHead className="font-semibold text-neutral-text">Ngày</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Giờ</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Bác sĩ</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Dịch vụ</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">
                    <TableCell className="text-neutral-text">{apt.date}</TableCell>
                    <TableCell className="text-neutral-text">{apt.time}</TableCell>
                    <TableCell className="text-neutral-text">{apt.doctor}</TableCell>
                    <TableCell className="text-neutral-text">{apt.service}</TableCell>
                    <TableCell>
                      <Badge variant={apt.status === 'completed' ? 'default' : 'outline'} className={apt.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'border-neutral-border'}>
                        {apt.status === 'completed' ? 'Hoàn tất' : 'Đã xác nhận'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Invoices History */}
          <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-text mb-5">Lịch sử Thanh toán</h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-muted/30">
                  <TableHead className="font-semibold text-neutral-text">Mã HĐ</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Ngày</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Dịch vụ</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Số tiền</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">
                    <TableCell className="font-mono text-neutral-text">HD{invoice.id.padStart(4, '0')}</TableCell>
                    <TableCell className="text-neutral-text">{invoice.date}</TableCell>
                    <TableCell className="text-neutral-text">{invoice.services}</TableCell>
                    <TableCell className="text-right text-neutral-text font-semibold">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                        className={invoice.status === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                      >
                        {invoice.status === 'paid' ? 'Đã thanh toán' : 'Còn nợ'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all">
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
          <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-neutral-text">Kế hoạch điều trị</h3>
              <Badge variant="outline" className="text-xs border-neutral-border bg-neutral-muted text-neutral-text">Chỉ xem</Badge>
            </div>

            {treatmentPlans.map((plan) => (
              <Card key={plan.id} className="p-5 bg-neutral-muted/30 border-neutral-border hover:shadow-md transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-neutral-text font-semibold">{plan.name}</h4>
                      <p className="text-sm text-neutral-text/70 mt-1.5">
                        Bác sĩ phụ trách: {plan.doctor}
                      </p>
                    </div>
                    <Badge className="bg-primary hover:bg-primary-strong">Đang thực hiện</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-neutral-border">
                    <div>
                      <p className="text-xs text-neutral-text/60 mb-1.5 font-medium">Ngày bắt đầu</p>
                      <p className="text-sm text-neutral-text font-semibold">{plan.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-text/60 mb-1.5 font-medium">Tổng chi phí</p>
                      <p className="text-sm text-neutral-text font-semibold">
                        {plan.totalCost.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-text/60 mb-1.5 font-medium">Đã thanh toán</p>
                      <p className="text-sm text-green-600 font-semibold">
                        {plan.paidAmount.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-neutral-text/70 font-medium">Tiến độ thanh toán</span>
                      <span className="text-neutral-text font-semibold">
                        {Math.round((plan.paidAmount / plan.totalCost) * 100)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-neutral-tint rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(plan.paidAmount / plan.totalCost) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all"
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
