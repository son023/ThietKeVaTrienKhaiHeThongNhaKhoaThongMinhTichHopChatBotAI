import { Plus, Save, Briefcase, Edit, Trash2, Loader2, AlertCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import { useState, useEffect } from 'react';
import { medicalServiceController, MedicalServiceDTO, CreateMedicalServiceRequest } from '../../controllers/MedicalServiceController';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  status: string;
  description?: string;
}

// Service categories mapping
const SERVICE_CATEGORIES = [
  { code: 'GEN', name: 'Nha khoa tổng quát' },
  { code: 'ENDO', name: 'Điều trị nội nha' },
  { code: 'ORTHO', name: 'Chỉnh nha - Niềng răng' },
  { code: 'IMPL', name: 'Cấy ghép Implant' },
  { code: 'PROS', name: 'Phục hình răng' },
  { code: 'COS', name: 'Nha khoa thẩm mỹ' },
];

// Helper function to map service type codes to display names
const getServiceCategoryName = (code: string): string => {
  const category = SERVICE_CATEGORIES.find(cat => cat.code === code);
  return category ? category.name : code;
};

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [restoringService, setRestoringService] = useState<Service | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [addForm, setAddForm] = useState({
    name: '',
    category: '',
    price: 0,
    duration: 0,
    description: '',
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: 0,
    duration: 0,
    description: '',
  });

  // Load services from backend
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await medicalServiceController.getAll();
      
      // Map backend DTO to frontend interface
      const mappedServices: Service[] = data
        .map(dto => ({
          id: dto.id,
          name: dto.serviceName,
          category: dto.serviceType,
          price: dto.price,
          duration: dto.serviceTime,
          status: dto.status,
          description: dto.description,
        }));
      
      setServices(mappedServices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách dịch vụ');
      console.error('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    try {
      console.log('Add form data:', addForm);
      
      if (!addForm.name || !addForm.category || addForm.price <= 0 || addForm.duration <= 0) {
        alert('Vui lòng điền đầy đủ thông tin hợp lệ');
        return;
      }

      const payload: CreateMedicalServiceRequest = {
        serviceName: addForm.name,
        serviceType: addForm.category,
        serviceTime: addForm.duration,
        status: 'ACTIVE',
        price: addForm.price,
        description: addForm.description || undefined,
      };
      
      console.log('Sending payload to backend:', payload);
      const result = await medicalServiceController.create(payload);
      console.log('Service created successfully:', result);
      
      // Reset form and close dialog
      setAddForm({ name: '', category: '', price: 0, duration: 0, description: '' });
      setIsAddDialogOpen(false);
      
      // Reload services
      await loadServices();
    } catch (err) {
      console.error('Error adding service:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể thêm dịch vụ';
      alert(errorMessage);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;

    try {
      console.log('Editing service:', editingService);
      console.log('Edit form data:', editForm);
      
      if (!editForm.name || !editForm.category || editForm.price <= 0 || editForm.duration <= 0) {
        alert('Vui lòng điền đầy đủ thông tin hợp lệ');
        return;
      }

      const payload = {
        serviceName: editForm.name,
        serviceType: editForm.category,
        serviceTime: editForm.duration,
        status: 'ACTIVE',
        price: editForm.price,
        description: editForm.description || undefined,
      };
      
      console.log('Updating service ID:', editingService.id);
      console.log('Update payload:', payload);

      const result = await medicalServiceController.update(editingService.id, payload);
      console.log('Update successful:', result);
      
      // Update service in-place without reloading the entire list
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === editingService.id 
            ? {
                ...service,
                name: editForm.name,
                category: editForm.category,
                price: editForm.price,
                duration: editForm.duration,
                description: editForm.description,
              }
            : service
        )
      );
      
      // Close dialog and clear form
      setIsEditDialogOpen(false);
      setEditingService(null);
    } catch (err) {
      console.error('Error updating service:', err);
      alert(err instanceof Error ? err.message : 'Không thể cập nhật dịch vụ');
    }
  };

  const handleDeleteClick = (service: Service) => {
    setDeletingService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;

    try {
      // Deactivate instead of delete to set status to INACTIVE
      await medicalServiceController.deactivateById(deletingService.id);
      
      // Update service status in local state instead of removing
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === deletingService.id 
            ? { ...service, status: 'INACTIVE' }
            : service
        )
      );
      
      setIsDeleteDialogOpen(false);
      setDeletingService(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa dịch vụ');
      console.error('Error deleting service:', err);
    }
  };

  const handleRestoreClick = (service: Service) => {
    setRestoringService(service);
    setIsRestoreDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!restoringService) return;

    try {
      // Update service to set status to ACTIVE
      const payload = {
        serviceName: restoringService.name,
        serviceType: restoringService.category,
        serviceTime: restoringService.duration,
        status: 'ACTIVE',
        price: restoringService.price,
        description: restoringService.description || undefined,
      };
      
      await medicalServiceController.update(restoringService.id, payload);
      
      // Update service in local state
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === restoringService.id 
            ? { ...service, status: 'ACTIVE' }
            : service
        )
      );
      
      setIsRestoreDialogOpen(false);
      setRestoringService(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục dịch vụ');
      console.error('Error restoring service:', err);
    }
  };

  // Calculate categories - always show all predefined categories
  const categories = SERVICE_CATEGORIES.map(category => ({
    code: category.code,
    name: category.name,
    count: services.filter(s => s.category === category.code).length,
  }));

  // Pagination calculations
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = services.slice(startIndex, endIndex);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-[#fcfeff] flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#3FB5FF] mx-auto mb-4" />
          <p className="text-[#333333]/60">Đang tải danh sách dịch vụ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-[#fcfeff]">
        <Card className="rounded-[15px] border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={loadServices} 
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px]"
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <DialogContent className="rounded-[15px] max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle className="text-[#01304e]">Thêm dịch vụ mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin để thêm dịch vụ mới vào danh mục
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="service-name" className="mb-2">Tên dịch vụ</Label>
                  <Input 
                    id="service-name" 
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Nhập tên dịch vụ" 
                    className="rounded-[10px] border-[#e8e8e8]" 
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="mb-2">Danh mục</Label>
                  <Select 
                    value={addForm.category}
                    onValueChange={(value) => setAddForm({ ...addForm, category: value })}
                  >
                    <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                      <SelectValue placeholder="Chọn danh mục dịch vụ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {SERVICE_CATEGORIES.map((category) => (
                        <SelectItem key={category.code} value={category.code}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="mb-2">Giá tiền (VNĐ)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      value={addForm.price || ''}
                      onChange={(e) => setAddForm({ ...addForm, price: parseInt(e.target.value) || 0 })}
                      placeholder="0" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="mb-2">Thời lượng (phút)</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      value={addForm.duration || ''}
                      onChange={(e) => setAddForm({ ...addForm, duration: parseInt(e.target.value) || 0 })}
                      placeholder="30" 
                      className="rounded-[10px] border-[#e8e8e8]" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2">Mô tả (tùy chọn)</Label>
                  <Input 
                    id="description" 
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="Mô tả dịch vụ..." 
                    className="rounded-[10px] border-[#e8e8e8]" 
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)} 
                    className="rounded-[10px]"
                  >
                    Hủy
                  </Button>
                  <Button 
                    className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px]"
                    onClick={handleAddService}
                  >
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
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-[#333333]/30 mx-auto mb-4" />
              <p className="text-[#333333]/60 mb-2">Chưa có dịch vụ nào</p>
              <p className="text-sm text-[#333333]/40">Nhấn "Thêm dịch vụ mới" để bắt đầu</p>
            </div>
          ) : (
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
                {paginatedServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-gray-50">
                    <TableCell className="text-[#333333]">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 border-blue-300">
                        {getServiceCategoryName(service.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#333333]">
                      {service.price.toLocaleString('vi-VN')} ₫
                    </TableCell>
                    <TableCell className="text-[#333333]">{service.duration} phút</TableCell>
                    <TableCell className="text-right">
                      {service.status === 'INACTIVE' ? (
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-[10px] text-green-600 border-green-300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
                            onClick={() => handleRestoreClick(service)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Khôi phục
                          </Button>
                        </div>
                      ) : (
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-[10px] text-red-600 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                            onClick={() => handleDeleteClick(service)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination Controls */}
          {services.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-[#333333]/60">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, services.length)} trong tổng số {services.length} dịch vụ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-[10px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-[10px] min-w-[32px] ${
                        currentPage === page 
                          ? 'bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 text-white' 
                          : ''
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-[10px]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho dịch vụ {editingService?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-service-name" className="mb-2">Tên dịch vụ</Label>
              <Input 
                id="edit-service-name" 
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nhập tên dịch vụ" 
                className="rounded-[10px] border-[#e8e8e8]" 
              />
            </div>
            <div>
              <Label htmlFor="edit-category" className="mb-2">Danh mục</Label>
              <Select 
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                  <SelectValue placeholder="Chọn danh mục dịch vụ" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category.code} value={category.code}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price" className="mb-2">Giá tiền (VNĐ)</Label>
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
                <Label htmlFor="edit-duration" className="mb-2">Thời lượng (phút)</Label>
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
            <div>
              <Label htmlFor="edit-description" className="mb-2">Mô tả (tùy chọn)</Label>
              <Input 
                id="edit-description" 
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Mô tả dịch vụ..." 
                className="rounded-[10px] border-[#e8e8e8]" 
              />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Xác nhận xóa dịch vụ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ <span className="font-semibold text-[#01304e]">"{deletingService?.name}"</span> không?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              className="rounded-[10px]"
            >
              Hủy
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 rounded-[15px] text-white"
              onClick={handleConfirmDelete}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Xác nhận khôi phục dịch vụ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khôi phục dịch vụ <span className="font-semibold text-[#01304e]">"{restoringService?.name}"</span> không?
              Dịch vụ sẽ được kích hoạt lại và có thể sử dụng bình thường.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsRestoreDialogOpen(false)} 
              className="rounded-[10px]"
            >
              Hủy
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 rounded-[15px] text-white"
              onClick={handleConfirmRestore}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Khôi phục
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
