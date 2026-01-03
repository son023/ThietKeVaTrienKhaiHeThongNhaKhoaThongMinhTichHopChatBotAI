import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, DollarSign, FileText, Calendar, User, Filter, Loader2, RefreshCw } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { invoiceController, InvoiceDTO } from '../../controllers/InvoiceController';
import { paymentController, PaymentMethod } from '../../controllers/PaymentController';
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
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { UserDTO } from '../../models/User';
import { userController } from '../../controllers/UserController';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

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
  onViewInvoice: (invoiceId: string, mode?: 'view' | 'payment') => void;
  onCreateInvoice: () => void;
}

export function ReceptionistInvoiceList({ onViewInvoice, onCreateInvoice }: ReceptionistInvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  // Backend data state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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


  // Load invoices from backend
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Get status filter for API (convert 'all' to undefined)
      const apiStatusFilter = statusFilter === 'all' ? undefined : mapStatusToBackend(statusFilter);

      const data = await invoiceController.listInvoices(apiStatusFilter);

      console.log('Raw invoice data from backend:', data);
      console.log(`Received ${data.length} invoices from backend`);

      // Map backend data to frontend format with error handling
      const mappedInvoices = await Promise.allSettled(
        data.map((invoice) => mapInvoiceFromBackend(invoice))
      );

      // Filter out failed mappings and extract successful ones
      const successfulInvoices = mappedInvoices
        .filter((result): result is PromiseFulfilledResult<Invoice> => result.status === 'fulfilled')
        .map((result) => result.value);

      const failedMappings = mappedInvoices.filter((result) => result.status === 'rejected');
      if (failedMappings.length > 0) {
        console.warn(`${failedMappings.length} invoices failed to map:`, failedMappings);
      }

      console.log(`Successfully mapped ${successfulInvoices.length} invoices`);
      setInvoices(successfulInvoices);

      if (showRefreshIndicator) {
        toast.success('Đã làm mới danh sách hóa đơn');
      }

      console.log(`Loaded ${mappedInvoices.length} invoices from backend`);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn');
      setInvoices([]);
    }
    finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Map backend status to frontend status
  const mapStatusToFrontend = (backendStatus: string): Invoice['status'] => {
    switch (backendStatus) {
      case 'PENDING':
      case 'DRAFT':
        return 'unpaid';
      case 'PAID':
        return 'paid';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'unpaid';
    }
  };

  // Map frontend status to backend status
  const mapStatusToBackend = (frontendStatus: string): string => {
    switch (frontendStatus) {
      case 'unpaid':
        return 'PENDING';
      case 'paid':
        return 'PAID';
      case 'cancelled':
        return 'CANCELLED';
      case 'partial':
        return 'PENDING';
      default:
        return 'PENDING';
    }
  };


  const mapInvoiceFromBackend = async (invoice: InvoiceDTO): Promise<Invoice> => {
    try {
      console.log(`Mapping invoice ${invoice.id}, appointmentId: ${invoice.appointmentId}`);
      
      const appointment = await getAppointment(invoice.appointmentId);
      console.log(`Appointment for ${invoice.id}:`, appointment ? 'found' : 'not found');
      
      const patientUser = await getUser(appointment?.patientId);
      const doctorUser = await getUser(appointment?.doctorId);

      // Lấy phương thức thanh toán từ payment-service
      let paymentMethodText: string | undefined = undefined;

      if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
        try {
          const payments = await paymentController.getPaymentsByInvoice(invoice.id);

          if (payments.length > 0) {
            // Lấy payment gần nhất (payment cuối cùng trong mảng)
            const latestPayment = payments[payments.length - 1];

            // Map payment method sang tiếng Việt
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
          // Fallback nếu lỗi
          paymentMethodText = invoice.status === 'PAID' ? 'Đã thanh toán' : undefined;
        }
      }

      const mappedInvoice = {
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
        paymentMethod: paymentMethodText,
      };

      console.log(`Successfully mapped invoice ${invoice.id}:`, mappedInvoice);
      return mappedInvoice;
    } catch (error) {
      console.error(`Error mapping invoice ${invoice.id}:`, error);
      // Return a basic invoice even if mapping fails partially
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
        paymentMethod: undefined,
      };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Chưa thanh toán</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đã thanh toán</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Thanh toán một phần</Badge>;
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

  // Pagination calculations for all invoices
  const totalAllInvoices = filteredInvoices.length;
  const totalPagesAll = Math.ceil(totalAllInvoices / itemsPerPage);
  const startIndexAll = (currentPage - 1) * itemsPerPage;
  const endIndexAll = startIndexAll + itemsPerPage;
  const paginatedAllInvoices = filteredInvoices.slice(startIndexAll, endIndexAll);

  // Pagination calculations for unpaid invoices
  const totalUnpaidInvoices = unpaidInvoices.length;
  const totalPagesUnpaid = Math.ceil(totalUnpaidInvoices / itemsPerPage);
  const startIndexUnpaid = (currentPage - 1) * itemsPerPage;
  const endIndexUnpaid = startIndexUnpaid + itemsPerPage;
  const paginatedUnpaidInvoices = unpaidInvoices.slice(startIndexUnpaid, endIndexUnpaid);

  // Pagination calculations for paid invoices
  const totalPaidInvoices = paidInvoices.length;
  const totalPagesPaid = Math.ceil(totalPaidInvoices / itemsPerPage);
  const startIndexPaid = (currentPage - 1) * itemsPerPage;
  const endIndexPaid = startIndexPaid + itemsPerPage;
  const paginatedPaidInvoices = paidInvoices.slice(startIndexPaid, endIndexPaid);

  // Pagination calculations for partial invoices
  const totalPartialInvoices = partialInvoices.length;
  const totalPagesPartial = Math.ceil(totalPartialInvoices / itemsPerPage);
  const startIndexPartial = (currentPage - 1) * itemsPerPage;
  const endIndexPartial = startIndexPartial + itemsPerPage;
  const paginatedPartialInvoices = partialInvoices.slice(startIndexPartial, endIndexPartial);

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Loading state
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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-neutral-heading">Thanh toán & Hóa đơn</h1>
          </div>
          <p className="text-neutral-text/70 font-medium">Quản lý hóa đơn và thanh toán</p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            onClick={onCreateInvoice}
            className="bg-primary hover:bg-primary-strong rounded-[15px] shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Hóa đơn mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-text/70 font-medium">Chờ thanh toán</span>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl text-neutral-heading font-bold mb-1">{unpaidInvoices.length}</p>
          <p className="text-xs text-neutral-text/60">{totalUnpaid.toLocaleString('vi-VN')}đ</p>
        </Card>

        <Card className="p-4 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-text/70 font-medium">Đã thanh toán</span>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl text-neutral-heading font-bold mb-1">{paidInvoices.length}</p>
          <p className="text-xs text-neutral-text/60">{totalPaid.toLocaleString('vi-VN')}đ</p>
        </Card>

        <Card className="p-4 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-text/70 font-medium">Thanh toán một phần</span>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl text-neutral-heading font-bold mb-1">{partialInvoices.length}</p>
          <p className="text-xs text-neutral-text/60">Cần hoàn tất</p>
        </Card>

        <Card className="p-4 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-text/70 font-medium">Tổng doanh thu hôm nay</span>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl text-primary font-bold">{totalPaid.toLocaleString('vi-VN')}đ</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-neutral-border bg-neutral-surface shadow-sm">
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
          <TabsTrigger value="partial">
            Thanh toán một phần ({partialInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-neutral-border bg-neutral-surface shadow-sm">
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
                {paginatedAllInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-neutral-muted/20 transition-colors border-b border-neutral-border">
                    <TableCell className="font-mono text-neutral-text">{invoice.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-neutral-heading font-medium">{invoice.patientName}</p>
                        <p className="text-xs text-neutral-text/60">{invoice.patientCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-text">{invoice.date}</TableCell>
                    <TableCell className="text-sm text-neutral-text">{invoice.doctor}</TableCell>
                    <TableCell className="text-right text-neutral-heading font-semibold">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-sm text-neutral-text">
                      {invoice.paymentMethod || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === 'unpaid' && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary-strong transition-all duration-200"
                            onClick={() => onViewInvoice(invoice.id, 'payment')}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Thanh toán
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all"
                          onClick={() => onViewInvoice(invoice.id, 'view')}
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
                <FileText className="w-12 h-12 text-neutral-text/20 mx-auto mb-3" />
                <p className="text-neutral-text/60 font-medium">Không tìm thấy hóa đơn</p>
              </div>
            )}

            {/* Total Count */}
            {totalAllInvoices > 0 && (
              <div className="px-6 py-3 border-t border-neutral-border">
                <div className="text-sm text-neutral-text/70">
                  Hiển thị <span className="font-medium text-neutral-text">{startIndexAll + 1}</span> đến{" "}
                  <span className="font-medium text-neutral-text">{Math.min(endIndexAll, totalAllInvoices)}</span> trong tổng số{" "}
                  <span className="font-medium text-neutral-text">{totalAllInvoices}</span> hóa đơn
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPagesAll > 1 && (
              <div className="flex justify-center px-6 py-4 border-t border-neutral-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPagesAll }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPagesAll ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPagesAll, prev + 1))}
                        className={currentPage === totalPagesAll ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="unpaid">
          <Card className="border-neutral-border bg-neutral-surface shadow-sm">
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
                {paginatedUnpaidInvoices.map((invoice) => (
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
                        onClick={() => onViewInvoice(invoice.id, 'payment')}
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

            {/* Total Count */}
            {totalUnpaidInvoices > 0 && (
              <div className="px-6 py-3 border-t border-neutral-border">
                <div className="text-sm text-neutral-text/70">
                  Hiển thị <span className="font-medium text-neutral-text">{startIndexUnpaid + 1}</span> đến{" "}
                  <span className="font-medium text-neutral-text">{Math.min(endIndexUnpaid, totalUnpaidInvoices)}</span> trong tổng số{" "}
                  <span className="font-medium text-neutral-text">{totalUnpaidInvoices}</span> hóa đơn
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPagesUnpaid > 1 && (
              <div className="flex justify-center px-6 py-4 border-t border-neutral-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPagesUnpaid }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPagesUnpaid ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPagesUnpaid, prev + 1))}
                        className={currentPage === totalPagesUnpaid ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card className="border-neutral-border bg-neutral-surface shadow-sm">
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
                {paginatedPaidInvoices.map((invoice) => (
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
                        onClick={() => onViewInvoice(invoice.id, 'view')}
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

            {/* Total Count */}
            {totalPaidInvoices > 0 && (
              <div className="px-6 py-3 border-t border-neutral-border">
                <div className="text-sm text-neutral-text/70">
                  Hiển thị <span className="font-medium text-neutral-text">{startIndexPaid + 1}</span> đến{" "}
                  <span className="font-medium text-neutral-text">{Math.min(endIndexPaid, totalPaidInvoices)}</span> trong tổng số{" "}
                  <span className="font-medium text-neutral-text">{totalPaidInvoices}</span> hóa đơn
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPagesPaid > 1 && (
              <div className="flex justify-center px-6 py-4 border-t border-neutral-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPagesPaid }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPagesPaid ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPagesPaid, prev + 1))}
                        className={currentPage === totalPagesPaid ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="partial">
          <Card className="border-neutral-border bg-neutral-surface shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPartialInvoices.map((invoice) => (
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
                    <TableCell className="text-right text-yellow-600">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-strong transition-all duration-200"
                          onClick={() => onViewInvoice(invoice.id, 'payment')}
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Thanh toán tiếp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all"
                          onClick={() => onViewInvoice(invoice.id, 'view')}
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

            {partialInvoices.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có hóa đơn thanh toán một phần</p>
              </div>
            )}

            {/* Total Count */}
            {totalPartialInvoices > 0 && (
              <div className="px-6 py-3 border-t border-neutral-border">
                <div className="text-sm text-neutral-text/70">
                  Hiển thị <span className="font-medium text-neutral-text">{startIndexPartial + 1}</span> đến{" "}
                  <span className="font-medium text-neutral-text">{Math.min(endIndexPartial, totalPartialInvoices)}</span> trong tổng số{" "}
                  <span className="font-medium text-neutral-text">{totalPartialInvoices}</span> hóa đơn
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPagesPartial > 1 && (
              <div className="flex justify-center px-6 py-4 border-t border-neutral-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPagesPartial }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPagesPartial ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPagesPartial, prev + 1))}
                        className={currentPage === totalPagesPartial ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
