import { useState, useEffect } from "react";
import {
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  invoiceController, InvoiceDTO
} from "../../controllers/InvoiceController";
import { authController } from "../../controllers/AuthController";
import { appointmentController, AppointmentDTO } from "../../controllers/AppointmentController";
import { userController } from "../../controllers/UserController";
import { UserDTO } from "../../models/User";
import { pdf } from '@react-pdf/renderer';
import { InvoicePdfDocument } from '../receptionist/InvoicePdfDocument';

// InvoiceDisplay interface
interface InvoiceDisplay {
  id: string; // Display ID (shortened)
  invoiceId: string; // Original invoice ID from backend
  date: string;
  service: string;
  doctor: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  patientId: string;
  insurancePays?: number; // Added for backend mapping
  patientPays?: number; // Added for backend mapping
}

// Map backend invoice to display format
const mapInvoiceFromBackend = (invoice: InvoiceDTO, doctorName?: string): InvoiceDisplay => {
  const status: "pending" | "paid" | "cancelled" =
    invoice.status === "PAID"
      ? "paid"
      : invoice.status === "CANCELLED"
        ? "cancelled"
        : "pending";

  return {
    id: invoice.id.slice(-8).toUpperCase(),
    invoiceId: invoice.id, // Store original invoice ID
    date: new Date(invoice.issueAt).toLocaleDateString("vi-VN"),
    service: invoice.items
      .map((item) => item.description || item.serviceType)
      .join(", "),
    doctor: doctorName || "BS. Đang cập nhật", // Use provided doctor name
    amount: invoice.totalAmount || 0,
    patientId: invoice.appointmentId || "",
    insurancePays: invoice.insuranceTotalPay || 0,
    patientPays: invoice.patientTotalPay || 0,
    paidDate: invoice.paidAt
      ? new Date(invoice.paidAt).toLocaleDateString("vi-VN")
      : undefined,
    status,
    items: invoice.items.map((item) => ({
      name: item.description || item.serviceType || "Dịch vụ",
      quantity: item.quantity || 1,
      price: item.unitPrice || 0,
      insurancePayAmount: item.insurancePayAmount || 0,
      patientPayAmount: item.patientPayAmount || 0,
    })),
  };
};

export function PatientPayment() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Backend data
  const [invoices, setInvoices] = useState<InvoiceDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // PDF download state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Get current patient
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  // Get patient ID on mount
  useEffect(() => {
    const user = authController.getCurrentUser();
    if (user) {
      // Giả sử patientId = userId cho patient role
      // Nếu cần mapping khác, có thể gọi thêm API
      setCurrentPatientId(user.id);
      console.log("Current patient ID:", user.id);
    } else {
      toast.error("Vui lòng đăng nhập để xem hóa đơn");
      setIsLoading(false);
    }
  }, []);

  // Load invoices when patientId is available
  useEffect(() => {
    if (currentPatientId) {
      loadInvoices();
    }
  }, [currentPatientId]);

  const loadInvoices = async () => {
    if (!currentPatientId) {
      console.error("No patient ID available");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API lấy invoices của patient này - CHỈ lấy invoices của patient
      const invoices = await invoiceController.getInvoicesByPatient(
        currentPatientId
      );

      // Lấy thông tin appointment và doctor cho mỗi invoice
      const mappedInvoices: InvoiceDisplay[] = await Promise.all(
        invoices.map(async (invoice) => {
          let doctorName = "BS. Đang cập nhật";

          try {
            // Lấy appointment từ appointmentId
            const appointment = await appointmentController.getById(invoice.appointmentId);

            // Lấy thông tin bác sĩ từ doctorId
            if (appointment?.doctorId) {
              try {
                const doctor = await userController.getById(appointment.doctorId);
                doctorName = doctor.fullName || `BS. ${appointment.doctorId.substring(0, 8)}`;
              } catch (error) {
                console.warn("Failed to load doctor name:", appointment.doctorId);
              }
            }
          } catch (error) {
            console.warn("Failed to load appointment for invoice:", invoice.id, error);
          }

          return mapInvoiceFromBackend(invoice, doctorName);
        })
      );
      setInvoices(mappedInvoices);

      console.log(
        `✅ Loaded ${mappedInvoices.length} invoices for patient ${currentPatientId}`
      );
    } catch (error) {
      console.error("Error loading patient invoices:", error);
      toast.error("Không thể tải danh sách hóa đơn");
      // Không fallback về mock data hoặc all invoices - chỉ hiển thị empty
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setIsDownloadingPdf(true);
      setDownloadingInvoiceId(invoiceId);

      // 1. Load invoice data từ backend
      const invoiceData = await invoiceController.getInvoiceById(invoiceId);

      // 2. Load appointment data
      let appointmentData: AppointmentDTO | null = null;
      let patientData: UserDTO | null = null;
      let doctorData: UserDTO | null = null;

      if (invoiceData.appointmentId) {
        try {
          appointmentData = await appointmentController.getById(invoiceData.appointmentId);

          // 3. Load patient data
          if (appointmentData.patientId) {
            try {
              patientData = await userController.getById(appointmentData.patientId);
            } catch (error) {
              console.warn('Failed to load patient data:', error);
            }
          }

          // 4. Load doctor data
          if (appointmentData.doctorId) {
            try {
              doctorData = await userController.getById(appointmentData.doctorId);
            } catch (error) {
              console.warn('Failed to load doctor data:', error);
            }
          }
        } catch (error) {
          console.warn('Failed to load appointment data:', error);
        }
      }

      // 5. Map invoice items
      const normalizedItems = invoiceData.items.map(item => ({
        serviceType: item.serviceType || 'SERVICE',
        name: item.description || item.serviceType || 'Dịch vụ',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        insurancePayAmount: item.insurancePayAmount || 0,
        patientPayAmount: item.patientPayAmount || 0,
      }));

      // 6. Calculate totals
      const subtotal = invoiceData.totalAmount || 0;
      const insurancePays = invoiceData.insuranceTotalPay || 0;
      const patientPays = invoiceData.patientTotalPay || 0;
      const isPaid = invoiceData.status === 'PAID';

      // 7. Load payment data nếu đã thanh toán
      let paymentData = null;
      if (isPaid) {
        try {
          const { paymentController } = await import('../../controllers/PaymentController');
          paymentData = await paymentController.getPaymentStatus(invoiceId);
        } catch (error) {
          console.warn('Failed to load payment data:', error);
        }
      }

      // 8. Tạo PDF document
      const docInstance = (
        <InvoicePdfDocument
          invoiceData={invoiceData}
          items={normalizedItems}
          patientData={patientData}
          doctorData={doctorData}
          appointmentData={appointmentData}
          subtotal={subtotal}
          insurancePays={insurancePays}
          patientPays={patientPays}
          isPaid={isPaid}
          paymentData={paymentData}
          paymentMethod={paymentData?.paymentMethod || 'CASH'}
          amountReceived=""
          change={0}
        />
      );

      // 9. Generate và download PDF
      const blob = await pdf(docInstance).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const displayInvoiceCode = invoiceData.id.slice(-8).toUpperCase();
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
      setDownloadingInvoiceId(null);
    }
  };

  // ===== FILTER INVOICES THEO STATUS TỪ BACKEND =====

  // Filter theo search query
  const searchFilteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Split invoices theo status từ backend
  const pendingInvoices = searchFilteredInvoices.filter(
    (inv) => inv.status === "pending"
  );
  const paidInvoices = searchFilteredInvoices.filter(
    (inv) => inv.status === "paid"
  );

  // Tính tổng tiền
  const totalPending = pendingInvoices.reduce(
    (sum, inv) => sum + (inv.patientPays || inv.amount || 0),
    0
  );
  const totalPaid = paidInvoices.reduce(
    (sum, inv) => sum + (inv.patientPays || inv.amount || 0),
    0
  );

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[var(--accent-light)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-regular)] opacity-70">
              Đang tải danh sách hóa đơn...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="typo-h1 text-[var(--text-strong)]">
              Thanh toán & Hóa đơn
            </h1>
            {/* {currentPatientId && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium text-xs">
                ID: {currentPatientId.substring(0, 8).toUpperCase()}
              </span>
            )} */}
          </div>
          <p className="text-base text-[var(--text-regular)] opacity-70">
            Quản lý các hóa đơn và thanh toán của bạn
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Card className="p-6 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg font-medium text-xs">
                {pendingInvoices.length} hóa đơn
              </span>
            </div>
            <p className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
              Chờ thanh toán
            </p>
            <p className="typo-h2 text-orange-600">
              {totalPending.toLocaleString("vi-VN")}đ
            </p>
          </Card>

          <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg font-medium text-xs">
                {paidInvoices.length} hóa đơn
              </span>
            </div>
            <p className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
              Đã thanh toán
            </p>
            <p className="typo-h2 text-green-600">
              {totalPaid.toLocaleString("vi-VN")}đ
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pending" className="font-medium">
                Chờ thanh toán ({pendingInvoices.length})
              </TabsTrigger>
              <TabsTrigger value="paid" className="font-medium">
                Đã thanh toán ({paidInvoices.length})
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-regular)] opacity-70" />
              <Input
                placeholder="Tìm mã hóa đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Pending Invoices Tab */}
          <TabsContent value="pending" className="space-y-5">
            {pendingInvoices.length === 0 ? (
              <Card className="p-10 text-center border-[var(--border-soft)] bg-[var(--surface-bg)]">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="typo-h4 text-[var(--text-strong)] mb-2">
                  Không có hóa đơn chờ thanh toán
                </h3>
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  Bạn đã thanh toán tất cả các hóa đơn
                </p>
              </Card>
            ) : (
              <>
                {pendingInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="p-6 md:p-8 border-orange-200 bg-gradient-to-br from-orange-50/50 to-white"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left side - Invoice details */}
                      <div className="flex-1 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="typo-h3 text-[var(--text-strong)]">
                                Hóa đơn #{invoice.id}
                              </h3>
                              <span className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg font-medium text-xs flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Chờ thanh toán
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-regular)] opacity-70 mb-1">
                              Ngày tạo: {invoice.date}
                            </p>
                          </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="bg-white border border-orange-200 rounded-xl p-5">
                          <p className="font-semibold text-[var(--text-strong)] text-base mb-4">
                            Chi tiết hóa đơn
                          </p>
                          <div className="space-y-3">
                            {invoice.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <span className="text-sm text-[var(--text-regular)]">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-[var(--text-regular)] opacity-70 ml-2">
                                    x{item.quantity}
                                  </span>
                                </div>
                                <span className="font-medium text-[var(--text-regular)] text-sm">
                                  {item.price.toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                            ))}
                            <div className="pt-3 mt-3 border-t border-orange-200 flex items-center justify-between">
                              <span className="font-semibold text-[var(--text-strong)] text-base">
                                Tổng cộng:
                              </span>
                              <span className="typo-h4 text-orange-600">
                                {invoice.amount.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[var(--text-regular)] opacity-70">
                          <span className="text-sm">
                            Bác sĩ: {invoice.doctor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Paid Invoices Tab */}
          <TabsContent value="paid" className="space-y-5">
            {paidInvoices.length === 0 ? (
              <Card className="p-10 text-center border-[var(--border-soft)] bg-[var(--surface-bg)]">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="typo-h4 text-[var(--text-strong)] mb-2">
                  Chưa có hóa đơn đã thanh toán
                </h3>
                <p className="text-sm text-[var(--text-regular)] opacity-70">
                  Bạn chưa thanh toán hóa đơn nào
                </p>
              </Card>
            ) : (
              <>
                {paidInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left side - Invoice details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="typo-h4 text-[var(--text-strong)]">
                                Hóa đơn #{invoice.id}
                              </h3>
                              <span className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg font-medium text-xs flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Đã thanh toán
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-regular)] opacity-70">
                              {invoice.service}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="typo-h4 text-[var(--text-strong)] mb-1">
                              {invoice.amount.toLocaleString("vi-VN")}đ
                            </p>
                            <p className="text-xs text-[var(--text-regular)] opacity-70">
                              {invoice.paymentMethod}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-[var(--accent-ghost)] rounded-xl p-3">
                            <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                              Ngày khám
                            </p>
                            <p className="font-semibold text-[var(--text-strong)] text-sm">
                              {invoice.date}
                            </p>
                          </div>
                          <div className="bg-[var(--accent-ghost)] rounded-xl p-3">
                            <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                              Ngày thanh toán
                            </p>
                            <p className="font-semibold text-[var(--text-strong)] text-sm">
                              {invoice.paidDate}
                            </p>
                          </div>
                          <div className="bg-[var(--accent-ghost)] rounded-xl p-3">
                            <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                              Bác sĩ
                            </p>
                            <p className="font-semibold text-[var(--text-strong)] text-sm">
                              {invoice.doctor}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Download button */}
                      <div className="flex lg:flex-col gap-3 lg:w-40 lg:justify-center">
                        <button
                          onClick={() => handleDownloadInvoice(invoice.invoiceId)}
                          disabled={isDownloadingPdf && downloadingInvoiceId === invoice.invoiceId}
                          className="flex-1 lg:flex-none bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] px-5 py-3.5 rounded-xl font-semibold text-sm hover:bg-[var(--accent-ghost)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDownloadingPdf && downloadingInvoiceId === invoice.invoiceId ? (
                            <>
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <Download className="w-4.5 h-4.5" />
                              Tải xuống
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
