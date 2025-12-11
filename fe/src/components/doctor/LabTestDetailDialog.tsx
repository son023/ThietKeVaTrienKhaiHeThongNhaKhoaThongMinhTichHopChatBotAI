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
      <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-[#e8e8e8]">
          <DialogTitle className="text-[#01304e]">
            Chi tiết kết quả lab test
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Header Card */}
          <Card className="rounded-[12px] border-[#e8e8e8]">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#01304e] font-semibold">
                      {labTest.labTestType?.name || "Lab test"}
                    </p>
                    {labTest.status && (
                      <Badge className={labStatusMeta[labTest.status]?.color || "bg-gray-100 text-gray-800"}>
                        {labStatusMeta[labTest.status]?.label || labTest.status}
                      </Badge>
                    )}
                  </div>
                  {labTest.resultDate && (
                    <div className="flex items-center gap-1 text-xs text-[#333333]/60">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Kết quả: {new Date(labTest.resultDate).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-[#333333]/70"
                >
                  Đóng
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic Information */}
            <Card className="rounded-[12px] border-[#e8e8e8]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-[#01304e] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {labTest.instructions && (
                  <div className="text-sm">
                    <span className="font-semibold text-[#01304e]">Hướng dẫn: </span>
                    <span className="text-[#333333]/70">{labTest.instructions}</span>
                  </div>
                )}

                {labTest.labTechnicianId && (
                  <div className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-[#01304e]" />
                    <span className="font-semibold text-[#01304e]">Nhân viên lab: </span>
                    <span className="text-[#333333]/70">{labTest.labTechnicianId}</span>
                  </div>
                )}

                {labTest.createdAt && (
                  <div className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#01304e]" />
                    <span className="font-semibold text-[#01304e]">Tạo lúc: </span>
                    <span className="text-[#333333]/70">
                      {new Date(labTest.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            {(parsedStructure || labTest.units || labTest.referenceRange || labTest.abnormalFlag) && (
              <Card className="rounded-[12px] border-[#e8e8e8]">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm text-[#01304e] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Kết quả xét nghiệm
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {labTest.status && (
                      <div className="text-sm">
                        <span className="font-semibold text-[#01304e]">Trạng thái: </span>
                        <span className="text-[#333333]/70">
                          {labStatusMeta[labTest.status]?.label || labTest.status}
                        </span>
                      </div>
                    )}
                    {labTest.abnormalFlag && (
                      <div className="text-sm">
                        <span className="font-semibold text-[#01304e]">
                          Đánh giá bất thường:{" "}
                        </span>
                        <span className="text-[#333333]/70">{labTest.abnormalFlag}</span>
                      </div>
                    )}
                    {labTest.units && (
                      <div className="text-sm">
                        <span className="font-semibold text-[#01304e]">Đơn vị: </span>
                        <span className="text-[#333333]/70">{labTest.units}</span>
                      </div>
                    )}
                    {labTest.referenceRange && (
                      <div className="text-sm">
                        <span className="font-semibold text-[#01304e]">
                          Khoảng tham chiếu:{" "}
                        </span>
                        <span className="text-[#333333]/70">{labTest.referenceRange}</span>
                      </div>
                    )}
                  </div>

                  {parsedStructure && (
                    <div className="space-y-2 pt-2 border-t border-[#e8e8e8]">
                      <p className="text-sm font-semibold text-[#01304e]">
                        Chi tiết kết quả:
                      </p>
                      <div className="text-xs font-mono bg-white border border-slate-200 rounded-lg p-3 text-[#01304e] overflow-x-auto">
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
            <Card className="rounded-[12px] border-[#e8e8e8]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm text-[#01304e] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  File đính kèm ({labTestAttachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {labTestAttachments.map((file) => {
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
                        className="rounded-[10px] border-[#e8e8e8] hover:border-[#3FB5FF] transition-all overflow-hidden"
                      >
                        {isImage && fileUrl ? (
                          <div className="relative w-full aspect-video bg-gray-100">
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
                          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <CardContent className="p-3 space-y-1">
                          <p className="text-sm text-[#01304e] line-clamp-1 font-medium">
                            {fileName}
                          </p>
                          {file.type && (
                            <p className="text-xs text-[#333333]/60">
                              Loại: {file.type}
                            </p>
                          )}
                          {file.updatedAt && (
                            <p className="text-xs text-[#333333]/60">
                              Cập nhật:{" "}
                              {new Date(file.updatedAt).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#3FB5FF] hover:text-[#3FB5FF]/80 mt-1"
                            >
                              <Download className="w-3 h-3" />
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

