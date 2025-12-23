import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";
import {
  invoiceController,
  InvoiceDTO,
} from "../../controllers/InvoiceController";
import { paymentController } from "../../controllers/PaymentController";
import { authController } from "../../controllers/AuthController";

// Mock data - Pending Invoices
const pendingInvoices = [
  {
    id: "HD001234",
    date: "01/11/2024",
    service: "Khám tổng quát + Cạo vôi",
    doctor: "BS. Nguyễn Văn A",
    amount: 2500000,
    dueDate: "30/11/2024",
    status: "pending",
    items: [
      { name: "Khám tổng quát", quantity: 1, price: 200000 },
      { name: "Cạo vôi răng", quantity: 1, price: 500000 },
      { name: "Đánh bóng răng", quantity: 1, price: 300000 },
      { name: "Chụp X-quang", quantity: 2, price: 1500000 },
    ],
  },
  {
    id: "HD001235",
    date: "05/11/2024",
    service: "Tái khám niềng răng (Đợt 2)",
    doctor: "BS. Trần Thị B",
    amount: 5000000,
    dueDate: "20/11/2024",
    status: "pending",
    items: [
      { name: "Tái khám niềng răng", quantity: 1, price: 1000000 },
      { name: "Thay khay invisalign mới", quantity: 1, price: 4000000 },
    ],
  },
];

// Mock data - Paid Invoices
const paidInvoices = [
  {
    id: "HD001233",
    date: "15/10/2024",
    service: "Tẩy trắng răng",
    doctor: "BS. Phạm Thị D",
    amount: 3500000,
    paidDate: "16/10/2024",
    paymentMethod: "Chuyển khoản",
    status: "paid",
  },
  {
    id: "HD001232",
    date: "01/10/2024",
    service: "Cạo vôi răng",
    doctor: "BS. Lê Văn C",
    amount: 500000,
    paidDate: "01/10/2024",
    paymentMethod: "Tiền mặt",
    status: "paid",
  },
  {
    id: "HD001231",
    date: "15/09/2024",
    service: "Khám định kỳ + Chụp X-quang",
    doctor: "BS. Nguyễn Văn A",
    amount: 300000,
    paidDate: "15/09/2024",
    paymentMethod: "Tiền mặt",
    status: "paid",
  },
  {
    id: "HD001230",
    date: "01/09/2024",
    service: "Điều trị tủy răng (Đợt 3)",
    doctor: "BS. Nguyễn Văn A",
    amount: 2500000,
    paidDate: "02/09/2024",
    paymentMethod: "Chuyển khoản",
    status: "paid",
  },
  {
    id: "HD001229",
    date: "15/08/2024",
    service: "Niềng răng (Đợt 1)",
    doctor: "BS. Trần Thị B",
    amount: 20000000,
    paidDate: "16/08/2024",
    paymentMethod: "Chuyển khoản",
    status: "paid",
  },
];

// Mock data - InvoiceDisplay
const mockInvoices: InvoiceDisplay[] = [
  {
    id: "HD001234",
    date: "01/11/2024",
    service: "Khám tổng quát + Cạo vôi",
    doctor: "BS. Nguyễn Văn A",
    amount: 2500000,
    dueDate: "30/11/2024",
    status: "pending",
    items: [
      { name: "Khám tổng quát", quantity: 1, price: 200000 },
      { name: "Cạo vôi răng", quantity: 1, price: 500000 },
      { name: "Đánh bóng răng", quantity: 1, price: 300000 },
      { name: "Chụp X-quang", quantity: 2, price: 1500000 },
    ],
    patientId: "PAT001",
  },
  {
    id: "HD001235",
    date: "05/11/2024",
    service: "Tái khám niềng răng (Đợt 2)",
    doctor: "BS. Trần Thị B",
    amount: 5000000,
    dueDate: "20/11/2024",
    status: "pending",
    items: [
      { name: "Tái khám niềng răng", quantity: 1, price: 1000000 },
      { name: "Thay khay invisalign mới", quantity: 1, price: 4000000 },
    ],
    patientId: "PAT001",
  },
  {
    id: "HD001233",
    date: "15/10/2024",
    service: "Tẩy trắng răng",
    doctor: "BS. Phạm Thị D",
    amount: 3500000,
    paidDate: "16/10/2024",
    paymentMethod: "Chuyển khoản",
    status: "paid",
    items: [{ name: "Tẩy trắng răng", quantity: 1, price: 3500000 }],
    patientId: "PAT002",
  },
  {
    id: "HD001232",
    date: "01/10/2024",
    service: "Cạo vôi răng",
    doctor: "BS. Lê Văn C",
    amount: 500000,
    paidDate: "01/10/2024",
    paymentMethod: "Tiền mặt",
    status: "paid",
    items: [{ name: "Cạo vôi răng", quantity: 1, price: 500000 }],
    patientId: "PAT002",
  },
  {
    id: "HD001231",
    date: "15/09/2024",
    service: "Khám định kỳ + Chụp X-quang",
    doctor: "BS. Nguyễn Văn A",
    amount: 300000,
    paidDate: "15/09/2024",
    paymentMethod: "Tiền mặt",
    status: "paid",
    items: [
      { name: "Khám định kỳ", quantity: 1, price: 100000 },
      { name: "Chụp X-quang", quantity: 1, price: 200000 },
    ],
    patientId: "PAT001",
  },
  {
    id: "HD001230",
    date: "01/09/2024",
    service: "Điều trị tủy răng (Đợt 3)",
    doctor: "BS. Nguyễn Văn A",
    amount: 2500000,
    paidDate: "02/09/2024",
    paymentMethod: "Chuyển khoản",
    status: "paid",
    items: [{ name: "Điều trị tủy răng", quantity: 1, price: 2500000 }],
    patientId: "PAT001",
  },
  {
    id: "HD001229",
    date: "15/08/2024",
    service: "Niềng răng (Đợt 1)",
    doctor: "BS. Trần Thị B",
    amount: 20000000,
    paidDate: "16/08/2024",
    paymentMethod: "Chuyển khoản",
    status: "paid",
    items: [{ name: "Niềng răng", quantity: 1, price: 20000000 }],
    patientId: "PAT002",
  },
];

// Mock data - PaymentMethod
const mockPaymentMethods = [
  { id: "bank_transfer", name: "Chuyển khoản ngân hàng" },
  { id: "credit_card", name: "Thẻ tín dụng/ghi nợ" },
  { id: "cash", name: "Tiền mặt tại phòng khám" },
];

// Mock data - InvoiceDisplay
interface InvoiceDisplay {
  id: string;
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

// Mock data - PaymentMethod
interface PaymentMethod {
  id: string;
  name: string;
}

// Mock data - InvoiceDTO
interface InvoiceDTO {
  id: string;
  date: string;
  service: string;
  doctor: string;
  amount: number;
  dueDate?: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  patientId: string;
  issueAt: string; // Added for backend mapping
  paidAt?: string; // Added for backend mapping
  totalAmount?: number; // Added for backend mapping
  insuranceTotalPay?: number; // Added for backend mapping
  patientTotalPay?: number; // Added for backend mapping
  appointmentId?: string; // Added for backend mapping
}

// Mock data - InvoiceResponseDTO
interface InvoiceResponseDTO {
  id: string;
  date: string;
  service: string;
  doctor: string;
  amount: number;
  paidDate?: string;
  paymentMethod?: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  patientId: string;
}

// Map backend invoice to display format
const mapInvoiceFromBackend = (invoice: InvoiceDTO): InvoiceDisplay => {
  const status: "pending" | "paid" | "cancelled" =
    invoice.status === "PAID"
      ? "paid"
      : invoice.status === "CANCELLED"
      ? "cancelled"
      : "pending";

  return {
    id: invoice.id.substring(0, 8).toUpperCase(),
    date: new Date(invoice.issueAt).toLocaleDateString("vi-VN"),
    service: invoice.items
      .map((item) => item.description || item.serviceType)
      .join(", "),
    doctor: "BS. Đang cập nhật", // TODO: Get from appointment
    amount: invoice.totalAmount || 0, // ← Thêm || 0
    patientId: invoice.appointmentId || "", // TODO: Map properly
    insurancePays: invoice.insuranceTotalPay || 0, // ← Thêm || 0
    patientPays: invoice.patientTotalPay || 0, // ← Thêm || 0
    paidDate: invoice.paidAt
      ? new Date(invoice.paidAt).toLocaleDateString("vi-VN")
      : undefined,
    status,
    items: invoice.items.map((item) => ({
      name: item.description || item.serviceType || "Dịch vụ", // ← Thêm fallback
      quantity: item.quantity || 1, // ← Thêm fallback
      price: item.unitPrice || 0, // ← MAP unitPrice -> price, thêm fallback
      insurancePayAmount: item.insurancePayAmount || 0, // ← Thêm || 0
      patientPayAmount: item.patientPayAmount || 0, // ← Thêm || 0
    })),
  };
};

// Mock data - getMockInvoices
const getMockInvoices = (): InvoiceDisplay[] => {
  return mockInvoices;
};

export function PatientPayment() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDisplay | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Backend data
  const [invoices, setInvoices] = useState<InvoiceDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

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
      // Gọi API lấy invoices của patient này
      const data = await invoiceController.getInvoicesByPatient(
        currentPatientId
      );

      const mappedInvoices: InvoiceDisplay[] = data.map(mapInvoiceFromBackend);
      setInvoices(mappedInvoices);

      console.log(
        `✅ Loaded ${mappedInvoices.length} invoices for patient ${currentPatientId}`
      );
    } catch (error) {
      console.error("Error loading patient invoices:", error);

      // Nếu endpoint chưa có, fallback về list all và filter client-side
      try {
        console.log("⚠️ Fallback: Trying to load all invoices and filter...");
        const allInvoices = await invoiceController.listInvoices();

        // TODO: Filter by patientId - cần field patientId trong InvoiceDTO
        // Hiện tại fallback về mock data
        const mappedInvoices: InvoiceDisplay[] = allInvoices.map(
          mapInvoiceFromBackend
        );
        setInvoices(mappedInvoices);

        toast.warning("Đang sử dụng chế độ dev (hiển thị tất cả hóa đơn)");
      } catch (fallbackError) {
        toast.error("Không thể tải danh sách hóa đơn");
        // Fallback to mock data
        setInvoices(getMockInvoices());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = (invoice: InvoiceDisplay) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Đang tải xuống hóa đơn ${invoiceId}...`);
  };

  const handleConfirmPayment = () => {
    toast.success("Thanh toán thành công!");
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
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
  const cancelledInvoices = searchFilteredInvoices.filter(
    (inv) => inv.status === "cancelled"
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
            {currentPatientId && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium text-xs">
                ID: {currentPatientId.substring(0, 8).toUpperCase()}
              </span>
            )}
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
                            <p className="font-medium text-red-600 text-sm">
                              Hạn thanh toán: {invoice.dueDate}
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

                      {/* Right side - Actions */}
                      <div className="flex lg:flex-col gap-3 lg:w-44">
                        <button
                          onClick={() => handlePayNow(invoice)}
                          className="flex-1 lg:flex-none bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4.5 h-4.5" />
                          Thanh toán
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="flex-1 lg:flex-none bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] px-5 py-3.5 rounded-xl font-semibold text-sm hover:bg-[var(--accent-ghost)] transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4.5 h-4.5" />
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
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="flex-1 lg:flex-none bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] px-5 py-3.5 rounded-xl font-semibold text-sm hover:bg-[var(--accent-ghost)] transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4.5 h-4.5" />
                          Tải xuống
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="typo-h3 text-[var(--text-strong)]">
                Thanh toán hóa đơn
              </DialogTitle>
              <DialogDescription>
                Chọn phương thức thanh toán của bạn
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Invoice Summary */}
                <div className="bg-[var(--accent-ghost)] rounded-2xl p-5">
                  <p className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-3">
                    Thông tin hóa đơn
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--text-regular)]">
                        Mã hóa đơn:
                      </span>
                      <span className="font-semibold text-[var(--text-strong)] text-sm">
                        #{selectedInvoice.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--text-regular)]">
                        Dịch vụ:
                      </span>
                      <span className="font-medium text-[var(--text-regular)] text-sm">
                        {selectedInvoice.service}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-[var(--border-soft)] flex justify-between">
                      <span className="font-semibold text-[var(--text-strong)] text-base">
                        Tổng tiền:
                      </span>
                      <span className="typo-h4 text-[var(--accent-light)]">
                        {selectedInvoice.amount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="font-medium text-[var(--text-strong)] text-sm mb-3">
                    Phương thức thanh toán
                  </p>

                  <button className="w-full bg-white border-2 border-[var(--accent-light)] rounded-xl p-4 hover:bg-[var(--accent-ghost)] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--accent-light)] rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-strong)] text-sm">
                          Chuyển khoản ngân hàng
                        </p>
                        <p className="text-xs text-[var(--text-regular)] opacity-70">
                          Thanh toán qua VietQR, Internet Banking
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[var(--accent-light)] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-strong)] text-sm">
                          Thẻ tín dụng/ghi nợ
                        </p>
                        <p className="text-xs text-[var(--text-regular)] opacity-70">
                          Visa, Mastercard, JCB
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[var(--accent-light)] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-strong)] text-sm">
                          Tiền mặt tại phòng khám
                        </p>
                        <p className="text-xs text-[var(--text-regular)] opacity-70">
                          Thanh toán khi đến khám
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1 font-medium"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className="flex-1 bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] font-semibold"
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
