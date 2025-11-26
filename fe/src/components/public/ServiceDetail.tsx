import React, { useEffect, useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { Calendar, CheckCircle, Clock, DollarSign } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import {
  medicalServiceController,
  MedicalServiceDTO,
} from "../../controllers/MedicalServiceController";

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
  onBooking: (serviceId: string) => void;
  onServiceSelect: (serviceId: string) => void;
}

const placeholderImg =
  "https://images.unsplash.com/photo-1582719478248-04f620d293d8?auto=format&fit=crop&w=1200&q=80";
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

export function ServiceDetail({
  serviceId,
  onBack,
  onBooking,
  onServiceSelect,
}: ServiceDetailProps) {
  const [service, setService] = useState<MedicalServiceDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<MedicalServiceDTO[]>([]);

  useEffect(() => {
    setLoading(true);
    medicalServiceController
      .getById(serviceId)
      .then((data) => {
        setService(data);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Khong tai duoc dich vu")
      )
      .finally(() => setLoading(false));
  }, [serviceId]);

  useEffect(() => {
    if (!service?.serviceType) {
      setRelated([]);
      return;
    }
    medicalServiceController
      .getByType(service.serviceType)
      .then((data) => setRelated(data.filter((s) => s.id !== service.id)))
      .catch(() => setRelated([]));
  }, [service?.serviceType, service?.id]);

  if (loading) {
    return (
      <p className="text-center py-10 text-[#666]">
        Dang tai thong tin dich vu...
      </p>
    );
  }

  if (error || !service) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-red-500">{error || "Khong tim thay dich vu"}</p>
        <Button onClick={onBack} className="bg-[#3fb5ff] text-white">
          Quay lai
        </Button>
      </div>
    );
  }

  const typeLabel =
    SPECIALIZATION_MAP[service.serviceType || ""] || service.serviceType || "Khong xac dinh";
  const priceLabel = `${service.price?.toLocaleString("vi-VN")} VND`;

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px] pb-[60px]">
      <div className="container mx-auto px-20">
        <button
          onClick={onBack}
          className="text-[#3fb5ff] font-['Fz_Poppins:Medium',sans-serif] text-[16px] hover:underline"
        >
          Tro lai danh sach
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] mt-[24px]">
          <div className="rounded-[20px] overflow-hidden shadow-lg">
            <ImageWithFallback
              src={service.imgUrl || placeholderImg}
              alt={service.serviceName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-[20px]">
            <div className="space-y-[8px]">
              <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[32px] tracking-[0.5px]">
                {service.serviceName}
              </h1>
              <p className="text-[#666666] font-['Fz_Poppins:Regular',sans-serif] text-[16px]">
                Loai dich vu: {typeLabel}
              </p>
              {service.description && (
                <p className="text-[#444] font-['Fz_Poppins:Regular',sans-serif] text-[15px] leading-[22px] whitespace-pre-line">
                  {service.description}
                </p>
              )}
            </div>

            <div className="bg-[#f4f9fd] border border-[#d6edfa] rounded-[16px] p-[20px] grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
              <div className="flex items-center gap-[10px] text-[#01304e]">
                <DollarSign className="w-[20px] h-[20px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px]">{priceLabel}</span>
              </div>
              <div className="flex items-center gap-[10px] text-[#01304e]">
                <Clock className="w-[20px] h-[20px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:Regular',sans-serif] text-[16px]">{service.serviceTime || 0} phut</span>
              </div>
            </div>

            <div className="flex gap-[12px]">
              <Button
                className="bg-[#3fb5ff] text-[#fcfeff] rounded-[12px] h-[48px] px-[24px] font-['Fz_Poppins:SemiBold',sans-serif]"
                onClick={() => onBooking(service.id)}
              >
                Dat lich voi dich vu nay
              </Button>
              <Button
                variant="outline"
                className="rounded-[12px] h-[48px] px-[24px] font-['Fz_Poppins:Medium',sans-serif]"
                onClick={onBack}
              >
                Quay lai
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-[60px]">
          <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[20px]">Dich vu lien quan</h2>
          {related.length === 0 ? (
            <p className="text-[#666666] font-['Fz_Poppins:Regular',sans-serif] text-[15px]">Chua co dich vu lien quan</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {related.map((item) => (
                <ServiceCard
                  key={item.id}
                  name={item.serviceName}
                  description={SPECIALIZATION_MAP[item.serviceType || ""] || item.description || "Dich vu y te"}
                  image={item.imgUrl || placeholderImg}
                  price={`${item.price?.toLocaleString("vi-VN")} VND`}
                  onLearnMore={() => onServiceSelect(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
