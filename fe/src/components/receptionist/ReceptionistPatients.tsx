import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Phone, Mail, Calendar, User, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { appointmentController } from "../../controllers/AppointmentController";
import { patientController } from "../../controllers/PatientController";
import { PatientWithUser } from "../../models";
import { userController } from "../../controllers/UserController";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

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
};

export function ReceptionistPatients({
  onPatientSelect,
}: ReceptionistPatientsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch all patients (profiles)
        const patientProfiles = await patientController.getAll();

        // 2. Fetch all users
        const allUsers = await userController.getAll();
        const userMap = new Map(allUsers.map(u => [u.id, u]));

        // 3. Merge data
        const mergedPatients: PatientWithUser[] = patientProfiles.map(p => ({
          ...p,
          user: p.userId ? userMap.get(p.userId) : undefined
        }));

        setPatients(mergedPatients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách bệnh nhân');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients: DisplayPatient[] = useMemo(
    () =>
      patients
        .map((patient) => {
          const name = patient.user?.fullName || 'Chưa cập nhật';
          const phone = patient.contactPhone || patient.user?.phone || '';
          const email = patient.user?.email || '';
          const birthDate = patient.dob
            ? new Date(patient.dob).toLocaleDateString('vi-VN')
            : '-';
          return {
            id: patient.userId,
            code: patient.userId, // Using userId as code for now
            name,
            phone,
            email,
            birthDate,
            address: patient.address || '',
          };
        })
        .filter(
          (patient) =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.phone.includes(searchQuery) ||
            patient.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [patients, searchQuery]
  );

  // Pagination calculations
  const totalPatients = filteredPatients.length;
  const totalPages = Math.ceil(totalPatients / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  return (
    <div className="p-8 space-y-6 bg-neutral-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text tracking-tight mb-2">Quản lý Bệnh nhân</h1>
          <p className="text-neutral-text/70 font-medium">Danh sách và hồ sơ bệnh nhân</p>
        </div>
      </div>

      <Card className="p-5 border-neutral-border bg-neutral-surface shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-subtle" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo Tên, SĐT, Mã BN, Email..."
              className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="border-neutral-border bg-neutral-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-muted/30 hover:bg-neutral-muted/40">

              <TableHead className="font-semibold text-neutral-heading">
                Họ tên
              </TableHead>
              <TableHead className="font-semibold text-neutral-heading">
                Số điện thoại
              </TableHead>
              <TableHead className="font-semibold text-neutral-heading">
                Email
              </TableHead>
              <TableHead className="font-semibold text-neutral-heading">
                Ngày sinh
              </TableHead>
              <TableHead className="font-semibold text-neutral-heading">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-neutral-text/70 font-medium">
                      Đang tải danh sách bệnh nhân...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="text-red-600 font-medium">{error}</div>
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-neutral-muted rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-neutral-text/40" />
                    </div>
                    <p className="text-neutral-text/60 font-medium">
                      Không tìm thấy bệnh nhân nào
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-neutral-muted/30 transition-colors border-b border-neutral-border"
                >

                  <TableCell className="text-xs text-neutral-text/70 max-w-[200px] truncate">
                    <span className="text-sm text-neutral-text">
                      {patient.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-subtle" />
                      <span className="text-sm text-neutral-text">
                        {patient.phone || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-subtle" />
                      <span className="text-sm text-neutral-text">
                        {patient.email || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-subtle" />
                      <span className="text-sm text-neutral-text">
                        {patient.birthDate}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary-strong shadow-sm transition-all duration-200"
                      onClick={() => onPatientSelect(patient.id)}
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Total Patient Count */}
        {filteredPatients.length > 0 && (
          <div className="px-6 py-3 border-t border-neutral-border">
            <div className="text-sm text-neutral-text/70">
              Hiển thị <span className="font-medium text-neutral-text">{startIndex + 1}</span> đến{" "}
              <span className="font-medium text-neutral-text">{Math.min(endIndex, totalPatients)}</span> trong tổng số{" "}
              <span className="font-medium text-neutral-text">{totalPatients}</span> bệnh nhân
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center px-6 py-4 border-t border-neutral-border">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <span className="px-2">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
