import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { invoiceController, InvoiceDTO } from '../../controllers/InvoiceController';
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { patientController } from '../../controllers/PatientController';
import { userController } from '../../controllers/UserController';
import { inventoryController } from '../../controllers/InventoryController';
import { medicalServiceController, MedicalServiceDTO } from '../../controllers/MedicalServiceController';

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface ServiceDataPoint {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

interface DoctorPerformanceData {
  doctor: string;
  revenue: number;
  cases: number;
}

export function AdminReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [serviceData, setServiceData] = useState<ServiceDataPoint[]>([]);
  const [doctorPerformance, setDoctorPerformance] = useState<DoctorPerformanceData[]>([]);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    monthlyPatients: 0,
    fillRate: 0,
    growthRate: 0,
  });
  const [appointmentStats, setAppointmentStats] = useState({
    fillRate: 0,
    avgWaitTime: '0 phút',
    cancelledCount: 0,
    noShowCount: 0,
  });
  const [inventoryStats, setInventoryStats] = useState({
    totalValue: 0,
    lowStockCount: 0,
    expiringCount: 0,
  });

  // Màu sắc cho biểu đồ
  const COLORS = ['#3FB5FF', '#05619A', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa'];

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Load tất cả dữ liệu song song
      const [invoices, appointments, patients, inventoryLots, medicines, medicalServices, allUsers] = await Promise.all([
        invoiceController.listInvoices(),
        appointmentController.getAll(),
        patientController.getAll(),
        inventoryController.getAllInventoryLots(),
        inventoryController.getAllMedicines(),
        medicalServiceController.getAll(),
        userController.getAll(),
      ]);

      // Tính toán thời gian
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // 1. Tính doanh thu theo ngày (7 ngày gần nhất)
      const revenueByDate = calculateDailyRevenue(invoices, 7);
      setRevenueData(revenueByDate);

      // 2. Tính doanh thu theo dịch vụ
      const serviceRevenue = calculateServiceRevenue(invoices, medicalServices);
      setServiceData(serviceRevenue);

      // 3. Tính hiệu suất bác sĩ
      const doctorPerf = calculateDoctorPerformance(invoices, appointments, allUsers);
      setDoctorPerformance(doctorPerf);

      // 4. Tính thống kê tổng quan
      const monthlyRevenue = invoices
        .filter(inv => inv.status === 'PAID' && new Date(inv.paidAt || inv.issueAt) >= currentMonthStart)
        .reduce((sum, inv) => sum + (inv.patientTotalPay || 0), 0);

      const monthlyPatients = new Set(
        appointments
          .filter(apt => new Date(apt.appointmentStartTime) >= currentMonthStart)
          .map(apt => apt.patientId)
      ).size;

      const lastMonthRevenue = invoices
        .filter(inv => {
          const paidDate = new Date(inv.paidAt || inv.issueAt);
          return inv.status === 'PAID' && paidDate >= lastMonthStart && paidDate <= lastMonthEnd;
        })
        .reduce((sum, inv) => sum + (inv.patientTotalPay || 0), 0);

      const growthRate = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      // Tính tỷ lệ lấp đầy (completed appointments / total appointments trong tháng)
      const monthlyAppointments = appointments.filter(
        apt => new Date(apt.appointmentStartTime) >= currentMonthStart
      );
      const completedAppointments = monthlyAppointments.filter(
        apt => apt.status === 'COMPLETED'
      );
      const fillRate = monthlyAppointments.length > 0
        ? (completedAppointments.length / monthlyAppointments.length) * 100
        : 0;

      setStats({
        monthlyRevenue,
        monthlyPatients,
        fillRate: Math.round(fillRate),
        growthRate: Math.round(growthRate * 10) / 10,
      });

      // 5. Tính thống kê lịch hẹn
      const cancelledAppointments = monthlyAppointments.filter(
        apt => apt.status === 'CANCELLED'
      );
      const noShowAppointments = monthlyAppointments.filter(
        apt => apt.status === 'FAILED' || (apt.status === 'PENDING' && new Date(apt.appointmentStartTime) < now)
      );

      // Tính thời gian chờ trung bình (giả định 15 phút, có thể tính từ dữ liệu thực tế)
      const avgWaitTime = '15 phút';

      const totalMonthlyAppointments = monthlyAppointments.length;
      const cancelledPercentage = totalMonthlyAppointments > 0
        ? Math.round((cancelledAppointments.length / totalMonthlyAppointments) * 100)
        : 0;
      const noShowPercentage = totalMonthlyAppointments > 0
        ? Math.round((noShowAppointments.length / totalMonthlyAppointments) * 100)
        : 0;

      setAppointmentStats({
        fillRate: Math.round(fillRate),
        avgWaitTime,
        cancelledCount: cancelledAppointments.length,
        noShowCount: noShowAppointments.length,
      });

      // 6. Tính thống kê kho
      const totalValue = inventoryLots.reduce(
        (sum, lot) => sum + (lot.quantityOnHand * (lot.costPrice || 0)),
        0
      );

      // Đếm thuốc sắp hết (quantity < 10)
      const lowStockCount = inventoryLots.filter(
        lot => lot.quantityOnHand < 10
      ).length;

      // Đếm thuốc sắp hết hạn (trong 90 ngày)
      const expiringCount = inventoryLots.filter(lot => {
        if (!lot.expireDate) return false;
        const expireDate = new Date(lot.expireDate);
        const daysUntilExpiry = (expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
      }).length;

      setInventoryStats({
        totalValue,
        lowStockCount,
        expiringCount,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setIsLoading(false);
    }
  };

  // Tính doanh thu theo ngày
  const calculateDailyRevenue = (invoices: InvoiceDTO[], days: number): RevenueDataPoint[] => {
    const now = new Date();
    const result: RevenueDataPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayRevenue = invoices
        .filter(inv => {
          const paidDate = new Date(inv.paidAt || inv.issueAt);
          return inv.status === 'PAID' && paidDate >= date && paidDate < nextDate;
        })
        .reduce((sum, inv) => sum + (inv.patientTotalPay || 0), 0);

      result.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        revenue: dayRevenue,
      });
    }

    return result;
  };

  // Tính doanh thu theo dịch vụ
  const calculateServiceRevenue = (
    invoices: InvoiceDTO[],
    medicalServices: MedicalServiceDTO[]
  ): ServiceDataPoint[] => {
    const serviceMap = new Map<string, { revenue: number; count: number }>();

    invoices
      .filter(inv => inv.status === 'PAID')
      .forEach(inv => {
        inv.items?.forEach(item => {
          const serviceType = item.serviceType;
          const revenue = item.patientPayAmount || 0;

          const current = serviceMap.get(serviceType) || { revenue: 0, count: 0 };
          serviceMap.set(serviceType, {
            revenue: current.revenue + revenue,
            count: current.count + 1,
          });
        });
      });

    // Tìm tên dịch vụ từ medicalServices hoặc sử dụng serviceType
    const serviceNameMap = new Map(
      medicalServices.map(svc => [svc.id, svc.serviceName])
    );

    // Map serviceType sang tên dịch vụ (nếu có)
    const serviceTypeNameMap = new Map<string, string>([
      ['Medicine', 'Thuốc'],
      ['Dental', 'Nha khoa'],
    ]);

    const result: ServiceDataPoint[] = Array.from(serviceMap.entries())
      .map(([serviceType, data], index) => {
        // Tìm tên từ serviceType hoặc serviceTypeNameMap
        let serviceName = serviceTypeNameMap.get(serviceType) || serviceType;

        // Nếu có referenceId, tìm trong medicalServices
        if (data.count > 0) {
          // Có thể cải thiện logic này để map chính xác hơn
          const matchedService = medicalServices.find(svc =>
            svc.serviceType === serviceType || svc.id === serviceType
          );
          if (matchedService) {
            serviceName = matchedService.serviceName;
          }
        }

        return {
          name: serviceName,
          value: data.count,
          revenue: data.revenue,
          color: COLORS[index % COLORS.length],
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6); // Top 6 dịch vụ

    return result;
  };

  // Tính hiệu suất bác sĩ
  const calculateDoctorPerformance = (
    invoices: InvoiceDTO[],
    appointments: AppointmentDTO[],
    users: any[]
  ): DoctorPerformanceData[] => {
    const doctorMap = new Map<string, { revenue: number; cases: number; name: string }>();

    // Tạo map user ID -> fullName
    const userMap = new Map(users.map(u => [u.id, u.fullName]));

    invoices
      .filter(inv => inv.status === 'PAID')
      .forEach(inv => {
        const appointment = appointments.find(apt => apt.id === inv.appointmentId);
        if (appointment?.doctorId) {
          const current = doctorMap.get(appointment.doctorId) || {
            revenue: 0,
            cases: 0,
            name: userMap.get(appointment.doctorId) || `BS. ${appointment.doctorId.slice(0, 8)}`,
          };
          doctorMap.set(appointment.doctorId, {
            ...current,
            revenue: current.revenue + (inv.patientTotalPay || 0),
            cases: current.cases + 1,
          });
        }
      });

    return Array.from(doctorMap.values())
      .map(doc => ({
        doctor: doc.name,
        revenue: doc.revenue,
        cases: doc.cases,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4); // Top 4 bác sĩ
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-[#01304e]">{stats.monthlyRevenue} đ</p>
                {/* <p className="text-[#01304e]">
                  {stats.monthlyRevenue >= 1000000
                    ? `${(stats.monthlyRevenue / 1000000).toFixed(1)}M`
                    : `${(stats.monthlyRevenue / 1000).toFixed(0)}K`} ₫
                </p> */}
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
                <p className="text-[#01304e]">{stats.monthlyPatients}</p>
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
                <p className="text-[#01304e]">{stats.fillRate}%</p>
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
                <p className="text-[#01304e]">
                  {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
                </p>
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
                      <Tooltip formatter={(value, name, props) => [
                        `${Number(props.payload.revenue).toLocaleString('vi-VN')} ₫`,
                        'Doanh thu'
                      ]} />
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
                    <span className="text-[#01304e]">{appointmentStats.fillRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                    <span className="text-[#333333]">Số ca bị hủy</span>
                    <span className="text-[#01304e]">
                      {appointmentStats.cancelledCount} ca
                      {appointmentStats.cancelledCount > 0 && appointmentStats.fillRate > 0 ?
                        ` (${Math.round((appointmentStats.cancelledCount / (appointmentStats.cancelledCount + appointmentStats.noShowCount + (100 - appointmentStats.fillRate) * 10)) * 100)}%)` : ''}
                    </span>
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
                    <span className="text-[#01304e]">
                      {inventoryStats.totalValue >= 1000000
                        ? `${(inventoryStats.totalValue / 1000000).toFixed(1)}M`
                        : `${(inventoryStats.totalValue / 1000).toFixed(0)}K`} ₫
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-[10px]">
                    <span className="text-[#333333]">Hàng sắp hết</span>
                    <span className="text-orange-600">{inventoryStats.lowStockCount} sản phẩm</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-[10px]">
                    <span className="text-[#333333]">Hàng sắp hết hạn</span>
                    <span className="text-red-600">{inventoryStats.expiringCount} sản phẩm</span>
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
