import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, AlertTriangle, RefreshCw, X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  inventoryController,
  MedicineDTO,
  InventoryLotDTO,
  StockLedgerDTO,
  CreateInventoryLotRequest
} from '../../controllers/InventoryController';
import { authController } from '../../controllers/AuthController';
import { userController } from '../../controllers/UserController';

interface DrugProfileProps {
  drugId: string;
  onBack: () => void;
}

interface BatchItem extends InventoryLotDTO {
  daysUntilExpiry: number;
  status: 'normal' | 'expiring' | 'expired' | 'out-of-stock';
}

interface LedgerRecord {
  date: string;
  action: string;
  quantity: number;
  person: string;
  note: string;
  lotNo?: string;
}

export function DrugProfile({ drugId, onBack }: DrugProfileProps) {
  const [activeTab, setActiveTab] = useState<'batches' | 'ledger' | 'info' | 'settings'>('batches');
  const [loading, setLoading] = useState(true);
  const [drug, setDrug] = useState<MedicineDTO | null>(null);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [showAddLotDialog, setShowAddLotDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(20);
  const [medicineSettings, setMedicineSettings] = useState({
    name: '',
    description: '',
    unit: '',
    salePrice: 0,
  });
  const [formData, setFormData] = useState<CreateInventoryLotRequest>({
    lotNo: '',
    expireDate: '',
    quantityOnHand: 0,
    costPrice: 0,
    medicineId: drugId,
    pharmacistId: '',
  });

  // Load ngưỡng cảnh báo từ localStorage khi component mount
  useEffect(() => {
    if (drugId) {
      const savedThreshold = localStorage.getItem(`medicine_threshold_${drugId}`);
      if (savedThreshold) {
        setStockThreshold(parseInt(savedThreshold, 10));
      }
    }
  }, [drugId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin thuốc
      const medicine = await inventoryController.getMedicineById(drugId);
      setDrug(medicine);

      // Cập nhật settings từ thông tin thuốc
      setMedicineSettings({
        name: medicine.name || '',
        description: medicine.description || '',
        unit: medicine.unit || '',
        salePrice: medicine.salePrice || 0,
      });

      // 2. Lấy tất cả inventory lots và filter theo medicineId
      const allLots = await inventoryController.getAllInventoryLots();
      const medicineLots = allLots.filter(lot => lot.medicineId === drugId);

      // 3. Tạo map lotNo -> lotId để tra cứu nhanh
      const lotNoToIdMap: Record<string, string> = {};
      medicineLots.forEach(lot => {
        if (lot.lotNo) {
          lotNoToIdMap[lot.lotNo] = lot.id;
        }
      });

      // 4. Tính tổng tồn kho
      const total = medicineLots.reduce((sum, lot) => sum + lot.quantityOnHand, 0);
      setTotalStock(total);

      // 5. Chuyển đổi sang BatchItem với thông tin hết hạn và trạng thái đầy đủ
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time để so sánh chính xác
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      thirtyDaysFromNow.setHours(23, 59, 59, 999);

      const batchItems: BatchItem[] = medicineLots.map(lot => {
        let daysUntilExpiry = 0;
        let status: 'normal' | 'expiring' | 'expired' | 'out-of-stock' = 'normal';

        // Kiểm tra hết hàng
        if (lot.quantityOnHand === 0) {
          status = 'out-of-stock';
        } else if (lot.expireDate) {
          const expireDate = new Date(lot.expireDate);
          expireDate.setHours(23, 59, 59, 999);
          const diffTime = expireDate.getTime() - today.getTime();
          daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Đã hết hạn
          if (daysUntilExpiry < 0) {
            status = 'expired';
          }
          // Sắp hết hạn (trong vòng 30 ngày)
          else if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            status = 'expiring';
          }
          // Còn hạn > 30 ngày
          else {
            status = 'normal';
          }
        } else {
          // Không có hạn sử dụng, chỉ kiểm tra tồn kho
          status = lot.quantityOnHand === 0 ? 'out-of-stock' : 'normal';
        }

        return {
          ...lot,
          daysUntilExpiry,
          status,
        };
      });

      // Sắp xếp theo trạng thái (ưu tiên: expired > out-of-stock > expiring > normal)
      // Sau đó sắp xếp theo expireDate (sắp hết hạn trước)
      const statusPriority: Record<string, number> = {
        'expired': 0,
        'out-of-stock': 1,
        'expiring': 2,
        'normal': 3,
      };

      batchItems.sort((a, b) => {
        // Sắp xếp theo độ ưu tiên trạng thái
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;

        // Nếu cùng trạng thái, sắp xếp theo expireDate (sắp hết hạn trước)
        if (!a.expireDate) return 1;
        if (!b.expireDate) return -1;
        return new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime();
      });

      setBatches(batchItems);

      // 6. Lấy stock ledgers cho tất cả các lots
      // Sử dụng lotId từ map hoặc lot.id trực tiếp
      const allLedgers: (StockLedgerDTO & { lotNo?: string; pharmacistId?: string })[] = [];
      const pharmacistMap: Record<string, string> = {};

      for (const lot of medicineLots) {
        try {
          const ledgers = await inventoryController.getStockLedgersByLotId(lot.id);

          // Lấy thông tin pharmacist nếu chưa có
          if (lot.pharmacistId && !pharmacistMap[lot.pharmacistId]) {
            try {
              const pharmacist = await userController.getById(lot.pharmacistId);
              pharmacistMap[lot.pharmacistId] = pharmacist.fullName || pharmacist.username || 'N/A';
            } catch (e) {
              pharmacistMap[lot.pharmacistId] = 'N/A';
            }
          }


          allLedgers.push(...ledgers.map(ledger => ({
            ...ledger,
            lotNo: lot.lotNo,
            pharmacistId: lot.pharmacistId,
          })));
        } catch (error) {
          console.error(`Error fetching ledgers for lot ${lot.id} (lotNo: ${lot.lotNo}):`, error);
        }
      }

      // 7. Chuyển đổi stock ledgers sang LedgerRecord
      const records: LedgerRecord[] = await Promise.all(
        allLedgers.map(async (ledger) => {
          const pharmacistName = ledger.pharmacistId && pharmacistMap[ledger.pharmacistId]
            ? pharmacistMap[ledger.pharmacistId]
            : 'N/A';

          let action = '';
          if (ledger.type === 'IN') {
            action = 'Nhập kho';
          } else if (ledger.type === 'OUT') {
            action = 'Xuất (Cấp phát)';
          } else if (ledger.type === 'ADJUST') {
            action = 'Điều chỉnh';
          }

          let note = '';
          if (ledger.referenceType === 'DISPENSE_ORDER' || ledger.referenceType === 'AUTO_DISPENSE') {
            note = `Đơn thuốc ${ledger.referenceId.slice(-8)}`;
          } else if (ledger.referenceType?.startsWith('MANUAL_EXPORT')) {
            note = `Xuất kho thủ công`;
          } else if (ledger.referenceType === 'INVENTORY_LOT' || ledger.referenceType === 'MANUAL_IMPORT') {
            note = `Lô ${ledger.lotNo || ''}`;
          } else {
            note = ledger.lotNo ? `Lô ${ledger.lotNo}` : 'Giao dịch kho';
          }

          return {
            date: new Date(ledger.createAt || '').toLocaleString('vi-VN'),
            action,
            quantity: ledger.type === 'IN' ? ledger.quantity : -ledger.quantity,
            person: `DS. ${pharmacistName}`,
            note,
            lotNo: ledger.lotNo,
          };
        })
      );

      // Sắp xếp theo ngày (mới nhất trước)
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setLedgerRecords(records);

    } catch (error) {
      console.error('Error loading drug profile:', error);
      toast.error('Không thể tải thông tin thuốc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [drugId]);

  const handleSubmitAddLot = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUser = authController.getCurrentUser();
    if (!currentUser?.id) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    // Validation
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
      await inventoryController.createInventoryLot({
        ...formData,
        pharmacistId: currentUser.id,
      });

      toast.success('Nhập lô mới thành công!');
      setShowAddLotDialog(false);
      resetForm();
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Error creating inventory lot:', error);
      toast.error(error.message || 'Không thể nhập lô mới');
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
      medicineId: drugId,
      pharmacistId: '',
    });
  };

  // Hàm lưu thay đổi
  const handleSaveSettings = async () => {
    if (!drug) return;

    // Validation
    if (stockThreshold < 0) {
      toast.error('Ngưỡng cảnh báo phải lớn hơn hoặc bằng 0');
      return;
    }

    if (!medicineSettings.name.trim()) {
      toast.error('Tên thuốc không được để trống');
      return;
    }

    setSaving(true);
    try {
      // 1. Lưu ngưỡng cảnh báo vào localStorage
      localStorage.setItem(`medicine_threshold_${drugId}`, stockThreshold.toString());

      // 2. Cập nhật thông tin thuốc lên backend (nếu có thay đổi)
      const hasChanges =
        medicineSettings.name !== drug.name ||
        medicineSettings.description !== (drug.description || '') ||
        medicineSettings.unit !== (drug.unit || '') ||
        medicineSettings.salePrice !== (drug.salePrice || 0);

      if (hasChanges) {
        await inventoryController.updateMedicine(drugId, {
          name: medicineSettings.name,
          description: medicineSettings.description || undefined,
          unit: medicineSettings.unit || undefined,
          salePrice: medicineSettings.salePrice || undefined,
        });

        // Reload data để cập nhật UI
        await loadData();
      }

      toast.success('Đã lưu cài đặt thành công');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm text-neutral-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!drug) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-strong mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Quản lý Kho
        </button>
        <div className="text-center py-12">
          <p className="text-sm text-neutral-gray-500">
            Không tìm thấy thông tin thuốc
          </p>
        </div>
      </div>
    );
  }

  const activeIngredient = drug.description
    ? drug.description.split(',')[0].trim()
    : drug.name.split(' ')[0];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-strong mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Quản lý Kho
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="typo-h2 text-neutral-heading mb-2">
              {drug.name}
            </h1>
            <div className="flex items-center gap-4 text-neutral-gray-500">
              <p className="text-sm">
                Công dụng: {activeIngredient}
              </p>
              <span className="text-neutral-gray-300">|</span>
              <p className="text-sm">
                Mã thuốc: {drug.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-gray-500 mb-1">
              Tổng Tồn kho
            </p>
            <p className="text-4xl font-bold text-emerald-600">
              {totalStock} <span className="text-lg">{drug.unit || 'đơn vị'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-gray-200 bg-neutral-surface rounded-t-xl px-2 pt-2">
        {[
          { id: 'batches' as const, label: 'Quản lý Lô & Hạn sử dụng' },
          { id: 'ledger' as const, label: 'Lịch sử Nhập/Xuất' },
          { id: 'info' as const, label: 'Thông tin Dược lý' },
          { id: 'settings' as const, label: 'Cài đặt Thuốc' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${activeTab === tab.id
              ? 'border-primary text-primary bg-neutral-muted'
              : 'border-transparent text-neutral-gray-500 hover:text-primary hover:bg-neutral-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'batches' && (
          <div>
            <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50 flex items-center justify-between">
              <h2 className="typo-h4 text-neutral-heading">
                Danh sách các lô trong kho ({batches.length})
              </h2>
              <button
                onClick={() => setShowAddLotDialog(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                Nhập lô mới
              </button>
            </div>
            <div className="p-6">
              {batches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-neutral-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-neutral-heading">
                          Số lô
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                          Số lượng
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                          HSD
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                          Còn lại (ngày)
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-neutral-heading">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-gray-100">
                      {batches.map((batch) => (
                        <tr
                          key={batch.id}
                          className="hover:bg-neutral-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 text-sm font-semibold text-primary">
                            {batch.lotNo}
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-bold text-neutral-heading">
                            {batch.quantityOnHand} {drug.unit || 'đơn vị'}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-neutral-text">
                            {formatDate(batch.expireDate)}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-neutral-text">
                            {batch.expireDate ? (
                              batch.daysUntilExpiry >= 0 ? (
                                <span className={batch.daysUntilExpiry <= 30 ? 'text-amber-600 font-semibold' : ''}>
                                  {batch.daysUntilExpiry} ngày
                                </span>
                              ) : (
                                <span className="text-red-600 font-semibold">Đã hết hạn</span>
                              )
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {batch.status === 'expired' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Đã hết hạn
                              </span>
                            ) : batch.status === 'out-of-stock' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Hết hàng
                              </span>
                            ) : batch.status === 'expiring' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Cảnh báo HSD
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                                Bình thường
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-neutral-gray-500">
                    Chưa có lô hàng nào
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div>
            <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
              <h2 className="typo-h4 text-neutral-heading">
                Lịch sử Nhập/Xuất kho
              </h2>
            </div>
            <div className="p-6">
              {ledgerRecords.length > 0 ? (
                <div className="space-y-3">
                  {ledgerRecords.map((record, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-lg border border-neutral-gray-200 hover:border-primary hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${record.quantity > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                          >
                            {record.action}
                          </span>
                          <span
                            className={`text-lg font-bold ${record.quantity > 0 ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                          >
                            {record.quantity > 0 ? '+' : ''}{record.quantity} {drug.unit || 'đơn vị'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-gray-500">
                          {record.date}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-gray-600">
                          {record.person}
                        </p>
                        <p className="text-sm text-neutral-text">
                          {record.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-neutral-gray-500">
                    Chưa có lịch sử giao dịch
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-heading mb-4">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-neutral-gray-50 border border-neutral-gray-100">
                    <p className="text-xs text-neutral-gray-500 mb-2 font-medium">
                      Tên biệt dược
                    </p>
                    <p className="text-sm font-semibold text-neutral-heading">
                      {drug.name}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-neutral-gray-50 border border-neutral-gray-100">
                    <p className="text-xs text-neutral-gray-500 mb-2 font-medium">
                      Công dụng / Mô tả
                    </p>
                    <p className="text-sm font-semibold text-neutral-heading">
                      {drug.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-neutral-gray-50 border border-neutral-gray-100">
                    <p className="text-xs text-neutral-gray-500 mb-2 font-medium">
                      Đơn vị
                    </p>
                    <p className="text-sm font-semibold text-neutral-heading">
                      {drug.unit || 'N/A'}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-neutral-gray-50 border border-neutral-gray-100">
                    <p className="text-xs text-neutral-gray-500 mb-2 font-medium">
                      Giá bán
                    </p>
                    <p className="text-sm font-semibold text-neutral-heading">
                      {drug.salePrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(drug.salePrice) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="max-w-2xl space-y-6">
              {/* Ngưỡng cảnh báo tồn kho */}
              <div>
                <label className="block text-sm font-semibold text-neutral-heading mb-2">
                  Ngưỡng cảnh báo tồn kho
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(parseInt(e.target.value) || 0)}
                    min="0"
                    className="flex-1 h-12 px-4 rounded-xl border border-neutral-gray-200 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <span className="text-sm text-neutral-gray-500">
                    {drug?.unit || 'đơn vị'}
                  </span>
                </div>
                <p className="text-xs text-neutral-gray-500 mt-2">
                  Cảnh báo khi tồn kho xuống dưới ngưỡng này
                </p>
              </div>

              {/* Thông tin thuốc có thể chỉnh sửa */}
              <div className="border-t border-neutral-gray-200 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-heading mb-4">
                  Thông tin thuốc
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Tên thuốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={medicineSettings.name}
                    onChange={(e) => setMedicineSettings({ ...medicineSettings, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-neutral-gray-200 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-heading mb-2">
                    Mô tả / Công dụng
                  </label>
                  <textarea
                    value={medicineSettings.description}
                    onChange={(e) => setMedicineSettings({ ...medicineSettings, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-gray-200 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Nhập mô tả hoặc công dụng của thuốc..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-heading mb-2">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      value={medicineSettings.unit}
                      onChange={(e) => setMedicineSettings({ ...medicineSettings, unit: e.target.value })}
                      placeholder="Ví dụ: Viên, Hộp, Chai..."
                      className="w-full h-12 px-4 rounded-xl border border-neutral-gray-200 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-heading mb-2">
                      Giá bán (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={medicineSettings.salePrice}
                      onChange={(e) => setMedicineSettings({ ...medicineSettings, salePrice: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                      className="w-full h-12 px-4 rounded-xl border border-neutral-gray-200 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-strong transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    // Reset về giá trị ban đầu
                    if (drug) {
                      setMedicineSettings({
                        name: drug.name || '',
                        description: drug.description || '',
                        unit: drug.unit || '',
                        salePrice: drug.salePrice || 0,
                      });
                      const savedThreshold = localStorage.getItem(`medicine_threshold_${drugId}`);
                      setStockThreshold(savedThreshold ? parseInt(savedThreshold, 10) : 20);
                    }
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-neutral-surface border border-neutral-gray-200 text-neutral-gray-600 rounded-lg text-sm font-semibold hover:bg-neutral-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Lot Dialog */}
      {showAddLotDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-gray-200 bg-neutral-gray-50 sticky top-0 rounded-t-2xl">
              <h2 className="typo-h4 text-neutral-heading">
                Nhập lô mới
              </h2>
              <button
                onClick={() => {
                  setShowAddLotDialog(false);
                  resetForm();
                }}
                className="p-2 hover:bg-neutral-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddLot} className="p-6 space-y-5">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLotDialog(false);
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
                      Xác nhận nhập lô
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
