import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import {
  invoiceController,
  InvoiceDTO,
} from "../../controllers/InvoiceController";
import {
  paymentController,
  PaymentMethod,
} from "../../controllers/PaymentController";
import {
  appointmentController,
  AppointmentDTO,
} from "../../controllers/AppointmentController";
import { userController } from "../../controllers/UserController";
import { UserDTO } from "../../models/User";

interface ReportStats {
  cashRevenue: number;
  cardRevenue: number;
  totalRevenue: number;
  newPatients: number;
}

interface Transaction {
  id: string;
  time: string;
  patient: string;
  service: string;
  amount: number;
  method: "cash" | "card" | "transfer";
  status: "completed" | "pending" | "cancelled";
}

export function ReceptionistReports() {
  const [stats, setStats] = useState<ReportStats>({
    cashRevenue: 0,
    cardRevenue: 0,
    totalRevenue: 0,
    newPatients: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filter state
  const [filterType, setFilterType] = useState<"day" | "month" | "custom">("day");
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Format: YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  ); // Format: YYYY-MM
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");


  // Caching để tối ưu performance
  const userCacheRef = useRef<Record<string, UserDTO>>({});
  const appointmentCacheRef = useRef<Record<string, AppointmentDTO>>({});

  const getUser = async (id?: string) => {
    if (!id) return undefined;
    try {
      if (!userCacheRef.current[id]) {
        userCacheRef.current[id] = await userController.getById(id);
      }
      return userCacheRef.current[id];
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return undefined;
    }
  };

  const getAppointment = async (id?: string) => {
    if (!id) return undefined;
    try {
      if (!appointmentCacheRef.current[id]) {
        appointmentCacheRef.current[id] = await appointmentController.getById(
          id
        );
      }
      return appointmentCacheRef.current[id];
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      return undefined;
    }
  };

  useEffect(() => {
    loadReportData();
  }, [filterType, selectedDay, selectedMonth, fromDate, toDate]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Lấy tất cả invoices
      const allInvoices = await invoiceController.listInvoices();

      // Filter invoices theo filter type
      let filteredInvoices = allInvoices;

      if (filterType === "day") {
        // Filter theo ngày được chọn
        const selected = new Date(selectedDay);
        filteredInvoices = allInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.issueAt);
          return (
            invoiceDate.getDate() === selected.getDate() &&
            invoiceDate.getMonth() === selected.getMonth() &&
            invoiceDate.getFullYear() === selected.getFullYear()
          );
        });
      } else if (filterType === "month") {
        // Filter theo tháng được chọn
        const [year, month] = selectedMonth.split("-").map(Number);
        filteredInvoices = allInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.issueAt);
          return (
            invoiceDate.getMonth() === month - 1 &&
            invoiceDate.getFullYear() === year
          );
        });
      } else if (filterType === "custom" && fromDate && toDate) {
        // Filter theo khoảng thời gian tùy chỉnh
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // Set to end of day
        
        filteredInvoices = allInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.issueAt);
          return invoiceDate >= from && invoiceDate <= to;
        });
      }

      // 2. Tính toán thống kê doanh thu
      let cashTotal = 0;
      let cardTotal = 0;

      // Xử lý song song với Promise.allSettled
      const transactionPromises = filteredInvoices.map(async (invoice) => {
        if (invoice.status !== "PAID") return null;

        try {
          const payments = await paymentController.getPaymentsByInvoice(
            invoice.id
          );

          if (payments.length > 0) {
            const latestPayment = payments[payments.length - 1];
            const amount = invoice.patientTotalPay || 0;

            // Lấy thông tin bệnh nhân và appointment
            const appointment = await getAppointment(invoice.appointmentId);
            const patient = await getUser(appointment?.patientId);

            const invoiceTime = new Date(invoice.issueAt);

            return {
              id: invoice.id,
              time: invoiceTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              patient: patient?.fullName || "Bệnh nhân",
              service:
                appointment?.medicalServices?.[0]?.serviceName || "Dịch vụ",
              amount: amount,
              method:
                latestPayment.paymentMethod === PaymentMethod.CASH
                  ? ("cash" as const)
                  : latestPayment.paymentMethod === PaymentMethod.BANK_TRANSFER
                  ? ("transfer" as const)
                  : ("card" as const),
              status: "completed" as const,
              paymentMethod: latestPayment.paymentMethod,
            };
          }
        } catch (err) {
          console.error(`Error processing invoice ${invoice.id}:`, err);
        }
        return null;
      });

      const results = await Promise.allSettled(transactionPromises);
      const processedTransactions = results
        .filter(
          (
            r
          ): r is PromiseFulfilledResult<
            NonNullable<Awaited<(typeof transactionPromises)[0]>>
          > => r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);

      // Tính tổng doanh thu theo phương thức
      processedTransactions.forEach((t) => {
        if (t.paymentMethod === PaymentMethod.CASH) {
          cashTotal += t.amount;
        } else if (t.paymentMethod === PaymentMethod.BANK_TRANSFER) {
          cardTotal += t.amount;
        }
      });

      // Sắp xếp transactions theo thời gian (mới nhất trước)
      processedTransactions.sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);
        return timeB[0] * 60 + timeB[1] - (timeA[0] * 60 + timeA[1]);
      });

      // 3. Đếm bệnh nhân mới (appointments theo filter)
      let appointmentDate: Date;
      if (filterType === "day") {
        appointmentDate = new Date(selectedDay);
      } else if (filterType === "month") {
        appointmentDate = new Date(selectedMonth + "-01");
      } else {
        appointmentDate = new Date(); // Default to today for custom range
      }
      
      const appointments = await appointmentController.getByDate(appointmentDate);
      const uniquePatients = new Set(
        appointments.map((apt) => apt.patientId)
      );

      // 4. Cập nhật state
      setStats({
        cashRevenue: cashTotal,
        cardRevenue: cardTotal,
        totalRevenue: cashTotal + cardTotal,
        newPatients: uniquePatients.size,
      });

      setRecentTransactions(processedTransactions);
    } catch (err) {
      console.error("Error loading report data:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo"
      );
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const paymentMethodMap: Record<string, string> = {
    cash: "Tiền mặt",
    card: "Thẻ",
    transfer: "Chuyển khoản",
  };

  // Loading state - only show full page loader on initial load
  if (loading && isInitialLoad) {
    return (
      <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-text/70 font-medium">
              Đang tải báo cáo doanh thu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">
            Báo cáo Doanh thu
          </h1>
          <p className="text-neutral-text/70 font-medium">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">
          Báo cáo Doanh thu
        </h1>
        <p className="text-neutral-text/70 font-medium">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Date Filter */}
      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neutral-text/70" />
            <span className="text-sm font-medium text-neutral-text">
              Lọc theo:
            </span>
          </div>
          
          <Select value={filterType} onValueChange={(value: "day" | "month" | "custom") => setFilterType(value)}>
            <SelectTrigger className="w-[180px] border-neutral-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="custom">Khoảng thời gian</SelectItem>
            </SelectContent>
          </Select>

          {filterType === "day" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-text/70">Chọn ngày:</span>
              <Input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-[160px] border-neutral-border"
              />
            </div>
          )}

          {filterType === "month" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-text/70">Chọn tháng:</span>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[160px] border-neutral-border"
              />
            </div>
          )}

          {filterType === "custom" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-text/70">Từ ngày:</span>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[160px] border-neutral-border"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-text/70">Đến ngày:</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[160px] border-neutral-border"
                />
              </div>
            </>
          )}

          {loading && !isInitialLoad && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm text-neutral-text/70">Đang tải...</span>
            </div>
          )}
        </div>
      </Card>


      {/* Revenue Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">
                Tiền mặt
              </p>
              <h3 className="text-2xl font-bold text-neutral-text">
                {stats.cashRevenue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+12% so với hôm qua</span>
          </div>
        </Card>

        <Card className="p-6 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">
                Thẻ/CK
              </p>
              <h3 className="text-2xl font-bold text-neutral-text">
                {stats.cardRevenue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+8% so với hôm qua</span>
          </div>
        </Card>

        <Card className="p-6 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">
                Tổng Doanh thu
              </p>
              <h3 className="text-2xl font-bold text-primary">
                {stats.totalRevenue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+10% so với hôm qua</span>
          </div>
        </Card>

        <Card className="p-6 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">
                Bệnh nhân mới
              </p>
              <h3 className="text-2xl font-bold text-neutral-text">
                {stats.newPatients}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+20% so với hôm qua</span>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-text mb-5">
            Phân bổ theo phương thức
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-neutral-text">Tiền mặt</span>
              </div>
              <span className="text-sm font-semibold text-neutral-text">
                {stats.totalRevenue > 0
                  ? ((stats.cashRevenue / stats.totalRevenue) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2.5 bg-neutral-tint rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width:
                    stats.totalRevenue > 0
                      ? `${(stats.cashRevenue / stats.totalRevenue) * 100}%`
                      : "0%",
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-sm text-neutral-text">
                  Thẻ/Chuyển khoản
                </span>
              </div>
              <span className="text-sm font-semibold text-neutral-text">
                {stats.totalRevenue > 0
                  ? ((stats.cardRevenue / stats.totalRevenue) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2.5 bg-neutral-tint rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width:
                    stats.totalRevenue > 0
                      ? `${(stats.cardRevenue / stats.totalRevenue) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-text mb-5">
            Tổng quan
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-border">
              <span className="text-sm text-neutral-text/70 font-medium">
                Tổng số giao dịch
              </span>
              <span className="text-neutral-text font-semibold">
                {recentTransactions.length}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-border">
              <span className="text-sm text-neutral-text/70 font-medium">
                Giá trị trung bình
              </span>
              <span className="text-neutral-text font-semibold">
                {recentTransactions.length > 0
                  ? (
                      stats.totalRevenue / recentTransactions.length
                    ).toLocaleString("vi-VN")
                  : 0}
                đ
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-border">
              <span className="text-sm text-neutral-text/70 font-medium">
                Số bệnh nhân khám
              </span>
              <span className="text-neutral-text font-semibold">
                {recentTransactions.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-text/70 font-medium">
                Tỷ lệ hoàn tất
              </span>
              <Badge className="bg-green-600 text-white">100%</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-text mb-5">
          Danh sách giao dịch
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-muted/30">
              <TableHead className="font-semibold text-neutral-text">
                Giờ
              </TableHead>
              <TableHead className="font-semibold text-neutral-text">
                Bệnh nhân
              </TableHead>
              <TableHead className="font-semibold text-neutral-text">
                Dịch vụ
              </TableHead>
              <TableHead className="font-semibold text-neutral-text">
                Phương thức
              </TableHead>
              <TableHead className="text-right font-semibold text-neutral-text">
                Số tiền
              </TableHead>
              <TableHead className="font-semibold text-neutral-text">
                Trạng thái
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-neutral-text/60 font-medium">
                    Không có giao dịch nào trong khoảng thời gian này
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              recentTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border"
                >
                  <TableCell className="text-sm text-neutral-text">
                    {transaction.time}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-text">
                    {transaction.patient}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-text">
                    {transaction.service}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-neutral-border bg-neutral-muted"
                    >
                      {paymentMethodMap[transaction.method]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-neutral-text">
                    {transaction.amount.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-600 text-white">Hoàn tất</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
