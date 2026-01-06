import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle, Clock, XCircle, X, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  inventoryController,
  InventoryLotDTO,
  MedicineDTO,
  CreateInventoryLotRequest,
  ManualExportRequest,
  ManualExportResponse
} from '../../controllers/InventoryController';
import { authController } from '../../controllers/AuthController';
import { userController } from '../../controllers/UserController';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface ImportExportManagementProps {
  onNavigate?: (page: string, id?: string) => void;
}

export function ImportExportManagement({ onNavigate }: ImportExportManagementProps = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importRecords, setImportRecords] = useState<InventoryLotDTO[]>([]);
  const [exportRecords, setExportRecords] = useState<ManualExportResponse[]>([]);
  const [medicines, setMedicines] = useState<MedicineDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state for Import tab
  const [importCurrentPage, setImportCurrentPage] = useState(1);
  // Pagination state for Export tab
  const [exportCurrentPage, setExportCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Import Form state
  const [formData, setFormData] = useState<CreateInventoryLotRequest>({
    lotNo: '',
    expireDate: '',
    quantityOnHand: 0,
    costPrice: 0,
    medicineId: '',
  });

  // Export Form state
  const [exportFormData, setExportFormData] = useState<ManualExportRequest>({
    inventoryLotId: '',
    quantity: 0,
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadImportRecords();
    loadExportRecords();
    loadMedicines();
  }, []);

  const loadImportRecords = async () => {
    setLoading(true);
    try {
      const lots = await inventoryController.getAllInventoryLots();
      // Sắp xếp theo hạn sử dụng (gần hết hạn trước)
      const sorted = lots.sort((a, b) => {
        const dateA = new Date(a.expireDate).getTime();
        const dateB = new Date(b.expireDate).getTime();
        return dateA - dateB; // Gần hết hạn lên đầu
      });
      setImportRecords(sorted);
      setImportCurrentPage(1); // Reset page when data changes
    } catch (error) {
      console.error('Error loading import records:', error);
      toast.error('Không thể tải danh sách nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      const data = await inventoryController.getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error('Error loading medicines:', error);
      toast.error('Không thể tải danh sách thuốc');
    }
  };

  const loadExportRecords = async () => {
    setLoading(true);
    try {
      // Lấy TẤT CẢ xuất kho (manual + auto)
      const exports = await inventoryController.getAllExports();


      const pharmacistIds = exports.map(exp => exp.pharmacistId);
      const pharmacists = await userController.getByIds(pharmacistIds);

      const exportsWithPharmacist = exports.map(exp => ({
        ...exp,
        pharmacistName: exp.pharmacistId
          ? pharmacists[exp.pharmacistId]?.username ||
          pharmacists[exp.pharmacistId]?.fullName
          : undefined,
      }));

      // Sắp xếp theo thời gian xuất (mới nhất trước)
      const sortedExports = exportsWithPharmacist.sort((a, b) =>
        new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime()
      );

      setExportRecords(sortedExports);
      setExportCurrentPage(1); // Reset page when data changes
    } catch (error) {
      console.error('Error loading export records:', error);
      toast.error('Không thể tải danh sách xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitImport = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Get pharmacist ID
    const currentUser = authController.getCurrentUser();
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    // Validation
    if (!formData.medicineId) {
      toast.error('Vui lòng chọn thuốc');
      return;
    }
    if (!formData.lotNo.trim()) {
      toast.error('Vui lòng nhập số lô');
      return;
    }
    if (formData.quantityOnHand <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }
    if (formData.costPrice < 0) {
      toast.error('Giá nhập không hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Add pharmacistId to request
      const requestData: CreateInventoryLotRequest = {
        ...formData,
        pharmacistId: currentUser.id
      };
      await inventoryController.createInventoryLot(requestData);
      toast.success('Nhập hàng vào kho thành công!');
      setShowImportDialog(false);
      resetForm();
      loadImportRecords(); // Reload list
    } catch (error: any) {
      console.error('Error creating inventory lot:', error);
      toast.error(error.message || 'Không thể nhập hàng vào kho');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      lotNo: '',
      expireDate: '',
      quantityOnHand: 0,
      costPrice: 0,
      medicineId: '',
    });
  };

  const resetExportForm = () => {
    setExportFormData({
      inventoryLotId: '',
      quantity: 0,
      reason: '',
      notes: '',
    });
  };

  const handleSubmitExport = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Get pharmacist ID
    const currentUser = authController.getCurrentUser();
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    // Validation
    if (!exportFormData.inventoryLotId) {
      toast.error('Vui lòng chọn lô hàng');
      return;
    }
    if (!exportFormData.reason) {
      toast.error('Vui lòng chọn lý do xuất kho');
      return;
    }
    if (exportFormData.quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    // Check if quantity exceeds available stock
    const selectedLot = importRecords.find(lot => lot.id === exportFormData.inventoryLotId);
    if (selectedLot && exportFormData.quantity > selectedLot.quantityOnHand) {
      toast.error(`Số lượng xuất vượt quá tồn kho (Hiện có: ${selectedLot.quantityOnHand})`);
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Add pharmacistId to request
      const requestData: ManualExportRequest = {
        ...exportFormData,
        pharmacistId: currentUser.id
      };
      await inventoryController.manualExport(requestData);
      toast.success('Xuất kho thành công');
      setShowExportDialog(false);
      resetExportForm();

      // Reload data
      await Promise.all([
        loadImportRecords(),
        loadExportRecords()
      ]);
    } catch (error: any) {
      console.error('Error exporting stock:', error);
      toast.error(error.message || 'Không thể xuất kho');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStockStatusBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-semibold">
          Hết hàng
        </span>
      );
    } else if (quantity < 50) {
      return (
        <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold">
          Sắp hết
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          Còn hàng
        </span>
      );
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewPrescription = (prescriptionId: string) => {
    // Sử dụng React Router để navigate
    navigate(`/pharmacist/prescriptions/${prescriptionId}`);
  };

  // Pagination calculations for Import tab
  const importTotalItems = importRecords.length;
  const importTotalPages = Math.ceil(importTotalItems / itemsPerPage);
  const importStartIndex = (importCurrentPage - 1) * itemsPerPage;
  const importEndIndex = importStartIndex + itemsPerPage;
  const paginatedImportRecords = importRecords.slice(importStartIndex, importEndIndex);

  // Pagination calculations for Export tab
  const exportTotalItems = exportRecords.length;
  const exportTotalPages = Math.ceil(exportTotalItems / itemsPerPage);
  const exportStartIndex = (exportCurrentPage - 1) * itemsPerPage;
  const exportEndIndex = exportStartIndex + itemsPerPage;
  const paginatedExportRecords = exportRecords.slice(exportStartIndex, exportEndIndex);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="typo-h2 text-neutral-heading mb-2">
            Quản lý nhập/xuất thuốc
          </h1>
          <p className="text-base text-neutral-gray-500">
            Quản lý phiếu nhập và phiếu xuất kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-surface border border-red-500 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all duration-200 shadow-sm"
          >
            <XCircle className="w-4 h-4" />
            Tạo phiếu xuất kho
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Nhập hàng vào kho
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-gray-200 bg-neutral-surface rounded-t-xl px-2 pt-2">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${activeTab === 'import'
            ? 'border-primary text-primary bg-neutral-muted'
            : 'border-transparent text-neutral-gray-500 hover:text-primary hover:bg-neutral-gray-50'
            }`}
        >
          Lịch sử nhập kho <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-gray-100 text-neutral-gray-700 text-xs font-bold">{importRecords.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${activeTab === 'export'
            ? 'border-primary text-primary bg-neutral-muted'
            : 'border-transparent text-neutral-gray-500 hover:text-primary hover:bg-neutral-gray-50'
            }`}
        >
          Lịch sử xuất kho <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-gray-100 text-neutral-gray-700 text-xs font-bold">{exportRecords.length}</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'import' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-gray-500">Đang tải...</p>
              </div>
            ) : importRecords.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-gray-50 border-b border-neutral-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                          Số lô
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                          Tên thuốc
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                          Số lượng
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-neutral-heading">
                          Giá nhập
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                          Hạn sử dụng
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-gray-100">
                      {paginatedImportRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-neutral-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-primary">
                            {record.lotNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-text font-medium">
                            {record.medicineName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                            {record.quantityOnHand}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                            {formatCurrency(record.costPrice)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-neutral-gray-600">
                            {formatDate(record.expireDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {getStockStatusBadge(record.quantityOnHand)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Count Display */}
                {importTotalItems > 0 && (
                  <div className="px-6 py-3 border-t border-neutral-gray-200 text-sm text-neutral-gray-500">
                    Hiển thị <span className="font-medium text-neutral-text">{importStartIndex + 1}</span> đến{" "}
                    <span className="font-medium text-neutral-text">{Math.min(importEndIndex, importTotalItems)}</span> trong tổng số{" "}
                    <span className="font-medium text-neutral-text">{importTotalItems}</span> phiếu nhập
                  </div>
                )}

                {/* Pagination Controls */}
                {importTotalPages > 1 && (
                  <div className="flex justify-center px-6 py-4 border-t border-neutral-gray-200">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setImportCurrentPage(prev => Math.max(1, prev - 1))}
                            className={importCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: importTotalPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === importTotalPages ||
                            (page >= importCurrentPage - 1 && page <= importCurrentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setImportCurrentPage(page)}
                                  isActive={importCurrentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (page === importCurrentPage - 2 || page === importCurrentPage + 2) {
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
                            onClick={() => setImportCurrentPage(prev => Math.min(importTotalPages, prev + 1))}
                            className={importCurrentPage === importTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neutral-gray-50 flex items-center justify-center">
                  <Package className="w-10 h-10 text-neutral-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-heading mb-2">
                  Chưa có lịch sử nhập kho
                </h3>
                <p className="text-sm text-neutral-gray-500 mb-4">
                  Bắt đầu nhập hàng vào kho để quản lý tồn kho
                </p>
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  Nhập hàng đầu tiên
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'export' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-gray-50 border-b border-neutral-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                      Số lô
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                      Tên thuốc
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                      Số lượng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                      Lý do
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                      Dược sĩ
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                      Đơn thuốc
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                      Ngày xuất
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </td>
                    </tr>
                  ) : exportRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-gray-50 flex items-center justify-center">
                          <Package className="w-8 h-8 text-neutral-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-heading mb-1">
                          Chưa có phiếu xuất kho
                        </h3>
                        <p className="text-sm text-neutral-gray-500">
                          Tạo phiếu xuất kho đầu tiên của bạn
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedExportRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-neutral-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-primary">
                          {record.lotNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-text font-medium">
                          {record.medicineName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-red-600">
                          {record.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-text">
                          {record.reason}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-text">
                          {record.pharmacistName || <span className="text-neutral-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {record.dispenseOrderId ? (
                            <button
                              onClick={() => handleViewPrescription(record.dispenseOrderId!)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-strong transition-all duration-200 text-xs font-semibold shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem đơn
                            </button>
                          ) : (
                            <span className="text-neutral-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-neutral-gray-600">
                          {formatDateTime(record.exportedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Count Display */}
            {exportTotalItems > 0 && (
              <div className="px-6 py-3 border-t border-neutral-gray-200 text-sm text-neutral-gray-500">
                Hiển thị <span className="font-medium text-neutral-text">{exportStartIndex + 1}</span> đến{" "}
                <span className="font-medium text-neutral-text">{Math.min(exportEndIndex, exportTotalItems)}</span> trong tổng số{" "}
                <span className="font-medium text-neutral-text">{exportTotalItems}</span> phiếu xuất
              </div>
            )}

            {/* Pagination Controls */}
            {exportTotalPages > 1 && (
              <div className="flex justify-center px-6 py-4 border-t border-neutral-gray-200">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setExportCurrentPage(prev => Math.max(1, prev - 1))}
                        className={exportCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: exportTotalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === exportTotalPages ||
                        (page >= exportCurrentPage - 1 && page <= exportCurrentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setExportCurrentPage(page)}
                              isActive={exportCurrentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === exportCurrentPage - 2 || page === exportCurrentPage + 2) {
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
                        onClick={() => setExportCurrentPage(prev => Math.min(exportTotalPages, prev + 1))}
                        className={exportCurrentPage === exportTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Import Dialog */}
      {
        showImportDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-gray-200 bg-neutral-gray-50 sticky top-0 rounded-t-2xl">
                <h2 className="typo-h4 text-neutral-heading">
                  Nhập hàng vào kho
                </h2>
                <button
                  onClick={() => {
                    setShowImportDialog(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-neutral-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-gray-600" />
                </button>
              </div>

              {/* Dialog Content */}
              <form onSubmit={handleSubmitImport} className="p-6 space-y-5">
                {/* Medicine Select */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Chọn thuốc <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.medicineId}
                    onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">-- Chọn thuốc --</option>
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lot Number */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Số lô <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lotNo}
                    onChange={(e) => setFormData({ ...formData, lotNo: e.target.value })}
                    placeholder="Ví dụ: LOT-2025-001"
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Quantity and Cost Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-heading mb-2">
                      Số lượng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantityOnHand}
                      onChange={(e) => setFormData({ ...formData, quantityOnHand: parseInt(e.target.value) || 0 })}
                      min="1"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-heading mb-2">
                      Giá nhập (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Expire Date */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Hạn sử dụng
                  </label>
                  <input
                    type="date"
                    value={formData.expireDate}
                    onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Dialog Footer */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportDialog(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-neutral-gray-200 text-neutral-text rounded-lg text-sm font-semibold hover:bg-neutral-gray-50 transition-all duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-strong transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow"
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Xác nhận nhập kho
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Export Dialog */}
      {
        showExportDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-gray-200 bg-neutral-gray-50 sticky top-0 rounded-t-2xl">
                <h2 className="typo-h4 text-neutral-heading">
                  Xuất kho thủ công
                </h2>
                <button
                  onClick={() => {
                    setShowExportDialog(false);
                    resetExportForm();
                  }}
                  className="p-2 hover:bg-neutral-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-gray-600" />
                </button>
              </div>

              {/* Dialog Content */}
              <form onSubmit={handleSubmitExport} className="p-6 space-y-5">
                {/* Inventory Lot Select */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Chọn lô hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={exportFormData.inventoryLotId}
                    onChange={(e) => setExportFormData({ ...exportFormData, inventoryLotId: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">-- Chọn lô hàng --</option>
                    {importRecords.filter(lot => lot.quantityOnHand > 0).map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.lotNo} - {lot.medicineName} (Tồn: {lot.quantityOnHand})
                      </option>
                    ))}
                  </select>
                  {exportFormData.inventoryLotId && (
                    <p className="mt-2 text-sm text-neutral-gray-500">
                      Tồn kho hiện tại: <span className="font-bold text-neutral-heading">
                        {importRecords.find(lot => lot.id === exportFormData.inventoryLotId)?.quantityOnHand || 0}
                      </span>
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Số lượng xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={exportFormData.quantity}
                    onChange={(e) => setExportFormData({ ...exportFormData, quantity: parseInt(e.target.value) || 0 })}
                    min="1"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Lý do xuất kho <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={exportFormData.reason}
                    onChange={(e) => setExportFormData({ ...exportFormData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">-- Chọn lý do --</option>
                    <option value="Hết hạn sử dụng">Hết hạn sử dụng</option>
                    <option value="Hư hỏng">Hư hỏng</option>
                    <option value="Chuyển kho">Chuyển kho</option>
                    <option value="Mất mát">Mất mát</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={exportFormData.notes}
                    onChange={(e) => setExportFormData({ ...exportFormData, notes: e.target.value })}
                    placeholder="Nhập ghi chú (tùy chọn)"
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
                  />
                </div>

                {/* Dialog Footer */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportDialog(false);
                      resetExportForm();
                    }}
                    className="px-6 py-3 border border-neutral-gray-200 text-neutral-text rounded-lg text-sm font-semibold hover:bg-neutral-gray-50 transition-all duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow"
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Xác nhận xuất kho
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
