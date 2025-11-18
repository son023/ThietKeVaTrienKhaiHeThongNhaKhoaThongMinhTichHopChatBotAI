import { useState } from 'react';
import { Search, Phone, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface MyPatientsProps {
  onNavigateToPatient: (id: string) => void;
}

export function MyPatients({ onNavigateToPatient }: MyPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const patients = [
    {
      id: 'BN001',
      name: 'Nguyễn Văn An',
      phone: '0901234567',
      lastVisit: '25/10/2025',
      status: 'in-treatment',
      nextAppointment: '30/10/2025',
    },
    {
      id: 'BN002',
      name: 'Trần Thị Bình',
      phone: '0912345678',
      lastVisit: '24/10/2025',
      status: 'completed',
      nextAppointment: null,
    },
    {
      id: 'BN003',
      name: 'Lê Văn Cường',
      phone: '0923456789',
      lastVisit: '20/10/2025',
      status: 'in-treatment',
      nextAppointment: '27/10/2025',
    },
    {
      id: 'BN004',
      name: 'Phạm Thị Dung',
      phone: '0934567890',
      lastVisit: '23/10/2025',
      status: 'in-treatment',
      nextAppointment: '28/10/2025',
    },
    {
      id: 'BN005',
      name: 'Hoàng Văn Em',
      phone: '0945678901',
      lastVisit: '22/10/2025',
      status: 'completed',
      nextAppointment: null,
    },
    {
      id: 'BN006',
      name: 'Đỗ Thị Phương',
      phone: '0956789012',
      lastVisit: '26/10/2025',
      status: 'in-treatment',
      nextAppointment: '02/11/2025',
    },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'in-treatment') {
      return <Badge className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">Đang điều trị</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Hoàn thành</Badge>;
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-4">Bệnh nhân của tôi</h1>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã bệnh nhân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] border-[#e8e8e8]"
          />
        </div>
      </div>

      <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã BN</TableHead>
                <TableHead>Tên bệnh nhân</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Ngày khám cuối</TableHead>
                <TableHead>Lịch hẹn tiếp theo</TableHead>
                <TableHead>Tình trạng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onNavigateToPatient(patient.id)}
                >
                  <TableCell className="text-[#333333]/60">{patient.id}</TableCell>
                  <TableCell className="text-[#333333]">{patient.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[#333333]/60">
                      <Phone className="w-4 h-4" />
                      {patient.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[#333333]/60">
                      <Calendar className="w-4 h-4" />
                      {patient.lastVisit}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.nextAppointment ? (
                      <div className="flex items-center gap-2 text-[#3FB5FF]">
                        <Calendar className="w-4 h-4" />
                        {patient.nextAppointment}
                      </div>
                    ) : (
                      <span className="text-[#333333]/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 text-[#333333]/60">
          Không tìm thấy bệnh nhân phù hợp
        </div>
      )}
    </div>
  );
}
