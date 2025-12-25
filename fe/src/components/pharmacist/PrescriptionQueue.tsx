import { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { inventoryController, DispenseOrderDTO } from '../../controllers/InventoryController';
import { patientController } from '../../controllers/PatientController';
import { medicalHistoryController } from '../../controllers/MedicalHistoryController';
import { doctorController } from '../../controllers/DoctorController';
import { userController } from '../../controllers/UserController';
import { toast } from 'sonner';

interface PrescriptionQueueProps {
  onViewDetail: (id: string) => void;
}

interface EnrichedDispenseOrder extends DispenseOrderDTO {
  patientName: string;
  doctorName: string;
  time: string;
  priority: string;
}

export function PrescriptionQueue({ onViewDetail }: PrescriptionQueueProps) {
  //const [activeTab, setActiveTab] = useState<'pending' | 'review' | 'dispensed' | 'cancelled'>('pending');
  const [activeTab, setActiveTab] = useState<'pending' | 'dispensed' | 'cancelled'>('pending');

  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<EnrichedDispenseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    //review: 0,
    dispensed: 0,
    cancelled: 0,
  });

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      let status = '';
      switch (activeTab) {
        case 'pending':
          status = 'RELEASED'; // Đã giữ thuốc, chờ cấp phát
          break;
        // case 'review':
        //   status = 'IN_PROGRESS'; // Đang xem xét
        //   break;
        case 'dispensed':
          status = 'SOLD'; // Đã cấp phát
          break;
        case 'cancelled':
          status = 'CANCELLED'; // Đã hủy
          break;
      }

      const orders = await inventoryController.getDispenseOrdersByStatus(status);

      if (orders.length === 0) {
        setPrescriptions([]);
        return;
      }

      // Tối ưu: Batch fetch tất cả dữ liệu cần thiết
      // 1. Thu thập tất cả unique IDs
      const medicalHistoryIds = [...new Set(orders.map(o => o.medicalHistoryId))];
      const doctorIds = [...new Set(orders.map(o => o.doctorId))];

      // 2. Batch fetch medical histories song song
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

      // 3. Extract patient IDs từ medical histories
      const patientIds = [...new Set(
        Object.values(medicalHistoryMap)
          .map((mh: any) => mh?.patientId)
          .filter(Boolean)
      )];

      // 4. Batch fetch patients và users cho patients
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

      // 5. Batch fetch doctors và users cho doctors
      const doctorUserIds = doctorIds;
      const userMap = await userController.getByIds(doctorUserIds);

      const doctorMap: Record<string, any> = {};
      await Promise.all(
        doctorIds.map(async (doctorId) => {
          try {
            const doctor = await doctorController.getById(doctorId);
            doctorMap[doctorId] = {
              ...doctor,
              user: userMap[doctorId],
            };
          } catch (error) {
            console.error(`Error fetching doctor ${doctorId}:`, error);
          }
        })
      );

      // 6. Map lại orders với thông tin đã fetch
      const enriched = orders.map((order) => {
        const mh = medicalHistoryMap[order.medicalHistoryId];
        let patientName = `Bệnh nhân ${order.medicalHistoryId.substring(0, 8)}`;

        if (mh?.patientId) {
          const patient = patientMap[mh.patientId];
          patientName = patient?.user?.fullName || patientName;
        }

        const doctor = doctorMap[order.doctorId];
        const doctorName = doctor?.user?.fullName || 'N/A';

        return {
          ...order,
          patientName,
          doctorName,
          time: new Date(order.createAt).toLocaleString('vi-VN'),
          priority: 'normal',
        };
      });

      setPrescriptions(enriched);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Không thể tải danh sách đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      //const [released, inProgress, sold, cancelled] = await Promise.all([
      const [released, sold, cancelled] = await Promise.all([
        inventoryController.getDispenseOrdersByStatus('RELEASED'),
        // inventoryController.getDispenseOrdersByStatus('IN_PROGRESS'),
        inventoryController.getDispenseOrdersByStatus('SOLD'),
        inventoryController.getDispenseOrdersByStatus('CANCELLED'),
      ]);

      setCounts({
        pending: released.length,
        // review: inProgress.length,
        dispensed: sold.length,
        cancelled: cancelled.length,
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [activeTab]);

  useEffect(() => {
    loadCounts();
  }, []);

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      RELEASED: {
        label: 'Chờ cấp',
        className: 'px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200'
      },
      IN_PROGRESS: {
        label: 'Cần xem xét',
        className: 'px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200'
      },
      SOLD: {
        label: 'Đã cấp phát',
        className: 'px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200'
      },
      CANCELLED: {
        label: 'Đã hủy',
        className: 'px-3 py-1.5 rounded-full bg-neutral-gray-100 text-neutral-gray-600 border border-neutral-gray-200'
      },
    };

    const statusInfo = statusMap[status] || statusMap.RELEASED

    ;
    return (
      <span className={`${statusInfo.className} text-xs font-semibold`}>
        {statusInfo.label}
      </span>
    );
  };

  const tabs = [
    { id: 'pending' as const, label: 'Chờ cấp', count: counts.pending },
    // { id: 'review' as const, label: 'Cần xem xét', count: counts.review },
    { id: 'dispensed' as const, label: 'Đã cấp phát', count: counts.dispensed },
    { id: 'cancelled' as const, label: 'Đã hủy', count: counts.cancelled },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="typo-h2 text-neutral-heading mb-2">
            Danh sách đơn thuốc
          </h1>
          <p className="text-base text-neutral-gray-500">
            Quản lý và cấp phát đơn thuốc
          </p>
        </div>
        <button
          onClick={() => {
            loadPrescriptions();
            loadCounts();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-neutral-surface border border-neutral-info text-neutral-info rounded-lg text-sm font-semibold hover:bg-neutral-muted transition-all duration-200 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại danh sách
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-gray-200 bg-neutral-surface rounded-t-xl px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${activeTab === tab.id
              ? 'border-primary text-primary bg-neutral-muted'
              : 'border-transparent text-neutral-gray-500 hover:text-primary hover:bg-neutral-gray-50'
              }`}
          >
            {tab.label} <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-gray-100 text-neutral-gray-700 text-xs font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo Mã Đơn hoặc Tên Bệnh nhân..."
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-gray-200 bg-neutral-surface text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <RefreshCw className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-neutral-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-gray-50 border-b border-neutral-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Mã Đơn
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Tên Bệnh nhân
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Bác sĩ kê
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-gray-100">
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
                    <tr
                      key={prescription.id}
                      className="hover:bg-neutral-gray-50 transition-colors cursor-pointer group"
                      onClick={() => onViewDetail(prescription.id)}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {prescription.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-text font-medium">
                        {prescription.patientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-text">
                        {prescription.doctorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-gray-500">
                        {prescription.time}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(prescription.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetail(prescription.id);
                            }}
                            className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow group-hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Search className="w-12 h-12 text-neutral-gray-300" />
                        <p className="text-sm text-neutral-gray-500 font-medium">
                          Không tìm thấy đơn thuốc nào
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
