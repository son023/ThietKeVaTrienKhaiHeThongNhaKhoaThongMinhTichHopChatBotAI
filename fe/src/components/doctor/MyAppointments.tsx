import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Phone, Search, User } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  appointmentController,
  AppointmentDTO,
} from "../../controllers/AppointmentController";
import {
  patientController,
  PatientWithUser,
} from "../../controllers/PatientController";

interface MyAppointmentsProps {
  doctorId?: string | null;
  onNavigateToPatient: (id: string) => void;
}

const statusMap: Record<string, { label: string; style: string }> = {
  pending: {
    label: "Cho xac nhan",
    style: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  confirmed: {
    label: "Da xac nhan",
    style: "bg-green-100 text-green-800 border-green-300",
  },
  completed: {
    label: "Da hoan thanh",
    style: "bg-blue-100 text-blue-800 border-blue-300",
  },
  cancelled: {
    label: "Da huy",
    style: "bg-red-100 text-red-800 border-red-300",
  },
  "no-show": {
    label: "Khong den",
    style: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export function MyAppointments({
  onNavigateToPatient,
  doctorId,
}: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [patientMap, setPatientMap] = useState<Record<string, PatientWithUser>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!doctorId) {
          setError("Khong tim thay thong tin bac si");
          return;
        }

        const data = await appointmentController.getByDoctorId(doctorId);
        setAppointments(data);

        const patientIds = Array.from(
          new Set(data.map((apt) => apt.patientId).filter(Boolean))
        );
        if (patientIds.length === 0) {
          setPatientMap({});
          return;
        }

        const patients = await Promise.all(
          patientIds.map(async (pid) => {
            try {
              return await patientController.getWithUserById(pid);
            } catch (err) {
              console.error("Failed to load patient", pid, err);
              return null;
            }
          })
        );

        const map: Record<string, PatientWithUser> = {};
        patients.forEach((p) => {
          if (p) map[p.userId] = p;
        });
        setPatientMap(map);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Khong tai duoc lich hen"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [doctorId]);

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return appointments
      .map((apt) => {
        const patient = apt.patientId ? patientMap[apt.patientId] : undefined;
        return { ...apt, patient };
      })
      .filter((apt) => {
        const name = apt.patient?.user?.fullName?.toLowerCase() || "";
        const phone =
          apt.patient?.contactPhone || apt.patient?.user?.phone || "";
        const pid = apt.patientId?.toLowerCase() || "";
        return (
          name.includes(q) || phone.includes(searchQuery) || pid.includes(q)
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.appointmentStartTime).getTime();
        const bTime = new Date(b.appointmentStartTime).getTime();
        return aTime - bTime;
      });
  }, [appointments, patientMap, searchQuery]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filteredAppointments> = {};
    filteredAppointments.forEach((apt) => {
      const dateKey = new Date(apt.appointmentStartTime).toLocaleDateString(
        "vi-VN"
      );
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(apt);
    });
    return groups;
  }, [filteredAppointments]);

  const renderStatus = (status: string) => {
    const meta = statusMap[status] || statusMap["pending"];
    return <Badge className={meta.style}>{meta.label}</Badge>;
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#01304e] mb-2">Lich hen cua toi</h1>
          <p className="text-[#333333]/60">
            Theo doi cac cuoc hen gan day va sap toi
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            placeholder="Tim theo ten, so dien thoai, ma benh nhan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] border-[#e8e8e8]"
          />
        </div>
      </div>

      {loading ? (
        <Card className="rounded-[15px] border-[#e8e8e8]">
          <CardContent className="p-8 text-center text-[#333333]/60">
            Dang tai lich hen...
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="rounded-[15px] border-[#e8e8e8]">
          <CardContent className="p-8 text-center text-red-500">
            {error}
          </CardContent>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card className="rounded-[15px] border-[#e8e8e8]">
          <CardContent className="p-8 text-center text-[#333333]/60">
            Khong co lich hen nao phu hop
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#3FB5FF]" />
              <h2 className="text-[#01304e] font-semibold">{date}</h2>
            </div>
            <div className="space-y-3">
              {items.map((apt) => {
                const patientName = apt.patient?.user?.fullName || "Benh nhan";
                const phone =
                  apt.patient?.contactPhone ||
                  apt.patient?.user?.phone ||
                  "N/A";
                const start = new Date(apt.appointmentStartTime);
                const timeLabel = isNaN(start.getTime())
                  ? "N/A"
                  : start.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                return (
                  <Card
                    key={apt.id}
                    className="cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[12px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]"
                    onClick={() =>
                      apt.patientId && onNavigateToPatient(apt.patientId)
                    }
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[#333333]/70 min-w-[80px]">
                          <Clock className="w-4 h-4" />
                          <span>{timeLabel}</span>
                        </div>
                        <div>
                          <p className="text-[#333333]">{patientName}</p>
                          <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                            <Phone className="w-4 h-4 ml-3" />
                            <span>{phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {renderStatus(apt.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-[10px] border-[#3FB5FF] text-[#3FB5FF]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (apt.patientId)
                              onNavigateToPatient(apt.patientId);
                          }}
                        >
                          Xem ho so
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
