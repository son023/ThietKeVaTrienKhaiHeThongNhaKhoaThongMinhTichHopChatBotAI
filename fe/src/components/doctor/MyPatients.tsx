import { useState, useEffect } from 'react';
import { Search, Phone, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { patientController, PatientWithUser } from '../../controllers/PatientController';

interface MyPatientsProps {
  onNavigateToPatient: (id: string) => void;
}

export function MyPatients({ onNavigateToPatient }: MyPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const patientData = await patientController.getWithUserDetails();
        setPatients(patientData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.contactPhone?.includes(searchQuery) ||
    patient.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <TableHead>Giới tính</TableHead>
                <TableHead>Địa chỉ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.userId}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onNavigateToPatient(patient.userId)}
                  >
                    <TableCell className="text-[#333333]/60">{patient.userId}</TableCell>
                    <TableCell className="text-[#333333]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {patient.user?.fullName || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[#333333]/60">
                        <Phone className="w-4 h-4" />
                        {patient.contactPhone || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#333333]/60">{patient.gender || 'N/A'}</TableCell>
                    <TableCell className="text-[#333333]/60">{patient.address || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-[#333333]/60">
                    Không có bệnh nhân nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
