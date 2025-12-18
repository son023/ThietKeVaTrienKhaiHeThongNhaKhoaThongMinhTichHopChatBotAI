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
    <div className="p-6 space-y-6">
      {/* DoctorHeader */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Báo cáo dược
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Thống kê và phân tích dữ liệu kho thuốc
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-[44px] px-4 rounded-lg border border-[#3295d0] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 text-[#3fb5ff]" />
          </div>
          <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e] mb-1">
            120
          </p>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Tổng loại thuốc
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-[#28a745]" />
          </div>
          <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e] mb-1">
            1,245
          </p>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Đơn cấp phát (tháng này)
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-[#ffc107]" />
          </div>
          <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e] mb-1">
            5
          </p>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Lô sắp hết hạn
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-[#3fb5ff]" />
          </div>
          <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e] mb-1">
            450M
          </p>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Tổng giá trị tồn kho
          </p>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        {[
          { id: 'inventory' as const, label: 'Báo cáo Xuất - Nhập - Tồn' },
          { id: 'dispensing' as const, label: 'Top thuốc cấp phát' },
          { id: 'expiring' as const, label: 'Thuốc sắp hết hạn' },
          { id: 'value' as const, label: 'Xu hướng giá trị' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${
              reportType === tab.id
                ? 'border-[#3fb5ff] text-[#3fb5ff]'
                : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
        {reportType === 'inventory' && (
          <div className="p-6">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e] mb-6">
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
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e] mb-6">
              Top 5 thuốc cấp phát nhiều nhất
            </h2>
            <table className="w-full">
              <thead className="border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-4 py-3 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Tên thuốc
                  </th>
                  <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Số lượng cấp phát
                  </th>
                  <th className="px-4 py-3 text-right font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Giá trị
                  </th>
                </tr>
              </thead>
              <tbody>
                {topDispensedDrugs.map((drug, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                  >
                    <td className="px-4 py-4 font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#3fb5ff]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {drug.name}
                    </td>
                    <td className="px-4 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      {drug.quantity} viên
                    </td>
                    <td className="px-4 py-4 text-right font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#28a745]">
                      {formatCurrency(drug.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'expiring' && (
          <div className="p-6">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e] mb-6">
              Danh sách thuốc sắp hết hạn (trong 90 ngày tới)
            </h2>
            <table className="w-full">
              <thead className="border-b border-[#e5e7eb]">
                <tr>
                  <th className="px-4 py-3 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Tên thuốc
                  </th>
                  <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Số lô
                  </th>
                  <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    HSD
                  </th>
                  <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    Còn lại
                  </th>
                </tr>
              </thead>
              <tbody>
                {expiringDrugs.map((drug, index) => (
                  <tr
                    key={index}
                    className={`border-b border-[#e5e7eb] ${
                      drug.daysLeft < 30 ? 'bg-[#f8d7da]' : 'bg-[#fff3cd]'
                    }`}
                  >
                    <td className="px-4 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {drug.name}
                    </td>
                    <td className="px-4 py-4 text-center font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                      {drug.batch}
                    </td>
                    <td className="px-4 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {drug.expiry}
                    </td>
                    <td className="px-4 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      {drug.quantity} viên
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] ${
                          drug.daysLeft < 30 ? 'text-[#dc3545]' : 'text-[#ffc107]'
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
        )}

        {reportType === 'value' && (
          <div className="p-6">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e] mb-6">
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
