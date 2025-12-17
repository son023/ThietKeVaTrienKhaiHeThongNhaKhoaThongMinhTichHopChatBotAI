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
    <div className="p-6 bg-neutral-background min-h-screen">
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Hiệu suất cá nhân</h1>
        <p className="text-neutral-text/60">Theo dõi hiệu suất và thành tích của bạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-text/60 mb-2">Tuần này</p>
                <p className="text-2xl font-bold text-neutral-text">{stats.thisWeek} <span className="text-base font-normal">ca</span></p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-text/60 mb-2">Tháng này</p>
                <p className="text-2xl font-bold text-neutral-text">{stats.thisMonth} <span className="text-base font-normal">ca</span></p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-text/60 mb-2">Tổng bệnh nhân</p>
                <p className="text-2xl font-bold text-neutral-text">{stats.totalPatients}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-text/60 mb-2">Đánh giá TB</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-neutral-text">{stats.avgRating}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= stats.avgRating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-border'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-yellow-50">
                <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="bg-neutral-muted border border-neutral-border/30 p-1 rounded-xl">
          <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Phân loại dịch vụ</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Theo tuần</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="typo-h4">Tỉ lệ các loại dịch vụ đã thực hiện</CardTitle>
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

        <TabsContent value="weekly">
          <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="typo-h4">Số ca khám theo ngày trong tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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

        <TabsContent value="reviews">
          <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="typo-h4">Bệnh nhân có phản hồi tốt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReviews.map((review) => (
                  <div key={review.id} className="p-5 bg-neutral-muted rounded-xl border border-neutral-border/30 hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-neutral-text">{review.patient}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-border'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-neutral-text/60 font-medium">{review.date}</span>
                    </div>
                    <p className="text-sm text-neutral-text/80 italic leading-relaxed">"{review.comment}"</p>
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
