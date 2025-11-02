import { useState } from 'react';
import { Search, Plus, Phone, Calendar, User, Save } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface AdminPatientsProps {
  onNavigateToPatientDetail: (id: string) => void;
}

export function AdminPatients({ onNavigateToPatientDetail }: AdminPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const patients = [
    {
      id: 'BN001',
      name: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'an.nguyen@email.com',
      lastVisit: '25/10/2025',
      nextAppointment: '30/10/2025',
      status: 'active',
      totalVisits: 12,
    },
    {
      id: 'BN002',
      name: 'Trần Thị Bình',
      phone: '0912345678',
      email: 'binh.tran@email.com',
      lastVisit: '24/10/2025',
      nextAppointment: null,
      status: 'active',
      totalVisits: 5,
    },
    {
      id: 'BN003',
      name: 'Lê Văn Cường',
      phone: '0923456789',
      email: 'cuong.le@email.com',
      lastVisit: '20/10/2025',
      nextAppointment: '27/10/2025',
      status: 'active',
      totalVisits: 8,
    },
    {
      id: 'BN004',
      name: 'Phạm Thị Dung',
      phone: '0934567890',
      email: 'dung.pham@email.com',
      lastVisit: '23/10/2025',
      nextAppointment: '28/10/2025',
      status: 'active',
      totalVisits: 15,
    },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Bệnh nhân</h1>
            <p className="text-sm text-[#333333]/60">Cơ sở dữ liệu bệnh nhân toàn phòng khám</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <Plus className="w-4 h-4 mr-2" />
                Thêm bệnh nhân mới
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[15px] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#01304e]">Thêm bệnh nhân mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin để thêm bệnh nhân mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="patient-name">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input 
                      id="patient-name" 
                      placeholder="Nhập họ và tên bệnh nhân" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-phone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input 
                      id="patient-phone" 
                      type="tel"
                      placeholder="0901234567" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-email">Email</Label>
                    <Input 
                      id="patient-email" 
                      type="email"
                      placeholder="email@example.com" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-dob">Ngày sinh</Label>
                    <Input 
                      id="patient-dob" 
                      type="date"
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-gender">Giới tính</Label>
                    <select 
                      id="patient-gender"
                      className="flex h-10 w-full rounded-[10px] border border-[#e8e8e8] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-address">Địa chỉ</Label>
                    <Input 
                      id="patient-address" 
                      placeholder="Nhập địa chỉ" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-insurance">Số bảo hiểm y tế</Label>
                    <Input 
                      id="patient-insurance" 
                      placeholder="Nhập mã số BHYT (nếu có)" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-emergency">Người liên hệ khẩn cấp</Label>
                    <Input 
                      id="patient-emergency" 
                      placeholder="Tên và số điện thoại người nhà" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-medical-history">Tiền sử bệnh</Label>
                    <Textarea 
                      id="patient-medical-history" 
                      placeholder="Ghi chú về tiền sử bệnh, dị ứng thuốc..."
                      className="rounded-[10px] border-[#e8e8e8] min-h-[80px]" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-notes">Ghi chú</Label>
                    <Textarea 
                      id="patient-notes" 
                      placeholder="Ghi chú khác về bệnh nhân..."
                      className="rounded-[10px] border-[#e8e8e8] min-h-[60px]" 
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
                      // Handle save patient logic here
                      console.log('Saving patient...');
                      setIsAddDialogOpen(false);
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu bệnh nhân
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã BN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] border-[#e8e8e8]"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tổng bệnh nhân</p>
                <p className="text-[#01304e]">{patients.length}</p>
              </div>
              <User className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Bệnh nhân mới (tháng)</p>
                <p className="text-[#01304e]">24</p>
              </div>
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tái khám (tháng)</p>
                <p className="text-[#01304e]">48</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Đang điều trị</p>
                <p className="text-[#01304e]">32</p>
              </div>
              <div className="w-8 h-8 bg-[#3FB5FF]/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#3FB5FF]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã BN</TableHead>
                <TableHead>Tên bệnh nhân</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Lần khám cuối</TableHead>
                <TableHead>Lịch hẹn tiếp theo</TableHead>
                <TableHead>Số lần khám</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="text-[#333333]/60">{patient.id}</TableCell>
                  <TableCell className="text-[#333333]">{patient.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[#333333]/60">
                      <Calendar className="w-4 h-4" />
                      {patient.lastVisit}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.nextAppointment ? (
                      <div className="flex items-center gap-2 text-[#3FB5FF]">
                        <Calendar className="w-4 h-4" />
                        {patient.nextAppointment}
                      </div>
                    ) : (
                      <span className="text-[#333333]/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50">
                      {patient.totalVisits} lần
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToPatientDetail(patient.id);
                      }}
                    >
                      Xem hồ sơ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
