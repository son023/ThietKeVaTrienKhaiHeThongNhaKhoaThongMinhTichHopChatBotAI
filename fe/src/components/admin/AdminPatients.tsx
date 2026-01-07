import { useState, useEffect } from 'react';
import { Search, Phone, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { patientController } from '../../controllers/PatientController';
import { userController } from '../../controllers/UserController';
import { PatientWithUser } from '../../models/Patient';
import { AddPatientDialog } from '../shared/AddPatientDialog';

interface AdminPatientsProps {
  onNavigateToPatientDetail: (id: string) => void;
}

export function AdminPatients({ onNavigateToPatientDetail }: AdminPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await patientController.getAll();

      const patientsWithUser = await Promise.all(
        patientsData.map(async (patient) => {
          try {
            const user = await userController.getById(patient.userId);
            return { ...patient, user };
          } catch (err) {
            console.error(`Failed to load user for patient ${patient.userId}`, err);
            return { ...patient, user: undefined };
          }
        })
      );
      
      setPatients(patientsWithUser);
    } catch (err: any) {
      console.error('Failed to load patients:', err);
      setError(err.message || 'Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.contactPhone?.includes(searchQuery) ||
    patient.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 bg-[#fcfeff]">
        <div className="flex items-center justify-center py-12">
          <div className="text-[#333333]/60">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#fcfeff]">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Bệnh nhân</h1>
            <p className="text-sm text-[#333333]/60">Cơ sở dữ liệu bệnh nhân toàn phòng khám</p>
          </div>
          <AddPatientDialog onPatientAdded={loadPatients} />
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã BN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] border-[#e8e8e8]"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tổng bệnh nhân</p>
                <p className="text-[#01304e]">{patients.length}</p>
              </div>
              <User className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Bệnh nhân mới (tháng)</p>
                <p className="text-[#01304e]">24</p>
              </div>
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tái khám (tháng)</p>
                <p className="text-[#01304e]">48</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Đang điều trị</p>
                <p className="text-[#01304e]">32</p>
              </div>
              <div className="w-8 h-8 bg-[#3FB5FF]/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#3FB5FF]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã BN</TableHead>
                <TableHead>Tên bệnh nhân</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Lần khám cuối</TableHead>
                <TableHead>Lịch hẹn tiếp theo</TableHead>
                <TableHead>Số lần khám</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow
                  key={patient.userId}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onNavigateToPatientDetail(patient.userId)}
                >
                  <TableCell className="text-[#333333]/60">{patient.userId.substring(0, 8).toUpperCase()}</TableCell>
                  <TableCell className="text-[#333333]">{patient.user?.fullName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                        <Phone className="w-4 h-4" />
                        {patient.contactPhone || patient.user?.phone || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[#333333]/60">
                      <Calendar className="w-4 h-4" />
                      {patient.user?.createdAt ? new Date(patient.user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#333333]/40">—</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50">
                      — lần
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[10px]"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onNavigateToPatientDetail(patient.userId);
                      }}
                    >
                      Xem hồ sơ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
