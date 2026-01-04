import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { LabTestDTO, MedicalAttachmentDTO } from "../../models";
import { ImageIcon, User, FileText, Calendar, AlertTriangle, Download } from "lucide-react";
import { API_CONFIG } from "../../config/api";

interface LabTestDetailDialogProps {
  labTest: LabTestDTO | null;
  medicalAttachments?: MedicalAttachmentDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabTestDetailDialog({
  labTest,
  medicalAttachments = [],
  open,
  onOpenChange,
}: LabTestDetailDialogProps) {
  const parsedStructure = useMemo(() => {
    if (!labTest?.structureJson) return null;
    try {
      return JSON.parse(labTest.structureJson);
    } catch (error) {
      return labTest.structureJson;
    }
  }, [labTest]);

  const labTestAttachments = useMemo(() => {
    if (!labTest?.id) return [];
    // Use medicalAttachments from labTest if available, otherwise filter from props
    if (labTest.medicalAttachments && labTest.medicalAttachments.length > 0) {
      return labTest.medicalAttachments;
    }
    return medicalAttachments.filter((att) => att.labTestId === labTest.id);
  }, [medicalAttachments, labTest?.id, labTest?.medicalAttachments]);

  const getFileUrl = (filePath?: string) => {
    if (!filePath) return "";
    // Use the endpoint to serve files
    const cleanPath = encodeURIComponent(filePath);
    return `${API_CONFIG.BASE_URL}/labtest-service/medical-attachments/file?path=${cleanPath}`;
  };

  const isImageFile = (type?: string, filePath?: string) => {
    if (type === "IMAGE") return true;
    if (!filePath) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    const lowerPath = filePath.toLowerCase();
    return imageExtensions.some((ext) => lowerPath.endsWith(ext));
  };

  const labStatusMeta: Record<string, { label: string; color: string }> = {
    REQUESTED: { label: "Đã yêu cầu", color: "bg-amber-100 text-amber-800" },
    ACCEPTED: { label: "Đã nhận", color: "bg-sky-100 text-sky-800" },
    IN_PROGRESS: { label: "Đang làm", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
    COMPLETE: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Hủy", color: "bg-red-100 text-red-800" },
  };

  if (!labTest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-white p-0 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-border/30">
          <DialogTitle className="typo-h3">
            Chi tiết kết quả lab test
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Header Card */}
          <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-neutral-text">
                      {labTest.labTestType?.name || "Lab test"}
                    </p>
                    {labTest.status && (
                      <Badge className={labStatusMeta[labTest.status]?.color || "bg-neutral-muted text-neutral-text"}>
                        {labStatusMeta[labTest.status]?.label || labTest.status}
                      </Badge>
                    )}
                  </div>
                  {labTest.resultDate && (
                    <div className="flex items-center gap-2 text-sm text-neutral-text/60">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Kết quả: {new Date(labTest.resultDate).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
               
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
            {/* Basic Information */}
            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm lg:col-span-4">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="px-7 pt-2 pb-7 space-y-4">
                {labTest.instructions && (
                  <div className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-text/60" />
                    <span className="font-semibold text-neutral-text">Ghi chú: </span>
                    <span className="text-neutral-text/70">{labTest.instructions}</span>
                  </div>
                )}

                {(labTest.labTechnicianName || labTest.labTechnicianId) && (
                  <div className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-text/60" />
                    <span className="font-semibold text-neutral-text">Nhân viên lab: </span>
                    <span className="text-neutral-text/70">
                      {labTest.labTechnicianName || labTest.labTechnicianId}
                    </span>
                  </div>
                )}

                {labTest.createdAt && (
                  <div className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-text/60" />
                    <span className="font-semibold text-neutral-text">Tạo lúc: </span>
                    <span className="text-neutral-text/70">
                      {new Date(labTest.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}

                {(labTest.resultDate || (labTest.status && (labTest.status === 'COMPLETE' || labTest.status === 'COMPLETED') && labTest.updatedAt)) && (
                  <div className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-text/60" />
                    <span className="font-semibold text-neutral-text">Hoàn thành lúc: </span>
                    <span className="text-neutral-text/70">
                      {labTest.resultDate 
                        ? new Date(labTest.resultDate).toLocaleString("vi-VN")
                        : labTest.updatedAt 
                        ? new Date(labTest.updatedAt).toLocaleString("vi-VN")
                        : 'N/A'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            {(parsedStructure || labTest.units || labTest.referenceRange || labTest.abnormalFlag) && (
              <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm lg:col-span-6">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                    </div>
                    Kết quả xét nghiệm
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {labTest.status && (
                      <div className="text-sm">
                        <span className="font-semibold text-neutral-text">Trạng thái: </span>
                        <span className="text-neutral-text/70">
                          {labStatusMeta[labTest.status]?.label || labTest.status}
                        </span>
                      </div>
                    )}
                    {labTest.abnormalFlag && (
                      <div className="text-sm">
                        <span className="font-semibold text-neutral-text">
                          Đánh giá bất thường:{" "}
                        </span>
                        <span className="text-neutral-text/70">{labTest.abnormalFlag}</span>
                      </div>
                    )}
                    {labTest.units && (
                      <div className="text-sm">
                        <span className="font-semibold text-neutral-text">Đơn vị: </span>
                        <span className="text-neutral-text/70">{labTest.units}</span>
                      </div>
                    )}
                    {labTest.referenceRange && (
                      <div className="text-sm">
                        <span className="font-semibold text-neutral-text">
                          Khoảng tham chiếu:{" "}
                        </span>
                        <span className="text-neutral-text/70">{labTest.referenceRange}</span>
                      </div>
                    )}
                  </div>

                  {parsedStructure && (
                    <div className="space-y-3 pt-3 border-t border-neutral-border/30">
                      <p className="text-sm font-semibold text-neutral-text">
                        Chi tiết kết quả:
                      </p>
                      <div className="text-xs font-mono bg-neutral-muted border border-neutral-border/30 rounded-lg p-4 text-neutral-text overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-words">
                          {typeof parsedStructure === "string"
                            ? parsedStructure
                            : JSON.stringify(parsedStructure, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Medical Attachments */}
          {labTestAttachments.length > 0 && (
            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <ImageIcon className="w-4 h-4 text-primary" />
                  </div>
                  File đính kèm ({labTestAttachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {labTestAttachments.map((file: MedicalAttachmentDTO) => {
                    const fileUrl = getFileUrl(file.filePath);
                    const isImage = isImageFile(file.type, file.filePath);
                    const fileName = file.filePath
                      ? file.filePath.split("/").pop() || "Tệp không tên"
                      : "Tệp không tên";

                    // Debug log
                    console.log("File attachment:", {
                      id: file.id,
                      filePath: file.filePath,
                      fileUrl,
                      isImage,
                      type: file.type
                    });

                    return (
                      <Card
                        key={file.id}
                        className="rounded-xl border border-neutral-border/30 hover:border-primary hover:shadow-md transition-all overflow-hidden bg-neutral-surface"
                      >
                        {isImage && fileUrl ? (
                          <div className="relative w-full aspect-video bg-neutral-muted">
                            <img
                              src={fileUrl}
                              alt={fileName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback nếu không load được ảnh
                                console.error("Failed to load image:", fileUrl, file);
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex flex-col items-center justify-center p-4">
                                      <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <p class="text-xs text-gray-500 text-center">Không thể tải hình ảnh</p>
                                    </div>
                                  `;
                                }
                              }}
                              onLoad={() => {
                                console.log("Image loaded successfully:", fileUrl);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-video bg-neutral-muted flex items-center justify-center">
                            <FileText className="w-12 h-12 text-neutral-text/30" />
                          </div>
                        )}
                        <CardContent className="p-4 space-y-2">
                          <p className="text-sm text-neutral-text line-clamp-1 font-semibold">
                            {fileName}
                          </p>
                          {file.type && (
                            <p className="text-xs text-neutral-text/60">
                              Loại: {file.type}
                            </p>
                          )}
                          {file.updatedAt && (
                            <p className="text-xs text-neutral-text/60">
                              Cập nhật:{" "}
                              {new Date(file.updatedAt).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-strong font-medium mt-2 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Xem/Tải xuống
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

