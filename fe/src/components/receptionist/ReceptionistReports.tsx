import { Card } from '../ui/card';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

export function ReceptionistReports() {
  const stats = {
    cashRevenue: 12500000,
    cardRevenue: 8300000,
    totalRevenue: 20800000,
    newPatients: 12,
  };

  const recentTransactions = [
    {
      id: '1',
      time: '15:45',
      patient: 'Nguyễn Văn A',
      service: 'Trám răng Composite',
      amount: 800000,
      method: 'cash',
      status: 'completed',
    },
    {
      id: '2',
      time: '14:30',
      patient: 'Trần Thị B',
      service: 'Tẩy trắng răng',
      amount: 1500000,
      method: 'card',
      status: 'completed',
    },
    {
      id: '3',
      time: '11:20',
      patient: 'Lê Văn C',
      service: 'Cạo vôi răng',
      amount: 300000,
      method: 'cash',
      status: 'completed',
    },
    {
      id: '4',
      time: '10:15',
      patient: 'Phạm Thị D',
      service: 'Nhổ răng khôn',
      amount: 2000000,
      method: 'transfer',
      status: 'completed',
    },
    {
      id: '5',
      time: '09:30',
      patient: 'Hoàng Văn E',
      service: 'Khám tổng quát',
      amount: 500000,
      method: 'cash',
      status: 'completed',
    },
  ];

  const paymentMethodMap: Record<string, string> = {
    cash: 'Tiền mặt',
    card: 'Thẻ',
    transfer: 'Chuyển khoản',
  };

  return (
    <div className="p-8 space-y-6">
      {/* DoctorHeader */}
      <div>
        <h1 className="text-2xl text-[#01304e] mb-1">Báo cáo Doanh thu</h1>
        <p className="text-gray-600">Thứ Ba, 28 tháng 10, 2025</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiền mặt</p>
              <h3 className="text-2xl text-[#01304e]">
                {stats.cashRevenue.toLocaleString('vi-VN')}đ
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>+12% so với hôm qua</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Thẻ/CK</p>
              <h3 className="text-2xl text-[#01304e]">
                {stats.cardRevenue.toLocaleString('vi-VN')}đ
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <TrendingUp className="w-3 h-3" />
            <span>+8% so với hôm qua</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Doanh thu</p>
              <h3 className="text-2xl text-[#3FB5FF]">
                {stats.totalRevenue.toLocaleString('vi-VN')}đ
              </h3>
            </div>
            <div className="w-12 h-12 bg-[#3FB5FF]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#3FB5FF]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#3FB5FF]">
            <TrendingUp className="w-3 h-3" />
            <span>+10% so với hôm qua</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bệnh nhân mới</p>
              <h3 className="text-2xl text-[#01304e]">
                {stats.newPatients}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <TrendingUp className="w-3 h-3" />
            <span>+20% so với hôm qua</span>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg text-[#01304e] mb-4">Phân bổ theo phương thức</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Tiền mặt</span>
              </div>
              <span className="text-sm text-[#01304e]">
                {((stats.cashRevenue / stats.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(stats.cashRevenue / stats.totalRevenue) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-700">Thẻ/Chuyển khoản</span>
              </div>
              <span className="text-sm text-[#01304e]">
                {((stats.cardRevenue / stats.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(stats.cardRevenue / stats.totalRevenue) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg text-[#01304e] mb-4">Tổng quan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Tổng số giao dịch</span>
              <span className="text-[#01304e]">{recentTransactions.length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Giá trị trung bình</span>
              <span className="text-[#01304e]">
                {(stats.totalRevenue / recentTransactions.length).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Số bệnh nhân khám</span>
              <span className="text-[#01304e]">{recentTransactions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tỷ lệ hoàn tất</span>
              <Badge className="bg-green-600">100%</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg text-[#01304e] mb-4">Các giao dịch gần nhất</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Giờ</TableHead>
              <TableHead>Bệnh nhân</TableHead>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-sm">{transaction.time}</TableCell>
                <TableCell className="text-sm">{transaction.patient}</TableCell>
                <TableCell className="text-sm">{transaction.service}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {paymentMethodMap[transaction.method]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-[#01304e]">
                  {transaction.amount.toLocaleString('vi-VN')}đ
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600">
                    Hoàn tất
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
