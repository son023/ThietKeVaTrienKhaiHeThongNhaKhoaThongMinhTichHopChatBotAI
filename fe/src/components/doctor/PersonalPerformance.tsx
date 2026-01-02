import { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';
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
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { authController } from '../../controllers/AuthController';

interface Stats {
  thisWeek: number;
  thisMonth: number;
  totalPatients: number;
}

interface ServiceData {
  name: string;
  value: number;
  color: string;
}

interface WeeklyData {
  day: string;
  count: number;
}

const SERVICE_COLORS = [
  '#3FB5FF', '#05619A', '#82ca9d', '#ffc658', 
  '#ff7c7c', '#a78bfa', '#f59e0b', '#10b981',
  '#6366f1', '#ec4899', '#14b8a6', '#f97316'
];

export function PersonalPerformance() {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    thisWeek: 0,
    thisMonth: 0,
    totalPatients: 0,
  });
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  const currentUser = authController.getCurrentUser();
  const doctorId = currentUser?.id;

  useEffect(() => {
    const loadData = async () => {
      if (!doctorId) {
        setError('Không tìm thấy thông tin bác sĩ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await appointmentController.getByDoctorId(doctorId);
        setAppointments(data);

        calculateStats(data);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [doctorId]);

  const calculateStats = (data: AppointmentDTO[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedAppointments = data.filter(apt => 
      apt.status === 'COMPLETED' || apt.status === 'IN_PROGRESS' || apt.status === 'PROGRESSING'
    );

    const thisWeekCount = completedAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentStartTime);
      return aptDate >= startOfWeek;
    }).length;

    const thisMonthCount = completedAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentStartTime);
      return aptDate >= startOfMonth;
    }).length;

    const uniquePatients = new Set(completedAppointments.map(apt => apt.patientId));
    const totalPatientsCount = uniquePatients.size;

    setStats({
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      totalPatients: totalPatientsCount,
    });

    const serviceMap = new Map<string, number>();
    completedAppointments.forEach(apt => {
      if (apt.medicalServices && apt.medicalServices.length > 0) {
        apt.medicalServices.forEach(service => {
          const count = serviceMap.get(service.serviceName) || 0;
          serviceMap.set(service.serviceName, count + 1);
        });
      }
    });

    const services: ServiceData[] = Array.from(serviceMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: SERVICE_COLORS[index % SERVICE_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Lấy top 10 dịch vụ

    setServiceData(services);

    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dailyCounts = new Map<number, number>();

    completedAppointments.forEach(apt => {
      const aptDate = new Date(apt.appointmentStartTime);
      const dayOfWeek = aptDate.getDay();
      const count = dailyCounts.get(dayOfWeek) || 0;
      dailyCounts.set(dayOfWeek, count + 1);
    });

    const weekly: WeeklyData[] = [1, 2, 3, 4, 5, 6, 0].map(dayIndex => ({
      day: weekDays[dayIndex],
      count: dailyCounts.get(dayIndex) || 0
    }));

    setWeeklyData(weekly);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-background min-h-screen">
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Hiệu suất cá nhân</h1>
        <p className="text-neutral-text/60">Theo dõi hiệu suất và thành tích của bạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="bg-neutral-muted border border-neutral-border/30 p-1 rounded-xl">
          <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Phân loại dịch vụ</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Theo tuần</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="typo-h4">Tỉ lệ các loại dịch vụ đã thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-neutral-text/60">
                  Chưa có dữ liệu dịch vụ
                </div>
              ) : (
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
              )}
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
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3FB5FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
