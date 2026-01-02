import React, { useEffect } from 'react';
import { Badge } from '../ui/badge';
import { PatientWithUser } from '../../models/Patient';
import { LabTestDTO } from '../../models/LabTest';

interface PrintData {
  patient: PatientWithUser | null;
  appointmentId: string | null;
  symptoms: string;
  conditions: Array<{
    toothNumber?: number;
    name: string;
    status?: string;
    treatment?: string;
    surface?: string;
  }>;
  labTests: LabTestDTO[];
  doctorName?: string;
  visitDate?: string;
}

interface ExaminationPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printData: PrintData | null;
}

const formatDateTime = (iso?: string) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const labStatusMeta: Record<string, { label: string; color: string }> = {
  REQUESTED: { label: "Đã yêu cầu", color: "bg-amber-100 text-amber-800" },
  ACCEPTED: { label: "Đã nhận", color: "bg-sky-100 text-sky-800" },
  IN_PROGRESS: { label: "Đang làm", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  COMPLETE: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Hủy", color: "bg-red-100 text-red-800" },
};

export function ExaminationPrintDialog({
  open,
  onOpenChange,
  printData,
}: ExaminationPrintDialogProps) {
  useEffect(() => {
    if (open && printData) {
      // Đợi một chút để render xong rồi mới in
      const timer = setTimeout(() => {
        window.print();
        // Đóng sau khi in xong
        onOpenChange(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, printData, onOpenChange]);

  if (!open || !printData) return null;

  return (
    <div className="hidden print:block print-content">
      <div className="space-y-3 p-0 max-w-[21cm] mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-primary pb-2 mb-3">
          <h1 className="text-xl font-bold text-primary mb-2">HỒ SƠ KHÁM BỆNH</h1>
          <p className="text-sm text-neutral-text/60">
            {printData?.visitDate 
              ? formatDateTime(printData.visitDate)
              : formatDateTime(new Date().toISOString())}
          </p>
        </div>

        {/* Patient Info */}
        {printData?.patient && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-neutral-muted rounded-lg break-inside-avoid">
            <div>
              <p className="text-xs font-semibold text-neutral-text/60 mb-1">Bệnh nhân</p>
              <p className="text-sm font-medium text-neutral-text">
                {printData.patient.user?.fullName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-text/60 mb-1">Mã bệnh nhân</p>
              <p className="text-sm text-neutral-text">
                {printData.patient.userId || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-text/60 mb-1">Giới tính</p>
              <p className="text-sm text-neutral-text">
                {printData.patient.gender || "N/A"}
              </p>
            </div>
            {printData.patient.bloodType && (
              <div>
                <p className="text-xs font-semibold text-neutral-text/60 mb-1">Nhóm máu</p>
                <p className="text-sm text-neutral-text">
                  {printData.patient.bloodType}
                </p>
              </div>
            )}
            {printData.patient.contactPhone && (
              <div>
                <p className="text-xs font-semibold text-neutral-text/60 mb-1">Số điện thoại</p>
                <p className="text-sm text-neutral-text">
                  {printData.patient.contactPhone}
                </p>
              </div>
            )}
            {printData.patient.user?.email && (
              <div>
                <p className="text-xs font-semibold text-neutral-text/60 mb-1">Email</p>
                <p className="text-sm text-neutral-text">
                  {printData.patient.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Doctor Info */}
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-xs font-semibold text-neutral-text/60 mb-1">Bác sĩ khám</p>
            <p className="text-sm font-medium text-neutral-text">
              {printData?.doctorName || "N/A"}
            </p>
          </div>
        </div>

        {/* Symptoms */}
        {printData?.symptoms && (
          <div className="break-inside-avoid">
            <h3 className="text-sm font-semibold text-primary mb-1 border-b border-primary pb-1">
              Triệu chứng
            </h3>
            <p className="text-xs text-neutral-text whitespace-pre-wrap bg-neutral-muted p-2 rounded-lg">
              {printData.symptoms}
            </p>
          </div>
        )}

        {/* Conditions */}
        {printData?.conditions && printData.conditions.length > 0 && (
          <div className="break-inside-avoid">
            <h3 className="text-sm font-semibold text-primary mb-1 border-b border-primary pb-1">
              Chẩn đoán lâm sàng
            </h3>
            <div className="space-y-1">
              {printData.conditions.map((condition, index) => (
                <div
                  key={index}
                  className="bg-neutral-muted p-2 rounded-lg border-l-4 border-primary break-inside-avoid"
                >
                  <div className="flex items-start gap-2 mb-1">
                    {condition.toothNumber && (
                      <Badge variant="outline" className="text-xs">
                        Răng {condition.toothNumber}
                      </Badge>
                    )}
                    {condition.status && (
                      <Badge variant="outline" className="text-xs">
                        {condition.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-text mb-1">{condition.name}</p>
                  {condition.treatment && (
                    <p className="text-xs text-neutral-text/70">
                      Điều trị: {condition.treatment}
                    </p>
                  )}
                  {condition.surface && (
                    <p className="text-xs text-neutral-text/70">
                      Bề mặt: {condition.surface}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lab Tests */}
        {printData?.labTests && printData.labTests.length > 0 && (
          <div className="break-inside-avoid">
            <h3 className="text-sm font-semibold text-primary mb-1 border-b border-primary pb-1">
              Xét nghiệm
            </h3>
            <div className="space-y-1">
              {printData.labTests.map((lt) => {
                const statusMeta =
                  labStatusMeta[lt.status || ""] ||
                  labStatusMeta.REQUESTED;
                return (
                  <div
                    key={lt.id}
                    className="bg-neutral-muted p-2 rounded-lg border-l-4 border-primary break-inside-avoid"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-neutral-text">
                        {lt.labTestType?.name || "Lab test"}
                      </p>
                      <Badge className={statusMeta.color + " text-xs"}>{statusMeta.label}</Badge>
                    </div>
                    {lt.instructions && (
                      <p className="text-xs text-neutral-text/70 mt-1">
                        Ghi chú: {lt.instructions}
                      </p>
                    )}
                    {lt.createdAt && (
                      <p className="text-xs text-neutral-text/60 mt-1">
                        Ngày yêu cầu: {formatDateTime(lt.createdAt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Allergies & Underlying Diseases */}
        {printData?.patient && (
          <>
            {printData.patient.patientAllergies && printData.patient.patientAllergies.length > 0 && (
              <div className="break-inside-avoid">
                <h3 className="text-sm font-semibold text-red-600 mb-1 border-b border-red-200 pb-1">
                  Dị ứng
                </h3>
                <div className="space-y-1">
                  {printData.patient.patientAllergies.map((al, idx) => (
                    <div
                      key={idx}
                      className="bg-red-50 p-2 rounded-lg border border-red-200"
                    >
                      <p className="text-xs font-medium text-red-700">
                        {al.allergyName || al.allergyCode || "Dị ứng"}
                      </p>
                      {(al.reaction || al.note || al.severity) && (
                        <p className="text-xs text-red-600 mt-1">
                          {al.reaction || al.note || al.severity}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {printData.patient.underlyingDiseases && printData.patient.underlyingDiseases.length > 0 && (
              <div className="break-inside-avoid">
                <h3 className="text-sm font-semibold text-orange-600 mb-1 border-b border-orange-200 pb-1">
                  Bệnh nền
                </h3>
                <div className="space-y-1">
                  {printData.patient.underlyingDiseases.map((dis, idx) => (
                    <div
                      key={idx}
                      className="bg-orange-50 p-2 rounded-lg border border-orange-200"
                    >
                      <p className="text-xs font-medium text-orange-700">
                        {dis.name || "Bệnh nền"}
                      </p>
                      {(dis.note || dis.status || dis.severity) && (
                        <p className="text-xs text-orange-600 mt-1">
                          {dis.note || dis.status || dis.severity}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-3 border-t-2 border-primary mt-3 break-inside-avoid">
          <p className="text-xs text-neutral-text/60">
            Hồ sơ được in từ hệ thống quản lý phòng khám
          </p>
          <p className="text-xs text-neutral-text/60 mt-1">
            {new Date().toLocaleString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );
}

