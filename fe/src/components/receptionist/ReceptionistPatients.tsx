import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Phone, Mail, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { appointmentController } from '../../controllers/AppointmentController';
import { patientController, PatientWithUser } from '../../controllers/PatientController';

interface ReceptionistPatientsProps {
  onPatientSelect: (patientId: string) => void;
}

type DisplayPatient = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  notes: string;
  lastVisit: string;
};

export function ReceptionistPatients({ onPatientSelect }: ReceptionistPatientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTodayPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const appointments = await appointmentController.getAll();
        const today = new Date();

        const isSameDay = (dateStr: string) => {
          const d = new Date(dateStr);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          );
        };

        const todayAppointments = appointments.filter(
          (apt) => apt.appointmentStartTime && isSameDay(apt.appointmentStartTime)
        );

        const patientIds = Array.from(
          new Set(todayAppointments.map((apt) => apt.patientId).filter(Boolean))
        );

        const patientData = await Promise.all(
          patientIds.map(async (pid) => {
            try {
              return await patientController.getWithUserById(pid);
            } catch (err) {
              console.error('Failed to fetch patient', pid, err);
              return null;
            }
          })
        );

        const patientTimeMap: Record<string, string> = {};
        todayAppointments.forEach((apt) => {
          if (!apt.patientId || !apt.appointmentStartTime) return;
          const start = new Date(apt.appointmentStartTime);
          patientTimeMap[apt.patientId] = isNaN(start.getTime())
            ? '-'
            : start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        });

        setPatients(patientData.filter(Boolean) as PatientWithUser[]);
        setPatientAppointments(patientTimeMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Khong the tai danh sach benh nhan hom nay');
      } finally {
        setLoading(false);
      }
    };

    loadTodayPatients();
  }, []);

  const filteredPatients: DisplayPatient[] = useMemo(
    () =>
      patients
        .map((patient) => {
          const name = patient.user?.fullName || 'Chua cap nhat';
          const phone = patient.contactPhone || patient.user?.phone || '';
          const email = patient.user?.email || '';
          const birthDate = patient.dob
            ? new Date(patient.dob).toLocaleDateString('vi-VN')
            : '-';
          return {
            id: patient.userId,
            code: patient.userId,
            name,
            phone,
            email,
            birthDate,
            address: patient.address || '',
            notes: patient.allergy || '',
            lastVisit: patientAppointments[patient.userId] || '-',
          };
        })
        .filter(
          (patient) =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.phone.includes(searchQuery) ||
            patient.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [patients, searchQuery, patientAppointments]
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#01304e] mb-1">Quan ly Benh nhan</h1>
          <p className="text-gray-600">Danh sach va ho so benh nhan</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tim kiem theo Ten, SDT, Ma BN, Email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">
            + Them Benh nhan moi
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tong so benh nhan hom nay</p>
          <p className="text-2xl text-[#01304e]">{patients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Benh nhan moi (thang nay)</p>
          <p className="text-2xl text-green-600">-</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Ca lich hen hom nay</p>
          <p className="text-2xl text-blue-600">{patients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Can lien he lai</p>
          <p className="text-2xl text-orange-600">-</p>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ma BN</TableHead>
              <TableHead>Ho ten</TableHead>
              <TableHead>So dien thoai</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ngay sinh</TableHead>
              <TableHead>Gio hen hom nay</TableHead>
              <TableHead>Ghi chu</TableHead>
              <TableHead>Thao tac</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Dang tai danh sach benh nhan hom nay...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Khong tim thay benh nhan nao co lich hom nay
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
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
                      <span className="text-sm">{patient.phone || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{patient.email || '-'}</span>
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
                      <div
                        className="text-xs text-gray-600 max-w-[200px] truncate"
                        title={patient.notes}
                      >
                        {patient.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => onPatientSelect(patient.id)}>
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
