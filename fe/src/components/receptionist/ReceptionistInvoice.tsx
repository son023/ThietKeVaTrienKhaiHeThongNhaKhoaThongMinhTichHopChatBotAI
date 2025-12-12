import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Loader2,
  QrCode,
  AlertCircle,
  Calendar,
  User,
  FileText,
  DollarSign,
  Shield,
  Wallet
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { paymentController, PaymentStatus } from '../../controllers/PaymentController';
import { invoiceController, InvoiceDTO } from '../../controllers/InvoiceController';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface InvoiceItem {
  id: string;
  serviceType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  insurancePayAmount: number;
  patientPayAmount: number;
}

interface ReceptionistInvoiceProps {
  invoiceId?: string;
  patientId?: string;
  onBack: () => void;
}

export function ReceptionistInvoice({ invoiceId, patientId, onBack }: ReceptionistInvoiceProps) {
  // ===== STATE =====
  // Backend data
  const [invoiceData, setInvoiceData] = useState<InvoiceDTO | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvoiceItems, setShowInvoiceItems] = useState(true);


  // Mock data fallback
  const [patient] = useState({
    name: 'Nguyễn Văn A',
    code: 'BN001',
  });

  const [invoice] = useState({
    code: 'HD0123',
    date: '28/10/2025',
    doctor: 'BS. Phạm Thị Ngọc Mai',
  });

  // Thêm state cho cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // ===== LOAD INVOICE DATA FROM BACKEND =====
  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData();
    } else {
      // Load mock data nếu không có invoiceId
      setItems([
        {
          id: '1',
          serviceType: 'Dental',
          name: 'Trám răng Composite Răng 46',
          quantity: 1,
          unitPrice: 500000,
          insurancePayAmount: 300000,
          patientPayAmount: 200000,
        },
        {
          id: '2',
          serviceType: 'Dental',
          name: 'Cạo vôi răng',
          quantity: 1,
          unitPrice: 300000,
          insurancePayAmount: 150000,
          patientPayAmount: 150000,
        },
      ]);
    }
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    if (!invoiceId) return;

    setIsLoadingInvoice(true);
    try {
      const data = await invoiceController.getInvoiceById(invoiceId);
      setInvoiceData(data);

      // Map items từ backend
      if (data.items && data.items.length > 0) {
        const mappedItems: InvoiceItem[] = data.items.map(item => ({
          id: item.id,
          serviceType: item.serviceType,
          name: item.description || item.serviceType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          insurancePayAmount: item.insurancePayAmount,
          patientPayAmount: item.patientPayAmount,
        }));
        setItems(mappedItems);
      }

      // Check if already paid
      if (data.status === 'PAID') {
        setIsPaid(true);
      }

      console.log('✅ Loaded invoice:', data);
    } catch (error) {
      console.error('❌ Error loading invoice:', error);
      toast.error('Không thể tải hóa đơn, sử dụng dữ liệu mẫu');

      // Fallback to mock data
      setItems([
        {
          id: '1',
          serviceType: 'Dental',
          name: 'Trám răng Composite Răng 46',
          quantity: 1,
          unitPrice: 500000,
          insurancePayAmount: 300000,
          patientPayAmount: 200000,
        },
        {
          id: '2',
          serviceType: 'Dental',
          name: 'Cạo vôi răng',
          quantity: 1,
          unitPrice: 300000,
          insurancePayAmount: 150000,
          patientPayAmount: 150000,
        },
      ]);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // ===== CALCULATED VALUES =====
  // Tổng tiền hóa đơn
  const subtotal = invoiceData?.totalAmount || items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Bảo hiểm chi trả (đây là "discount")
  const insurancePays = invoiceData?.insuranceTotalPay || items.reduce((sum, item) => sum + item.insurancePayAmount, 0);

  // Bệnh nhân phải trả
  const patientPays = invoiceData?.patientTotalPay || items.reduce((sum, item) => sum + item.patientPayAmount, 0);

  // Tiền thừa (chỉ cho tiền mặt)
  const change = amountReceived ? Math.max(0, parseInt(amountReceived) - patientPays) : 0;

  // Display values
  const displayInvoiceCode = invoiceData?.id.substring(0, 8).toUpperCase() || invoice.code;
  const displayDate = invoiceData?.issueAt
    ? new Date(invoiceData.issueAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : invoice.date;

  // ===== HANDLERS =====
  const handleConfirmPayment = async () => {
    // Validate for cash payment
    if (paymentMethod === 'CASH') {
      if (!amountReceived) {
        toast.error('Vui lòng nhập số tiền nhận');
        return;
      }
      if (parseInt(amountReceived) < patientPays) {
        toast.error('Số tiền nhận chưa đủ');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const response = await paymentController.createPayment({
        invoiceId: invoiceId || 'MOCK-INVOICE',
        paymentMethod: paymentMethod,
        totalAmount: patientPays,
      });

      if (paymentMethod === 'CASH') {
        // Cash payment - immediate success
        toast.success('Thanh toán tiền mặt thành công!');
        setIsPaid(true);

        // Reload invoice data if available
        if (invoiceId) {
          await loadInvoiceData();
        }
        setIsProcessing(false);
      } else {
        // Bank transfer - REDIRECT to PayOS Hosted Page
        if (response.paymentUrl) {
          toast.info('Đang chuyển đến trang thanh toán PayOS...');

          // Wait a bit for toast to show, then redirect
          setTimeout(() => {
            window.location.href = response.paymentUrl!;
          }, 500);
        } else {
          toast.error('Không nhận được link thanh toán từ server');
          setIsProcessing(false);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi tạo thanh toán');
      setIsProcessing(false);
    }
  };

  // Get service icon
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Medicine':
        return '💊';
      case 'Dental':
        return '🦷';
      default:
        return '📋';
    }
  };

  // ===== LOADING STATE =====
  if (isLoadingInvoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#01304e]">
                Hóa đơn #{displayInvoiceCode}
              </h1>
              {isLoadingInvoice && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
              <Badge
                className={isPaid ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
              >
                {isPaid ? '✓ ĐÃ THANH TOÁN' : '⏳ CHƯA THANH TOÁN'}
              </Badge>
              {invoiceData && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  📡 Dữ liệu thực
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <strong>{patient.name}</strong> ({patient.code})
              </span>
              <span>•</span>
              <span>BS. {invoice.doctor}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-[10px]">
            <Printer className="w-4 h-4" />
            In Hóa đơn
          </Button>
        </div>
      </div>

      {/* Invoice Info Card*/}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ngày lập</p>
              <p className="text-[#01304e] font-semibold text-sm md:text-base truncate">{displayDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mã hóa đơn</p>
              <p className="text-[#01304e] font-mono font-semibold text-sm md:text-base truncate">{displayInvoiceCode}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bác sĩ</p>
              <p className="text-[#01304e] font-semibold text-sm md:text-base truncate">{invoice.doctor}</p>
            </div>
          </div>
        </div>
      </Card>


      {/* Invoice Items Table*/}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#01304e] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3FB5FF]" />
            Chi tiết Dịch vụ/Vật tư
            <Badge variant="outline" className="ml-2">{items.length} mục</Badge>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tên Dịch vụ/Vật tư</TableHead>
                <TableHead className="text-center w-[100px]">Số lượng</TableHead>
                <TableHead className="text-right w-[130px]">Đơn giá</TableHead>
                <TableHead className="text-right w-[130px]">Thành tiền</TableHead>
                <TableHead className="text-right w-[130px]">
                  <span className="flex items-center justify-end gap-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    BH chi trả
                  </span>
                </TableHead>
                <TableHead className="text-right w-[130px]">
                  <span className="flex items-center justify-end gap-1">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    BN thanh toán
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getServiceIcon(item.serviceType)}</span>
                      <span className="text-xs font-medium text-gray-600">{item.serviceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-[#01304e]">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right text-gray-700">
                    {item.unitPrice.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right font-semibold text-[#01304e]">
                    {(item.quantity * item.unitPrice).toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {item.insurancePayAmount.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {item.patientPayAmount.toLocaleString('vi-VN')}đ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals Summary - Enhanced Spacing */}
        <div className="mt-6 space-y-4 max-w-lg ml-auto">
          {/* Subtotal */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="text-base font-medium text-gray-700">Tổng cộng</span>
            </div>
            <span className="text-xl font-bold text-[#01304e] ml-8">
              {subtotal.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Insurance Payment - với background nổi bật */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-green-200 bg-green-50 -mx-4 px-6 py-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-base font-semibold text-green-800">Bảo hiểm chi trả</span>
                <p className="text-xs text-green-600 mt-0.5">Phần được hỗ trợ</p>
              </div>
            </div>
            <span className="text-xl font-bold text-green-600 ml-8">
              -{insurancePays.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Patient Payment - với background highlight */}
          <div className="flex justify-between items-center pt-4 bg-gradient-to-r from-blue-50 to-blue-100 -mx-4 px-6 py-5 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-blue-600" />
              <div>
                <span className="text-lg font-bold text-blue-900">
                  Bệnh nhân thanh toán
                </span>
                <p className="text-xs text-blue-600 mt-0.5">Số tiền cần thu</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-[#3FB5FF] ml-8">
              {patientPays.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </Card>


      {/* Payment Section */}
      {!isPaid && (
        <Card className="p-6 border-2 border-blue-100">
          <h3 className="text-lg font-semibold text-[#01304e] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#3FB5FF]" />
            Thông tin Thanh toán
          </h3>

          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Phương thức thanh toán *</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Cash */}
                <div
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'CASH'
                    ? 'border-[#3FB5FF] bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CASH' ? 'border-[#3FB5FF]' : 'border-gray-300'
                    }`}>
                    {paymentMethod === 'CASH' && (
                      <div className="w-3 h-3 rounded-full bg-[#3FB5FF]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#01304e]">💵 Tiền mặt</div>
                    <div className="text-sm text-gray-500">Thanh toán ngay tại quầy</div>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'BANK_TRANSFER'
                    ? 'border-[#3FB5FF] bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#3FB5FF]' : 'border-gray-300'
                    }`}>
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <div className="w-3 h-3 rounded-full bg-[#3FB5FF]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#01304e]">🏦 Chuyển khoản</div>
                    <div className="text-sm text-gray-500">Quét mã QR PayOS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Received - Only for CASH */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2">
                <Label htmlFor="amountReceived" className="text-base font-medium">
                  Số tiền nhận *
                </Label>
                <div className="relative">
                  <Input
                    id="amountReceived"
                    type="number"
                    min="0"
                    step="10000"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Nhập số tiền khách đưa"
                    className="rounded-[10px] text-lg h-12 pr-24"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-xs font-semibold text-[#3FB5FF] hover:bg-blue-100"
                      onClick={() => setAmountReceived(patientPays.toString())}
                    >
                      Vừa đủ
                    </Button>
                  </div>
                </div>

                {/* Change Display */}
                {amountReceived && parseInt(amountReceived) >= patientPays && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-green-900 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Tiền thừa trả khách
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {change.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                )}

                {/* Shortage Display */}
                {amountReceived && parseInt(amountReceived) < patientPays && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-red-900 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Số tiền chưa đủ
                      </span>
                      <span className="text-xl font-bold text-red-600">
                        Thiếu: {(patientPays - parseInt(amountReceived)).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về thanh toán (tùy chọn)..."
                className="rounded-[10px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center mt-6 pt-6 border-t">
            <Button
              size="lg"
              onClick={handleConfirmPayment}
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 gap-2 rounded-[15px] shadow-lg px-8 text-base"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {paymentMethod === 'BANK_TRANSFER'
                    ? 'Đang chuyển hướng...'
                    : 'Đang xử lý...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {paymentMethod === 'BANK_TRANSFER'
                    ? `Xác nhận Thanh toán (${patientPays.toLocaleString('vi-VN')}đ)`
                    : `Xác nhận Thanh toán (${patientPays.toLocaleString('vi-VN')}đ)`}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}




      {/* Payment Success */}
      {isPaid && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-[15px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-1">
                  ✅ Thanh toán thành công!
                </h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <strong>Phương thức:</strong> {paymentMethodMap[paymentMethod]}
                  </p>
                  {paymentMethod === 'CASH' && amountReceived && (
                    <>
                      <p>
                        <strong>Số tiền nhận:</strong> {parseInt(amountReceived).toLocaleString('vi-VN')}đ
                      </p>
                      {change > 0 && (
                        <p>
                          <strong>Tiền thừa:</strong> {change.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                    </>
                  )}
                  {notes && (
                    <p className="italic mt-2 bg-white/50 px-2 py-1 rounded">
                      <strong>Ghi chú:</strong> {notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-[10px] border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => console.log('In hóa đơn')}
              >
                <Printer className="w-4 h-4" />
                In hóa đơn
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 gap-2 rounded-[10px]"
                onClick={onBack}
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Nút Hủy hóa đơn - mở dialog */}
      <Button
        variant="outline"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-2 rounded-[10px]"
        disabled={isProcessing}
        onClick={() => setShowCancelDialog(true)}
      >
        <AlertCircle className="w-4 h-4" />
        Hủy Hóa đơn
      </Button>

      {/* Cancel Dialog - Thêm ở cuối component */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#01304e] mb-1">
                  Hủy Hóa đơn
                </h3>
                <p className="text-sm text-gray-600">
                  Vui lòng nhập lý do hủy hóa đơn. Hóa đơn đã hủy không thể khôi phục.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <Label htmlFor="cancelReason">Lý do hủy *</Label>
              <Input
                id="cancelReason"
                placeholder="Ví dụ: Khách hàng hủy lịch hẹn..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="rounded-[10px]"
                autoFocus
              />

              {/* Quick reasons */}
              <div className="flex flex-wrap gap-2">
                {['Khách hàng hủy', 'Sai thông tin', 'Trùng lặp', 'Khác'].map((reason) => (
                  <Button
                    key={reason}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setCancelReason(reason)}
                  >
                    {reason}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                }}
                disabled={isProcessing}
              >
                Đóng
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  if (!cancelReason.trim()) {
                    toast.error('Vui lòng nhập lý do hủy');
                    return;
                  }

                  try {
                    setIsProcessing(true);
                    await invoiceController.cancelInvoiceWithReason(
                      invoiceId!,
                      cancelReason.trim()
                    );

                    toast.success('✅ Đã hủy hóa đơn thành công');
                    setShowCancelDialog(false);

                    setTimeout(() => onBack(), 1500);
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : 'Lỗi khi hủy hóa đơn'
                    );
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing || !cancelReason.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận Hủy'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

const paymentMethodMap: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

