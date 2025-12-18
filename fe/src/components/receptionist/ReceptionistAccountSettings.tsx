import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Camera } from 'lucide-react';

export function ReceptionistAccountSettings() {
  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">Tài khoản của tôi</h1>
        <p className="text-neutral-text/70 font-medium">Quản lý thông tin cá nhân và cài đặt</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Thông tin cá nhân</h3>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-neutral-border">
              <AvatarFallback className="bg-primary text-white text-2xl font-semibold">LT</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:bg-primary-strong transition-all shadow-md border-2 border-neutral-surface">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-text mb-1">Ảnh đại diện</p>
            <p className="text-xs text-neutral-text/60">JPG, PNG. Tối đa 2MB</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-neutral-text font-medium">Họ và tên</Label>
            <Input id="fullName" defaultValue="Nguyễn Thị Lan" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-text font-medium">Email</Label>
            <Input id="email" type="email" defaultValue="receptionist@gmail.com" disabled className="border-neutral-border bg-neutral-muted text-neutral-text/60" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-neutral-text font-medium">Số điện thoại</Label>
            <Input id="phone" defaultValue="0909123456" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-neutral-text font-medium">Ngày sinh</Label>
            <Input id="birthDate" type="date" defaultValue="1995-05-15" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="address" className="text-neutral-text font-medium">Địa chỉ</Label>
            <Input id="address" defaultValue="123 Nguyễn Văn Linh, Q7, TP.HCM" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-primary hover:bg-primary-strong shadow-sm transition-all duration-200">
            Lưu thay đổi
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Đổi mật khẩu</h3>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-neutral-text font-medium">Mật khẩu hiện tại</Label>
            <Input id="currentPassword" type="password" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-neutral-text font-medium">Mật khẩu mới</Label>
            <Input id="newPassword" type="password" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-neutral-text font-medium">Xác nhận mật khẩu mới</Label>
            <Input id="confirmPassword" type="password" className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface" />
          </div>

          <Button className="w-full bg-primary hover:bg-primary-strong shadow-sm transition-all duration-200">
            Đổi mật khẩu
          </Button>
        </div>
      </Card>

      {/* Work Info */}
      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-text mb-6">Thông tin công việc</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Chức vụ</Label>
            <Input value="Lễ tân" disabled className="border-neutral-border bg-neutral-muted text-neutral-text/60" />
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Mã nhân viên</Label>
            <Input value="NV005" disabled className="border-neutral-border bg-neutral-muted text-neutral-text/60" />
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Ngày vào làm</Label>
            <Input value="01/01/2023" disabled className="border-neutral-border bg-neutral-muted text-neutral-text/60" />
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Phòng khám</Label>
            <Input value="DentalCareX" disabled className="border-neutral-border bg-neutral-muted text-neutral-text/60" />
          </div>
        </div>
      </Card>
    </div>
  );
}
