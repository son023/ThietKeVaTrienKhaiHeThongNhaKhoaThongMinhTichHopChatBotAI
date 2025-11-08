import { useState } from 'react';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

export function PatientPayment() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - Pending Invoices
  const pendingInvoices = [
    {
      id: 'HD001234',
      date: '01/11/2024',
      service: 'Khám tổng quát + Cạo vôi',
      doctor: 'BS. Nguyễn Văn A',
      amount: 2500000,
      dueDate: '30/11/2024',
      status: 'pending',
      items: [
        { name: 'Khám tổng quát', quantity: 1, price: 200000 },
        { name: 'Cạo vôi răng', quantity: 1, price: 500000 },
        { name: 'Đánh bóng răng', quantity: 1, price: 300000 },
        { name: 'Chụp X-quang', quantity: 2, price: 1500000 }
      ]
    },
    {
      id: 'HD001235',
      date: '05/11/2024',
      service: 'Tái khám niềng răng (Đợt 2)',
      doctor: 'BS. Trần Thị B',
      amount: 5000000,
      dueDate: '20/11/2024',
      status: 'pending',
      items: [
        { name: 'Tái khám niềng răng', quantity: 1, price: 1000000 },
        { name: 'Thay khay invisalign mới', quantity: 1, price: 4000000 }
      ]
    }
  ];

  // Mock data - Paid Invoices
  const paidInvoices = [
    {
      id: 'HD001233',
      date: '15/10/2024',
      service: 'Tẩy trắng răng',
      doctor: 'BS. Phạm Thị D',
      amount: 3500000,
      paidDate: '16/10/2024',
      paymentMethod: 'Chuyển khoản',
      status: 'paid'
    },
    {
      id: 'HD001232',
      date: '01/10/2024',
      service: 'Cạo vôi răng',
      doctor: 'BS. Lê Văn C',
      amount: 500000,
      paidDate: '01/10/2024',
      paymentMethod: 'Tiền mặt',
      status: 'paid'
    },
    {
      id: 'HD001231',
      date: '15/09/2024',
      service: 'Khám định kỳ + Chụp X-quang',
      doctor: 'BS. Nguyễn Văn A',
      amount: 300000,
      paidDate: '15/09/2024',
      paymentMethod: 'Tiền mặt',
      status: 'paid'
    },
    {
      id: 'HD001230',
      date: '01/09/2024',
      service: 'Điều trị tủy răng (Đợt 3)',
      doctor: 'BS. Nguyễn Văn A',
      amount: 2500000,
      paidDate: '02/09/2024',
      paymentMethod: 'Chuyển khoản',
      status: 'paid'
    },
    {
      id: 'HD001229',
      date: '15/08/2024',
      service: 'Niềng răng (Đợt 1)',
      doctor: 'BS. Trần Thị B',
      amount: 20000000,
      paidDate: '16/08/2024',
      paymentMethod: 'Chuyển khoản',
      status: 'paid'
    }
  ];

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Đang tải xuống hóa đơn ${invoiceId}...`);
  };

  const handleConfirmPayment = () => {
    toast.success('Thanh toán thành công!');
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
  };

  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="w-full bg-[#fcfeff] py-[40px] px-[20px] md:px-[80px]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] md:text-[32px] mb-[8px]">
            Thanh toán & Hóa đơn
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
            Quản lý các hóa đơn và thanh toán của bạn
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[32px]">
          <Card className="p-[24px] border-[#ffc107] bg-gradient-to-br from-[#fffbf0] to-white">
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-[#ffc107] rounded-[12px] flex items-center justify-center">
                <Clock className="w-[24px] h-[24px] text-white" />
              </div>
              <span className="px-[12px] py-[6px] bg-[#fff3e0] text-[#ff9800] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]">
                {pendingInvoices.length} hóa đơn
              </span>
            </div>
            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
              Chờ thanh toán
            </p>
            <p className="font-['Fz_Poppins:Bold',sans-serif] text-[#ff9800] text-[32px]">
              {totalPending.toLocaleString('vi-VN')}đ
            </p>
          </Card>

          <Card className="p-[24px] border-[#4caf50] bg-gradient-to-br from-[#f1f8f4] to-white">
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-[#4caf50] rounded-[12px] flex items-center justify-center">
                <CheckCircle className="w-[24px] h-[24px] text-white" />
              </div>
              <span className="px-[12px] py-[6px] bg-[#e8f5e9] text-[#4caf50] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]">
                {paidInvoices.length} hóa đơn
              </span>
            </div>
            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
              Đã thanh toán
            </p>
            <p className="font-['Fz_Poppins:Bold',sans-serif] text-[#4caf50] text-[32px]">
              {totalPaid.toLocaleString('vi-VN')}đ
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] mb-[24px]">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="pending" className="font-['Fz_Poppins:Medium',sans-serif]">
                Chờ thanh toán ({pendingInvoices.length})
              </TabsTrigger>
              <TabsTrigger value="paid" className="font-['Fz_Poppins:Medium',sans-serif]">
                Đã thanh toán ({paidInvoices.length})
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#666666]" />
              <Input
                placeholder="Tìm mã hóa đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-[40px] font-['Fz_Poppins:Regular',sans-serif]"
              />
            </div>
          </div>

          {/* Pending Invoices Tab */}
          <TabsContent value="pending" className="space-y-[20px]">
            {pendingInvoices.length === 0 ? (
              <Card className="p-[40px] text-center border-[#ebf6fc]">
                <CheckCircle className="w-[64px] h-[64px] text-[#4caf50] mx-auto mb-[16px]" />
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[8px]">
                  Không có hóa đơn chờ thanh toán
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                  Bạn đã thanh toán tất cả các hóa đơn
                </p>
              </Card>
            ) : (
              <>
                {pendingInvoices.map((invoice) => (
                  <Card key={invoice.id} className="p-[24px] md:p-[32px] border-[#ffc107] bg-gradient-to-br from-[#fffbf0] to-white">
                    <div className="flex flex-col lg:flex-row gap-[24px]">
                      {/* Left side - Invoice details */}
                      <div className="flex-1 space-y-[20px]">
                        <div className="flex items-start justify-between gap-[16px]">
                          <div>
                            <div className="flex items-center gap-[12px] mb-[8px]">
                              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px]">
                                Hóa đơn #{invoice.id}
                              </h3>
                              <span className="px-[12px] py-[6px] bg-[#fff3e0] text-[#ff9800] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] flex items-center gap-[6px]">
                                <AlertCircle className="w-[14px] h-[14px]" />
                                Chờ thanh toán
                              </span>
                            </div>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] mb-[4px]">
                              Ngày tạo: {invoice.date}
                            </p>
                            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#f44336] text-[14px]">
                              Hạn thanh toán: {invoice.dueDate}
                            </p>
                          </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="bg-white border border-[#ffe082] rounded-[12px] p-[20px]">
                          <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px] mb-[16px]">
                            Chi tiết hóa đơn
                          </p>
                          <div className="space-y-[12px]">
                            {invoice.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                                    {item.name}
                                  </span>
                                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px] ml-[8px]">
                                    x{item.quantity}
                                  </span>
                                </div>
                                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                                  {item.price.toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            ))}
                            <div className="pt-[12px] mt-[12px] border-t border-[#ffe082] flex items-center justify-between">
                              <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px]">
                                Tổng cộng:
                              </span>
                              <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#ff9800] text-[20px]">
                                {invoice.amount.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-[12px] text-[#666666]">
                          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          <span className="font-['Fz_Poppins:Regular',sans-serif] text-[14px]">
                            Bác sĩ: {invoice.doctor}
                          </span>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex lg:flex-col gap-[12px] lg:w-[180px]">
                        <button
                          onClick={() => handlePayNow(invoice)}
                          className="flex-1 lg:flex-none bg-gradient-to-r from-[#ff9800] to-[#f57c00] text-white px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:shadow-[0px_4px_16px_0px_rgba(255,152,0,0.4)] transition-all flex items-center justify-center gap-[8px]"
                        >
                          <CreditCard className="w-[18px] h-[18px]" />
                          Thanh toán ngay
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="flex-1 lg:flex-none bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:bg-[#ebf6fc] transition-all flex items-center justify-center gap-[8px]"
                        >
                          <Download className="w-[18px] h-[18px]" />
                          Tải xuống
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Paid Invoices Tab */}
          <TabsContent value="paid" className="space-y-[20px]">
            {paidInvoices.map((invoice) => (
              <Card key={invoice.id} className="p-[24px] md:p-[32px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all">
                <div className="flex flex-col lg:flex-row gap-[24px]">
                  {/* Left side - Invoice details */}
                  <div className="flex-1 space-y-[16px]">
                    <div className="flex items-start justify-between gap-[16px] flex-wrap">
                      <div>
                        <div className="flex items-center gap-[12px] mb-[8px]">
                          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px]">
                            Hóa đơn #{invoice.id}
                          </h3>
                          <span className="px-[12px] py-[6px] bg-[#e8f5e9] text-[#4caf50] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] flex items-center gap-[6px]">
                            <CheckCircle className="w-[14px] h-[14px]" />
                            Đã thanh toán
                          </span>
                        </div>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                          {invoice.service}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[4px]">
                          {invoice.amount.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                          {invoice.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
                      <div className="bg-[#f5fbff] rounded-[10px] p-[12px]">
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                          Ngày khám
                        </p>
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                          {invoice.date}
                        </p>
                      </div>
                      <div className="bg-[#f5fbff] rounded-[10px] p-[12px]">
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                          Ngày thanh toán
                        </p>
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                          {invoice.paidDate}
                        </p>
                      </div>
                      <div className="bg-[#f5fbff] rounded-[10px] p-[12px]">
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                          Bác sĩ
                        </p>
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                          {invoice.doctor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Download button */}
                  <div className="flex lg:flex-col gap-[12px] lg:w-[160px] lg:justify-center">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="flex-1 lg:flex-none bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] px-[20px] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[15px] hover:bg-[#ebf6fc] transition-all flex items-center justify-center gap-[8px]"
                    >
                      <Download className="w-[18px] h-[18px]" />
                      Tải xuống
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px]">
                Thanh toán hóa đơn
              </DialogTitle>
              <DialogDescription className="font-['Fz_Poppins:Regular',sans-serif]">
                Chọn phương thức thanh toán của bạn
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-[24px]">
                {/* Invoice Summary */}
                <div className="bg-[#f5fbff] rounded-[16px] p-[20px]">
                  <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[12px]">
                    Thông tin hóa đơn
                  </p>
                  <div className="space-y-[8px]">
                    <div className="flex justify-between">
                      <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                        Mã hóa đơn:
                      </span>
                      <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                        #{selectedInvoice.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                        Dịch vụ:
                      </span>
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                        {selectedInvoice.service}
                      </span>
                    </div>
                    <div className="pt-[8px] mt-[8px] border-t border-[#d6edfa] flex justify-between">
                      <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px]">
                        Tổng tiền:
                      </span>
                      <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#3fb5ff] text-[20px]">
                        {selectedInvoice.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-[12px]">
                  <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-[12px]">
                    Phương thức thanh toán
                  </p>
                  
                  <button className="w-full bg-white border-2 border-[#3fb5ff] rounded-[12px] p-[16px] hover:bg-[#ebf6fc] transition-all text-left">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] bg-[#3fb5ff] rounded-[10px] flex items-center justify-center">
                        <CreditCard className="w-[20px] h-[20px] text-white" />
                      </div>
                      <div>
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                          Chuyển khoản ngân hàng
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                          Thanh toán qua VietQR, Internet Banking
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-white border-2 border-[#e0e0e0] rounded-[12px] p-[16px] hover:border-[#3fb5ff] transition-all text-left">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] bg-[#e0e0e0] rounded-[10px] flex items-center justify-center">
                        <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                          Thẻ tín dụng/ghi nợ
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                          Visa, Mastercard, JCB
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-white border-2 border-[#e0e0e0] rounded-[12px] p-[16px] hover:border-[#3fb5ff] transition-all text-left">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] bg-[#e0e0e0] rounded-[10px] flex items-center justify-center">
                        <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[15px]">
                          Tiền mặt tại phòng khám
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                          Thanh toán khi đến khám
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-[12px]">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1 font-['Fz_Poppins:Medium',sans-serif]"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className="flex-1 bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] font-['Fz_Poppins:SemiBold',sans-serif]"
              >
                Xác nhận thanh toán
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
