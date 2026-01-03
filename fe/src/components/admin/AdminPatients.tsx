import { useState, useEffect } from 'react';
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
import { patientController } from '../../controllers/PatientController';
import { userController, CreateUserRequestDTO } from '../../controllers/UserController';
import { PatientWithUser } from '../../models/Patient';

interface AdminPatientsProps {
  onNavigateToPatientDetail: (id: string) => void;
}

export function AdminPatients({ onNavigateToPatientDetail }: AdminPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    address: '',
    insuranceNumber: '',
    emergencyContact: '',
    medicalHistory: '',
    notes: '',
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await patientController.getAll();

      const patientsWithUser = await Promise.all(
        patientsData.map(async (patient) => {
          try {
            const user = await userController.getById(patient.userId);
            return { ...patient, user };
          } catch (err) {
            console.error(`Failed to load user for patient ${patient.userId}`, err);
            return { ...patient, user: undefined };
          }
        })
      );
      
      setPatients(patientsWithUser);
    } catch (err: any) {
      console.error('Failed to load patients:', err);
      setError(err.message || 'Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    try {
      if (!formData.fullName || !formData.phone || !formData.password) {
        alert('Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Số điện thoại, Mật khẩu)');
        return;
      }

      setSaving(true);
      
      // Create user with PATIENT role
      const createUserRequest: CreateUserRequestDTO = {
        fullName: formData.fullName,
        email: formData.email || `${formData.phone}@temp.com`, // Fallback email if not provided
        phone: formData.phone,
        password: formData.password,
        roleNames: ['PATIENT'], // Only PATIENT role
        isActive: true,
      };

      const user = await userController.create(createUserRequest);
      
      // Patient record is automatically created by backend
      // But we can update it with additional info if needed
      if (formData.dob || formData.gender || formData.address || formData.insuranceNumber) {
        await patientController.updateProfile(user.id, {
          userId: user.id,
          dob: formData.dob || undefined,
          gender: formData.gender || undefined,
          address: formData.address || undefined,
          contactPhone: formData.phone,
          insuranceNumber: formData.insuranceNumber || undefined,
        });
      }
      
      // Reload patients list
      await loadPatients();
      
      // Reset form and close dialog
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        dob: '',
        gender: '',
        address: '',
        insuranceNumber: '',
        emergencyContact: '',
        medicalHistory: '',
        notes: '',
      });
      setIsAddDialogOpen(false);
      
      alert('Thêm bệnh nhân thành công!');
    } catch (err: any) {
      console.error('Failed to create patient:', err);
      alert(err.message || 'Không thể thêm bệnh nhân');
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.contactPhone?.includes(searchQuery) ||
    patient.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 bg-[#fcfeff]">
        <div className="flex items-center justify-center py-12">
          <div className="text-[#333333]/60">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#fcfeff]">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

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
            <DialogContent className="rounded-[15px] max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
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
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-phone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input 
                      id="patient-phone" 
                      type="tel"
                      placeholder="0901234567" 
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-email">Email</Label>
                    <Input 
                      id="patient-email" 
                      type="email"
                      placeholder="email@example.com" 
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="patient-password">Mật khẩu <span className="text-red-500">*</span></Label>
                    <Input 
                      id="patient-password" 
                      type="password"
                      placeholder="Nhập mật khẩu" 
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-dob">Ngày sinh</Label>
                    <Input 
                      id="patient-dob" 
                      type="date"
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patient-gender">Giới tính</Label>
                    <select 
                      id="patient-gender"
                      className="flex h-10 w-full rounded-[10px] border border-[#e8e8e8] bg-white px-3 py-2 text-sm"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-address">Địa chỉ</Label>
                    <Input 
                      id="patient-address" 
                      placeholder="Nhập địa chỉ" 
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-insurance">Số bảo hiểm y tế</Label>
                    <Input 
                      id="patient-insurance" 
                      placeholder="Nhập mã số BHYT (nếu có)" 
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.insuranceNumber}
                      onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-emergency">Người liên hệ khẩn cấp</Label>
                    <Input 
                      id="patient-emergency" 
                      placeholder="Tên và số điện thoại người nhà" 
                      className="rounded-[10px] border-[#e8e8e8]"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-medical-history">Tiền sử bệnh</Label>
                    <Textarea 
                      id="patient-medical-history" 
                      placeholder="Ghi chú về tiền sử bệnh, dị ứng thuốc..."
                      className="rounded-[10px] border-[#e8e8e8] min-h-[80px]"
                      value={formData.medicalHistory}
                      onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="patient-notes">Ghi chú</Label>
                    <Textarea 
                      id="patient-notes" 
                      placeholder="Ghi chú khác về bệnh nhân..."
                      className="rounded-[10px] border-[#e8e8e8] min-h-[60px]"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t border-[#e8e8e8]">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)} 
                    className="rounded-[10px]"
                    disabled={saving}
                  >
                    Hủy
                  </Button>
                  <Button 
                    className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                    onClick={handleCreatePatient}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Đang lưu...' : 'Lưu bệnh nhân'}
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
                  key={patient.userId}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onNavigateToPatientDetail(patient.userId)}
                >
                  <TableCell className="text-[#333333]/60">{patient.userId.substring(0, 8).toUpperCase()}</TableCell>
                  <TableCell className="text-[#333333]">{patient.user?.fullName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                        <Phone className="w-4 h-4" />
                        {patient.contactPhone || patient.user?.phone || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[#333333]/60">
                      <Calendar className="w-4 h-4" />
                      {patient.user?.createdAt ? new Date(patient.user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#333333]/40">—</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50">
                      — lần
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[10px]"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onNavigateToPatientDetail(patient.userId);
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
