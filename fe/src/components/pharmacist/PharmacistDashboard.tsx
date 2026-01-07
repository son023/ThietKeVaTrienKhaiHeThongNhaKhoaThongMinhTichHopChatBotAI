import { useState, useEffect } from 'react';
import { AlertCircle, Package, Calendar, TrendingUp, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { inventoryController, DispenseOrderDTO, MedicineWithStock, InventoryLotDTO } from '../../controllers/InventoryController';
import { medicalHistoryController } from '../../controllers/MedicalHistoryController';
import { patientController } from '../../controllers/PatientController';
import { userController } from '../../controllers/UserController';
import { authController } from '../../controllers/AuthController';
import { toast } from 'sonner';

interface PharmacistDashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

interface PrescriptionDisplay {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  status: string;
}

interface LowStockDrug {
  name: string;
  stock: number;
  threshold: number;
  unit: string;
}

interface ExpiringDrug {
  name: string;
  batch: string;
  expiry: string;
  daysLeft: number;
}

export function PharmacistDashboard({ onNavigate }: PharmacistDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [newPrescriptions, setNewPrescriptions] = useState<PrescriptionDisplay[]>([]);
  const [lowStockDrugs, setLowStockDrugs] = useState<LowStockDrug[]>([]);
  const [expiringDrugs, setExpiringDrugs] = useState<ExpiringDrug[]>([]);
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    lowStockCount: 0,
    expiringCount: 0,
    dispensedToday: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load tất cả dữ liệu song song
      const [dispenseOrders, medicinesWithStock, inventoryLots, soldOrders] = await Promise.all([
        inventoryController.getDispenseOrdersByStatus('RELEASED'),
        inventoryController.getMedicinesWithStock(),
        inventoryController.getAllInventoryLots(),
        inventoryController.getDispenseOrdersByStatus('SOLD'),
      ]);

      // 1. Xử lý đơn thuốc mới
      await loadPrescriptions(dispenseOrders);

      // 2. Xử lý thuốc sắp hết hàng
      const lowStock = medicinesWithStock
        .filter(med => med.stockStatus === 'low')
        .map(med => ({
          name: med.name,
          stock: med.stockQuantity,
          threshold: 20, // Ngưỡng mặc định
          unit: med.unit || 'viên',
        }));
      setLowStockDrugs(lowStock);

      // 3. Xử lý thuốc sắp hết hạn (trong vòng 60 ngày)
      const today = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(today.getDate() + 60);

      const expiring = inventoryLots
        .filter(lot => {
          if (!lot.expireDate) return false;
          const expireDate = new Date(lot.expireDate);
          const daysLeft = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return expireDate >= today && expireDate <= sixtyDaysFromNow && lot.quantityOnHand > 0 && daysLeft > 0;
        })
        .map(lot => {
          const expireDate = new Date(lot.expireDate!);
          const daysLeft = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return {
            name: lot.medicineName,
            batch: lot.lotNo,
            expiry: expireDate.toLocaleDateString('vi-VN'),
            daysLeft,
          };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft) // Sắp xếp theo ngày hết hạn gần nhất
        .slice(0, 10); // Lấy 10 lô gần hết hạn nhất
      setExpiringDrugs(expiring);

      // 4. Tính toán stats - Đếm đơn đã cấp hôm nay (status = SOLD)
      // Backend lưu UTC, cần cộng 7 giờ để chuyển sang múi giờ VN
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const dispensedToday = soldOrders.filter(order => {
        // Chỉ đếm đơn có status = SOLD
        if (order.status !== 'SOLD') return false;

        // Sử dụng updatedAt và cộng thêm 7 giờ (UTC+7)
        const utcDate = new Date(order.updateAt);
        const vnDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

        return vnDate >= todayStart && vnDate <= todayEnd;
      }).length;

      setStats({
        totalPrescriptions: dispenseOrders.length,
        lowStockCount: lowStock.length,
        expiringCount: expiring.length,
        dispensedToday,
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Không thể tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptions = async (orders: DispenseOrderDTO[]) => {
    try {
      if (orders.length === 0) {
        setNewPrescriptions([]);
        return;
      }

      // Batch fetch medical histories
      const medicalHistoryIds = [...new Set(orders.map(o => o.medicalHistoryId))];
      const medicalHistoryMap: Record<string, any> = {};

      await Promise.all(
        medicalHistoryIds.map(async (mhId) => {
          try {
            const mh = await medicalHistoryController.getById(mhId);
            medicalHistoryMap[mhId] = mh;
          } catch (error) {
            console.error(`Error fetching medical history ${mhId}:`, error);
          }
        })
      );

      // Extract patient IDs và doctor IDs
      const patientIds = [...new Set(
        Object.values(medicalHistoryMap)
          .map((mh: any) => mh?.patientId)
          .filter(Boolean)
      )];
      const doctorIds = [...new Set(orders.map(o => o.doctorId).filter(Boolean))];

      // Batch fetch patients
      const patientMap: Record<string, any> = {};
      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const patient = await patientController.getWithUserById(patientId);
            patientMap[patientId] = patient;
          } catch (error) {
            console.error(`Error fetching patient ${patientId}:`, error);
          }
        })
      );

      // Batch fetch doctors
      const doctorMap: Record<string, any> = {};
      await Promise.all(
        doctorIds.map(async (doctorId) => {
          try {
            const doctor = await userController.getById(doctorId);
            doctorMap[doctorId] = doctor;
          } catch (error) {
            console.error(`Error fetching doctor ${doctorId}:`, error);
          }
        })
      );

      // Map orders to display format
      const prescriptions: PrescriptionDisplay[] = orders.slice(0, 10).map(order => {
        const mh = medicalHistoryMap[order.medicalHistoryId];
        const patient = mh ? patientMap[mh.patientId] : null;
        const doctor = doctorMap[order.doctorId];

        const orderDate = new Date(order.createAt);
        const timeStr = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        return {
          id: order.id,
          time: timeStr,
          patient: patient?.user?.fullName || 'N/A',
          doctor: doctor ? `BS. ${doctor.fullName}` : 'N/A',
          status: order.status === 'RELEASED' ? 'Chờ cấp' : 'Cần xem xét',
        };
      });

      setNewPrescriptions(prescriptions);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
      toast.error('Không thể tải danh sách đơn thuốc');
    }
  };

  const currentUser = authController.getCurrentUser();
  const pharmacistName = currentUser?.fullName || 'Dược sĩ';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="typo-h2 text-neutral-heading mb-2">
          Bảng điều khiển
        </h1>
        <p className="text-base text-neutral-gray-500">
          Chào mừng trở lại, {pharmacistName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              {stats.totalPrescriptions}
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Danh sách đơn thuốc
          </p>
        </div>

        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-accent-orange">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <Package className="w-7 h-7 text-amber-600" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              {stats.lowStockCount}
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Thuốc sắp hết hàng
          </p>
        </div>

        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              {stats.expiringCount}
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Thuốc sắp hết hạn
          </p>
        </div>

        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              {stats.dispensedToday}
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Đơn đã cấp hôm nay
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Đơn thuốc mới */}
        <div className="lg:col-span-2 bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Đơn thuốc mới (Chờ cấp phát)
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {newPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-neutral-gray-500">
                Không có đơn thuốc mới
              </div>
            ) : (
              newPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="p-5 rounded-lg border border-neutral-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => onNavigate('prescription-detail', prescription.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-neutral-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-heading mb-1">
                          {prescription.patient}
                        </p>
                        <p className="text-sm text-neutral-gray-500">
                          {prescription.doctor} • {prescription.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${prescription.status === 'Chờ cấp'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                      >
                        {prescription.status}
                      </span>
                      <button className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow">
                        Xem & Cấp phát
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Việc cần làm nhanh */}
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Việc cần làm nhanh
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {lowStockDrugs.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:shadow-md hover:bg-amber-100 transition-all duration-200"
                onClick={() => onNavigate('inventory')}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    Có {lowStockDrugs.length} thuốc sắp hết hàng cần nhập kho
                  </p>
                </div>
              </div>
            )}
            {expiringDrugs.length > 0 && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:shadow-md hover:bg-red-100 transition-all duration-200"
                onClick={() => onNavigate('inventory')}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 font-medium leading-relaxed">
                    Có {expiringDrugs.length} lô thuốc sắp hết hạn cần xử lý
                  </p>
                </div>
              </div>
            )}
            {lowStockDrugs.length === 0 && expiringDrugs.length === 0 && (
              <div className="text-center py-4 text-neutral-gray-500 text-sm">
                Không có việc cần làm ngay
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cảnh báo Kho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thuốc sắp hết hàng */}
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Thuốc sắp hết hàng
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {lowStockDrugs.length === 0 ? (
              <div className="text-center py-8 text-neutral-gray-500">
                Không có thuốc sắp hết hàng
              </div>
            ) : (
              lowStockDrugs.slice(0, 5).map((drug, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border border-neutral-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => onNavigate('inventory')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-heading mb-1.5">
                        {drug.name}
                      </p>
                      <p className="text-sm text-neutral-gray-500">
                        Tồn kho: <span className="font-semibold">{drug.stock} {drug.unit}</span> / Ngưỡng: {drug.threshold} {drug.unit}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-muted group-hover:bg-primary/10 transition-colors">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thuốc sắp hết hạn */}
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Thuốc sắp hết hạn
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {expiringDrugs.length === 0 ? (
              <div className="text-center py-8 text-neutral-gray-500">
                Không có thuốc sắp hết hạn
              </div>
            ) : (
              expiringDrugs.slice(0, 5).map((drug, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border border-neutral-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => onNavigate('inventory')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-heading mb-1.5">
                        {drug.name}
                      </p>
                      <p className="text-sm text-neutral-gray-500">
                        Lô {drug.batch} • HSD: {drug.expiry} • Còn <span className="font-semibold">{drug.daysLeft} ngày</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-muted group-hover:bg-primary/10 transition-colors">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
