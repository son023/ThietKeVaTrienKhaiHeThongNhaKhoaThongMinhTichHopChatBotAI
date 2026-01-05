import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { patientController } from '../../controllers/PatientController';
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { invoiceController, InvoiceDTO } from '../../controllers/InvoiceController';
import { doctorController, DoctorWithUser } from '../../controllers/DoctorController';
import { PatientWithUser } from '../../models';

interface ReceptionistPatientDetailProps {
  patientId: string;
  onBack: () => void;
  onNewAppointment: () => void;
  onCreateInvoice: () => void;
}

export function ReceptionistPatientDetail({ patientId, onBack, onNewAppointment, onCreateInvoice }: ReceptionistPatientDetailProps) {
  const [patient, setPatient] = useState<PatientWithUser | null>(null);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [doctors, setDoctors] = useState<Record<string, string>>({}); // Map: doctorId -> Doctor Name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [
          patientData,
          appointmentList,
          invoiceList,
          doctorList
        ] = await Promise.all([
          patientController.getWithUserById(patientId),
          appointmentController.getByPatientId(patientId),
          invoiceController.getInvoicesByPatient(patientId),
          doctorController.getWithUserDetails()
        ]);

        setPatient(patientData);
        setAppointments(appointmentList || []);
        setInvoices(invoiceList || []);

        // Create doctor map for easy lookup
        const docMap: Record<string, string> = {};
        doctorList.forEach(d => {
          docMap[d.userId] = d.user?.fullName || 'Bác sĩ';
        });
        setDoctors(docMap);

      } catch (err) {
        console.error("Error fetching patient detail:", err);
        setError("Không thể tải thông tin chi tiết bệnh nhân");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-neutral-text/60">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error || "Không tìm thấy bệnh nhân"}</p>
        <Button onClick={onBack} variant="outline">Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="border-neutral-border hover:bg-primary hover:border-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-text tracking-tight">{patient.user?.fullName || 'Chưa cập nhật tên'}</h1>
              {patient.dob && (
                <Badge variant="outline" className="border-neutral-border bg-neutral-muted text-neutral-text font-medium">
                  {new Date().getFullYear() - new Date(patient.dob).getFullYear()} tuổi
                </Badge>
              )}

            </div>
            <p className="text-neutral-text/70 font-medium">{patient.user?.phone || patient.contactPhone || 'SĐT: --'} • {patient.user?.email || 'Email: --'}</p>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Thông tin Hành chính</TabsTrigger>
          <TabsTrigger value="history">Lịch sử Hẹn & Thanh toán</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Info */}
        <TabsContent value="info" className="space-y-6">
          <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-text mb-5">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-text font-medium">Họ và tên *</Label>
                <Input id="name" defaultValue={patient.user?.fullName} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-neutral-text font-medium">Số điện thoại *</Label>
                <Input id="phone" defaultValue={patient.user?.phone || patient.contactPhone} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-text font-medium">Email</Label>
                <Input id="email" type="email" defaultValue={patient.user?.email} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-neutral-text font-medium">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  defaultValue={patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : ''}
                  className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-neutral-text font-medium">Giới tính</Label>
                <Input id="gender" defaultValue={patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : patient.gender} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address" className="text-neutral-text font-medium">Địa chỉ</Label>
                <Input id="address" defaultValue={patient.address} className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes" className="text-neutral-text font-medium">Ghi chú (Dị ứng/Bệnh nền)</Label>
                <Textarea
                  id="notes"
                  defaultValue={patient.allergy}
                  placeholder="Ví dụ: Dị ứng thuốc tê..."
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
            {appointments.length === 0 ? (
              <p className="text-neutral-text/60 italic">Chưa có lịch hẹn nào.</p>
            ) : (
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
                  {appointments.map((apt) => {
                    const aptDate = new Date(apt.appointmentStartTime);
                    const dateStr = aptDate.toLocaleDateString('vi-VN');
                    const timeStr = aptDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    const doctorName = doctors[apt.doctorId] || 'Unknown';
                    const servicesStr = apt.medicalServices?.map(s => s.serviceName).join(', ') || 'Khám';

                    return (
                      <TableRow key={apt.id} className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">
                        <TableCell className="text-neutral-text">{dateStr}</TableCell>
                        <TableCell className="text-neutral-text">{timeStr}</TableCell>
                        <TableCell className="text-neutral-text">{doctorName}</TableCell>
                        <TableCell className="text-neutral-text">{servicesStr}</TableCell>
                        <TableCell>
                          <Badge variant={apt.status === 'COMPLETED' ? 'default' : 'outline'} className={apt.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 'border-neutral-border'}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Invoices History */}
          <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-text mb-5">Lịch sử Thanh toán</h3>
            {invoices.length === 0 ? (
              <p className="text-neutral-text/60 italic">Chưa có hóa đơn nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-muted/30">

                    <TableHead className="font-semibold text-neutral-text">Ngày</TableHead>
                    <TableHead className="font-semibold text-neutral-text">Số tiền</TableHead>
                    <TableHead className="font-semibold text-neutral-text">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-neutral-text">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">

                      <TableCell className="text-neutral-text">{new Date(invoice.issueAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell className="text-right text-neutral-text font-semibold">
                        {invoice.totalAmount.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={invoice.status === 'PAID' ? 'default' : 'destructive'}
                          className={invoice.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                          {invoice.status}
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
            )}
          </Card>
        </TabsContent>
        {/* Removed Treatment Tab */}
      </Tabs>
    </div>
  );
}
