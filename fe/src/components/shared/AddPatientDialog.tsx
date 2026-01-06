import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { patientController } from '../../controllers/PatientController';
import { userController, CreateUserRequestDTO } from '../../controllers/UserController';

interface AddPatientDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPatientAdded?: () => void;
  triggerButton?: React.ReactNode;
}

export function AddPatientDialog({ 
  open, 
  onOpenChange, 
  onPatientAdded,
  triggerButton 
}: AddPatientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    address: '',
  });

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      password: '',
      dob: '',
      gender: '',
      address: '',
    });
  };

  const handleCreatePatient = async () => {
    // Validate all fields before proceeding
    const errors: string[] = [];

    // Check required fields
    if (!formData.fullName || formData.fullName.trim() === '') {
      errors.push('- Họ và tên là bắt buộc');
    }
    if (!formData.phone || formData.phone.trim() === '') {
      errors.push('- Số điện thoại là bắt buộc');
    } else {
      // Validate phone format (Vietnamese phone numbers)
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        errors.push('- Số điện thoại không hợp lệ (phải có 10-11 số)');
      }
    }
    if (!formData.password || formData.password.trim() === '') {
      errors.push('- Mật khẩu là bắt buộc');
    } else if (formData.password.length < 6) {
      errors.push('- Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('- Email không đúng định dạng (ví dụ: example@email.com)');
      }
    }

    // If there are any errors, show them all and stop
    if (errors.length > 0) {
      alert('Vui lòng kiểm tra lại thông tin:\n\n' + errors.join('\n'));
      return;
    }

    try {
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
      if (formData.dob || formData.gender || formData.address) {
        await patientController.updateProfile(user.id, {
          userId: user.id,
          dob: formData.dob || undefined,
          gender: formData.gender || undefined,
          address: formData.address || undefined,
          contactPhone: formData.phone,
        });
      }
      
      // Reset form and close dialog
      resetForm();
      setDialogOpen(false);
      
      // Notify parent component
      if (onPatientAdded) {
        onPatientAdded();
      }
      
      alert('Thêm bệnh nhân thành công!');
    } catch (err: any) {
      console.error('Failed to create patient:', err);
      alert('Lỗi: ' + (err.message || 'Không thể thêm bệnh nhân'));
    } finally {
      setSaving(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <Plus className="w-4 h-4 mr-2" />
      Thêm bệnh nhân mới
    </Button>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {triggerButton !== undefined ? (
        triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
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
              <Label htmlFor="patient-name" className="mb-2 block">Họ và tên <span className="text-red-500">*</span></Label>
              <Input 
                id="patient-name" 
                placeholder="Nhập họ và tên bệnh nhân" 
                className="rounded-[10px] border-[#e8e8e8]"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="patient-phone" className="mb-2 block">Số điện thoại <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="patient-email" className="mb-2 block">Email</Label>
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
              <Label htmlFor="patient-password" className="mb-2 block">Mật khẩu <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="patient-dob" className="mb-2 block">Ngày sinh</Label>
              <Input 
                id="patient-dob" 
                type="date"
                className="rounded-[10px] border-[#e8e8e8]"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="patient-gender" className="mb-2 block">Giới tính</Label>
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
              <Label htmlFor="patient-address" className="mb-2 block">Địa chỉ</Label>
              <Input 
                id="patient-address" 
                placeholder="Nhập địa chỉ" 
                className="rounded-[10px] border-[#e8e8e8]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-[#e8e8e8]">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)} 
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
  );
}

