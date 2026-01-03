import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Phone, Mail, Calendar, User, Eye, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { appointmentController } from "../../controllers/AppointmentController";
import {
  patientController,
  PatientWithUser,
} from "../../controllers/PatientController";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  notes: string;
  lastVisit: string;
};

export function ReceptionistPatients({
  onPatientSelect,
}: ReceptionistPatientsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filterType, setFilterType] = useState<"day" | "month">("day");
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Format: YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  ); // Format: YYYY-MM
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const appointments = await appointmentController.getAll();
        
        let filteredAppointments = appointments;
        
        if (filterType === "day") {
          // Filter by selected day
          const selected = new Date(selectedDay);
          filteredAppointments = appointments.filter((apt) => {
            if (!apt.appointmentStartTime) return false;
            const aptDate = new Date(apt.appointmentStartTime);
            return (
              !isNaN(aptDate.getTime()) &&
              aptDate.getFullYear() === selected.getFullYear() &&
              aptDate.getMonth() === selected.getMonth() &&
              aptDate.getDate() === selected.getDate()
            );
          });
        } else if (filterType === "month") {
          // Filter by selected month
          const [year, month] = selectedMonth.split("-").map(Number);
          filteredAppointments = appointments.filter((apt) => {
            if (!apt.appointmentStartTime) return false;
            const aptDate = new Date(apt.appointmentStartTime);
            return (
              !isNaN(aptDate.getTime()) &&
              aptDate.getMonth() === month - 1 &&
              aptDate.getFullYear() === year
            );
          });
        }

        const todayAppointments = filteredAppointments;

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
          if (isNaN(start.getTime())) {
            patientTimeMap[apt.patientId] = '-';
          } else {
            if (filterType === "day") {
              // Show time only for day filter
              patientTimeMap[apt.patientId] = start.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
            } else {
              // Show full date for month filter
              patientTimeMap[apt.patientId] = start.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            }
          }
        });

        setPatients(patientData.filter(Boolean) as PatientWithUser[]);
        setPatientAppointments(patientTimeMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách bệnh nhân');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filterType, selectedDay, selectedMonth]);

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
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neutral-text/70" />
            <span className="text-sm font-medium text-neutral-text">
              Lọc theo:
            </span>
          </div>
          
          <Select value={filterType} onValueChange={(value: "day" | "month") => setFilterType(value)}>
            <SelectTrigger className="w-[140px] border-neutral-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
            </SelectContent>
          </Select>

          {filterType === "day" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-text/70">Chọn ngày:</span>
              <Input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-[160px] border-neutral-border"
              />
            </div>
          )}

          {filterType === "month" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-text/70">Chọn tháng:</span>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[160px] border-neutral-border"
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="border-neutral-border bg-neutral-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-muted/30 hover:bg-neutral-muted/40">
              <TableHead className="font-semibold text-neutral-heading">
                Mã BN
              </TableHead>
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
                {filterType === "day" ? "Giờ hẹn" : "Ngày hẹn"}
              </TableHead>
              <TableHead className="font-semibold text-neutral-heading">
                Ghi chú
              </TableHead>
              <TableHead className="font-semibold text-neutral-heading">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-neutral-text/70 font-medium">
                      {filterType === "day" 
                        ? "Đang tải danh sách bệnh nhân..." 
                        : "Đang tải danh sách bệnh nhân..."}
                    </p>
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
                    <p className="text-neutral-text/60 font-medium">
                      {filterType === "day" 
                        ? "Không tìm thấy bệnh nhân nào có lịch trong ngày này" 
                        : "Không tìm thấy bệnh nhân nào có lịch trong tháng này"}
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
                  <TableCell className="font-mono text-xs text-neutral-text/70">
                    {patient.code}
                  </TableCell>
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
                  <TableCell className="text-sm text-neutral-text">
                    {patient.lastVisit}
                  </TableCell>
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
