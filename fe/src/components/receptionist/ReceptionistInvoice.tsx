import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  FileText,
  DollarSign,
  Shield,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { paymentController, PaymentStatus, PaymentResponseDTO } from '../../controllers/PaymentController';
import { invoiceController, InvoiceDTO } from '../../controllers/InvoiceController';
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { userController } from '../../controllers/UserController';
import { UserDTO } from '../../models/User';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { usePayOS, PayOSConfig } from '@payos/payos-checkout';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import { Download, X } from 'lucide-react';

interface InvoiceItem {
  id: string;
  serviceType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  insurancePayAmount: number | null;
  patientPayAmount: number | null;
}

interface NormalizedInvoiceItem {
  serviceType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  insurancePayAmount: number;
  patientPayAmount: number;
}

const normalizeInvoiceItem = (item: InvoiceItem): NormalizedInvoiceItem => ({
  serviceType: item.serviceType,
  name: item.name,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  insurancePayAmount: item.insurancePayAmount ?? 0,
  patientPayAmount: item.patientPayAmount ?? 0,
});



interface ReceptionistInvoiceProps {
  invoiceId?: string;
  patientId?: string;
  onBack: () => void;
  mode?: 'view' | 'payment'; // 'view' = chỉ xem chi tiết, 'payment' = xem + thanh toán
}

export function ReceptionistInvoice({ invoiceId, patientId, onBack, mode = 'view' }: ReceptionistInvoiceProps) {
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
  const [showPayOS, setShowPayOS] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponseDTO | null>(null);



  const payOSConfig: PayOSConfig | null = checkoutUrl
    ? {
      RETURN_URL: 'http://localhost:3000/payment/result',
      ELEMENT_ID: 'embedded-payment-container',
      CHECKOUT_URL: checkoutUrl,
      embedded: false,

      onSuccess: (event) => {
        console.log('✅ Payment success:', event);
        toast.success('Thanh toán thành công!', {
          description: 'Hóa đơn đã được thanh toán qua PayOS',
          duration: 5000,
        });
        setShowPayOS(false);
        setIsPaid(true);
        setIsProcessing(false);

        if (invoiceId) {
          loadInvoiceData();
        }
      },

      onCancel: async () => {
        console.log('❌ Payment cancelled by user');
        setShowPayOS(false);
        setIsProcessing(false);

        toast.warning('Đã hủy thanh toán', {
          description: 'Bạn đã hủy giao dịch thanh toán',
          duration: 4000,
        });

        // Reload để check status mới nhất
        if (invoiceId) {
          await loadInvoiceData();
        }
      },

      onExit: async () => {
        console.log('🚪 Payment window closed');
        setShowPayOS(false);
        setIsProcessing(false);

        // Check payment status sau khi đóng popup
        if (invoiceId) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1s
            const paymentStatus = await paymentController.getPaymentStatus(invoiceId);

            if (paymentStatus.status === PaymentStatus.SUCCESSFUL) {
              toast.success('Thanh toán thành công!');
              setIsPaid(true);
              await loadInvoiceData();
            } else if (paymentStatus.status === PaymentStatus.CANCELLED) {
              toast.info('Thanh toán đã bị hủy');
            } else if (paymentStatus.status === PaymentStatus.TIMEOUT) {
              toast.error('Hết thời gian thanh toán', {
                description: 'Mã QR đã hết hạn. Vui lòng thử lại.',
                duration: 5000,
              });
            } else if (paymentStatus.status === PaymentStatus.FAILED) {
              toast.error('Thanh toán thất bại', {
                description: 'Giao dịch không thành công. Vui lòng thử lại.',
                duration: 5000,
              });
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }
      },
    }
    : null;

  const payOS = payOSConfig ? usePayOS(payOSConfig) : null;


  useEffect(() => {
    if (checkoutUrl && payOS) {
      payOS.open();
    }
  }, [checkoutUrl]);



  // Real backend data states
  const [patientData, setPatientData] = useState<UserDTO | null>(null);
  const [doctorData, setDoctorData] = useState<UserDTO | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentDTO | null>(null);

  // Thêm state cho cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // State cho PDF preview dialog
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // ===== LOAD INVOICE DATA FROM BACKEND =====
  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData();
    }
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    if (!invoiceId) return;

    setIsLoadingInvoice(true);
    try {
      // 1. Load Invoice
      const data = await invoiceController.getInvoiceById(invoiceId);
      setInvoiceData(data);

      // 2. Load Appointment từ appointmentId
      if (data.appointmentId) {
        try {
          const appointment = await appointmentController.getById(data.appointmentId);
          setAppointmentData(appointment);

          // 3. Load Patient info
          if (appointment.patientId) {
            const patient = await userController.getById(appointment.patientId);
            setPatientData(patient);
          }

          // 4. Load Doctor info
          if (appointment.doctorId) {
            const doctor = await userController.getById(appointment.doctorId);
            setDoctorData(doctor);
          }
        } catch (error) {
          console.error('Error loading appointment/user data:', error);
          toast.error('Không thể tải thông tin bệnh nhân/bác sĩ');
        }
      }

      // 5. Map invoice items
      if (data.items && data.items.length > 0) {
        const mappedItems: InvoiceItem[] = data.items.map(item => ({
          id: item.id,
          serviceType: item.serviceType,
          name: item.description || item.serviceType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          insurancePayAmount: item.insurancePayAmount ?? null,
          patientPayAmount: item.patientPayAmount ?? null,
        }));
        setItems(mappedItems);

      }

      // 6. Check if already paid
      if (data.status === 'PAID') {
        setIsPaid(true);

        // 7. Load Payment data nếu đã thanh toán
        try {
          const paymentInfo = await paymentController.getPaymentStatus(invoiceId);
          setPaymentData(paymentInfo);

          // Set payment method từ backend data
          setPaymentMethod(paymentInfo.paymentMethod);
          console.log('✅ Loaded payment info:', paymentInfo);
        } catch (error) {
          console.error('Error loading payment info:', error);
        }
      }

      console.log('✅ Loaded invoice:', data);
    } catch (error) {
      toast.error('Không thể tải hóa đơn');
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // ===== CALCULATED VALUES =====
  // Tổng tiền hóa đơn
  const subtotal = invoiceData?.totalAmount || items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Bảo hiểm chi trả (đây là "discount")
  const insurancePays = invoiceData?.insuranceTotalPay || items.reduce((sum, item) => sum + (item.insurancePayAmount ?? 0), 0);

  // Bệnh nhân phải trả
  const patientPays = invoiceData?.patientTotalPay || items.reduce((sum, item) => sum + (item.patientPayAmount ?? 0), 0);

  // Tiền thừa (chỉ cho tiền mặt)
  const change = amountReceived ? Math.max(0, parseInt(amountReceived) - patientPays) : 0;

  // Display values
  const displayInvoiceCode = invoiceData?.id.slice(-8).toUpperCase() || 'N/A';
  const displayDate = invoiceData?.issueAt
    ? new Date(invoiceData.issueAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '—';

  // Patient & Doctor display values
  const displayPatientName = patientData?.fullName || 'Đang tải...';
  const displayPatientCode = patientData?.id
    ? `BN${patientData.id.slice(-6).toUpperCase()}`
    : '—';
  const displayDoctorName = doctorData?.fullName || 'Đang tải...';


  const handleConfirmPayment = async () => {
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

      // 💵 TIỀN MẶT
      if (paymentMethod === 'CASH') {
        toast.success('Thanh toán tiền mặt thành công!');
        setIsPaid(true);

        if (invoiceId) {
          await loadInvoiceData();
        }

        setIsProcessing(false);
        return;
      }

      // 🏦 CHUYỂN KHOẢN (EMBEDDED)
      if (!response.paymentUrl) {
        toast.error('Không nhận được link thanh toán từ PayOS');
        setIsProcessing(false);
        return;
      }

      //toast.info('Đang mở popup thanh toán...');

      setCheckoutUrl(response.paymentUrl);
      setShowPayOS(true);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi tạo thanh toán');
      setIsProcessing(false);
    }
  };


  // Get service icon
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'MEDICINE':
        return '💊';
      case 'SERVICE':
        return '🦷';
      default:
        return '📋';
    }
  };

  // ===== PDF PREVIEW & DOWNLOAD FUNCTIONS =====
  const handleOpenPrintPreview = () => {
    if (!invoiceData) {
      toast.error('Không có dữ liệu hóa đơn để in');
      return;
    }

    // Kiểm tra dữ liệu cần thiết
    if (!items || items.length === 0) {
      toast.error('Hóa đơn chưa có chi tiết dịch vụ');
      return;
    }

    setPdfError(null);
    console.log('Opening PDF preview with data:', {
      invoiceData,
      itemsCount: items.length,
      patientData,
      doctorData,
    });
    setShowPdfPreview(true);
  };

  const handleDownloadPdf = async () => {
    if (!invoiceData) return;

    try {
      setIsDownloadingPdf(true);

      const docInstance = (
        <InvoicePdfDocument
          invoiceData={invoiceData}
          items={items.map(normalizeInvoiceItem)}
          patientData={patientData}
          doctorData={doctorData}
          appointmentData={appointmentData}
          subtotal={subtotal}
          insurancePays={insurancePays}
          patientPays={patientPays}
          isPaid={isPaid}
          paymentData={paymentData}
          paymentMethod={paymentMethod}
          amountReceived={amountReceived}
          change={change}
        />
      );

      const blob = await pdf(docInstance).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const fileName = `HoaDon_${displayInvoiceCode}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      toast.success('Đã tải file PDF thành công!', {
        description: `File: ${fileName}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Lỗi khi tạo file PDF', {
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
      });
    } finally {
      setIsDownloadingPdf(false);
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
              <h1 className="text-2xl font-bold text-neutral-heading">
                Hóa đơn #{displayInvoiceCode}
              </h1>
              {isLoadingInvoice && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              <Badge
                className={isPaid ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
              >
                {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-text/70">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <strong>{displayPatientName}</strong> ({displayPatientCode})
              </span>
              <span>•</span>
              <span>BS. {displayDoctorName}</span>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-[10px]"
            onClick={() => loadInvoiceData()}
            disabled={isLoadingInvoice}
          >
            {isLoadingInvoice ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Làm mới
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-[10px]"
            onClick={handleOpenPrintPreview}
            disabled={!invoiceData}
          >
            <Printer className="w-4 h-4" />
            In Hóa đơn
          </Button>
        </div> */}
      </div>

      {/* Invoice Info Card*/}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-neutral-surface border-primary/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-text/60 uppercase tracking-wide mb-1 font-medium">Ngày lập</p>
              <p className="text-neutral-heading font-semibold text-sm md:text-base truncate">{displayDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-text/60 uppercase tracking-wide mb-1 font-medium">Mã hóa đơn</p>
              <p className="text-neutral-heading font-mono font-semibold text-sm md:text-base truncate">{displayInvoiceCode}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-text/60 uppercase tracking-wide mb-1 font-medium">Bác sĩ</p>
              <p className="text-neutral-heading font-semibold text-sm md:text-base truncate">{displayDoctorName}</p>
            </div>
          </div>
        </div>
      </Card>


      {/* Invoice Items Table*/}

      <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Chi tiết Dịch vụ/Vật tư
            <Badge variant="outline" className="ml-2 border-neutral-border bg-neutral-muted text-neutral-text">{items.length} mục</Badge>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-neutral-muted/30">
                <TableHead className="font-semibold text-neutral-heading px-3">STT</TableHead>
                <TableHead className="font-semibold text-neutral-heading px-3">Loại</TableHead>
                <TableHead className="font-semibold text-neutral-heading px-3">Tên Dịch vụ/Vật tư</TableHead>
                <TableHead className="text-center font-semibold text-neutral-heading px-3">SL</TableHead>
                <TableHead className="text-right font-semibold text-neutral-heading px-3">Đơn giá</TableHead>
                <TableHead className="text-right font-semibold text-neutral-heading px-3">Thành tiền</TableHead>
                <TableHead className="text-right font-semibold text-neutral-heading px-3">
                  <span className="flex items-center justify-end gap-1">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">BH chi trả</span>
                  </span>
                </TableHead>
                <TableHead className="text-right font-semibold text-neutral-heading px-3">
                  <span className="flex items-center justify-end gap-1">
                    <Wallet className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="truncate">BN thanh toán</span>
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">
                  <TableCell className="font-medium text-neutral-text align-top px-3 py-3">{index + 1}</TableCell>
                  <TableCell className="align-top px-3 py-3">
                    <div className="flex items-start gap-2 overflow-hidden">
                      <span className="text-xl flex-shrink-0">{getServiceIcon(item.serviceType)}</span>
                      <span className="text-xs font-medium text-neutral-text/70 break-words overflow-hidden">{item.serviceType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top px-3 py-3">
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-neutral-heading leading-relaxed break-all">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-neutral-text align-top px-3 py-3">{item.quantity}</TableCell>
                  <TableCell className="text-right text-neutral-text align-top whitespace-nowrap px-3 py-3">
                    {item.unitPrice.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right font-semibold text-neutral-heading align-top whitespace-nowrap px-3 py-3">
                    {(item.quantity * item.unitPrice).toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600 align-top whitespace-nowrap px-3 py-3">
                    {(item.insurancePayAmount ?? 0).toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary align-top whitespace-nowrap px-3 py-3">
                    {(item.patientPayAmount ?? 0).toLocaleString('vi-VN')}đ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </div>

        {/* Totals Summary - Enhanced Spacing */}
        <div className="mt-6 space-y-4 max-w-lg ml-auto">
          {/* Subtotal */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-neutral-border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-neutral-text/60" />
              <span className="text-base font-medium text-neutral-text">Tổng cộng</span>
            </div>
            <span className="text-xl font-bold text-neutral-heading ml-8">
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
      {mode === 'payment' && !isPaid && invoiceData?.status === 'PENDING' && (
        <Card className="p-6 border-2 border-primary/20 bg-neutral-surface shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-heading mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
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
                    className="rounded-[10px] text-lg h-12 pr-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                placeholder="Ghi chú thanh toán"
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
                    <strong>Phương thức:</strong> {paymentData?.paymentMethod ? paymentMethodMap[paymentData.paymentMethod] : paymentMethodMap[paymentMethod]}
                  </p>

                  {/* Chi tiết cho TIỀN MẶT */}
                  {(paymentData?.paymentMethod === 'CASH' || paymentMethod === 'CASH') && (
                    <>
                      {paymentData?.totalAmount && (
                        <p>
                          <strong>Số tiền thanh toán:</strong> {paymentData.totalAmount.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                      {amountReceived && (
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
                    </>
                  )}

                  {/* Chi tiết cho CHUYỂN KHOẢN */}
                  {(paymentData?.paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'BANK_TRANSFER') && (
                    <>
                      <p>
                        <strong>Số tiền:</strong> {paymentData?.totalAmount ? paymentData.totalAmount.toLocaleString('vi-VN') : patientPays.toLocaleString('vi-VN')}đ
                      </p>
                      <p>
                        <strong>Cổng thanh toán:</strong> PayOS
                      </p>
                      {paymentData?.transactionId && (
                        <p className="text-xs">
                          <strong>Mã GD:</strong> {paymentData.transactionId}
                        </p>
                      )}
                      {paymentData?.paidAt && (
                        <p className="text-xs">
                          <strong>Thời gian:</strong> {new Date(paymentData.paidAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                      <p className="text-xs text-green-600 italic">
                        ✓ Đã xác nhận thanh toán qua ngân hàng
                      </p>
                    </>
                  )}

                  {(notes || paymentData?.description) && (
                    <p className="italic mt-2 bg-white/50 px-2 py-1 rounded">
                      <strong>Ghi chú:</strong> {paymentData?.description || notes}
                    </p>
                  )}
                </div>


              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-[10px] border-green-600 text-green-700 hover:bg-green-50"
                onClick={handleOpenPrintPreview}
                disabled={!invoiceData}
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

      {/* Nút Hủy hóa đơn - chỉ hiển thị cho hóa đơn PENDING */}
      {invoiceData?.status === 'PENDING' && (
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-2 rounded-[10px]"
          disabled={isProcessing}
          onClick={() => setShowCancelDialog(true)}
        >
          <AlertCircle className="w-4 h-4" />
          Hủy Hóa đơn
        </Button>
      )}

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

                    toast.success('Đã hủy hóa đơn thành công');
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

      {/* PayOS Embedded Container */}
      {showPayOS && (
        <div
          id="embedded-payment-container"
          className="fixed inset-0 z-[9999]"
        />
      )}

      {/* PDF Preview - Fullscreen Overlay */}
      {showPdfPreview && invoiceData && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm flex-shrink-0">
            <h2 className="text-xl font-bold text-[#01304e]">Xem trước hóa đơn (PDF)</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                className="rounded-[10px] gap-2"
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo file...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Tải về
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPdfPreview(false)}
                className="rounded-[10px]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PDF Viewer - Fullscreen */}
          <div className="flex-1 overflow-hidden bg-gray-100 relative min-h-0">
            {pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold mb-2">Lỗi khi tải PDF</p>
                  <p className="text-gray-600 text-sm mb-4">{pdfError}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPdfError(null);
                      setShowPdfPreview(false);
                    }}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            ) : invoiceData && items && items.length > 0 ? (
              <div className="w-full h-full" style={{ minHeight: '600px' }}>
                <PDFViewer
                  width="100%"
                  height="100%"
                >
                  <InvoicePdfDocument
                    invoiceData={invoiceData}
                    items={items.map(normalizeInvoiceItem)}
                    patientData={patientData}
                    doctorData={doctorData}
                    appointmentData={appointmentData}
                    subtotal={subtotal}
                    insurancePays={insurancePays}
                    patientPays={patientPays}
                    isPaid={isPaid}
                    paymentData={paymentData}
                    paymentMethod={paymentMethod}
                    amountReceived={amountReceived}
                    change={change}
                  />
                </PDFViewer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải PDF...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const paymentMethodMap: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

