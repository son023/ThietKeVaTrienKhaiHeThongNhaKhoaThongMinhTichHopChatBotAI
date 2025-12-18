import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, AlertTriangle, RefreshCw, X, CheckCircle } from 'lucide-react';
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
  const [formData, setFormData] = useState<CreateInventoryLotRequest>({
    lotNo: '',
    expireDate: '',
    quantityOnHand: 0,
    costPrice: 0,
    medicineId: drugId,
    pharmacistId: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin thuốc
      const medicine = await inventoryController.getMedicineById(drugId);
      setDrug(medicine);

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
            note = `Đơn thuốc ${ledger.referenceId.substring(0, 8)}`;
          } else if (ledger.referenceType?.startsWith('MANUAL_EXPORT')) {
            note = `Xuất kho thủ công`;
          } else if (ledger.referenceType === 'INVENTORY_LOT' || ledger.referenceType === 'MANUAL_IMPORT') {
            note = `Lô ${ledger.lotNo || ''}`;
          } else {
            note = ledger.lotNo ? `Lô ${ledger.lotNo}` : 'Giao dịch kho';
          }

          return {
            date: new Date(ledger.createAt).toLocaleString('vi-VN'),
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3fb5ff]" />
        <span className="ml-3 text-[#05619a]">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!drug) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff] hover:text-[#05619a] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Quản lý Kho
        </button>
        <div className="text-center py-12">
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff] hover:text-[#05619a] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Quản lý Kho
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
              {drug.name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                Công dụng: {activeIngredient}
              </p>
              <span className="text-[#e5e7eb]">|</span>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                Mã thuốc: {drug.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d] mb-1">
              Tổng Tồn kho
            </p>
            <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[32px] text-[#28a745]">
              {totalStock} <span className="text-[18px]">{drug.unit || 'đơn vị'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        {[
          { id: 'batches' as const, label: 'Quản lý Lô & Hạn sử dụng' },
          { id: 'ledger' as const, label: 'Lịch sử Nhập/Xuất' },
          { id: 'info' as const, label: 'Thông tin Dược lý' },
          { id: 'settings' as const, label: 'Cài đặt Thuốc' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${activeTab === tab.id
              ? 'border-[#3fb5ff] text-[#3fb5ff]'
              : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
        {activeTab === 'batches' && (
          <div>
            <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
                Danh sách các lô trong kho ({batches.length})
              </h2>
              <button
                onClick={() => setShowAddLotDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nhập lô mới
              </button>
            </div>
            <div className="p-5">
              {batches.length > 0 ? (
                <table className="w-full">
                  <thead className="border-b border-[#e5e7eb]">
                    <tr>
                      <th className="px-4 py-3 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        Số lô
                      </th>
                      <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        HSD
                      </th>
                      <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        Còn lại (ngày)
                      </th>
                      <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr
                        key={batch.id}
                        className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                      >
                        <td className="px-4 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                          {batch.lotNo}
                        </td>
                        <td className="px-4 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                          {batch.quantityOnHand} {drug.unit || 'đơn vị'}
                        </td>
                        <td className="px-4 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                          {formatDate(batch.expireDate)}
                        </td>
                        <td className="px-4 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                          {batch.expireDate ? (
                            batch.daysUntilExpiry >= 0 ? (
                              <span className={batch.daysUntilExpiry <= 30 ? 'text-[#ffc107]' : ''}>
                                {batch.daysUntilExpiry} ngày
                              </span>
                            ) : (
                              <span className="text-[#dc3545]">Đã hết hạn</span>
                            )
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {batch.status === 'expired' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                              <AlertTriangle className="w-3 h-3" />
                              Đã hết hạn
                            </span>
                          ) : batch.status === 'out-of-stock' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#dc3545] text-white font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                              <AlertTriangle className="w-3 h-3" />
                              Hết hàng
                            </span>
                          ) : batch.status === 'expiring' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                              <AlertTriangle className="w-3 h-3" />
                              Cảnh báo HSD
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                              Bình thường
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                    Chưa có lô hàng nào
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div>
            <div className="p-5 border-b border-[#e5e7eb]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
                Lịch sử Nhập/Xuất kho
              </h2>
            </div>
            <div className="p-5">
              {ledgerRecords.length > 0 ? (
                <div className="space-y-3">
                  {ledgerRecords.map((record, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-[#e5e7eb] hover:border-[#3fb5ff] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full font-['Fz_Poppins:Medium',sans-serif] text-[12px] ${record.quantity > 0
                              ? 'bg-[#d4edda] text-[#155724]'
                              : 'bg-[#fff3cd] text-[#856404]'
                              }`}
                          >
                            {record.action}
                          </span>
                          <span
                            className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] ${record.quantity > 0 ? 'text-[#28a745]' : 'text-[#ffc107]'
                              }`}
                          >
                            {record.quantity > 0 ? '+' : ''}{record.quantity} {drug.unit || 'đơn vị'}
                          </span>
                        </div>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#6c757d]">
                          {record.date}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#05619a]">
                          {record.person}
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#333333]">
                          {record.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                    Chưa có lịch sử giao dịch
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-5">
            <div className="space-y-6">
              <div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-3">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#f8f9fa]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                      Tên biệt dược
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.name}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f8f9fa]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                      Công dụng / Mô tả
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f8f9fa]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                      Đơn vị
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.unit || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f8f9fa]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                      Giá bán
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.salePrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(drug.salePrice) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-5">
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Ngưỡng cảnh báo tồn kho
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={20}
                    className="flex-1 h-[44px] px-4 rounded-lg border border-[#3295d0] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                  />
                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                    {drug.unit || 'đơn vị'}
                  </span>
                </div>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mt-1">
                  Cảnh báo khi tồn kho xuống dưới ngưỡng này
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => toast.success('Đã lưu cài đặt thành công')}
                  className="px-6 py-3 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
                >
                  Lưu thay đổi
                </button>
                <button className="px-6 py-3 bg-white border border-[#e5e7eb] text-[#6c757d] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f8f9fa] transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Lot Dialog */}
      {showAddLotDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
                Nhập lô mới
              </h2>
              <button
                onClick={() => {
                  setShowAddLotDialog(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6c757d]" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddLot} className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLotDialog(false);
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
