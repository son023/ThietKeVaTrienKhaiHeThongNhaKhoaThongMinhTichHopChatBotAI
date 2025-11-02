import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function AdminReports() {
  const revenueData = [
    { date: '20/10', revenue: 8500000 },
    { date: '21/10', revenue: 12300000 },
    { date: '22/10', revenue: 9800000 },
    { date: '23/10', revenue: 15600000 },
    { date: '24/10', revenue: 11200000 },
    { date: '25/10', revenue: 13400000 },
    { date: '26/10', revenue: 12500000 },
  ];

  const serviceData = [
    { name: 'Khám tổng quát', value: 30, revenue: 45000000, color: '#3FB5FF' },
    { name: 'Trám răng', value: 25, revenue: 62500000, color: '#05619A' },
    { name: 'Điều trị tủy', value: 15, revenue: 52500000, color: '#82ca9d' },
    { name: 'Cạo vôi', value: 12, revenue: 18000000, color: '#ffc658' },
    { name: 'Niềng răng', value: 10, revenue: 85000000, color: '#ff7c7c' },
    { name: 'Phục hình', value: 8, revenue: 96000000, color: '#a78bfa' },
  ];

  const doctorPerformance = [
    { doctor: 'BS. Hùng', revenue: 156000000, cases: 48 },
    { doctor: 'BS. Mai', revenue: 142000000, cases: 42 },
    { doctor: 'BS. Phong', revenue: 135000000, cases: 45 },
    { doctor: 'BS. Lan', revenue: 128000000, cases: 38 },
  ];

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-1">Báo cáo & Thống kê</h1>
        <p className="text-sm text-[#333333]/60">Phân tích dữ liệu và hiệu suất phòng khám</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Doanh thu tháng</p>
                <p className="text-[#01304e]">359M ₫</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Bệnh nhân/tháng</p>
                <p className="text-[#01304e]">173</p>
              </div>
              <Users className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tỷ lệ lấp đầy</p>
                <p className="text-[#01304e]">85%</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tăng trưởng</p>
                <p className="text-[#01304e]">+12.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Báo cáo Tài chính</TabsTrigger>
          <TabsTrigger value="operations">Báo cáo Vận hành</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Doanh thu theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3FB5FF" strokeWidth={2} name="Doanh thu" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#01304e]">Doanh thu theo Dịch vụ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#01304e]">Doanh thu theo Bác sĩ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="doctor" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
                      <Bar dataKey="revenue" fill="#3FB5FF" radius={[8, 8, 0, 0]} name="Doanh thu" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#01304e]">Thống kê lịch hẹn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                    <span className="text-[#333333]">Tỷ lệ lấp đầy slot</span>
                    <span className="text-[#01304e]">85%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                    <span className="text-[#333333]">Thời gian chờ trung bình</span>
                    <span className="text-[#01304e]">15 phút</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                    <span className="text-[#333333]">Số ca bị hủy</span>
                    <span className="text-[#01304e]">12 ca (7%)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                    <span className="text-[#333333]">Số ca không đến</span>
                    <span className="text-[#01304e]">8 ca (4.6%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#01304e]">Thống kê kho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                    <span className="text-[#333333]">Giá trị tồn kho</span>
                    <span className="text-[#01304e]">45.5M ₫</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-[10px]">
                    <span className="text-[#333333]">Hàng sắp hết</span>
                    <span className="text-orange-600">5 sản phẩm</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-[10px]">
                    <span className="text-[#333333]">Hàng sắp hết hạn</span>
                    <span className="text-red-600">3 sản phẩm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
