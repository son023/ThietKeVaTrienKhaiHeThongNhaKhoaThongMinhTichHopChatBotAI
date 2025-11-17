import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, DollarSign, FileText, Calendar, User, Filter } from 'lucide-react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Invoice {
  id: string;
  code: string;
  patientName: string;
  patientCode: string;
  date: string;
  doctor: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'partial' | 'cancelled';
  paymentMethod?: string;
}

interface ReceptionistInvoiceListProps {
  onViewInvoice: (invoiceId: string) => void;
  onCreateInvoice: () => void;
}

export function ReceptionistInvoiceList({ onViewInvoice, onCreateInvoice }: ReceptionistInvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const invoices: Invoice[] = [
    {
      id: '1',
      code: 'HD0123',
      patientName: 'Nguyễn Văn A',
      patientCode: 'BN001',
      date: '28/10/2025 09:30',
      doctor: 'BS. Phạm Mai',
      amount: 800000,
      status: 'unpaid',
    },
    {
      id: '2',
      code: 'HD0124',
      patientName: 'Trần Thị B',
      patientCode: 'BN002',
      date: '28/10/2025 10:00',
      doctor: 'BS. Lê Anh',
      amount: 1500000,
      status: 'paid',
      paymentMethod: 'Tiền mặt',
    },
    {
      id: '3',
      code: 'HD0125',
      patientName: 'Lê Văn C',
      patientCode: 'BN003',
      date: '28/10/2025 14:00',
      doctor: 'BS. Phạm Mai',
      amount: 2500000,
      status: 'unpaid',
    },
    {
      id: '4',
      code: 'HD0122',
      patientName: 'Phạm Thị D',
      patientCode: 'BN004',
      date: '27/10/2025 15:30',
      doctor: 'BS. Lê Anh',
      amount: 500000,
      status: 'paid',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: '5',
      code: 'HD0121',
      patientName: 'Hoàng Văn E',
      patientCode: 'BN005',
      date: '27/10/2025 11:00',
      doctor: 'BS. Phạm Mai',
      amount: 1200000,
      status: 'partial',
      paymentMethod: 'Tiền mặt',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Chưa thanh toán</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đã thanh toán</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Thanh toán 1 phần</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Đã hủy</Badge>;
      default:
        return null;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const unpaidInvoices = filteredInvoices.filter(inv => inv.status === 'unpaid');
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
  const partialInvoices = filteredInvoices.filter(inv => inv.status === 'partial');

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* DoctorHeader */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#01304e] mb-2">Thanh toán & Hóa đơn</h1>
          <p className="text-gray-600">Quản lý hóa đơn và thanh toán</p>
        </div>
        <Button
          onClick={onCreateInvoice}
          className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Hóa đơn mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Chờ thanh toán</span>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl text-[#01304e] mb-1">{unpaidInvoices.length}</p>
          <p className="text-xs text-gray-500">{totalUnpaid.toLocaleString('vi-VN')}đ</p>
        </Card>

        <Card className="p-4 border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đã thanh toán</span>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl text-[#01304e] mb-1">{paidInvoices.length}</p>
          <p className="text-xs text-gray-500">{totalPaid.toLocaleString('vi-VN')}đ</p>
        </Card>

        <Card className="p-4 border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Thanh toán 1 phần</span>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl text-[#01304e] mb-1">{partialInvoices.length}</p>
          <p className="text-xs text-gray-500">Cần hoàn tất</p>
        </Card>

        <Card className="p-4 border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng doanh thu hôm nay</span>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl text-[#3FB5FF]">{totalPaid.toLocaleString('vi-VN')}đ</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-[#e8e8e8]">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo mã hóa đơn, tên bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-[10px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] rounded-[10px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="partial">Thanh toán 1 phần</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px] rounded-[10px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Invoice List with Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({filteredInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="unpaid">
            Chờ thanh toán ({unpaidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Đã thanh toán ({paidInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-[#e8e8e8]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>PT Thanh toán</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-mono">{invoice.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-[#01304e]">{invoice.patientName}</p>
                        <p className="text-xs text-gray-500">{invoice.patientCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{invoice.date}</TableCell>
                    <TableCell className="text-sm">{invoice.doctor}</TableCell>
                    <TableCell className="text-right text-[#01304e]">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-sm">
                      {invoice.paymentMethod || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === 'unpaid' && (
                          <Button
                            size="sm"
                            className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90"
                            onClick={() => onViewInvoice(invoice.id)}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Thanh toán
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewInvoice(invoice.id)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không tìm thấy hóa đơn</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="unpaid">
          <Card className="border-[#e8e8e8]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-mono">{invoice.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-[#01304e]">{invoice.patientName}</p>
                        <p className="text-xs text-gray-500">{invoice.patientCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{invoice.date}</TableCell>
                    <TableCell className="text-sm">{invoice.doctor}</TableCell>
                    <TableCell className="text-right text-red-600">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90"
                        onClick={() => onViewInvoice(invoice.id)}
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Thanh toán ngay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {unpaidInvoices.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có hóa đơn chờ thanh toán</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card className="border-[#e8e8e8]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>PT Thanh toán</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-mono">{invoice.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-[#01304e]">{invoice.patientName}</p>
                        <p className="text-xs text-gray-500">{invoice.patientCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{invoice.date}</TableCell>
                    <TableCell className="text-sm">{invoice.doctor}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell className="text-sm">
                      {invoice.paymentMethod || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewInvoice(invoice.id)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paidInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có hóa đơn đã thanh toán</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
