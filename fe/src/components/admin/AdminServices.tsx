import { Plus, Save, Briefcase, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useState } from 'react';

interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: number;
}

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([
    { id: 1, name: 'Khám tổng quát', category: 'Khám', price: 150000, duration: 30 },
    { id: 2, name: 'Trám răng', category: 'Điều trị', price: 250000, duration: 60 },
    { id: 3, name: 'Điều trị tủy', category: 'Điều trị', price: 350000, duration: 90 },
    { id: 4, name: 'Cạo vôi răng', category: 'Vệ sinh', price: 150000, duration: 45 },
    { id: 5, name: 'Niềng răng (1 hàm)', category: 'Chỉnh nha', price: 8500000, duration: 60 },
    { id: 6, name: 'Nhổ răng khôn', category: 'Tiểu phẫu', price: 500000, duration: 45 },
    { id: 7, name: 'Cấy ghép Implant', category: 'Phục hồi', price: 15000000, duration: 120 },
    { id: 8, name: 'Bọc răng sứ', category: 'Phục hồi', price: 3500000, duration: 90 },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: 0,
    duration: 0,
  });

  const categories = [
    { name: 'Khám', count: services.filter(s => s.category === 'Khám').length },
    { name: 'Điều trị', count: services.filter(s => s.category === 'Điều trị').length },
    { name: 'Vệ sinh', count: services.filter(s => s.category === 'Vệ sinh').length },
    { name: 'Chỉnh nha', count: services.filter(s => s.category === 'Chỉnh nha').length },
    { name: 'Tiểu phẫu', count: services.filter(s => s.category === 'Tiểu phẫu').length },
    { name: 'Phục hồi', count: services.filter(s => s.category === 'Phục hồi').length },
  ];

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingService) {
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...editForm }
          : s
      ));
      setIsEditDialogOpen(false);
      setEditingService(null);
    }
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Dịch vụ</h1>
            <p className="text-sm text-[#333333]/60">Quản lý danh mục dịch vụ và giá</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <Plus className="w-4 h-4 mr-2" />
                Thêm dịch vụ mới
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[15px] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#01304e]">Thêm dịch vụ mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin để thêm dịch vụ mới vào danh mục
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="service-name">Tên dịch vụ</Label>
                  <Input id="service-name" placeholder="Nhập tên dịch vụ" className="rounded-[10px] border-[#e8e8e8]" />
                </div>
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Input id="category" placeholder="Ví dụ: Điều trị, Vệ sinh..." className="rounded-[10px] border-[#e8e8e8]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Giá tiền (VNĐ)</Label>
                    <Input id="price" type="number" placeholder="0" className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                  <div>
                    <Label htmlFor="duration">Thời lượng (phút)</Label>
                    <Input id="duration" type="number" placeholder="30" className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-[10px]">
                    Hủy
                  </Button>
                  <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px]">
                    <Save className="w-4 h-4 mr-2" />
                    Lưu dịch vụ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {categories.map((category, index) => (
          <Card key={index} className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-[#333333]/60 mb-1">{category.name}</p>
                <p className="text-[#01304e]">{category.count} dịch vụ</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Table */}
      <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#01304e]">
            <Briefcase className="w-5 h-5 text-[#3FB5FF]" />
            Danh sách Dịch vụ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá tiền</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="hover:bg-gray-50">
                  <TableCell className="text-[#333333]">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 border-blue-300">
                      {service.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {service.price.toLocaleString('vi-VN')} ₫
                  </TableCell>
                  <TableCell className="text-[#333333]">{service.duration} phút</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-[10px]"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-[10px] text-red-600 border-red-300 hover:bg-red-50">
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

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho dịch vụ {editingService?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-service-name">Tên dịch vụ</Label>
              <Input 
                id="edit-service-name" 
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nhập tên dịch vụ" 
                className="rounded-[10px] border-[#e8e8e8]" 
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Danh mục</Label>
              <Input 
                id="edit-category" 
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                placeholder="Ví dụ: Điều trị, Vệ sinh..." 
                className="rounded-[10px] border-[#e8e8e8]" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Giá tiền (VNĐ)</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                  placeholder="0" 
                  className="rounded-[10px] border-[#e8e8e8]" 
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Thời lượng (phút)</Label>
                <Input 
                  id="edit-duration" 
                  type="number" 
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                  placeholder="30" 
                  className="rounded-[10px] border-[#e8e8e8]" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)} 
                className="rounded-[10px]"
              >
                Hủy
              </Button>
              <Button 
                className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px]"
                onClick={handleSaveEdit}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
