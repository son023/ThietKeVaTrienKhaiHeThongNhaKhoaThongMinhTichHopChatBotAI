import { User, Lock, FileSignature, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AccountSettings() {
  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-2">Tài khoản của tôi</h1>
        <p className="text-[#333333]/60">Quản lý thông tin cá nhân và cài đặt</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="signature">Chữ ký số</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <User className="w-5 h-5 text-[#3FB5FF]" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullname">Họ và tên</Label>
                    <Input id="fullname" defaultValue="Nguyễn Văn Hùng" />
                  </div>
                  <div>
                    <Label htmlFor="code">Mã bác sĩ</Label>
                    <Input id="code" defaultValue="BS001" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" defaultValue="0901234567" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="hung.nguyen@dental.vn" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialization">Chuyên môn</Label>
                  <Input id="specialization" defaultValue="Bác sĩ Nha khoa Tổng quát" />
                </div>

                <div>
                  <Label htmlFor="license">Số giấy phép hành nghề</Label>
                  <Input id="license" defaultValue="123456/BYT" />
                </div>

                <div>
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Textarea 
                    id="bio" 
                    defaultValue="Bác sĩ Nha khoa với 10 năm kinh nghiệm trong điều trị và phục hồi răng miệng."
                    className="min-h-[100px]"
                  />
                </div>

                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <Lock className="w-5 h-5 text-[#3FB5FF]" />
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div>
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  Đổi mật khẩu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <FileSignature className="w-5 h-5 text-[#3FB5FF]" />
                Chữ ký số
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileSignature className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-[#333333]/60 mb-4">Chưa có chữ ký số</p>
                  <Button variant="outline">
                    Upload chữ ký
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-[#333333]">
                    <strong>Lưu ý:</strong> Chữ ký số sẽ được sử dụng để ký các tài liệu y khoa, 
                    đơn thuốc và kế hoạch điều trị. Vui lòng đảm bảo chữ ký của bạn rõ ràng và chính xác.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <Bell className="w-5 h-5 text-[#3FB5FF]" />
                Cài đặt thông báo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-[#333333]">Lịch hẹn mới</p>
                    <p className="text-sm text-[#333333]/60">Nhận thông báo khi có lịch hẹn mới</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-[#333333]">Nhắc nhở lịch hẹn</p>
                    <p className="text-sm text-[#333333]/60">Nhận nhắc nhở trước 1 giờ khi có lịch hẹn</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-[#333333]">Kết quả xét nghiệm</p>
                    <p className="text-sm text-[#333333]/60">Thông báo khi kết quả xét nghiệm sẵn sàng</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-[#333333]">Bệnh nhân hủy lịch</p>
                    <p className="text-sm text-[#333333]/60">Thông báo khi bệnh nhân hủy lịch hẹn</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[#333333]">Email tổng hợp cuối ngày</p>
                    <p className="text-sm text-[#333333]/60">Nhận email tổng hợp công việc cuối ngày</p>
                  </div>
                  <Switch />
                </div>

                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  Lưu cài đặt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
