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
  PatientWithUser,
} from "../../controllers/PatientController";
import { appointmentController } from "../../controllers/AppointmentController";
import { authController } from "../../controllers";

interface MyPatientsProps {
  onNavigateToPatient: (id: string) => void;
}

export function MyPatients({ onNavigateToPatient }: MyPatientsProps) {
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
    if (g === "nam") return "Nam";
    if (g === "nữ") return "Nu";
    return "Khac";
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-4">Benh nhan cua toi</h1>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            type="text"
            placeholder="Tim kiem theo ten, so dien thoai hoac ma benh nhan..."
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
                <TableHead>Ma BN (6 so cuoi)</TableHead>
                <TableHead>Ten benh nhan</TableHead>
                <TableHead>So dien thoai</TableHead>
                <TableHead>Ngay sinh</TableHead>
                <TableHead>Gioi tinh</TableHead>
                <TableHead>Nhom mau</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    Dang tai du lieu...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-red-500"
                  >
                    {error}
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
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => onNavigateToPatient(patient.userId)}
                    >
                      <TableCell className="text-[#333333]/60">
                        {displayId}
                      </TableCell>
                      <TableCell className="text-[#333333]">
                        {patient.user?.fullName || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[#333333]/60">
                          <Phone className="w-4 h-4" />
                          {phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#333333]/60">
                        {formatDob(patient.dob)}
                      </TableCell>
                      <TableCell className="text-[#333333]/60">
                        {formatGender(patient.gender)}
                      </TableCell>
                      <TableCell className="text-[#333333]/60">
                        {bloodType}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-[#333333]/60"
                  >
                    Khong tim thay benh nhan phu hop
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
