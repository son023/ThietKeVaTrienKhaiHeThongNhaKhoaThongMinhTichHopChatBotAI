import { useState } from 'react';
import { ArrowLeft, Save, Clock, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';

interface AdminStaffDetailProps {
  staffId: string | null;
  onBack: () => void;
}

export function AdminStaffDetail({ staffId, onBack }: AdminStaffDetailProps) {
  // Mock staff data
  const staff = {
    id: staffId,
    name: 'BS. Nguyễn Văn Hùng',
    position: 'Bác sĩ Nha khoa',
    specialty: 'Tổng quát',
    email: 'hung.nguyen@dental.vn',
    phone: '0901234567',
    license: '123456/BYT',
    role: 'doctor',
  };

  const workSchedule = [
    { day: 'Thứ 2', enabled: true, start: '08:00', end: '17:00', room: 'Phòng 1' },
    { day: 'Thứ 3', enabled: false, start: '', end: '', room: '' },
    { day: 'Thứ 4', enabled: true, start: '08:00', end: '17:00', room: 'Phòng 1' },
    { day: 'Thứ 5', enabled: false, start: '', end: '', room: '' },
    { day: 'Thứ 6', enabled: true, start: '08:00', end: '17:00', room: 'Phòng 1' },
    { day: 'Thứ 7', enabled: true, start: '08:00', end: '12:00', room: 'Phòng 1' },
    { day: 'Chủ nhật', enabled: false, start: '', end: '', room: '' },
  ];

  const performanceStats = {
    totalCases: 156,
    thisMonth: 48,
    revenue: '156,000,000 ₫',
    avgRating: 4.8,
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4 rounded-[10px] border-[#e8e8e8]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
        <h1 className="text-[#01304e]">{staff.name}</h1>
        <p className="text-[#333333]/60">{staff.position} • {staff.specialty}</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ cá nhân</TabsTrigger>
          <TabsTrigger value="schedule">Cấu hình Lịch làm việc</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullname">Họ và tên</Label>
                    <Input id="fullname" defaultValue={staff.name} className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                  <div>
                    <Label htmlFor="position">Vị trí</Label>
                    <Input id="position" defaultValue={staff.position} className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" defaultValue={staff.phone} className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={staff.email} className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">Chuyên môn</Label>
                    <Input id="specialty" defaultValue={staff.specialty} className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                  <div>
                    <Label htmlFor="license">Số giấy phép</Label>
                    <Input id="license" defaultValue={staff.license} className="rounded-[10px] border-[#e8e8e8]" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Vai trò hệ thống</Label>
                  <Select defaultValue={staff.role}>
                    <SelectTrigger className="rounded-[10px] border-[#e8e8e8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="doctor">Bác sĩ</SelectItem>
                      <SelectItem value="receptionist">Lễ tân</SelectItem>
                      <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#01304e]">Lịch làm việc hàng tuần</CardTitle>
                <div className="text-sm text-[#333333]/60">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Thời gian đệm: 15 phút
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workSchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white border border-[#e8e8e8] rounded-[10px]"
                  >
                    <div className="flex items-center gap-3 w-32">
                      <Switch defaultChecked={schedule.enabled} />
                      <span className="text-[#333333]">{schedule.day}</span>
                    </div>

                    {schedule.enabled ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            defaultValue={schedule.start}
                            className="w-32 rounded-[10px] border-[#e8e8e8]"
                          />
                          <span className="text-[#333333]/60">đến</span>
                          <Input
                            type="time"
                            defaultValue={schedule.end}
                            className="w-32 rounded-[10px] border-[#e8e8e8]"
                          />
                        </div>
                        <Select defaultValue={schedule.room}>
                          <SelectTrigger className="w-40 rounded-[10px] border-[#e8e8e8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phòng 1">Phòng 1</SelectItem>
                            <SelectItem value="Phòng 2">Phòng 2</SelectItem>
                            <SelectItem value="Phòng 3">Phòng 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <span className="text-[#333333]/40">Nghỉ</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-[10px]">
                <p className="text-sm text-[#333333]">
                  <strong>Lưu ý:</strong> Lịch làm việc sẽ được áp dụng cho tất cả các tuần.
                  Để chặn thời gian nghỉ phép hoặc họp, vui lòng sử dụng chức năng "Block time" trong lịch.
                </p>
              </div>

              <Button className="mt-6 bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <Save className="w-4 h-4 mr-2" />
                Lưu lịch làm việc
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#333333]/60 mb-1">Tổng số ca</p>
                    <p className="text-[#01304e]">{performanceStats.totalCases}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-[#3FB5FF]" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#333333]/60 mb-1">Tháng này</p>
                    <p className="text-[#01304e]">{performanceStats.thisMonth}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#333333]/60 mb-1">Doanh thu</p>
                    <p className="text-[#01304e] text-sm">{performanceStats.revenue}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#3FB5FF]" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#333333]/60 mb-1">Đánh giá TB</p>
                    <p className="text-[#01304e]">{performanceStats.avgRating} ⭐</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Hiệu suất theo dịch vụ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { service: 'Khám tổng quát', count: 45, percent: 28.8 },
                  { service: 'Trám răng', count: 38, percent: 24.4 },
                  { service: 'Điều trị tủy', count: 25, percent: 16.0 },
                  { service: 'Cạo vôi', count: 22, percent: 14.1 },
                  { service: 'Khác', count: 26, percent: 16.7 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#333333]">{item.service}</span>
                      <span className="text-sm text-[#333333]/60">
                        {item.count} ca ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#3FB5FF] h-2 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
