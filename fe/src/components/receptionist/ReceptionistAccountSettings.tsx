import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Camera } from 'lucide-react';

export function ReceptionistAccountSettings() {
  return (
    <div className="p-8 space-y-6">
      {/* DoctorHeader */}
      <div>
        <h1 className="text-2xl text-[#01304e] mb-1">Tài khoản của tôi</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <h3 className="text-lg text-[#01304e] mb-6">Thông tin cá nhân</h3>
        
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-[#3FB5FF] text-white text-2xl">LT</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#3FB5FF] rounded-full flex items-center justify-center hover:bg-[#3FB5FF]/90 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Ảnh đại diện</p>
            <p className="text-xs text-gray-500">JPG, PNG. Tối đa 2MB</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" defaultValue="Nguyễn Thị Lan" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="receptionist@gmail.com" disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" defaultValue="0909123456" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Ngày sinh</Label>
            <Input id="birthDate" type="date" defaultValue="1995-05-15" />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" defaultValue="123 Nguyễn Văn Linh, Q7, TP.HCM" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">
            Lưu thay đổi
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="text-lg text-[#01304e] mb-6">Đổi mật khẩu</h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <Button className="w-full bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">
            Đổi mật khẩu
          </Button>
        </div>
      </Card>

      {/* Work Info */}
      <Card className="p-6">
        <h3 className="text-lg text-[#01304e] mb-6">Thông tin công việc</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Chức vụ</Label>
            <Input value="Lễ tân" disabled />
          </div>

          <div className="space-y-2">
            <Label>Mã nhân viên</Label>
            <Input value="NV005" disabled />
          </div>

          <div className="space-y-2">
            <Label>Ngày vào làm</Label>
            <Input value="01/01/2023" disabled />
          </div>

          <div className="space-y-2">
            <Label>Phòng khám</Label>
            <Input value="DentalCareX" disabled />
          </div>
        </div>
      </Card>
    </div>
  );
}
