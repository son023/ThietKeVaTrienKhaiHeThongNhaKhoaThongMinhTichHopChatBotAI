import { useState } from 'react';
import { Plus, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ImportExportManagement() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  const importRecords = [
    {
      id: 'PNK001',
      supplier: 'Nhà cung cấp A',
      date: '25/10/2025',
      creator: 'DS. Nguyễn Văn A',
      status: 'pending',
      totalValue: 15000000,
    },
    {
      id: 'PNK002',
      supplier: 'Nhà cung cấp B',
      date: '20/10/2025',
      creator: 'DS. Trần Thị B',
      status: 'completed',
      totalValue: 22000000,
    },
    {
      id: 'PNK003',
      supplier: 'Nhà cung cấp C',
      date: '15/10/2025',
      creator: 'DS. Nguyễn Văn A',
      status: 'completed',
      totalValue: 18500000,
    },
  ];

  const exportRecords = [
    {
      id: 'PXK001',
      type: 'Phiếu hủy',
      reason: 'Hết hạn sử dụng',
      date: '22/10/2025',
      creator: 'DS. Nguyễn Văn A',
      status: 'completed',
      items: 5,
    },
    {
      id: 'PXK002',
      type: 'Xuất nội bộ',
      reason: 'Chuyển phòng khám chi nhánh',
      date: '18/10/2025',
      creator: 'DS. Trần Thị B',
      status: 'completed',
      items: 12,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          <Clock className="w-3 h-3" />
          Chờ duyệt
        </span>
      );
    } else if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          <CheckCircle className="w-3 h-3" />
          Hoàn tất
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          <XCircle className="w-3 h-3" />
          Đã hủy
        </span>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Quản lý Nhập/Xuất kho
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Quản lý phiếu nhập và phiếu xuất kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Chức năng tạo Phiếu Hủy kho đang được phát triển')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dc3545] text-[#dc3545] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#fff5f5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo Phiếu Hủy kho
          </button>
          <button
            onClick={() => toast.info('Chức năng tạo Phiếu Nhập kho mới đang được phát triển')}
            className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo Phiếu Nhập kho
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${
            activeTab === 'import'
              ? 'border-[#3fb5ff] text-[#3fb5ff]'
              : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
          }`}
        >
          Phiếu nhập kho ({importRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${
            activeTab === 'export'
              ? 'border-[#3fb5ff] text-[#3fb5ff]'
              : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
          }`}
        >
          Phiếu xuất/hủy kho ({exportRecords.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
        {activeTab === 'import' && (
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Mã phiếu
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Nhà cung cấp
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Người tạo
                </th>
                <th className="px-6 py-4 text-right font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Tổng giá trị
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Hành động
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
                    {record.id}
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                    {record.supplier}
                  </td>
                  <td className="px-6 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                    {record.creator}
                  </td>
                  <td className="px-6 py-4 text-right font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#28a745]">
                    {formatCurrency(record.totalValue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getStatusBadge(record.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toast.info(`Xem chi tiết phiếu ${record.id}`)}
                        className="p-2 rounded-lg bg-[#3fb5ff] text-white hover:bg-[#3fb5ff]/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {record.status === 'pending' && (
                        <button
                          onClick={() => toast.success(`Đã duyệt phiếu ${record.id}`)}
                          className="p-2 rounded-lg bg-[#28a745] text-white hover:bg-[#218838] transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'export' && (
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Mã phiếu
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Loại phiếu
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Lý do
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Người tạo
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Số mặt hàng
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {exportRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                >
                  <td className="px-6 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                    {record.id}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full font-['Fz_Poppins:Medium',sans-serif] text-[12px] ${
                        record.type === 'Phiếu hủy'
                          ? 'bg-[#f8d7da] text-[#721c24]'
                          : 'bg-[#d1ecf1] text-[#0c5460]'
                      }`}
                    >
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                    {record.reason}
                  </td>
                  <td className="px-6 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                    {record.creator}
                  </td>
                  <td className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                    {record.items}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getStatusBadge(record.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => toast.info(`Xem chi tiết phiếu ${record.id}`)}
                        className="p-2 rounded-lg bg-[#3fb5ff] text-white hover:bg-[#3fb5ff]/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Empty State (if no records) */}
      {((activeTab === 'import' && importRecords.length === 0) ||
        (activeTab === 'export' && exportRecords.length === 0)) && (
        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#f8f9fa] flex items-center justify-center">
            <Plus className="w-10 h-10 text-[#6c757d]" />
          </div>
          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e] mb-2">
            Chưa có phiếu nào
          </h3>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d] mb-4">
            {activeTab === 'import'
              ? 'Tạo phiếu nhập kho đầu tiên của bạn'
              : 'Tạo phiếu xuất/hủy kho đầu tiên của bạn'}
          </p>
          <button className="px-6 py-3 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors">
            <Plus className="w-4 h-4 inline mr-2" />
            {activeTab === 'import' ? 'Tạo Phiếu Nhập kho' : 'Tạo Phiếu Xuất kho'}
          </button>
        </div>
      )}
    </div>
  );
}
