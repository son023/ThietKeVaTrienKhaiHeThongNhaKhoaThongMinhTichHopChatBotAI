import { Save, Building2, Shield, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AdminSettings() {
  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-1">Cài đặt Hệ thống</h1>
        <p className="text-sm text-[#333333]/60">Cấu hình phòng khám và hệ thống</p>
      </div>

      <Tabs defaultValue="clinic">
        <TabsList>
          <TabsTrigger value="clinic">Thông tin Phòng khám</TabsTrigger>
          <TabsTrigger value="roles">Phân quyền</TabsTrigger>
          <TabsTrigger value="operations">Vận hành</TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <Building2 className="w-5 h-5 text-[#3FB5FF]" />
                Thông tin Phòng khám
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label htmlFor="clinic-name">Tên phòng khám</Label>
                  <Input id="clinic-name" defaultValue="Phòng khám Nha khoa DentalCareX" className="rounded-[10px] border-[#e8e8e8]" />
                </div>

                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input id="address" defaultValue="123 Nguyễn Văn Linh, Quận 7, TP.HCM" className="rounded-[10px] border-[#e8e8e8]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" defaultValue="028 1234 5678" className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="contact@dentalcarex.vn" className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opening">Giờ mở cửa</Label>
                    <Input id="opening" type="time" defaultValue="08:00" className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                  <div>
                    <Label htmlFor="closing">Giờ đóng cửa</Label>
                    <Input id="closing" type="time" defaultValue="18:00" className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea 
                    id="description" 
                    defaultValue="Phòng khám Nha khoa chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm"
                    className="rounded-[10px] border-[#e8e8e8]"
                  />
                </div>

                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <Shield className="w-5 h-5 text-[#3FB5FF]" />
                Quản lý Phân quyền
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: 'Admin', permissions: 'Toàn quyền quản trị hệ thống' },
                  { role: 'Bác sĩ', permissions: 'Quản lý lịch hẹn, bệnh nhân, kế hoạch điều trị' },
                  { role: 'Lễ tân', permissions: 'Quản lý lịch hẹn, thanh toán' },
                  { role: 'KTV', permissions: 'Xem thông tin bệnh nhân, hỗ trợ bác sĩ' },
                ].map((item, index) => (
                  <div key={index} className="p-4 border border-[#e8e8e8] rounded-[10px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#333333]">{item.role}</p>
                        <p className="text-sm text-[#333333]/60 mt-1">{item.permissions}</p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-[10px]">
                        Cấu hình
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <SettingsIcon className="w-5 h-5 text-[#3FB5FF]" />
                Cấu hình Vận hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label htmlFor="slot-duration">Độ dài 1 slot (phút)</Label>
                  <Input id="slot-duration" type="number" defaultValue="30" className="rounded-[10px] border-[#e8e8e8]" />
                  <p className="text-xs text-[#333333]/60 mt-1">
                    Thời gian mặc định cho mỗi lịch hẹn
                  </p>
                </div>

                <div>
                  <Label htmlFor="buffer-time">Thời gian đệm (phút)</Label>
                  <Input id="buffer-time" type="number" defaultValue="15" className="rounded-[10px] border-[#e8e8e8]" />
                  <p className="text-xs text-[#333333]/60 mt-1">
                    Thời gian nghỉ giữa các ca khám
                  </p>
                </div>

                <div>
                  <Label htmlFor="late-policy">Chính sách giờ trễ (phút)</Label>
                  <Input id="late-policy" type="number" defaultValue="15" className="rounded-[10px] border-[#e8e8e8]" />
                  <p className="text-xs text-[#333333]/60 mt-1">
                    Thời gian chờ tối đa cho bệnh nhân đến muộn
                  </p>
                </div>

                <div>
                  <Label htmlFor="advance-booking">Đặt lịch trước (ngày)</Label>
                  <Input id="advance-booking" type="number" defaultValue="30" className="rounded-[10px] border-[#e8e8e8]" />
                  <p className="text-xs text-[#333333]/60 mt-1">
                    Số ngày tối đa có thể đặt lịch trước
                  </p>
                </div>

                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu cấu hình
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
