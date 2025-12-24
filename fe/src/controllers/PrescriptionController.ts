import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface PrescriptionItemInput {
    medicineId: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    usageInstructions?: string;
}

export interface CreatePrescriptionRequest {
    medicalHistoryId: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    items: PrescriptionItemInput[];
}

export interface PrescriptionResponse {
    id: string;
    appointmentId: string;
    doctorId: string;
    status: string;
}

class PrescriptionController {
    private baseUrl = API_CONFIG.ENDPOINTS.PRESCRIPTION_BILLINGS;

    async createPrescription(body: CreatePrescriptionRequest): Promise<PrescriptionResponse> {
        const url = createApiUrl(this.baseUrl);
        const res = await fetch(url, {
            method: "POST",
            headers: getApiHeaders(true),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Tạo đơn thuốc thất bại");
        }
        return res.json();
    }

    async getPrescriptionStatusByMedicalHistoryId(medicalHistoryId: string): Promise<{ status: string; dispenseOrderId?: string; prescriptionId?: string; medicalHistoryId?: string }> {
        const url = createApiUrl(`${this.baseUrl}/medical-history/${medicalHistoryId}/status`);
        const res = await fetch(url, {
            headers: getApiHeaders(true),
        });
        if (!res.ok) {
            throw new Error("Không lấy được trạng thái đơn thuốc");
        }
        return res.json();
    }
}

export const prescriptionController = new PrescriptionController();