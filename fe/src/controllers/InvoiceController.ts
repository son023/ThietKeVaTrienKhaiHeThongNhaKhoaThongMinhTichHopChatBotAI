import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

// ========== TYPES & INTERFACES ==========

export interface InvoiceItemDTO {
    id: string;
    referenceId: string;
    serviceType: 'Medicine' | 'Dental' | string;
    quantity: number;
    description: string;
    unitPrice: number;
    insurancePayAmount: number;
    patientPayAmount: number;
    claimItemId?: string;
    itemTotal: number;
}

export interface InvoiceDTO {
    id: string;
    receptionistId: string;
    appointmentId: string;
    totalAmount: number;
    currency: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    issueAt: string;
    paidAt?: string;
    insuranceTotalPay: number;
    patientTotalPay: number;
    insuranceClaimId?: string;
    updateAt: string;
    items: InvoiceItemDTO[];
}



export interface CreateInvoiceItemRequest {
    referenceId: string;
    serviceType: string;
    quantity: number;
    description: string;
    unitPrice: number;
    insurancePayAmount?: number;
    patientPayAmount?: number;
}

export interface CreateInvoiceRequest {
    receptionistId: string;
    appointmentId: string;
    items: CreateInvoiceItemRequest[];
}

// ========== CONTROLLER CLASS ==========

class InvoiceController {
    private baseUrl = API_CONFIG.ENDPOINTS.INVOICES;

    /**
     * Tạo hóa đơn mới
     */
    async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceDTO> {
        const url = createApiUrl(this.baseUrl);
        const res = await fetch(url, {
            method: 'POST',
            headers: getApiHeaders(true),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi tạo hóa đơn');
        }

        return res.json();
    }

    /**
     * Lấy chi tiết hóa đơn theo ID
     */
    async getInvoiceById(invoiceId: string): Promise<InvoiceDTO> {
        const url = createApiUrl(`${this.baseUrl}/${invoiceId}`);
        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không tìm thấy hóa đơn');
        }

        return res.json();
    }

    /**
     * Lấy danh sách hóa đơn (có thể filter theo status)
     */
    async listInvoices(status?: string): Promise<InvoiceDTO[]> {
        const queryParams = status ? `?status=${status}` : '';
        const url = createApiUrl(`${this.baseUrl}${queryParams}`);
        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi lấy danh sách hóa đơn');
        }

        return res.json();
    }

    /**
     * Lấy danh sách invoices của một bệnh nhân cụ thể
     */
    async getInvoicesByPatient(patientId: string, status?: string): Promise<InvoiceDTO[]> {
        const queryParams = new URLSearchParams();
        if (status) {
            queryParams.append('status', status);
        }

        const url = createApiUrl(
            `${this.baseUrl}/patient/${patientId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        );

        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi lấy danh sách hóa đơn');
        }

        return res.json();
    }

    /**
     * Cập nhật hóa đơn (chỉ khi ở trạng thái PENDING)
     */
    async updateInvoice(invoiceId: string, data: CreateInvoiceRequest): Promise<InvoiceDTO> {
        const url = createApiUrl(`${this.baseUrl}/${invoiceId}`);
        const res = await fetch(url, {
            method: 'PUT',
            headers: getApiHeaders(true),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi cập nhật hóa đơn');
        }

        return res.json();
    }

    /**
     * Đánh dấu hóa đơn đã thanh toán
     */
    async markAsPaid(invoiceId: string): Promise<InvoiceDTO> {
        const url = createApiUrl(`${this.baseUrl}/${invoiceId}/pay`);
        const res = await fetch(url, {
            method: 'PATCH',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi đánh dấu đã thanh toán');
        }

        return res.json();
    }

    /**
     * Hủy hóa đơn với lý do
     */
    async cancelInvoiceWithReason(invoiceId: string, reason: string): Promise<string> {
        const url = createApiUrl(`${this.baseUrl}/${invoiceId}/cancel?reason=${encodeURIComponent(reason)}`);
        const res = await fetch(url, {
            method: 'POST',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi hủy hóa đơn');
        }

        return res.text(); // Returns string from CompletableFuture<String>
    }

    /**
     * Lấy danh sách invoices theo appointmentId
     */
    async getInvoicesByAppointmentId(appointmentId: string): Promise<InvoiceDTO[]> {
        const url = createApiUrl(`${this.baseUrl}/appointment/${appointmentId}`);
        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi lấy danh sách hóa đơn');
        }

        return res.json();
    }
}

export const invoiceController = new InvoiceController();