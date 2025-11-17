import { useState } from 'react';
import { Search, Plus, UserCog, Mail, Phone, Trash2, Save } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface AdminStaffProps {
  onNavigateToStaffDetail: (id: string) => void;
}

export function AdminStaff({ onNavigateToStaffDetail }: AdminStaffProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  const staff = [
    {
      id: 'staff1',
      name: 'BS. Nguyễn Văn Hùng',
      position: 'Bác sĩ Nha khoa',
      specialty: 'Tổng quát',
      email: 'hung.nguyen@dental.vn',
      phone: '0901234567',
      role: 'Bác sĩ',
      status: 'active',
    },
    {
      id: 'staff2',
      name: 'BS. Trần Thị Mai',
      position: 'Bác sĩ Nha khoa',
      specialty: 'Phục hình',
      email: 'mai.tran@dental.vn',
      phone: '0912345678',
      role: 'Bác sĩ',
      status: 'active',
    },
    {
      id: 'staff3',
      name: 'Lê Thị Hoa',
      position: 'Lễ tân',
      specialty: '',
      email: 'hoa.le@dental.vn',
      phone: '0923456789',
      role: 'Lễ tân',
      status: 'active',
    },
    {
      id: 'staff4',
      name: 'BS. Lê Văn Phong',
      position: 'Bác sĩ Nha khoa',
      specialty: 'Chỉnh nha',
      email: 'phong.le@dental.vn',
      phone: '0934567890',
      role: 'Bác sĩ',
      status: 'active',
    },
    {
      id: 'staff5',
      name: 'Nguyễn Thị Lan',
      position: 'Kỹ thuật viên',
      specialty: 'X-quang',
      email: 'lan.nguyen@dental.vn',
      phone: '0945678901',
      role: 'KTV',
      status: 'active',
    },
    {
      id: 'staff6',
      name: 'BS. Phạm Thị Lan',
      position: 'Bác sĩ Nha khoa',
      specialty: 'Nha chu',
      email: 'lanpham@dental.vn',
      phone: '0956789012',
      role: 'Bác sĩ',
      status: 'inactive',
    },
  ];

  const filteredStaff = staff.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Bác sĩ':
        return <Badge className="bg-[#3FB5FF]">Bác sĩ</Badge>;
      case 'Lễ tân':
        return <Badge className="bg-purple-500">Lễ tân</Badge>;
      case 'KTV':
        return <Badge className="bg-green-500">KTV</Badge>;
      case 'Admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Hoạt động</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Khóa</Badge>;
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Nhân viên</h1>
            <p className="text-sm text-[#333333]/60">Quản lý toàn bộ nhân viên phòng khám</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <Plus className="w-4 h-4 mr-2" />
                Thêm nhân viên mới
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[15px] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#01304e]">Thêm nhân viên mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin để thêm nhân viên mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="staff-name">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input 
                      id="staff-name" 
                      placeholder="Nhập họ và tên nhân viên" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-position">Vị trí <span className="text-red-500">*</span></Label>
                    <Input 
                      id="staff-position" 
                      placeholder="Ví dụ: Bác sĩ Nha khoa" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-specialty">Chuyên môn</Label>
                    <Input 
                      id="staff-specialty" 
                      placeholder="Ví dụ: Tổng quát, Phục hình..." 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-phone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input 
                      id="staff-phone" 
                      type="tel"
                      placeholder="0901234567" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-email">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="staff-email" 
                      type="email"
                      placeholder="email@dental.vn" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-role">Vai trò hệ thống <span className="text-red-500">*</span></Label>
                    <select 
                      id="staff-role"
                      className="flex h-10 w-full rounded-[10px] border border-[#e8e8e8] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="doctor">Bác sĩ</option>
                      <option value="receptionist">Lễ tân</option>
                      <option value="technician">Kỹ thuật viên</option>
                      <option value="pharmacist">Dược sĩ</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-license">Số giấy phép hành nghề</Label>
                    <Input 
                      id="staff-license" 
                      placeholder="Số giấy phép (nếu có)" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="staff-address">Địa chỉ</Label>
                    <Input 
                      id="staff-address" 
                      placeholder="Nhập địa chỉ" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-dob">Ngày sinh</Label>
                    <Input 
                      id="staff-dob" 
                      type="date"
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staff-gender">Giới tính</Label>
                    <select 
                      id="staff-gender"
                      className="flex h-10 w-full rounded-[10px] border border-[#e8e8e8] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="staff-notes">Ghi chú</Label>
                    <Textarea 
                      id="staff-notes" 
                      placeholder="Ghi chú về nhân viên..."
                      className="rounded-[10px] border-[#e8e8e8] min-h-[80px]" 
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
                      // Handle save staff logic here
                      console.log('Saving staff...');
                      setIsAddDialogOpen(false);
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu nhân viên
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
            placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
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
                <p className="text-sm text-[#333333]/60 mb-1">Tổng nhân viên</p>
                <p className="text-[#01304e]">{staff.length}</p>
              </div>
              <UserCog className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Bác sĩ</p>
                <p className="text-[#01304e]">{staff.filter(s => s.role === 'Bác sĩ').length}</p>
              </div>
              <div className="w-8 h-8 bg-[#3FB5FF]/10 rounded-full flex items-center justify-center">
                <UserCog className="w-5 h-5 text-[#3FB5FF]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Lễ tân / KTV</p>
                <p className="text-[#01304e]">
                  {staff.filter(s => s.role === 'Lễ tân' || s.role === 'KTV').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                <UserCog className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Đang hoạt động</p>
                <p className="text-[#01304e]">{staff.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <UserCog className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Chuyên khoa/Vị trí</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((person) => (
                <TableRow
                  key={person.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onNavigateToStaffDetail(person.id)}
                >
                  <TableCell>
                    <div>
                      <p className="text-[#333333]">{person.name}</p>
                      <p className="text-sm text-[#333333]/60">{person.position}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.specialty ? (
                      <Badge variant="outline" className="bg-blue-50">
                        {person.specialty}
                      </Badge>
                    ) : (
                      <span className="text-[#333333]/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                        <Mail className="w-4 h-4" />
                        {person.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                        <Phone className="w-4 h-4" />
                        {person.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(person.role)}</TableCell>
                  <TableCell>{getStatusBadge(person.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[10px]"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          onNavigateToStaffDetail(person.id);
                        }}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[10px] text-red-600 border-red-300 hover:bg-red-50"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setStaffToDelete(person.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12 text-[#333333]/60">
          Không tìm thấy nhân viên phù hợp
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent className="rounded-[15px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#01304e]">Xác nhận xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 rounded-[10px]"
              onClick={() => {
                // Handle delete staff logic here
                console.log('Deleting staff:', staffToDelete);
                setStaffToDelete(null);
              }}
            >
              Xóa nhân viên
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
