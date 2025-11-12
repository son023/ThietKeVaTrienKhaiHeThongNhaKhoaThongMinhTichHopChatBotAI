import { TrendingUp, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export function PersonalPerformance() {
  const stats = {
    thisWeek: 12,
    thisMonth: 48,
    avgRating: 4.8,
    totalPatients: 156,
  };

  const serviceData = [
    { name: 'Khám tổng quát', value: 30, color: '#3FB5FF' },
    { name: 'Trám răng', value: 25, color: '#05619A' },
    { name: 'Điều trị tủy', value: 15, color: '#82ca9d' },
    { name: 'Cạo vôi', value: 12, color: '#ffc658' },
    { name: 'Niềng răng', value: 10, color: '#ff7c7c' },
    { name: 'Phục hình', value: 8, color: '#a78bfa' },
  ];

  const weeklyData = [
    { day: 'T2', count: 8 },
    { day: 'T3', count: 12 },
    { day: 'T4', count: 10 },
    { day: 'T5', count: 15 },
    { day: 'T6', count: 14 },
    { day: 'T7', count: 6 },
    { day: 'CN', count: 3 },
  ];

  const topReviews = [
    { id: '1', patient: 'Nguyễn Văn An', rating: 5, comment: 'Bác sĩ rất tận tâm và chu đáo. Quy trình điều trị chuyên nghiệp.', date: '24/10/2025' },
    { id: '2', patient: 'Trần Thị Bình', rating: 5, comment: 'Khám rất kỹ lưỡng, giải thích rõ ràng. Rất hài lòng!', date: '22/10/2025' },
    { id: '3', patient: 'Lê Văn Cường', rating: 5, comment: 'Thái độ thân thiện, tay nghề cao. Sẽ giới thiệu bạn bè đến.', date: '20/10/2025' },
  ];

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-2">Hiệu suất cá nhân</h1>
        <p className="text-[#333333]/60">Theo dõi hiệu suất và thành tích của bạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tuần này</p>
                <p className="text-[#333333]">{stats.thisWeek} ca</p>
              </div>
              <Calendar className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tháng này</p>
                <p className="text-[#333333]">{stats.thisMonth} ca</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tổng bệnh nhân</p>
                <p className="text-[#333333]">{stats.totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Đánh giá TB</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#333333]">{stats.avgRating}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= stats.avgRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Phân loại dịch vụ</TabsTrigger>
          <TabsTrigger value="weekly">Theo tuần</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Tỉ lệ các loại dịch vụ đã thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Số ca khám theo ngày trong tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3FB5FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Bệnh nhân có phản hồi tốt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[#333333]">{review.patient}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-[#333333]/60">{review.date}</span>
                    </div>
                    <p className="text-sm text-[#333333]/80 italic">"{review.comment}"</p>
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
