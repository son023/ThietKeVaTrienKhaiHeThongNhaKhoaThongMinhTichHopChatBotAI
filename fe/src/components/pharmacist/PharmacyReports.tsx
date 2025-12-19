import { useState } from 'react';
import { Download, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function PharmacyReports() {
  const [reportType, setReportType] = useState<'inventory' | 'dispensing' | 'expiring' | 'value'>('inventory');
  const [dateRange, setDateRange] = useState('30days');

  // Mock data for charts
  const inventoryData = [
    { name: 'Paracetamol', nhap: 200, xuat: 150, ton: 150 },
    { name: 'Amoxicillin', nhap: 100, xuat: 92, ton: 8 },
    { name: 'Ibuprofen', nhap: 80, xuat: 68, ton: 12 },
    { name: 'Vitamin C', nhap: 120, xuat: 40, ton: 80 },
    { name: 'Aspirin', nhap: 150, xuat: 120, ton: 30 },
  ];

  const topDispensedDrugs = [
    { name: 'Paracetamol 500mg', quantity: 450, value: 4500000 },
    { name: 'Amoxicillin 500mg', quantity: 380, value: 7600000 },
    { name: 'Ibuprofen 400mg', quantity: 320, value: 6400000 },
    { name: 'Vitamin C 1000mg', quantity: 280, value: 2800000 },
    { name: 'Aspirin 100mg', quantity: 250, value: 2500000 },
  ];

  const expiringDrugs = [
    { name: 'Vitamin C 1000mg', batch: 'L001', expiry: '15/01/2025', quantity: 80, daysLeft: 25 },
    { name: 'Calcium 600mg', batch: 'L002', expiry: '20/02/2025', quantity: 50, daysLeft: 60 },
    { name: 'Omega-3 1000mg', batch: 'L003', expiry: '10/03/2025', quantity: 40, daysLeft: 78 },
  ];

  const monthlyTrendData = [
    { month: 'T5', nhap: 4000, xuat: 2400, giatri: 65000000 },
    { month: 'T6', nhap: 3000, xuat: 1398, giatri: 52000000 },
    { month: 'T7', nhap: 2000, xuat: 9800, giatri: 78000000 },
    { month: 'T8', nhap: 2780, xuat: 3908, giatri: 85000000 },
    { month: 'T9', nhap: 1890, xuat: 4800, giatri: 92000000 },
    { month: 'T10', nhap: 2390, xuat: 3800, giatri: 88000000 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

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
            <option value="custom">Tùy chỉnh</option>
          </select>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
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
            120
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
            1,245
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
            5
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
            450M
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
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${
              reportType === tab.id
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
          </div>
        )}

        {reportType === 'dispensing' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Top 5 thuốc cấp phát nhiều nhất
            </h2>
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
          </div>
        )}

        {reportType === 'expiring' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Danh sách thuốc sắp hết hạn (trong 90 ngày tới)
            </h2>
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
                      className={`${
                        drug.daysLeft < 30 ? 'bg-red-50' : 'bg-amber-50'
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
                          className={`text-sm font-bold ${
                            drug.daysLeft < 30 ? 'text-red-600' : 'text-amber-600'
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
          </div>
        )}

        {reportType === 'value' && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-heading mb-6">
              Xu hướng giá trị tồn kho (6 tháng gần nhất)
            </h2>
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
          </div>
        )}
      </div>
    </div>
  );
}
