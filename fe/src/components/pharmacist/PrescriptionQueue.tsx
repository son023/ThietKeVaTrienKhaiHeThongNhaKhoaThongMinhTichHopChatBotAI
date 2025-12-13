import { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { inventoryController, DispenseOrderDTO } from '../../controllers/InventoryController';
import { patientController } from '../../controllers/PatientController';
import { medicalHistoryController } from '../../controllers/MedicalHistoryController';
import { doctorController } from '../../controllers/DoctorController';
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
  const [activeTab, setActiveTab] = useState<'pending' | 'review' | 'dispensed' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<EnrichedDispenseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    review: 0,
    dispensed: 0,
    cancelled: 0,
  });

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      let status = '';
      switch (activeTab) {
        case 'pending':
          status = 'RESERVED'; // Đã giữ thuốc, chờ cấp phát
          break;
        case 'review':
          status = 'IN_PROGRESS'; // Đang xem xét
          break;
        case 'dispensed':
          status = 'SOLD'; // Đã cấp phát
          break;
        case 'cancelled':
          status = 'CANCELLED'; // Đã hủy
          break;
      }

      const orders = await inventoryController.getDispenseOrdersByStatus(status);

      // Enrich với thông tin bệnh nhân và bác sĩ
      const enriched = await Promise.all(
        // orders.map(async (order) => {
        //   let patientName = 'Đang tải...';
        //   let doctorName = 'Đang tải...';

        //   try {
        //     // Gọi imedical history service để lấy patientId
        //     // Tạm thời dùng medicalHistoryId để lấy thông tin
        //     // Bạn cần implement logic này dựa vào kiến trúc hệ thống
        //     patientName = 'Bệnh nhân ' + order.medicalHistoryId.substring(0, 8);


        //   } catch (error) {
        //     console.error('Error fetching patient:', error);
        //   }

        //   try {
        //     const data = await doctorController.getWithUserById(order.doctorId);
        //     doctorName = `${data.user?.fullName || 'N/A'}`;
        //   } catch (error) {
        //     console.error('Error fetching doctor:', error);
        //   }

        //   return {
        //     ...order,
        //     patientName,
        //     doctorName,
        //     time: new Date(order.createAt).toLocaleString('vi-VN'),
        //     priority: 'normal', // Có thể tính toán dựa vào thời gian tạo
        //   };
        // })
        orders.map(async (order) => {
          let patientName = 'Đang tải...';
          let doctorName = 'Đang tải...';

          try {
            // Lấy patientId từ medicalHistoryId
            const mh = await medicalHistoryController.getById(order.medicalHistoryId);
            if (mh?.patientId) {
              const patient = await patientController.getWithUserById(mh.patientId);
          
              patientName = patient.user?.fullName || '';
                // patient.user?.fullName ||
                // `Bệnh nhân ${mh.patientId.substring(0, 8)}`;
                //console.log(patient);
            } else {
              patientName = `Bệnh nhân ${order.medicalHistoryId.substring(0, 8)}`;
            }
          } catch (error) {
            console.error('Error fetching patient:', error);
            patientName = `Bệnh nhân ${order.medicalHistoryId.substring(0, 8)}`;
          }

          try {
            const data = await doctorController.getWithUserById(order.doctorId);
            doctorName = `${data.user?.fullName || 'N/A'}`;
          } catch (error) {
            console.error('Error fetching doctor:', error);
          }

          return {
            ...order,
            patientName,
            doctorName,
            time: new Date(order.createAt).toLocaleString('vi-VN'),
            priority: 'normal',
          };
        })
      );

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
      const [reserved, inProgress, sold, cancelled] = await Promise.all([
        inventoryController.getDispenseOrdersByStatus('RESERVED'),
        inventoryController.getDispenseOrdersByStatus('IN_PROGRESS'),
        inventoryController.getDispenseOrdersByStatus('SOLD'),
        inventoryController.getDispenseOrdersByStatus('CANCELLED'),
      ]);

      setCounts({
        pending: reserved.length,
        review: inProgress.length,
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
      RESERVED: { 
        label: 'Chờ cấp', 
        className: 'px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404]' 
      },
      IN_PROGRESS: { 
        label: 'Cần xem xét', 
        className: 'px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24]' 
      },
      SOLD: { 
        label: 'Đã cấp phát', 
        className: 'px-3 py-1 rounded-full bg-[#d4edda] text-[#155724]' 
      },
      CANCELLED: { 
        label: 'Đã hủy', 
        className: 'px-3 py-1 rounded-full bg-[#f8f9fa] text-[#6c757d]' 
      },
    };

    const statusInfo = statusMap[status] || statusMap.RESERVED;
    return (
      <span className={`${statusInfo.className} font-['Fz_Poppins:Medium',sans-serif] text-[12px]`}>
        {statusInfo.label}
      </span>
    );
  };

  const tabs = [
    { id: 'pending' as const, label: 'Chờ cấp', count: counts.pending },
    { id: 'review' as const, label: 'Cần xem xét', count: counts.review },
    { id: 'dispensed' as const, label: 'Đã cấp phát', count: counts.dispensed },
    { id: 'cancelled' as const, label: 'Đã hủy', count: counts.cancelled },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Đơn thuốc chờ cấp
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Quản lý và cấp phát đơn thuốc
          </p>
        </div>
        <button 
          onClick={() => {
            loadPrescriptions();
            loadCounts();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3295d0] text-[#05619a] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f0f9ff] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại danh sách
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#3fb5ff] text-[#3fb5ff]'
                : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#05619a]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo Mã Đơn hoặc Tên Bệnh nhân..."
          className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#3fb5ff]" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Mã Đơn
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Tên Bệnh nhân
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Bác sĩ kê
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((prescription) => (
                  <tr
                    key={prescription.id}
                    className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                    onClick={() => onViewDetail(prescription.id)}
                  >
                    <td className="px-6 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                      {prescription.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {prescription.patientName}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {prescription.doctorName}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
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
                          className="p-2 rounded-lg bg-[#3fb5ff] text-white hover:bg-[#3fb5ff]/90 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                      Không tìm thấy đơn thuốc nào
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}