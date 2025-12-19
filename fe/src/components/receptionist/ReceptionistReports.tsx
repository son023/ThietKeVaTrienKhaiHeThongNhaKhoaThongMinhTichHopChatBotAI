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
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">Báo cáo Doanh thu</h1>
        <p className="text-neutral-text/70 font-medium">Thứ Ba, 28 tháng 10, 2025</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">Tiền mặt</p>
              <h3 className="text-2xl font-bold text-neutral-text">
                {stats.cashRevenue.toLocaleString('vi-VN')}đ
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
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">Thẻ/CK</p>
              <h3 className="text-2xl font-bold text-neutral-text">
                {stats.cardRevenue.toLocaleString('vi-VN')}đ
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
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">Tổng Doanh thu</p>
              <h3 className="text-2xl font-bold text-primary">
                {stats.totalRevenue.toLocaleString('vi-VN')}đ
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
              <p className="text-sm text-neutral-text/70 mb-2 font-medium">Bệnh nhân mới</p>
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
          <h3 className="text-lg font-semibold text-neutral-text mb-5">Phân bổ theo phương thức</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-neutral-text">Tiền mặt</span>
              </div>
              <span className="text-sm font-semibold text-neutral-text">
                {((stats.cashRevenue / stats.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-tint rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(stats.cashRevenue / stats.totalRevenue) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-sm text-neutral-text">Thẻ/Chuyển khoản</span>
              </div>
              <span className="text-sm font-semibold text-neutral-text">
                {((stats.cardRevenue / stats.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-tint rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(stats.cardRevenue / stats.totalRevenue) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-text mb-5">Tổng quan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-border">
              <span className="text-sm text-neutral-text/70 font-medium">Tổng số giao dịch</span>
              <span className="text-neutral-text font-semibold">{recentTransactions.length}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-border">
              <span className="text-sm text-neutral-text/70 font-medium">Giá trị trung bình</span>
              <span className="text-neutral-text font-semibold">
                {(stats.totalRevenue / recentTransactions.length).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-border">
              <span className="text-sm text-neutral-text/70 font-medium">Số bệnh nhân khám</span>
              <span className="text-neutral-text font-semibold">{recentTransactions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-text/70 font-medium">Tỷ lệ hoàn tất</span>
              <Badge className="bg-green-600 hover:bg-green-700">100%</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-text mb-5">Các giao dịch gần nhất</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-muted/30">
              <TableHead className="font-semibold text-neutral-text">Giờ</TableHead>
              <TableHead className="font-semibold text-neutral-text">Bệnh nhân</TableHead>
              <TableHead className="font-semibold text-neutral-text">Dịch vụ</TableHead>
              <TableHead className="font-semibold text-neutral-text">Phương thức</TableHead>
              <TableHead className="text-right font-semibold text-neutral-text">Số tiền</TableHead>
              <TableHead className="font-semibold text-neutral-text">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">
                <TableCell className="text-sm text-neutral-text">{transaction.time}</TableCell>
                <TableCell className="text-sm text-neutral-text">{transaction.patient}</TableCell>
                <TableCell className="text-sm text-neutral-text">{transaction.service}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs border-neutral-border bg-neutral-muted">
                    {paymentMethodMap[transaction.method]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-neutral-text">
                  {transaction.amount.toLocaleString('vi-VN')}đ
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 hover:bg-green-700">
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
