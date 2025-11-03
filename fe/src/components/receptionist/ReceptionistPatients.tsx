import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Phone, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface Patient {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  notes: string;
  lastVisit: string;
}

interface ReceptionistPatientsProps {
  onPatientSelect: (patientId: string) => void;
}

export function ReceptionistPatients({ onPatientSelect }: ReceptionistPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const patients: Patient[] = [
    {
      id: '1',
      code: 'BN001',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@gmail.com',
      birthDate: '15/03/1985',
      address: '123 Nguyễn Huệ, Q1, TP.HCM',
      notes: 'Khách hàng VIP',
      lastVisit: '20/10/2025',
    },
    {
      id: '2',
      code: 'BN002',
      name: 'Trần Thị B',
      phone: '0902345678',
      email: 'tranthib@gmail.com',
      birthDate: '22/07/1990',
      address: '456 Lê Lợi, Q1, TP.HCM',
      notes: '',
      lastVisit: '18/10/2025',
    },
    {
      id: '3',
      code: 'BN003',
      name: 'Lê Văn C',
      phone: '0903456789',
      email: 'levanc@gmail.com',
      birthDate: '10/11/1988',
      address: '789 Trần Hưng Đạo, Q5, TP.HCM',
      notes: 'Dị ứng thuốc gây tê',
      lastVisit: '15/10/2025',
    },
    {
      id: '4',
      code: 'BN004',
      name: 'Phạm Thị D',
      phone: '0904567890',
      email: 'phamthid@gmail.com',
      birthDate: '05/09/1992',
      address: '321 Điện Biên Phủ, Q3, TP.HCM',
      notes: '',
      lastVisit: '12/10/2025',
    },
    {
      id: '5',
      code: 'BN005',
      name: 'Hoàng Văn E',
      phone: '0905678901',
      email: 'hoangvane@gmail.com',
      birthDate: '28/12/1987',
      address: '654 Võ Văn Tần, Q3, TP.HCM',
      notes: 'Bệnh nhân khó tính, cần gọi nhắc trước 2 ngày',
      lastVisit: '08/10/2025',
    },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery) ||
    patient.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#01304e] mb-1">Quản lý Bệnh nhân</h1>
          <p className="text-gray-600">Danh sách và hồ sơ bệnh nhân</p>
        </div>
      </div>

      {/* Search and Actions */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo Tên, SĐT, Mã BN, Email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">
            + Thêm Bệnh nhân mới
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tổng số bệnh nhân</p>
          <p className="text-2xl text-[#01304e]">{patients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Bệnh nhân mới (tháng này)</p>
          <p className="text-2xl text-green-600">12</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Có lịch hẹn hôm nay</p>
          <p className="text-2xl text-blue-600">8</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Cần liên hệ lại</p>
          <p className="text-2xl text-orange-600">3</p>
        </Card>
      </div>

      {/* Patient Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã BN</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Lần khám gần nhất</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-mono text-xs">{patient.code}</TableCell>
                <TableCell>
                  <button
                    onClick={() => onPatientSelect(patient.id)}
                    className="text-[#3FB5FF] hover:underline text-left"
                  >
                    {patient.name}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{patient.birthDate}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{patient.lastVisit}</TableCell>
                <TableCell>
                  {patient.notes && (
                    <div className="text-xs text-gray-600 max-w-[200px] truncate" title={patient.notes}>
                      {patient.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPatientSelect(patient.id)}
                  >
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPatients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy bệnh nhân nào
          </div>
        )}
      </Card>
    </div>
  );
}
