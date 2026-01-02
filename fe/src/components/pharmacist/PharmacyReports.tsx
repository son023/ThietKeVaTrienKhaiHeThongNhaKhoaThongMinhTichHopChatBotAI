import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Package, DollarSign, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import {
  inventoryController,
  MedicineDTO,
  InventoryLotDTO,
  StockLedgerDTO,
  DispenseOrderDTO,
  DispenseItemDTO,
} from '../../controllers/InventoryController';

interface InventoryReportData {
  name: string;
  nhap: number;
  xuat: number;
  ton: number;
}

interface TopDispensedDrug {
  name: string;
  quantity: number;
  value: number;
}

interface ExpiringDrug {
  name: string;
  batch: string;
  expiry: string;
  quantity: number;
  daysLeft: number;
}

interface MonthlyTrendData {
  month: string;
  nhap: number;
  xuat: number;
  giatri: number;
}

export function PharmacyReports() {
  const [reportType, setReportType] = useState<'inventory' | 'dispensing' | 'expiring' | 'value'>('inventory');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  // Data states
  const [inventoryData, setInventoryData] = useState<InventoryReportData[]>([]);
  const [topDispensedDrugs, setTopDispensedDrugs] = useState<TopDispensedDrug[]>([]);
  const [expiringDrugs, setExpiringDrugs] = useState<ExpiringDrug[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendData[]>([]);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalDispensedThisMonth: 0,
    expiringLots: 0,
    totalInventoryValue: 0,
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Load tất cả dữ liệu song song
      const [medicines, inventoryLots, stockLedgers, dispenseOrders, dispenseItems] = await Promise.all([
        inventoryController.getAllMedicines(),
        inventoryController.getAllInventoryLots(),
        inventoryController.getAllStockLedgers(),
        inventoryController.getAllDispenseOrders(),
        inventoryController.getAllDispenseItems(),
      ]);

      // Tính toán khoảng thời gian
      const now = new Date();
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // 1. Báo cáo Xuất - Nhập - Tồn
      const inventoryReport = calculateInventoryReport(medicines, inventoryLots, stockLedgers, startDate);
      setInventoryData(inventoryReport);

      // 2. Top thuốc cấp phát
      const topDispensed = calculateTopDispensedDrugs(medicines, dispenseItems, inventoryLots, startDate);
      setTopDispensedDrugs(topDispensed);

      // 3. Thuốc sắp hết hạn (trong 90 ngày)
      const expiring = calculateExpiringDrugs(inventoryLots);
      setExpiringDrugs(expiring);

      // 4. Xu hướng giá trị (6 tháng gần nhất)
      const trendData = calculateMonthlyTrend(inventoryLots, stockLedgers);
      setMonthlyTrendData(trendData);

      // 5. Tính toán stats
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthOrders = dispenseOrders.filter(
        order => new Date(order.createAt) >= currentMonthStart
      );

      const totalValue = inventoryLots.reduce((sum, lot) => {
        return sum + (lot.quantityOnHand * (lot.costPrice || 0));
      }, 0);

      setStats({
        totalMedicines: medicines.length,
        totalDispensedThisMonth: currentMonthOrders.length,
        expiringLots: expiring.length,
        totalInventoryValue: totalValue,
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const calculateInventoryReport = (
    medicines: MedicineDTO[],
    lots: InventoryLotDTO[],
    ledgers: StockLedgerDTO[],
    startDate: Date
  ): InventoryReportData[] => {
    const medicineMap = new Map(medicines.map(m => [m.id, m]));
    const reportMap = new Map<string, { nhap: number; xuat: number; ton: number }>();

    // Khởi tạo report cho mỗi thuốc
    medicines.forEach(med => {
      reportMap.set(med.id, { nhap: 0, xuat: 0, ton: 0 });
    });

    // Tính tồn kho hiện tại
    lots.forEach(lot => {
      const report = reportMap.get(lot.medicineId);
      if (report) {
        report.ton += lot.quantityOnHand;
      }
    });

    // Tính nhập và xuất từ stock ledgers trong khoảng thời gian
    ledgers.forEach(ledger => {
      if (!ledger.createAt) return;
      const ledgerDate = new Date(ledger.createAt);
      if (ledgerDate >= startDate) {
        // Tìm medicineId từ inventoryLotId
        const lot = lots.find(l => l.id === ledger.inventoryLotId);
        if (lot) {
          const report = reportMap.get(lot.medicineId);
          if (report) {
            if (ledger.type === 'IN') {
              report.nhap += ledger.quantity;
            } else if (ledger.type === 'OUT') {
              report.xuat += ledger.quantity;
            }
          }
        }
      }
    });

    // Chuyển đổi sang array và sắp xếp theo tổng nhập + xuất
    const result: InventoryReportData[] = Array.from(reportMap.entries())
      .map(([medicineId, data]) => {
        const medicine = medicineMap.get(medicineId);
        return {
          name: medicine?.name || 'Unknown',
          nhap: data.nhap,
          xuat: data.xuat,
          ton: data.ton,
        };
      })
      .filter(item => item.nhap > 0 || item.xuat > 0 || item.ton > 0)
      .sort((a, b) => (b.nhap + b.xuat) - (a.nhap + a.xuat))
      .slice(0, 5); // Top 5

    return result;
  };

  const calculateTopDispensedDrugs = (
    medicines: MedicineDTO[],
    items: DispenseItemDTO[],
    lots: InventoryLotDTO[],
    startDate: Date
  ): TopDispensedDrug[] => {
    const medicineMap = new Map(medicines.map(m => [m.id, m]));
    const lotToMedicineMap = new Map(lots.map(l => [l.id, l.medicineId]));
    const drugMap = new Map<string, { quantity: number; value: number }>();

    items.forEach(item => {
      const medicineId = lotToMedicineMap.get(item.inventoryLotId);
      if (medicineId) {
        const medicine = medicineMap.get(medicineId);
        if (medicine) {
          const existing = drugMap.get(medicineId) || { quantity: 0, value: 0 };
          existing.quantity += item.quantity;
          existing.value += item.priceAtDispense * item.quantity;
          drugMap.set(medicineId, existing);
        }
      }
    });

    return Array.from(drugMap.entries())
      .map(([medicineId, data]) => {
        const medicine = medicineMap.get(medicineId);
        return {
          name: medicine?.name || 'Unknown',
          quantity: data.quantity,
          value: data.value,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const calculateExpiringDrugs = (lots: InventoryLotDTO[]): ExpiringDrug[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);
    ninetyDaysFromNow.setHours(23, 59, 59, 999);

    return lots
      .filter(lot => {
        if (!lot.expireDate || lot.quantityOnHand === 0) return false;
        const expireDate = new Date(lot.expireDate);
        expireDate.setHours(23, 59, 59, 999);
        return expireDate >= today && expireDate <= ninetyDaysFromNow;
      })
      .map(lot => {
        const expireDate = new Date(lot.expireDate!);
        const daysLeft = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          name: lot.medicineName,
          batch: lot.lotNo,
          expiry: expireDate.toLocaleDateString('vi-VN'),
          quantity: lot.quantityOnHand,
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const calculateMonthlyTrend = (
    lots: InventoryLotDTO[],
    ledgers: StockLedgerDTO[]
  ): MonthlyTrendData[] => {
    const now = new Date();
    const months: MonthlyTrendData[] = [];

    // Tính toán cho 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthLedgers = ledgers.filter(ledger => {
        if (!ledger.createAt) return false;
        const ledgerDate = new Date(ledger.createAt);
        return ledgerDate >= monthDate && ledgerDate < nextMonthDate;
      });

      const nhap = monthLedgers
        .filter(l => l.type === 'IN')
        .reduce((sum, l) => sum + l.quantity, 0);

      const xuat = monthLedgers
        .filter(l => l.type === 'OUT')
        .reduce((sum, l) => sum + l.quantity, 0);

      // Tính giá trị tồn kho cuối tháng (sử dụng giá trị hiện tại của lots)
      const giatri = lots.reduce((sum, lot) => {
        return sum + (lot.quantityOnHand * (lot.costPrice || 0));
      }, 0);

      months.push({
        month: `T${monthDate.getMonth() + 1}`,
        nhap,
        xuat,
        giatri,
      });
    }

    return months;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="typo-h2 text-neutral-heading mb-2">
            Báo cáo dược
          </h1>
          <p className="text-base text-neutral-gray-500">
            Thống kê và phân tích dữ liệu kho thuốc
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-12 px-4 rounded-xl border border-neutral-gray-200 text-sm text-neutral-text bg-neutral-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-surface p-6 rounded-xl border border-neutral-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Package className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-heading mb-1">
            {stats.totalMedicines}
          </p>
          <p className="text-sm text-neutral-gray-600">
            Tổng loại thuốc
          </p>
        </div>

        <div className="bg-neutral-surface p-6 rounded-xl border border-neutral-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-heading mb-1">
            {stats.totalDispensedThisMonth}
          </p>
          <p className="text-sm text-neutral-gray-600">
            Đơn cấp phát (tháng này)
          </p>
        </div>

        <div className="bg-neutral-surface p-6 rounded-xl border border-neutral-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-heading mb-1">
            {stats.expiringLots}
          </p>
          <p className="text-sm text-neutral-gray-600">
            Lô sắp hết hạn
          </p>
        </div>

        <div className="bg-neutral-surface p-6 rounded-xl border border-neutral-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-heading mb-1">
            {formatCurrency(stats.totalInventoryValue)}
          </p>
          <p className="text-sm text-neutral-gray-600">
            Tổng giá trị tồn kho
          </p>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-gray-200 bg-neutral-surface rounded-t-xl px-2 pt-2">
        {[
          { id: 'inventory' as const, label: 'Báo cáo Xuất - Nhập - Tồn' },
          { id: 'dispensing' as const, label: 'Top thuốc cấp phát' },
          { id: 'expiring' as const, label: 'Thuốc sắp hết hạn' },
          { id: 'value' as const, label: 'Xu hướng giá trị' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${reportType === tab.id
              ? 'border-primary text-primary bg-neutral-muted'
              : 'border-transparent text-neutral-gray-500 hover:text-primary hover:bg-neutral-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
        {reportType === 'inventory' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Báo cáo Xuất - Nhập - Tồn (Top 5 thuốc)
            </h2>
            {inventoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nhap" fill="#3fb5ff" name="Nhập" />
                  <Bar dataKey="xuat" fill="#ffc107" name="Xuất" />
                  <Bar dataKey="ton" fill="#28a745" name="Tồn" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-neutral-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}

        {reportType === 'dispensing' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Top 5 thuốc cấp phát nhiều nhất
            </h2>
            {topDispensedDrugs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-gray-200 bg-neutral-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-neutral-heading">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-neutral-heading">
                        Tên thuốc
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                        Số lượng cấp phát
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-neutral-heading">
                        Giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-gray-100">
                    {topDispensedDrugs.map((drug, index) => (
                      <tr
                        key={index}
                        className="hover:bg-neutral-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-bold text-primary">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-text font-medium">
                          {drug.name}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-neutral-heading">
                          {drug.quantity} viên
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-emerald-600">
                          {formatCurrency(drug.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}

        {reportType === 'expiring' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Danh sách thuốc sắp hết hạn (trong 90 ngày tới)
            </h2>
            {expiringDrugs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-gray-200 bg-neutral-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-neutral-heading">
                        Tên thuốc
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                        Số lô
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                        HSD
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                        Còn lại
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-gray-100">
                    {expiringDrugs.map((drug, index) => (
                      <tr
                        key={index}
                        className={`${drug.daysLeft < 30 ? 'bg-red-50' : 'bg-amber-50'
                          }`}
                      >
                        <td className="px-4 py-4 text-sm text-neutral-text font-medium">
                          {drug.name}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-primary">
                          {drug.batch}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-neutral-text">
                          {drug.expiry}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-neutral-heading">
                          {drug.quantity} viên
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`text-sm font-bold ${drug.daysLeft < 30 ? 'text-red-600' : 'text-amber-600'
                              }`}
                          >
                            {drug.daysLeft} ngày
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-gray-500">
                Không có thuốc sắp hết hạn
              </div>
            )}
          </div>
        )}

        {reportType === 'value' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Xu hướng giá trị tồn kho (6 tháng gần nhất)
            </h2>
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="giatri" stroke="#3fb5ff" strokeWidth={3} name="Giá trị tồn kho" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-neutral-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
