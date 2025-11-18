import { useState } from 'react';
import { DollarSign, FileText, AlertCircle, CheckCircle, Printer, Download } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  services?: { name: string; quantity: number; price: number }[];
  notes?: string;
}

export function AdminFinance() {
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isOverdueDialogOpen, setIsOverdueDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [actionNote, setActionNote] = useState('');

  const invoices: Invoice[] = [
    {
      id: 'HD001',
      patientName: 'Nguyễn Văn An',
      date: '25/10/2025',
      amount: 1500000,
      status: 'paid',
      method: 'Tiền mặt',
      services: [
        { name: 'Lấy cao răng', quantity: 1, price: 500000 },
        { name: 'Tẩy trắng răng', quantity: 1, price: 1000000 },
      ],
      notes: 'Đã thanh toán đầy đủ',
    },
    {
      id: 'HD002',
      patientName: 'Trần Thị Bình',
      date: '24/10/2025',
      amount: 2800000,
      status: 'pending',
      method: '',
      services: [
        { name: 'Trám răng composite', quantity: 2, price: 800000 },
        { name: 'Nhổ răng khôn', quantity: 1, price: 1200000 },
      ],
      notes: 'Chờ bệnh nhân thanh toán',
    },
    {
      id: 'HD003',
      patientName: 'Lê Văn Cường',
      date: '20/10/2025',
      amount: 8500000,
      status: 'overdue',
      method: '',
      services: [
        { name: 'Cấy ghép Implant', quantity: 1, price: 8500000 },
      ],
      notes: 'Quá hạn 7 ngày - Cần liên hệ khẩn',
    },
    {
      id: 'HD004',
      patientName: 'Phạm Thị Dung',
      date: '23/10/2025',
      amount: 500000,
      status: 'paid',
      method: 'Chuyển khoản',
      services: [{ name: 'Khám tổng quát', quantity: 1, price: 500000 }],
      notes: 'Đã thanh toán qua chuyển khoản',
    },
    {
      id: 'HD005',
      patientName: 'Hoàng Văn Em',
      date: '22/10/2025',
      amount: 3200000,
      status: 'pending',
      method: '',
      services: [{ name: 'Niềng răng (đợt 1)', quantity: 1, price: 3200000 }],
      notes: 'Chờ thanh toán đợt đầu',
    },
    {
      id: 'HD006',
      patientName: 'Võ Thị Phương',
      date: '19/10/2025',
      amount: 1800000,
      status: 'overdue',
      method: '',
      services: [{ name: 'Bọc răng sứ', quantity: 2, price: 900000 }],
      notes: 'Quá hạn 8 ngày',
    },
    {
      id: 'HD007',
      patientName: 'Đặng Văn Giang',
      date: '26/10/2025',
      amount: 750000,
      status: 'paid',
      method: 'Tiền mặt',
      services: [{ name: 'Chữa tủy răng', quantity: 1, price: 750000 }],
      notes: 'Thanh toán bằng tiền mặt',
    },
    {
      id: 'HD008',
      patientName: 'Lý Thị Hà',
      date: '21/10/2025',
      amount: 4500000,
      status: 'pending',
      method: '',
      services: [{ name: 'Làm cầu răng', quantity: 1, price: 4500000 }],
      notes: 'Đã hoàn thành, chờ thanh toán',
    },
    {
      id: 'HD009',
      patientName: 'Trương Văn Khoa',
      date: '18/10/2025',
      amount: 2100000,
      status: 'overdue',
      method: '',
      services: [{ name: 'Trám răng', quantity: 3, price: 700000 }],
      notes: 'Quá hạn 9 ngày - Đã nhắc nhở lần 2',
    },
  ];

  // Filter invoices based on current tab
  const getFilteredInvoices = () => {
    switch (currentTab) {
      case 'pending':
        return invoices.filter(inv => inv.status === 'pending');
      case 'paid':
        return invoices.filter(inv => inv.status === 'paid');
      case 'overdue':
        return invoices.filter(inv => inv.status === 'overdue');
      default:
        return invoices;
    }
  };

  const filteredInvoices = getFilteredInvoices();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Chờ thanh toán</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Quá hạn</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailDialogOpen(true);
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod('');
    setIsPaymentDialogOpen(true);
  };

  const handleOverdue = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActionNote('');
    setIsOverdueDialogOpen(true);
  };

  const confirmPayment = () => {
    if (selectedInvoice && paymentMethod) {
      alert(`Đã xác nhận thanh toán hóa đơn ${selectedInvoice.id} bằng ${paymentMethod}`);
      setIsPaymentDialogOpen(false);
      setPaymentMethod('');
    }
  };

  const handleOverdueAction = () => {
    if (selectedInvoice) {
      alert(`Đã ghi nhận hành động xử lý cho hóa đơn ${selectedInvoice.id}`);
      setIsOverdueDialogOpen(false);
      setActionNote('');
    }
  };

  const handlePrint = () => {
    alert('Chức năng in hóa đơn đang được phát triển');
  };

  const handleExport = () => {
    alert('Chức năng xuất PDF đang được phát triển');
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-1">Quản lý Tài chính</h1>
        <p className="text-sm text-[#333333]/60">Quản lý hóa đơn và thanh toán</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Doanh thu hôm nay</p>
                <p className="text-[#01304e]">12,500,000 ₫</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] cursor-pointer transition-all ${
            currentTab === 'pending' ? 'ring-2 ring-yellow-400' : ''
          }`}
          onClick={() => setCurrentTab('pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Chờ thanh toán</p>
                <p className="text-[#01304e]">{invoices.filter(i => i.status === 'pending').length} hóa đơn</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] cursor-pointer transition-all ${
            currentTab === 'overdue' ? 'ring-2 ring-red-400' : ''
          }`}
          onClick={() => setCurrentTab('overdue')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Quá hạn</p>
                <p className="text-[#01304e]">{invoices.filter(i => i.status === 'overdue').length} hóa đơn</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] cursor-pointer transition-all ${
            currentTab === 'paid' ? 'ring-2 ring-[#3FB5FF]' : ''
          }`}
          onClick={() => setCurrentTab('paid')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Đã thanh toán</p>
                <p className="text-[#01304e]">{invoices.filter(i => i.status === 'paid').length} hóa đơn</p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Chờ thanh toán ({invoices.filter(i => i.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Đã thanh toán ({invoices.filter(i => i.status === 'paid').length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Quá hạn ({invoices.filter(i => i.status === 'overdue').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardContent className="p-0">
              {filteredInvoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Bệnh nhân</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-[#333333]">{invoice.id}</TableCell>
                        <TableCell className="text-[#333333]">{invoice.patientName}</TableCell>
                        <TableCell className="text-[#333333]/60">{invoice.date}</TableCell>
                        <TableCell className="text-[#333333]">
                          {invoice.amount.toLocaleString('vi-VN')} ₫
                        </TableCell>
                        <TableCell>
                          {invoice.method || <span className="text-[#333333]/40">—</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-[10px]"
                            onClick={() => handleViewDetail(invoice)}
                          >
                            Chi tiết
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
                              onClick={() => handlePayment(invoice)}
                            >
                              Thanh toán
                            </Button>
                          )}
                          {invoice.status === 'overdue' && (
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700 rounded-[10px] text-white"
                              onClick={() => handleOverdue(invoice)}
                            >
                              Xử lý
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-[#333333]/60">
                  Không có hóa đơn nào
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Chi tiết hóa đơn</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về hóa đơn {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* DoctorHeader Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Mã hóa đơn</p>
                  <p className="text-[#333333]">{selectedInvoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Trạng thái</p>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Bệnh nhân</p>
                  <p className="text-[#333333]">{selectedInvoice.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Ngày</p>
                  <p className="text-[#333333]">{selectedInvoice.date}</p>
                </div>
                {selectedInvoice.method && (
                  <div>
                    <p className="text-sm text-[#333333]/60 mb-1">Phương thức thanh toán</p>
                    <p className="text-[#333333]">{selectedInvoice.method}</p>
                  </div>
                )}
              </div>

              {/* Services List */}
              <div>
                <h3 className="text-[#01304e] mb-3">Dịch vụ đã sử dụng</h3>
                <div className="border border-[#e8e8e8] rounded-[10px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.services?.map((service, index) => (
                        <TableRow key={index}>
                          <TableCell>{service.name}</TableCell>
                          <TableCell className="text-center">{service.quantity}</TableCell>
                          <TableCell className="text-right">
                            {service.price.toLocaleString('vi-VN')} ₫
                          </TableCell>
                          <TableCell className="text-right">
                            {(service.quantity * service.price).toLocaleString('vi-VN')} ₫
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-[#e8e8e8] pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-[#333333]">Tổng cộng</p>
                  <p className="text-[#01304e]">{selectedInvoice.amount.toLocaleString('vi-VN')} ₫</p>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="p-4 bg-gray-50 rounded-[10px]">
                  <p className="text-sm text-[#333333]/60 mb-1">Ghi chú</p>
                  <p className="text-[#333333]">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="rounded-[10px]" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>
                <Button variant="outline" className="rounded-[10px]" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Xuất PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Nhập thông tin thanh toán cho hóa đơn {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Info */}
              <div className="p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#333333]/60">Bệnh nhân</span>
                  <span className="text-[#333333]">{selectedInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#333333]/60">Số tiền</span>
                  <span className="text-[#01304e]">
                    {selectedInvoice.amount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Phương thức thanh toán *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method" className="rounded-[10px]">
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                    <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                    <SelectItem value="Thẻ">Thẻ tín dụng/ghi nợ</SelectItem>
                    <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline" 
                  className="rounded-[10px]"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
                  onClick={confirmPayment}
                  disabled={!paymentMethod}
                >
                  Xác nhận thanh toán
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Overdue Action Dialog */}
      <Dialog open={isOverdueDialogOpen} onOpenChange={setIsOverdueDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Xử lý hóa đơn quá hạn</DialogTitle>
            <DialogDescription>
              Ghi nhận hành động xử lý cho hóa đơn {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Info */}
              <div className="p-4 bg-red-50 rounded-[10px] border border-red-200">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-900">Hóa đơn quá hạn</p>
                    <p className="text-sm text-red-600">{selectedInvoice.notes}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#333333]/60">Bệnh nhân</span>
                    <span className="text-[#333333]">{selectedInvoice.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#333333]/60">Số tiền</span>
                    <span className="text-red-600">
                      {selectedInvoice.amount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#333333]/60">Ngày hóa đơn</span>
                    <span className="text-[#333333]">{selectedInvoice.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Selection */}
              <div className="space-y-2">
                <Label htmlFor="action-note">Hành động xử lý *</Label>
                <Select value={actionNote} onValueChange={setActionNote}>
                  <SelectTrigger id="action-note" className="rounded-[10px]">
                    <SelectValue placeholder="Chọn hành động" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đã liên hệ qua điện thoại">Đã liên hệ qua điện thoại</SelectItem>
                    <SelectItem value="Đã gửi email nhắc nhở">Đã gửi email nhắc nhở</SelectItem>
                    <SelectItem value="Đã gửi thông báo">Đã gửi thông báo</SelectItem>
                    <SelectItem value="Bệnh nhân hẹn thanh toán">Bệnh nhân hẹn thanh toán</SelectItem>
                    <SelectItem value="Chuyển xử lý pháp lý">Chuyển xử lý pháp lý</SelectItem>
                    <SelectItem value="Xóa nợ">Xóa nợ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="additional-notes">Ghi chú thêm (tùy chọn)</Label>
                <Textarea 
                  id="additional-notes"
                  placeholder="Nhập ghi chú chi tiết về hành động xử lý..."
                  className="rounded-[10px] min-h-[100px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline" 
                  className="rounded-[10px]"
                  onClick={() => setIsOverdueDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 rounded-[10px] text-white"
                  onClick={handleOverdueAction}
                  disabled={!actionNote}
                >
                  Lưu hành động
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
