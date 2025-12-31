import { useEffect, useMemo, useState } from "react";
import { Search, Phone } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  patientController,
} from "../../controllers/PatientController";
import { appointmentController } from "../../controllers/AppointmentController";
import { authController } from "../../controllers";
import {PatientWithUser} from "../../models";

interface MyPatientsProps {
  onNavigateToPatient: (id: string) => void;
  onNavigateToAppointments?: () => void;
}

export function MyPatients({ onNavigateToPatient, onNavigateToAppointments }: MyPatientsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = authController.getCurrentUser();
        if (!currentUser?.id) {
          setError("Khong tim thay thong tin bac si dang dang nhap");
          setPatients([]);
          return;
        }

        const appointments = await appointmentController.getByDoctorId(
          currentUser.id
        );
        const patientIds = Array.from(
          new Set(appointments.map((apt) => apt.patientId).filter(Boolean))
        );

        if (!patientIds.length) {
          setPatients([]);
          return;
        }

        const patientData = await Promise.all(
          patientIds.map(async (pid) => {
            try {
              return await patientController.getWithUserById(pid);
            } catch (err) {
              console.error("Failed to load patient", pid, err);
              return null;
            }
          })
        );

        setPatients(patientData.filter(Boolean) as PatientWithUser[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.user?.fullName?.toLowerCase().includes(q) ||
        patient.contactPhone?.includes(searchQuery) ||
        patient.user?.phone?.includes(searchQuery) ||
        patient.userId.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const formatDob = (dob?: string) => {
    if (!dob) return "-";
    const date = new Date(dob);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("vi-VN");
  };

  const formatGender = (gender?: string) => {
    if (!gender) return "-";
    const g = gender.toLowerCase();
    if (g === "male") return "Nam";
    if (g === "female") return "Nữ";
    return "Khác";
  };

  return (
    <div className="p-6 bg-[var(--page-bg)] min-h-screen">
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Bệnh nhân của tôi</h1>
        <p className="text-neutral-text/60 mb-6">
          Danh sách bệnh nhân đã từng khám
        </p>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã bệnh nhân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-xl border-neutral-border/30 bg-neutral-surface focus:border-primary transition-colors h-11 shadow-sm"
          />
        </div>
      </div>

      <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-muted hover:bg-neutral-muted border-b border-neutral-border/30">
                  <TableHead className="font-semibold text-neutral-text">Mã BN (6 số cuối)</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Tên bệnh nhân</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Số điện thoại</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Ngày sinh</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Giới tính</TableHead>
                  <TableHead className="font-semibold text-neutral-text">Nhóm máu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-neutral-text/60">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16"
                    >
                      <div className="flex items-center justify-center gap-3 text-red-600">
                        <Search className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => {
                    const displayId =
                      patient.userId && patient.userId.length > 6
                        ? patient.userId.slice(-6)
                        : patient.userId || "N/A";
                    const phone =
                      patient.contactPhone || patient.user?.phone || "N/A";
                    const bloodType = patient.bloodType || "-";

                    return (
                      <TableRow
                        key={patient.userId}
                        className="cursor-pointer hover:bg-neutral-muted/50 border-b border-neutral-border/20 transition-colors"
                        onClick={() => onNavigateToPatient(patient.userId)}
                      >
                        <TableCell className="text-neutral-text/60 font-mono">
                          {displayId}
                        </TableCell>
                        <TableCell className="font-semibold text-neutral-text">
                          {patient.user?.fullName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-neutral-text/60">
                            <Phone className="w-4 h-4" />
                            <span>{phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-text/60">
                          {formatDob(patient.dob)}
                        </TableCell>
                        <TableCell className="text-neutral-text/60">
                          {formatGender(patient.gender)}
                        </TableCell>
                        <TableCell className="text-neutral-text/60 font-medium">
                          {bloodType}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-neutral-text/40" />
                        </div>
                        <p className="text-neutral-text/60">Không tìm thấy bệnh nhân phù hợp</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
