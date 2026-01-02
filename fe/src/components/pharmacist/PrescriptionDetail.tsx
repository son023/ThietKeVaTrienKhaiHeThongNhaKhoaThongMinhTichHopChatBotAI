import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Flag, Printer, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryController, DispenseOrderDTO, DispenseItemDTO, InventoryLotDTO } from '../../controllers/InventoryController';
import { medicalHistoryController, MedicalHistoryDTO } from '../../controllers/MedicalHistoryController';
import { patientController } from '../../controllers/PatientController';
import { PatientWithUser } from '../../models/Patient';
import { doctorController } from '../../controllers/DoctorController';
import { authController } from '../../controllers/AuthController';
import { useNotifications } from '../../contexts/NotificationContext';

interface PrescriptionDetailProps {
  prescriptionId: string; // đây là dispenseOrderId
  onBack: () => void;
}

interface CurrentMedication {
  name: string;
  quantity?: number;
  dosage?: string;
}

interface MedicationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  dosage: string;
  duration?: string;
  frequency?: string;
  usageInstructions?: string;
  stockStatus: 'available' | 'low' | 'out';
  stockCount: number;
}

export function PrescriptionDetail({ prescriptionId, onBack }: PrescriptionDetailProps) {
  const [activeTab, setActiveTab] = useState<'prescription' | 'history'>('prescription');
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // State cho dữ liệu thật
  const [dispenseOrder, setDispenseOrder] = useState<DispenseOrderDTO | null>(null);
  const [patient, setPatient] = useState<PatientWithUser | null>(null);
  const [doctorName, setDoctorName] = useState<string>('Đang tải...');
  const [doctorNotes, setDoctorNotes] = useState<string>('Không có ghi chú');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<CurrentMedication[]>([]);
  const [prescriptionMeds, setPrescriptionMeds] = useState<MedicationItem[]>([]);
  const [dispensingHistory, setDispensingHistory] = useState<any[]>([]);

  const [isInvoicePaid, setIsInvoicePaid] = useState<boolean>(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1) Lấy dispense order
      const order = await inventoryController.getDispenseOrderById(prescriptionId);
      setDispenseOrder(order);

      // 2) Lấy medical history để biết patientId và lấy ghi chú bác sĩ
      const mh = await medicalHistoryController.getById(order.medicalHistoryId);
      const patientId = mh.patientId;

      // Ghi chú bác sĩ từ MedicalHistory
      const notes = [
        mh.symptoms,
        ...(mh.conditions || []).map(c => c.name).filter(Boolean)
      ].filter(Boolean).join('. ');
      setDoctorNotes(
        [
          mh.symptoms ? `Triệu chứng: ${mh.symptoms}` : '',
          ...(mh.conditions || []).map(c =>
            `${c.toothNumber ? `Răng ${c.toothNumber}: ` : ''}${c.name || ''}${c.status ? ` (${c.status})` : ''}${c.treatment ? ` - ${c.treatment}` : ''}`
          ).filter(Boolean)
        ].filter(Boolean).join('\n')
      );

      // 3) Lấy thông tin bệnh nhân kèm allergies
      try {
        const patientData = await patientController.getWithUserById(patientId);


        setPatient(patientData);


        // Lấy allergies từ patientAllergies
        if (patientData.patientAllergies && patientData.patientAllergies.length > 0) {
          setAllergies(patientData.patientAllergies.map(a =>
            a.allergyName || a.allergyCode || 'Không rõ'
          ));
        }
      } catch (err) {
        console.warn('Error fetching patient:', err);
      }

      // 4) Lấy thông tin bác sĩ kê đơn
      try {
        const doctor = await doctorController.getWithUserById(order.doctorId);
        setDoctorName(doctor.user?.fullName || 'N/A');
      } catch (err) {
        console.warn('Error fetching doctor:', err);
      }

      // 5) Lấy thuốc của đơn hiện tại (dispense items + inventory lot để lấy tên)
      try {
        const items = await inventoryController.getDispenseItemsByOrderId(order.id);
        const medsWithDetails: MedicationItem[] = await Promise.all(
          items.map(async (item) => {
            let medicineName = 'Thuốc';
            let stockCount = 0;
            let unit = 'viên';

            if (item.inventoryLotId) {
              try {
                const lot = await inventoryController.getInventoryLotById(item.inventoryLotId);
                medicineName = lot.medicineName || medicineName;
                stockCount = lot.quantityOnHand || 0;
              } catch (e) {
                console.warn('Error fetching lot:', e);
              }
            }

            // Xác định trạng thái tồn kho
            let stockStatus: 'available' | 'low' | 'out' = 'available';
            if (stockCount === 0) stockStatus = 'out';
            else if (stockCount < 50) stockStatus = 'low';

            return {
              id: item.id,
              name: medicineName,
              quantity: item.quantity,
              unit,
              dosage: item.dosage || 'Theo chỉ định',
              duration: item.duration || '',
              frequency: item.frequency || '',
              usageInstructions: item.usageInstructions || '',
              stockStatus,
              stockCount,
            };
          })
        );
        setPrescriptionMeds(medsWithDetails);
      } catch (err) {
        console.warn('Error fetching prescription items:', err);
      }

      // 6) Thuốc đang sử dụng: lấy các đơn SOLD của cùng bệnh nhân
      try {
        const allSold = await inventoryController.getDispenseOrdersByStatus('SOLD');

        // Lọc các đơn của cùng bệnh nhân (dựa vào medical history)
        // Cần lấy medical history của từng đơn để so sánh patientId
        const patientOrders: DispenseOrderDTO[] = [];
        for (const o of allSold) {
          if (o.id === order.id) continue; // Bỏ qua đơn hiện tại
          try {
            const omh = await medicalHistoryController.getById(o.medicalHistoryId);
            if (omh.patientId === patientId) {
              patientOrders.push(o);
            }
          } catch (e) {
            // skip
          }
        }

        // Lấy thuốc từ các đơn đã cấp
        const meds: CurrentMedication[] = [];
        const history: any[] = [];

        for (const po of patientOrders.slice(0, 5)) { // Giới hạn 5 đơn gần nhất
          try {
            const poItems = await inventoryController.getDispenseItemsByOrderId(po.id);
            const medNames: string[] = [];

            for (const item of poItems) {
              let name = 'Thuốc';
              if (item.inventoryLotId) {
                try {
                  const lot = await inventoryController.getInventoryLotById(item.inventoryLotId);
                  name = lot.medicineName || name;
                } catch (e) { }
              }
              meds.push({ name, quantity: item.quantity, dosage: item.dosage });
              medNames.push(name);
            }

            // Thêm vào lịch sử
            let docName = 'N/A';
            try {
              const doc = await doctorController.getWithUserById(po.doctorId);
              docName = doc.user?.fullName || 'N/A';
            } catch (e) { }

            history.push({
              id: po.id.substring(0, 8),
              date: new Date(po.createAt).toLocaleDateString('vi-VN'),
              doctor: docName,
              medications: medNames,
              status: 'Đã cấp phát',
            });
          } catch (e) {
            console.warn('Error fetching order items:', e);
          }
        }

        setCurrentMedications(meds);
        setDispensingHistory(history);
      } catch (err) {
        console.warn('Error fetching current medications:', err);
      }

      try {
        setIsCheckingPayment(true);
        console.log(prescriptionId);
        const paymentStatus = await inventoryController.getPaymentStatusOfPrescription(prescriptionId);


        setIsInvoicePaid(paymentStatus.isPaid || false);

        if (paymentStatus.isPaid) {
          //toast.success('✅ Hóa đơn đã được thanh toán. Có thể cấp phát đơn thuốc.');
        } else {
          //toast.warning('⚠️ Hóa đơn chưa được thanh toán. Vui lòng đợi bệnh nhân thanh toán.');
        }
      } catch (err) {
        console.warn('Error checking payment status:', err);
        setIsInvoicePaid(false);
      } finally {
        setIsCheckingPayment(false);
      }
    }
    catch (error) {
      console.error('Load prescription detail error:', error);
      toast.error('Không thể tải chi tiết đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  const { notifications } = useNotifications();

  useEffect(() => {
    loadData();
  }, [prescriptionId]);

  useEffect(() => {
    if (dispenseOrder?.id) {
      const relevantNotification = notifications.find(
        n => n.dispenseOrderId === dispenseOrder.id && !n.read
      );
      if (relevantNotification) {
        // Có thể tự động reload data hoặc hiển thị thông báo
        loadData();
      }
    }
  }, [notifications, dispenseOrder?.id]);

  // useEffect(() => {
  //   const currentUser = authController.getCurrentUser();
  //   if (!currentUser || !prescriptionId) return;

  //   const unsubscribe = subscribeToInvoicePaid(currentUser.id, (notification: InvoicePaidNotification) => {
  //     // Kiểm tra xem notification có liên quan đến đơn thuốc hiện tại không
  //     // (có thể so sánh qua appointmentId hoặc dispenseOrderId)
  //     if (notification.dispenseOrderId === prescriptionId || 
  //         notification.invoiceId) {
  //       // Reload data để cập nhật trạng thái thanh toán
  //       loadData();
  //     }
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [prescriptionId]);

  const handleDispense = async () => {
    try {
      // ✅ Kiểm tra nếu đã SOLD thì không cho phép
      if (dispenseOrder?.status === 'SOLD') {
        toast.error('Đơn thuốc đã được cấp phát. Không thể cấp phát lại.');
        return;
      }

      if (!isInvoicePaid) {
        //toast.error('Hóa đơn chưa được thanh toán. Vui lòng đợi bệnh nhân thanh toán.');
        return;
      }

      const currentUser = authController.getCurrentUser();
      if (!currentUser) {
        toast.error('Bạn cần đăng nhập');
        return;
      }

      await inventoryController.markAsSold(prescriptionId, currentUser.id);
      toast.success('Đơn thuốc đã được cấp phát thành công!');

      // ✅ Reload data để cập nhật status
      await loadData();

      // Không tự động quay lại nữa, để người dùng thấy nút đã bị disable
      // setTimeout(() => onBack(), 1500);
    } catch (error) {
      toast.error('Không thể cấp phát đơn thuốc');
    }
  };



  // Hiển thị loading
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-neutral-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Computed values
  const patientName = patient?.user?.fullName || patient?.user?.username || 'N/A';
  const patientId = patient?.userId?.substring(0, 8) || '---';
  const patientPhone = patient?.contactPhone || '---';
  const patientGender = patient?.gender === 'MALE' ? 'Nam' : patient?.gender === 'FEMALE' ? 'Nữ' : '---';
  const patientAge = patient?.dob
    ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : '---';

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-sm font-medium text-primary hover:text-primary-strong mb-2 transition-colors"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="typo-h2 text-neutral-heading mb-1">
            Đơn thuốc #{prescriptionId.substring(0, 8)}...
          </h1>
          <p className="text-base text-neutral-gray-500">
            {doctorName} • {dispenseOrder?.createAt ? new Date(dispenseOrder.createAt).toLocaleString('vi-VN') : '---'}
          </p>
        </div>
      </div>

      {/* Allergy Alert - Dữ liệu từ patient.patientAllergies */}
      {allergies.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-base font-bold text-red-800 mb-1">
              🛑 CẢNH BÁO DỊ ỨNG
            </p>
            <p className="text-sm font-medium text-red-700">
              {allergies.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Patient Info */}
        <div className="col-span-3 space-y-4">
          <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-neutral-heading mb-4">
              Thông tin Bệnh nhân
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-gray-500 mb-1">Tên bệnh nhân</p>
                <p className="text-sm font-medium text-neutral-text">{patientName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-gray-500 mb-1">Mã BN</p>
                <p className="text-sm font-semibold text-primary">{patientId}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-gray-500 mb-1">Tuổi</p>
                  <p className="text-sm font-medium text-neutral-text">{patientAge}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-gray-500 mb-1">Giới tính</p>
                  <p className="text-sm font-medium text-neutral-text">{patientGender}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-gray-500 mb-1">SĐT</p>
                <p className="text-sm font-medium text-neutral-text">{patientPhone}</p>
              </div>
            </div>
          </div>

          {/* Bác sĩ kê đơn - Ghi chú từ MedicalHistory */}
          <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-neutral-heading mb-4">
              Bác sĩ kê đơn
            </h3>
            <p className="text-sm font-semibold text-primary mb-3">
              {doctorName}
            </p>
            <div className="bg-neutral-gray-50 rounded-lg p-3">
              <p className="text-xs text-neutral-gray-500 mb-2">
                Ghi chú của Bác sĩ:
              </p>
              <div className="space-y-1 text-sm text-neutral-text whitespace-pre-line">
                {doctorNotes || 'Không có ghi chú'}
              </div>
            </div>
          </div>

          {/* Thuốc đang sử dụng - Từ lịch sử đơn thuốc */}
          <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-neutral-heading mb-4">
              Thuốc đang sử dụng
            </h3>
            {currentMedications.length > 0 ? (
              <ul className="space-y-2">
                {currentMedications.slice(0, 5).map((med, index) => (
                  <li
                    key={index}
                    className="text-sm text-neutral-text flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    {med.name} {med.quantity && `(${med.quantity})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-gray-500">
                Chưa có lịch sử dùng thuốc
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Prescription Details */}
        <div className="col-span-6 space-y-4">
          <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-neutral-gray-200 bg-neutral-surface px-2 pt-2">
              {[
                { id: 'prescription' as const, label: 'Chi tiết Đơn thuốc' },
                { id: 'history' as const, label: 'Lịch sử cấp phát' },
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

            <div className="p-6">
              {activeTab === 'prescription' && (
                <div className="space-y-4">
                  {prescriptionMeds.length > 0 ? prescriptionMeds.map((med) => (
                    <div
                      key={med.id}
                      className="p-5 rounded-xl border border-neutral-gray-200 hover:border-primary hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-base font-bold text-neutral-heading mb-1">
                            {med.name}
                          </p>
                          <p className="text-sm text-neutral-gray-600">
                            Số lượng: {med.quantity} {med.unit}
                          </p>
                        </div>
                        {med.stockStatus === 'available' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Còn hàng ({med.stockCount})
                          </span>
                        ) : med.stockStatus === 'low' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Sắp hết ({med.stockCount})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            Hết hàng
                          </span>
                        )}
                      </div>
                      <div className="bg-neutral-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-xs text-neutral-gray-500 mb-1">
                          Liều dùng:
                        </p>
                        <p className="text-sm font-medium text-neutral-text">
                          {med.dosage}
                        </p>
                        {med.frequency && (
                          <p className="text-sm font-medium text-neutral-text">
                            Tần suất: {med.frequency}
                          </p>
                        )}
                        {med.duration && (
                          <p className="text-sm font-medium text-neutral-text">
                            Thời gian: {med.duration}
                          </p>
                        )}
                        {med.usageInstructions && (
                          <p className="text-sm font-medium text-neutral-text">
                            HDSD: {med.usageInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-neutral-gray-500 py-8">Chưa có thuốc trong đơn</p>
                  )}
                </div>
              )}


              {activeTab === 'history' && (
                <div className="space-y-3">
                  {dispensingHistory.length > 0 ? dispensingHistory.map((record) => (
                    <div key={record.id} className="p-5 rounded-xl border border-neutral-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-primary">{record.id}</p>
                        <p className="text-xs text-neutral-gray-500">{record.date}</p>
                      </div>
                      <p className="text-sm text-neutral-gray-600 mb-2">{record.doctor}</p>
                      <p className="text-sm text-neutral-text">{record.medications.join(', ')}</p>
                    </div>
                  )) : (
                    <p className="text-center text-neutral-gray-500 py-8">Chưa có lịch sử cấp phát</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Actions */}
        <div className="col-span-3 space-y-4">
          <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-neutral-heading mb-4">Ghi chú của Dược sĩ</h3>
            <textarea
              value={pharmacistNotes}
              onChange={(e) => setPharmacistNotes(e.target.value)}
              placeholder="Nhập ghi chú nội bộ hoặc gửi cho Bác sĩ..."
              className="w-full h-[120px] p-3 rounded-lg border border-neutral-gray-300 text-sm text-neutral-text resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm p-6 space-y-3 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-neutral-heading mb-4">Hành động</h3>
            <button
              onClick={handleDispense}
              disabled={!isInvoicePaid || isCheckingPayment || dispenseOrder?.status === 'SOLD'}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm ${isInvoicePaid && !isCheckingPayment && dispenseOrder?.status !== 'SOLD'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow'
                  : 'bg-neutral-gray-300 text-neutral-gray-500 cursor-not-allowed'
                }`}
            >
              <CheckCircle className="w-5 h-5" />
              {isCheckingPayment
                ? 'Đang kiểm tra thanh toán...'
                : dispenseOrder?.status === 'SOLD'
                  ? 'Đã cấp phát'
                  : isInvoicePaid
                    ? 'Hoàn tất & Cấp phát'
                    : 'Chờ thanh toán hóa đơn'}
            </button>


          </div>
        </div>
      </div>
    </div>
  );
}