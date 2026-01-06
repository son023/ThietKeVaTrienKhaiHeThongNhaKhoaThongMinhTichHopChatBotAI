import { useState, useEffect, useRef } from 'react';
import { DollarSign, FileText, AlertCircle, CheckCircle, Printer, Download, Loader2, RefreshCw, X, Shield, Wallet, Calendar, User, ArrowLeft } from 'lucide-react';
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
import { toast } from 'sonner';
import { invoiceController, InvoiceDTO } from '../../controllers/InvoiceController';
import { paymentController, PaymentMethod } from '../../controllers/PaymentController';
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { userController } from '../../controllers/UserController';
import { UserDTO } from '../../models/User';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { InvoicePdfDocument } from '../receptionist/InvoicePdfDocument';

interface Invoice {
  id: string;
  code: string;
  patientName: string;
  patientCode: string;
  date: string;
  doctor: string;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  method: string;
  invoiceData: InvoiceDTO; // Lưu full invoice data từ backend
}

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

export function AdminFinance() {
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // PDF Preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Detail dialog data
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDTO | null>(null);
  const [patientData, setPatientData] = useState<UserDTO | null>(null);
  const [doctorData, setDoctorData] = useState<UserDTO | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentDTO | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Cache refs
  const appointmentCacheRef = useRef<Record<string, AppointmentDTO>>({});
  const userCacheRef = useRef<Record<string, UserDTO>>({});

  const getAppointment = async (id?: string) => {
    if (!id) return undefined;
    try {
      if (!appointmentCacheRef.current[id]) {
        appointmentCacheRef.current[id] = await appointmentController.getById(id);
      }
      return appointmentCacheRef.current[id];
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      return undefined;
    }
  };

  const getUser = async (id?: string) => {
    if (!id) return undefined;
    try {
      if (!userCacheRef.current[id]) {
        userCacheRef.current[id] = await userController.getById(id);
      }
      return userCacheRef.current[id];
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return undefined;
    }
  };

  // Map backend status to frontend status
  const mapStatusToFrontend = (backendStatus: string): Invoice['status'] => {
    switch (backendStatus) {
      case 'PENDING':
        return 'pending';
      case 'PAID':
        return 'paid';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // Map frontend status to backend status
  const mapStatusToBackend = (frontendStatus: string): string | undefined => {
    switch (frontendStatus) {
      case 'pending':
        return 'PENDING';
      case 'paid':
        return 'PAID';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return undefined;
    }
  };

  // Map invoice from backend
  const mapInvoiceFromBackend = async (invoice: InvoiceDTO): Promise<Invoice> => {
    try {
      const appointment = await getAppointment(invoice.appointmentId);
      const patientUser = await getUser(appointment?.patientId);
      const doctorUser = await getUser(appointment?.doctorId);

      // Lấy phương thức thanh toán từ payment-service
      let paymentMethodText: string | undefined = undefined;

      if (invoice.status === 'PAID') {
        try {
          const payments = await paymentController.getPaymentsByInvoice(invoice.id);
          if (payments.length > 0) {
            const latestPayment = payments[payments.length - 1];
            switch (latestPayment.paymentMethod) {
              case PaymentMethod.CASH:
                paymentMethodText = 'Tiền mặt';
                break;
              case PaymentMethod.BANK_TRANSFER:
                paymentMethodText = 'Chuyển khoản';
                break;
              default:
                paymentMethodText = 'Không xác định';
            }
          }
        } catch (error) {
          console.error('Error fetching payment method for invoice:', invoice.id, error);
          paymentMethodText = invoice.status === 'PAID' ? 'Đã thanh toán' : undefined;
        }
      }

      return {
        id: invoice.id,
        code: invoice.id.substring(0, 8).toUpperCase(),
        patientName: patientUser?.fullName || 'Bệnh nhân',
        patientCode: patientUser?.id
          ? `BN${patientUser.id.slice(-6).toUpperCase()}`
          : '—',
        date: new Date(invoice.issueAt).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        doctor: doctorUser?.fullName || 'BS. Đang cập nhật',
        amount: invoice.patientTotalPay ?? 0,
        status: mapStatusToFrontend(invoice.status),
        method: paymentMethodText || '',
        invoiceData: invoice, // Lưu full data
      };
    } catch (error) {
      console.error(`Error mapping invoice ${invoice.id}:`, error);
      return {
        id: invoice.id,
        code: invoice.id.substring(0, 8).toUpperCase(),
        patientName: 'Bệnh nhân',
        patientCode: '—',
        date: new Date(invoice.issueAt).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        doctor: 'BS. Đang cập nhật',
        amount: invoice.patientTotalPay ?? 0,
        status: mapStatusToFrontend(invoice.status),
        method: '',
        invoiceData: invoice,
      };
    }
  };

  // Load invoices from backend
  const loadInvoices = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const apiStatusFilter = currentTab === 'all' ? undefined : mapStatusToBackend(currentTab);
      const data = await invoiceController.listInvoices(apiStatusFilter);

      const mappedInvoices = await Promise.allSettled(
        data.map((invoice) => mapInvoiceFromBackend(invoice))
      );

      const successfulInvoices = mappedInvoices
        .filter((result): result is PromiseFulfilledResult<Invoice> => result.status === 'fulfilled')
        .map((result) => result.value);

      const failedMappings = mappedInvoices.filter((result) => result.status === 'rejected');
      if (failedMappings.length > 0) {
        console.warn(`${failedMappings.length} invoices failed to map:`, failedMappings);
      }

      console.log('successfulInvoices', successfulInvoices);
      setInvoices(successfulInvoices);

      if (showRefreshIndicator) {
        toast.success('Đã làm mới danh sách hóa đơn');
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn');
      setInvoices([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load invoice detail
  const loadInvoiceDetail = async (invoiceId: string) => {
    setIsLoadingDetail(true);
    try {
      const invoice = await invoiceController.getInvoiceById(invoiceId);
      setInvoiceDetail(invoice);

      // Load appointment
      if (invoice.appointmentId) {
        const appointment = await getAppointment(invoice.appointmentId);
        setAppointmentData(appointment || null);

        // Load patient
        if (appointment?.patientId) {
          const patient = await getUser(appointment.patientId);
          setPatientData(patient || null);
        }

        // Load doctor
        if (appointment?.doctorId) {
          const doctor = await getUser(appointment.doctorId);
          setDoctorData(doctor || null);
        }
      }

      // Load payment data if paid
      if (invoice.status === 'PAID') {
        try {
          const payments = await paymentController.getPaymentsByInvoice(invoiceId);
          if (payments.length > 0) {
            setPaymentData(payments[payments.length - 1]);
          }
        } catch (error) {
          console.error('Error loading payment data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading invoice detail:', error);
      toast.error('Không thể tải chi tiết hóa đơn');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentTab]);

  // Filter invoices based on current tab
  const getFilteredInvoices = () => {
    switch (currentTab) {
      case 'pending':
        return invoices.filter(inv => inv.status === 'pending');
      case 'paid':
        return invoices.filter(inv => inv.status === 'paid');
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
      case 'cancelled':
        return <Badge className="bg-gray-500">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetail = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode('detail');
    await loadInvoiceDetail(invoice.id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedInvoice(null);
    setInvoiceDetail(null);
    setPatientData(null);
    setDoctorData(null);
    setAppointmentData(null);
    setPaymentData(null);
  };

  const handleOpenPrintPreview = () => {
    if (!invoiceDetail || !selectedInvoice) {
      toast.error('Không có dữ liệu hóa đơn để in');
      return;
    }

    if (!invoiceDetail.items || invoiceDetail.items.length === 0) {
      toast.error('Hóa đơn chưa có chi tiết dịch vụ');
      return;
    }

    setPdfError(null);
    setShowPdfPreview(true);
  };

  const handleViewDetailAndPrint = async (invoice: Invoice) => {
    try {
      setSelectedInvoice(invoice);
      setIsLoadingDetail(true);

      // Load invoice detail trực tiếp
      const invoiceData = await invoiceController.getInvoiceById(invoice.id);

      if (!invoiceData || !invoiceData.items || invoiceData.items.length === 0) {
        toast.error('Hóa đơn chưa có chi tiết dịch vụ');
        setIsLoadingDetail(false);
        return;
      }

      // Set invoice detail
      setInvoiceDetail(invoiceData);

      // Load appointment và các thông tin liên quan
      if (invoiceData.appointmentId) {
        const appointment = await getAppointment(invoiceData.appointmentId);
        setAppointmentData(appointment || null);

        if (appointment?.patientId) {
          const patient = await getUser(appointment.patientId);
          setPatientData(patient || null);
        }

        if (appointment?.doctorId) {
          const doctor = await getUser(appointment.doctorId);
          setDoctorData(doctor || null);
        }
      }

      // Load payment data if paid
      if (invoiceData.status === 'PAID') {
        try {
          const payments = await paymentController.getPaymentsByInvoice(invoice.id);
          if (payments.length > 0) {
            setPaymentData(payments[payments.length - 1]);
          }
        } catch (error) {
          console.error('Error loading payment data:', error);
        }
      }

      setIsLoadingDetail(false);

      // Mở PDF preview
      setPdfError(null);
      setShowPdfPreview(true);
    } catch (error) {
      console.error('Error loading invoice detail:', error);
      toast.error('Không thể tải chi tiết hóa đơn');
      setIsLoadingDetail(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceDetail || !selectedInvoice) return;

    try {
      setIsDownloadingPdf(true);

      const items: InvoiceItem[] = invoiceDetail.items.map(item => ({
        id: item.id,
        serviceType: item.serviceType,
        name: item.description || item.serviceType,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        insurancePayAmount: item.insurancePayAmount ?? null,
        patientPayAmount: item.patientPayAmount ?? null,
      }));

      const subtotal = invoiceDetail.totalAmount || items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const insurancePays = invoiceDetail.insuranceTotalPay || items.reduce((sum, item) => sum + (item.insurancePayAmount ?? 0), 0);
      const patientPays = invoiceDetail.patientTotalPay || items.reduce((sum, item) => sum + (item.patientPayAmount ?? 0), 0);

      const docInstance = (
        <InvoicePdfDocument
          invoiceData={invoiceDetail}
          items={items.map(normalizeInvoiceItem)}
          patientData={patientData}
          doctorData={doctorData}
          appointmentData={appointmentData}
          subtotal={subtotal}
          insurancePays={insurancePays}
          patientPays={patientPays}
          isPaid={invoiceDetail.status === 'PAID'}
          paymentData={paymentData}
          paymentMethod={paymentData?.paymentMethod || 'CASH'}
          amountReceived={paymentData?.totalAmount?.toString() || ''}
          change={0}
        />
      );

      const blob = await pdf(docInstance).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const fileName = `HoaDon_${selectedInvoice.code}_${new Date().toISOString().split('T')[0]}.pdf`;
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

  // Calculate statistics
  const unpaidInvoices = invoices.filter(inv => inv.status === 'pending');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const todayRevenue = paidInvoices
    .filter(inv => {
      const paidDate = new Date(inv.invoiceData.paidAt || inv.invoiceData.issueAt);
      return paidDate.toDateString() === new Date().toDateString();
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách hóa đơn...</p>
        </div>
      </div>
    );
  }

  // Nếu đang ở chế độ xem chi tiết, hiển thị full-page view
  if (viewMode === 'detail' && selectedInvoice) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header với gradient background */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#01304e] via-[#05619a] to-[#3fb5ff] text-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">
                      Hóa đơn #{selectedInvoice.code}
                    </h1>
                    {invoiceDetail && (
                      <Badge
                        className={
                          invoiceDetail.status === 'PAID'
                            ? 'bg-green-500 hover:bg-green-600'
                            : invoiceDetail.status === 'PENDING'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-gray-500'
                        }
                      >
                        {invoiceDetail.status === 'PAID'
                          ? '✓ ĐÃ THANH TOÁN'
                          : invoiceDetail.status === 'PENDING'
                            ? '⏳ CHƯA THANH TOÁN'
                            : 'ĐÃ HỦY'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-white/90">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <strong>{patientData?.fullName || selectedInvoice.patientName}</strong>
                      <span className="text-white/70">({selectedInvoice.patientCode})</span>
                    </span>
                    {doctorData && (
                      <>
                        <span>•</span>
                        <span>BS. {doctorData.fullName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleOpenPrintPreview}
                  className="text-white hover:bg-white/20"
                  disabled={!invoiceDetail}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDownloadPdf}
                  className="text-white hover:bg-white/20"
                  disabled={isDownloadingPdf || !invoiceDetail}
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Xuất PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải chi tiết hóa đơn...</p>
              </div>
            </div>
          ) : invoiceDetail ? (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Invoice Info Cards - Grid layout đẹp mắt */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ngày lập</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(invoiceDetail.issueAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mã hóa đơn</p>
                      <p className="text-lg font-bold font-mono text-gray-900">{selectedInvoice.code}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bác sĩ</p>
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {doctorData?.fullName || selectedInvoice.doctor || '—'}
                      </p>
                    </div>
                  </div>
                </Card>

                {selectedInvoice.method && (
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Thanh toán</p>
                        <p className="text-lg font-bold text-gray-900">{selectedInvoice.method}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Invoice Items Table - Card lớn với shadow */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    Chi tiết Dịch vụ/Vật tư
                    {invoiceDetail.items && (
                      <Badge variant="outline" className="ml-2 text-lg px-3 py-1">
                        {invoiceDetail.items.length} mục
                      </Badge>
                    )}
                  </h2>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50">
                        <TableHead className="w-[50px] font-bold text-gray-900">STT</TableHead>
                        <TableHead className="font-bold text-gray-900">Loại</TableHead>
                        <TableHead className="font-bold text-gray-900">Tên Dịch vụ/Vật tư</TableHead>
                        <TableHead className="text-center w-[100px] font-bold text-gray-900">Số lượng</TableHead>
                        <TableHead className="text-right w-[130px] font-bold text-gray-900">Đơn giá</TableHead>
                        <TableHead className="text-right w-[130px] font-bold text-gray-900">Thành tiền</TableHead>
                        <TableHead className="text-right w-[130px] font-bold text-gray-900">
                          <span className="flex items-center justify-end gap-1">
                            <Shield className="w-4 h-4 text-green-600" />
                            BH chi trả
                          </span>
                        </TableHead>
                        <TableHead className="text-right w-[130px] font-bold text-gray-900">
                          <span className="flex items-center justify-end gap-1">
                            <Wallet className="w-4 h-4 text-blue-600" />
                            BN thanh toán
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetail.items?.map((item, index) => {
                        const getServiceIcon = (serviceType: string) => {
                          switch (serviceType) {
                            case 'MEDICINE':
                              return '💊';
                            case 'SERVICE':
                            case 'Dental':
                              return '🦷';
                            default:
                              return '📋';
                          }
                        };

                        return (
                          <TableRow
                            key={item.id || index}
                            className="hover:bg-blue-50/50 transition-colors border-b border-gray-100"
                          >
                            <TableCell className="font-semibold text-gray-700">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getServiceIcon(item.serviceType)}</span>
                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {item.serviceType}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm font-semibold text-gray-900">{item.description || item.serviceType}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-semibold text-gray-700">{item.quantity}</TableCell>
                            <TableCell className="text-right text-gray-700">
                              {item.unitPrice.toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell className="text-right font-bold text-gray-900">
                              {(item.quantity * item.unitPrice).toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-600">
                              {(item.insurancePayAmount ?? 0).toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600">
                              {(item.patientPayAmount ?? 0).toLocaleString('vi-VN')}đ
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals Summary - Styling đẹp mắt */}
                <div className="mt-8 space-y-4 max-w-2xl ml-auto">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-6 h-6 text-gray-500" />
                      <span className="text-lg font-semibold text-gray-700">Tổng cộng</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 ml-8">
                      {invoiceDetail.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* Insurance Payment */}
                  {invoiceDetail.insuranceTotalPay > 0 && (
                    <div className="flex justify-between items-center pb-4 border-b-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 px-6 py-5 rounded-xl shadow-md">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-green-600" />
                        <div>
                          <span className="text-lg font-bold text-green-900">Bảo hiểm chi trả</span>
                          <p className="text-xs text-green-600 mt-0.5">Phần được hỗ trợ</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-600 ml-8">
                        -{invoiceDetail.insuranceTotalPay.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}

                  {/* Patient Payment - Highlight lớn */}
                  <div className="flex justify-between items-center pt-6 bg-gradient-to-r from-blue-100 via-blue-50 to-cyan-50 -mx-6 px-8 py-6 rounded-2xl border-4 border-blue-300 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Wallet className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-blue-900 block">
                          Bệnh nhân thanh toán
                        </span>
                        <p className="text-sm text-blue-600 mt-1">Số tiền cần thu</p>
                      </div>
                    </div>
                    <span className="text-4xl font-black text-[#3FB5FF] ml-8 drop-shadow-lg">
                      {invoiceDetail.patientTotalPay.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Info Card - Nếu đã thanh toán */}
              {invoiceDetail.status === 'PAID' && paymentData && (
                <Card className="p-8 bg-gradient-to-r from-green-100 via-emerald-50 to-green-50 border-4 border-green-300 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-900">Thông tin Thanh toán</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-white/60 rounded-xl">
                      <p className="text-green-700 font-semibold mb-2">Phương thức:</p>
                      <p className="text-xl font-bold text-green-900">
                        {paymentData.paymentMethod === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                      </p>
                    </div>
                    {paymentData.totalAmount && (
                      <div className="p-4 bg-white/60 rounded-xl">
                        <p className="text-green-700 font-semibold mb-2">Số tiền thanh toán:</p>
                        <p className="text-xl font-bold text-green-900">
                          {paymentData.totalAmount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    )}
                    {paymentData.transactionId && (
                      <div className="p-4 bg-white/60 rounded-xl">
                        <p className="text-green-700 font-semibold mb-2">Mã giao dịch:</p>
                        <p className="text-lg font-mono font-bold text-green-900">{paymentData.transactionId}</p>
                      </div>
                    )}
                    {paymentData.paidAt && (
                      <div className="p-4 bg-white/60 rounded-xl">
                        <p className="text-green-700 font-semibold mb-2">Thời gian thanh toán:</p>
                        <p className="text-lg font-bold text-green-900">
                          {new Date(paymentData.paidAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Action Buttons - Floating */}
              <div className="sticky bottom-6 flex justify-end gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleOpenPrintPreview}
                  className="bg-white hover:bg-gray-50 shadow-lg rounded-xl px-6 py-3 text-base font-semibold"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  size="lg"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl rounded-xl px-6 py-3 text-base font-semibold"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Xuất PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Không thể tải chi tiết hóa đơn</p>
              <Button onClick={handleBackToList} className="mt-4">
                Quay lại danh sách
              </Button>
            </div>
          )}
        </div>

        {/* PDF Preview - Fullscreen Overlay */}
        {showPdfPreview && invoiceDetail && selectedInvoice && (
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

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100 relative min-h-0">
              {pdfError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-semibold mb-2">Lỗi khi tải PDF</p>
                    <p className="text-gray-600 text-sm mb-4">{pdfError}</p>
                    <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
                      Đóng
                    </Button>
                  </div>
                </div>
              ) : invoiceDetail.items && invoiceDetail.items.length > 0 ? (
                <div className="w-full h-full" style={{ minHeight: '600px' }}>
                  <PDFViewer width="100%" height="100%">
                    <InvoicePdfDocument
                      invoiceData={invoiceDetail}
                      items={invoiceDetail.items.map(item => ({
                        id: item.id,
                        serviceType: item.serviceType,
                        name: item.description || item.serviceType,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        insurancePayAmount: item.insurancePayAmount ?? null,
                        patientPayAmount: item.patientPayAmount ?? null,
                      })).map(normalizeInvoiceItem)}
                      patientData={patientData}
                      doctorData={doctorData}
                      appointmentData={appointmentData}
                      subtotal={invoiceDetail.totalAmount}
                      insurancePays={invoiceDetail.insuranceTotalPay}
                      patientPays={invoiceDetail.patientTotalPay}
                      isPaid={invoiceDetail.status === 'PAID'}
                      paymentData={paymentData}
                      paymentMethod={paymentData?.paymentMethod || 'CASH'}
                      amountReceived={paymentData?.totalAmount?.toString() || ''}
                      change={0}
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

  // Render danh sách hóa đơn
  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Tài chính</h1>
            <p className="text-sm text-[#333333]/60">Quản lý hóa đơn và thanh toán</p>
          </div>
          <Button
            variant="outline"
            onClick={() => loadInvoices(true)}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Doanh thu hôm nay</p>
                <p className="text-[#01304e]">{todayRevenue.toLocaleString('vi-VN')} ₫</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] cursor-pointer transition-all ${currentTab === 'pending' ? 'ring-2 ring-yellow-400' : ''
            }`}
          onClick={() => setCurrentTab('pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Chờ thanh toán</p>
                <p className="text-[#01304e]">{unpaidInvoices.length} hóa đơn</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] cursor-pointer transition-all ${currentTab === 'paid' ? 'ring-2 ring-[#3FB5FF]' : ''
            }`}
          onClick={() => setCurrentTab('paid')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Đã thanh toán</p>
                <p className="text-[#01304e]">{paidInvoices.length} hóa đơn</p>
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
            Chờ thanh toán ({unpaidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Đã thanh toán ({paidInvoices.length})
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
                        <TableCell className="text-[#333333]">{invoice.code}</TableCell>
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
                            onClick={() => handleViewDetailAndPrint(invoice)}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            In hóa đơn
                          </Button>
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

      {/* PDF Preview - Fullscreen Overlay */}
      {showPdfPreview && invoiceDetail && selectedInvoice && (
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

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden bg-gray-100 relative min-h-0">
            {pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold mb-2">Lỗi khi tải PDF</p>
                  <p className="text-gray-600 text-sm mb-4">{pdfError}</p>
                  <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            ) : invoiceDetail.items && invoiceDetail.items.length > 0 ? (
              <div className="w-full h-full" style={{ minHeight: '600px' }}>
                <PDFViewer width="100%" height="100%">
                  <InvoicePdfDocument
                    invoiceData={invoiceDetail}
                    items={invoiceDetail.items.map(item => ({
                      id: item.id,
                      serviceType: item.serviceType,
                      name: item.description || item.serviceType,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      insurancePayAmount: item.insurancePayAmount ?? null,
                      patientPayAmount: item.patientPayAmount ?? null,
                    })).map(normalizeInvoiceItem)}
                    patientData={patientData}
                    doctorData={doctorData}
                    appointmentData={appointmentData}
                    subtotal={invoiceDetail.totalAmount}
                    insurancePays={invoiceDetail.insuranceTotalPay}
                    patientPays={invoiceDetail.patientTotalPay}
                    isPaid={invoiceDetail.status === 'PAID'}
                    paymentData={paymentData}
                    paymentMethod={paymentData?.paymentMethod || 'CASH'}
                    amountReceived={paymentData?.totalAmount?.toString() || ''}
                    change={0}
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
