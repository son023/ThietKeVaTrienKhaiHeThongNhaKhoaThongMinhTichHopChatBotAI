import React, { useEffect, useMemo, useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { Button } from "../ui/button";
import {
  Search,
  Sparkles,
  Crown,
  Activity,
  Stethoscope,
  Baby,
  Heart,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  medicalServiceController,
  MedicalServiceDTO,
} from "../../controllers/MedicalServiceController";

const placeholderImg =
  "https://images.unsplash.com/photo-1582719478248-04f620d293d8?auto=format&fit=crop&w=1200&q=80";
const iconPool = [
  <Sparkles key="sparkles" className="w-[24px] h-[24px]" />,
  <Crown key="crown" className="w-[24px] h-[24px]" />,
  <Activity key="activity" className="w-[24px] h-[24px]" />,
  <Stethoscope key="steth" className="w-[24px] h-[24px]" />,
  <Baby key="baby" className="w-[24px] h-[24px]" />,
  <Heart key="heart" className="w-[24px] h-[24px]" />,
];

const SPECIALIZATION_MAP: Record<string, string> = {
  GEN: "General Dentistry",
  ENDO: "Endodontics (Noi nha)",
  ORTHO: "Orthodontics (Chinh nha)",
  PERIO: "Periodontics (Nha chu)",
  PROSTH: "Prosthodontics (Phuc hinh rang)",
  IMPL: "Implant Dentistry",
  OMFS: "Oral & Maxillofacial Surgery",
  PEDO: "Pediatric Dentistry",
  COS: "Cosmetic Dentistry",
  OMDIAG: "Oral Medicine",
  RAD: "Radiology",
};

interface ServicesListProps {
  onServiceSelect?: (serviceId: string) => void;
  onBooking?: (serviceId?: string) => void;
}

export function ServicesList({
  onServiceSelect,
  onBooking,
}: ServicesListProps) {
  const [services, setServices] = useState<MedicalServiceDTO[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    medicalServiceController
      .getAll()
      .then((data) => {
        setServices(data);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Khong tai duoc dich vu")
      )
      .finally(() => setLoading(false));
  }, []);

  const categoryFilters = useMemo(() => {
    const types = Array.from(
      new Set(
        services
          .map((s) => s.serviceType)
          .filter((t): t is string => Boolean(t))
      )
    );
    return [
      { id: "all", label: "Tat ca dich vu" },
      ...types.map((t) => ({ id: t.toLowerCase(), label: SPECIALIZATION_MAP[t] || t })),
    ];
  }, [services]);

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filter = selectedFilter.toLowerCase();
    return services.filter((s) => {
      const typeCode = s.serviceType?.toLowerCase() || "";
      const typeLabel = SPECIALIZATION_MAP[s.serviceType || ""]?.toLowerCase() || "";
      const matchesFilter = filter === "all" || typeCode === filter;
      const matchesSearch =
        s.serviceName.toLowerCase().includes(q) ||
        typeCode.includes(q) ||
        typeLabel.includes(q) ||
        (s.description || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [services, selectedFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[20px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] tracking-[0.5px]">
            Dịch vụ của chúng tôi
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-20 py-[60px] space-y-[40px]">
        <div className="max-w-[600px] mx-auto">
          <div className="relative">
            <Search className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#666666] w-[20px] h-[20px]" />
            <Input
              placeholder="Tim kiem dich vu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[56px] rounded-[28px] border-[#d6edfa] pl-[56px] pr-[20px] font-['Fz_Poppins:Regular',sans-serif] text-[16px] shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-[12px]">
          {categoryFilters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              className={`rounded-[20px] h-[42px] px-[24px] font-['Fz_Poppins:Medium',sans-serif] text-[15px] tracking-[0.5px] transition-all ${selectedFilter === filter.id
                ? "bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 shadow-[0px_4px_8px_0px_rgba(63,181,255,0.3)]"
                : "bg-[#fcfeff] text-[#333333] border-[#d6edfa] hover:bg-[#ebf6fc] hover:border-[#3fb5ff]"
                }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-[#666]">Dang tai dich vu...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="text-center">
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                Hien co {filteredServices.length} dich vu
              </p>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                {filteredServices.map((service, idx) => (
                  <ServiceCard
                    key={service.id}
                    name={service.serviceName}
                    description={
                      SPECIALIZATION_MAP[service.serviceType || ""] ||
                      service.description ||
                      "Dich vu y te"
                    }
                    image={service.imgUrl || placeholderImg}
                    price={`${service.price?.toLocaleString("vi-VN")} VND`}
                    icon={iconPool[idx % iconPool.length]}
                    onLearnMore={() => onServiceSelect?.(service.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-[80px] space-y-[20px]">
                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[20px]">
                  Khong tim thay dich vu phu hop
                </p>
                <Button
                  onClick={() => {
                    setSelectedFilter("all");
                    setSearchQuery("");
                  }}
                  className="bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[50px] px-[30px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#3fb5ff]/90"
                >
                  Xem tat ca dich vu
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[30px]">
          <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] tracking-[0.5px]">
            Can tu van ve dich vu?
          </h2>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] tracking-[0.5px] max-w-[600px] mx-auto">
            Doi ngu bac si cua chung toi san sang tu van va ho tro ban
          </p>
          <Button
            onClick={() => onBooking?.()}
            className="bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[56px] px-[40px] font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] hover:bg-[#3fb5ff]/90 shadow-[0px_4px_10px_0px_rgba(63,181,255,0.4)]"
          >
            Dat lich tu van ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
