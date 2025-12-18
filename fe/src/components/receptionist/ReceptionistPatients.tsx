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
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">Quan ly Benh nhan</h1>
          <p className="text-neutral-text/70 font-medium">Danh sach va ho so benh nhan</p>
        </div>
      </div>

      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-subtle" />
            <Input
              type="text"
              placeholder="Tim kiem theo Ten, SDT, Ma BN, Email..."
              className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-primary hover:bg-primary-strong shadow-sm transition-all duration-200">
            + Them Benh nhan moi
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <p className="text-sm text-neutral-text/70 mb-2 font-medium">Tong so benh nhan hom nay</p>
          <p className="text-3xl font-bold text-neutral-text">{patients.length}</p>
        </Card>
        <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <p className="text-sm text-neutral-text/70 mb-2 font-medium">Benh nhan moi (thang nay)</p>
          <p className="text-3xl font-bold text-green-600">-</p>
        </Card>
        <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <p className="text-sm text-neutral-text/70 mb-2 font-medium">Ca lich hen hom nay</p>
          <p className="text-3xl font-bold text-primary">{patients.length}</p>
        </Card>
        <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
          <p className="text-sm text-neutral-text/70 mb-2 font-medium">Can lien he lai</p>
          <p className="text-3xl font-bold text-accent-orange">-</p>
        </Card>
      </div>

      <Card className="border-neutral-border bg-neutral-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-muted/30 hover:bg-neutral-muted/40">
              <TableHead className="font-semibold text-neutral-text">Ma BN</TableHead>
              <TableHead className="font-semibold text-neutral-text">Ho ten</TableHead>
              <TableHead className="font-semibold text-neutral-text">So dien thoai</TableHead>
              <TableHead className="font-semibold text-neutral-text">Email</TableHead>
              <TableHead className="font-semibold text-neutral-text">Ngay sinh</TableHead>
              <TableHead className="font-semibold text-neutral-text">Gio hen hom nay</TableHead>
              <TableHead className="font-semibold text-neutral-text">Ghi chu</TableHead>
              <TableHead className="font-semibold text-neutral-text">Thao tac</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-neutral-text/70 font-medium">Dang tai danh sach benh nhan hom nay...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-red-600 font-medium">{error}</div>
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-neutral-muted rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-neutral-text/40" />
                    </div>
                    <p className="text-neutral-text/60 font-medium">Khong tim thay benh nhan nao co lich hom nay</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-neutral-muted/30 transition-colors border-b border-neutral-border">
                  <TableCell className="font-mono text-xs text-neutral-text/70">{patient.code}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => onPatientSelect(patient.id)}
                      className="text-primary hover:text-primary-strong hover:underline text-left font-medium transition-colors"
                    >
                      {patient.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-subtle" />
                      <span className="text-sm text-neutral-text">{patient.phone || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-subtle" />
                      <span className="text-sm text-neutral-text">{patient.email || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-subtle" />
                      <span className="text-sm text-neutral-text">{patient.birthDate}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-text">{patient.lastVisit}</TableCell>
                  <TableCell>
                    {patient.notes && (
                      <div
                        className="text-xs text-neutral-text/70 max-w-[200px] truncate"
                        title={patient.notes}
                      >
                        {patient.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="border-neutral-border hover:bg-neutral-muted hover:border-primary transition-all" onClick={() => onPatientSelect(patient.id)}>
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
