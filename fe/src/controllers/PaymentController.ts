import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface CreatePaymentRequest {
    invoiceId: string;
    paymentMethod: 'CASH' | 'BANK_TRANSFER';
    totalAmount?: number;
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESSFUL = 'SUCCESSFUL',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    TIMEOUT = 'TIMEOUT'
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER'
}

export interface PaymentResponseDTO {
    paymentId: string;
    invoiceId: string;
    totalAmount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    description?: string;
    paymentUrl?: string;
    message?: string;
    paidAt?: string;
    expiredAt?: string;
    createAt?: string;
    updateAt?: string;
}



class PaymentController {
    private baseUrl = API_CONFIG.ENDPOINTS.PAYMENTS; // Base URL của Payment Service

    async createPayment(data: CreatePaymentRequest): Promise<PaymentResponseDTO> {
        const url = createApiUrl(this.baseUrl); // Helper tạo URL đầy đủ
        const res = await fetch(url, {
            method: 'POST',
            headers: getApiHeaders(true), // Kèm token xác thực
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi tạo thanh toán');
        }

        return res.json();
    }

    /**
     * Kiểm tra trạng thái thanh toán (dùng để polling)
     */
    async getPaymentStatus(invoiceId: string): Promise<PaymentResponseDTO> {
        const url = createApiUrl(`${this.baseUrl}/status?invoiceId=${invoiceId}`);
        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không tìm thấy thanh toán');
        }

        return res.json();
    }

    /**
     * Lấy chi tiết payment theo ID
     */
    async getPaymentById(paymentId: string): Promise<PaymentResponseDTO> {
        const url = createApiUrl(`${this.baseUrl}/${paymentId}`);
        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không tìm thấy thanh toán');
        }

        return res.json();
    }

    /**
     * Lấy danh sách payments của một Invoice
     */
    async getPaymentsByInvoice(invoiceId: string): Promise<PaymentResponseDTO[]> {
        const url = createApiUrl(`${this.baseUrl}/invoice/${invoiceId}`);
        const res = await fetch(url, {
            method: 'GET',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi lấy danh sách thanh toán');
        }

        return res.json();
    }

    /**
     * Gọi API callback để cập nhật trạng thái payment từ PayOS redirect
     */
    async handlePaymentCallback(params: {
        orderCode: string;
        status?: string;
        code?: string;
        cancel?: string;
    }): Promise<PaymentResponseDTO> {
        const queryParams = new URLSearchParams();
        queryParams.append('orderCode', params.orderCode);
        if (params.status) queryParams.append('status', params.status);
        if (params.code) queryParams.append('code', params.code);
        if (params.cancel) queryParams.append('cancel', params.cancel);

        const url = createApiUrl(`${this.baseUrl}/callback?${queryParams.toString()}`);
        const res = await fetch(url, {
            method: 'POST',
            headers: getApiHeaders(true),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi xử lý callback thanh toán');
        }

        return res.json();
    }
}

export const paymentController = new PaymentController();