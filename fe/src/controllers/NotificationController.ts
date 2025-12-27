import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface NotificationDTO {
  id: string;
  userId: string;
  channel: string;
  templateId: string;
  message: string;
  status: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;

  invoiceId?: string;
  dispenseOrderId?: string;
  appointmentId?: string;
  type?: string;
  timestamp?: number;


}

class NotificationController {
  private baseUrl = API_CONFIG.ENDPOINTS.NOTIFICATIONS;

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (error) {
        // ignore parse error
      }
      throw new Error(msg);
    }
    return res.json();
  }

  async getByUserId(userId: string): Promise<NotificationDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl, `/user/${userId}`), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<NotificationDTO[]>(res);
  }

  async getByTemplateId(templateId: string): Promise<NotificationDTO[]> {
    const encodedTemplateId = encodeURIComponent(templateId);
    const res = await fetch(createApiUrl(this.baseUrl, `/template?templateId=${encodedTemplateId}`), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<NotificationDTO[]>(res);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const res = await fetch(createApiUrl(this.baseUrl, `/user/${userId}/unread-count`), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<number>(res);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const res = await fetch(createApiUrl(this.baseUrl, `/${notificationId}/read`), {
      method: 'PUT',
      headers: getApiHeaders(true),
    });
    await this.handleResponse<void>(res);
  }
}

export const notificationController = new NotificationController();