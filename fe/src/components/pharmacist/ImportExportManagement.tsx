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
      // Sắp xếp theo ngày tạo mới nhất
      const sorted = lots.sort((a, b) => {
        // Giả sử có createdAt field, nếu không thì sort theo ID
        return b.id.localeCompare(a.id);
      });
      setImportRecords(sorted);
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



      setExportRecords(exportsWithPharmacist);
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
        <span className="px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] text-xs font-medium">
          Hết hàng
        </span>
      );
    } else if (quantity < 50) {
      return (
        <span className="px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] text-xs font-medium">
          Sắp hết
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] text-xs font-medium">
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Quản lý nhập/xuất thuốc
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Quản lý phiếu nhập và phiếu xuất kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dc3545] text-[#dc3545] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#fff5f5] transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Tạo phiếu xuất kho
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nhập hàng vào kho
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${activeTab === 'import'
            ? 'border-[#3fb5ff] text-[#3fb5ff]'
            : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
            }`}
        >
          Lịch sử nhập kho ({importRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${activeTab === 'export'
            ? 'border-[#3fb5ff] text-[#3fb5ff]'
            : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
            }`}
        >
          Lịch sử xuất kho ({exportRecords.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
        {activeTab === 'import' && (
          <>
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3fb5ff]"></div>
                <p className="mt-4 text-[#6c757d]">Đang tải...</p>
              </div>
            ) : importRecords.length > 0 ? (
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Số lô
                    </th>
                    <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Tên thuốc
                    </th>
                    <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Số lượng
                    </th>
                    <th className="px-6 py-4 text-right font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Giá nhập
                    </th>
                    <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Hạn sử dụng
                    </th>
                    <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {importRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                    >
                      <td className="px-6 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                        {record.lotNo}
                      </td>
                      <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                        {record.medicineName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        {record.quantityOnHand}
                      </td>
                      <td className="px-6 py-4 text-right font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#28a745]">
                        {formatCurrency(record.costPrice)}
                      </td>
                      <td className="px-6 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
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
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#f8f9fa] flex items-center justify-center">
                  <Package className="w-10 h-10 text-[#6c757d]" />
                </div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e] mb-2">
                  Chưa có lịch sử nhập kho
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d] mb-4">
                  Bắt đầu nhập hàng vào kho để quản lý tồn kho
                </p>
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="px-6 py-3 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Nhập hàng đầu tiên
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'export' && (
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Số lô
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Tên thuốc
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Số lượng
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Lý do
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Dược sĩ
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Đơn thuốc
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Ngày xuất
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3fb5ff]"></div>
                  </td>
                </tr>
              ) : exportRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#f8f9fa] flex items-center justify-center">
                      <Package className="w-8 h-8 text-[#6c757d]" />
                    </div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-1">
                      Chưa có phiếu xuất kho
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                      Tạo phiếu xuất kho đầu tiên của bạn
                    </p>
                  </td>
                </tr>
              ) : (
                exportRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                  >
                    <td className="px-6 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                      {record.lotNo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {record.medicineName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#dc3545]">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {record.reason}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {record.pharmacistName || <span className="text-[#6c757d]">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {record.dispenseOrderId ? (
                        <button
                          onClick={() => handleViewPrescription(record.dispenseOrderId!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3fb5ff] text-white hover:bg-[#3fb5ff]/90 transition-colors font-['Fz_Poppins:Medium',sans-serif] text-[13px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem đơn
                        </button>
                      ) : (
                        <span className="text-[#6c757d] text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#05619a]">
                      {formatDateTime(record.exportedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
                Nhập hàng vào kho
              </h2>
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6c757d]" />
              </button>
            </div>

            {/* Dialog Content */}
            <form onSubmit={handleSubmitImport} className="p-6 space-y-4">
              {/* Medicine Select */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Chọn thuốc <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.medicineId}
                  onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
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
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Số lô <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lotNo}
                  onChange={(e) => setFormData({ ...formData, lotNo: e.target.value })}
                  placeholder="Ví dụ: LOT-2025-001"
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                  required
                />
              </div>

              {/* Quantity and Cost Price Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantityOnHand}
                    onChange={(e) => setFormData({ ...formData, quantityOnHand: parseInt(e.target.value) || 0 })}
                    min="1"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                    required
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                    Giá nhập (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Expire Date */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Hạn sử dụng
                </label>
                <input
                  type="date"
                  value={formData.expireDate}
                  onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                />
              </div>

              {/* Dialog Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportDialog(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-[#e5e7eb] text-[#333333] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f8f9fa] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
                Xuất kho thủ công
              </h2>
              <button
                onClick={() => {
                  setShowExportDialog(false);
                  resetExportForm();
                }}
                className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6c757d]" />
              </button>
            </div>

            {/* Dialog Content */}
            <form onSubmit={handleSubmitExport} className="p-6 space-y-4">
              {/* Inventory Lot Select */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Chọn lô hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={exportFormData.inventoryLotId}
                  onChange={(e) => setExportFormData({ ...exportFormData, inventoryLotId: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent"
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
                  <p className="mt-2 text-sm text-[#6c757d] font-['Fz_Poppins:Regular',sans-serif]">
                    Tồn kho hiện tại: <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">
                      {importRecords.find(lot => lot.id === exportFormData.inventoryLotId)?.quantityOnHand || 0}
                    </span>
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Số lượng xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={exportFormData.quantity}
                  onChange={(e) => setExportFormData({ ...exportFormData, quantity: parseInt(e.target.value) || 0 })}
                  min="1"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Lý do xuất kho <span className="text-red-500">*</span>
                </label>
                <select
                  value={exportFormData.reason}
                  onChange={(e) => setExportFormData({ ...exportFormData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent"
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
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={exportFormData.notes}
                  onChange={(e) => setExportFormData({ ...exportFormData, notes: e.target.value })}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent resize-none"
                />
              </div>

              {/* Dialog Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => {
                    setShowExportDialog(false);
                    resetExportForm();
                  }}
                  className="px-6 py-3 border border-[#e5e7eb] text-[#333333] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f8f9fa] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#dc3545] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#dc3545]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      )}
    </div>
  );
}