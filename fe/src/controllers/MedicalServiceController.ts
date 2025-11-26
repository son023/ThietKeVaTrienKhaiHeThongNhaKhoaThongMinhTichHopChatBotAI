import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';

export interface MedicalServiceDTO {
  id: string;
  serviceName: string;
  serviceType: string;
  serviceTime: number;
  status: string;
  price: number;
  description?: string;
  imgUrl?: string;
}

export type CreateMedicalServiceRequest = Omit<MedicalServiceDTO, 'id'>;
export type UpdateMedicalServiceRequest = Partial<CreateMedicalServiceRequest>;

class MedicalServiceController {
  private baseUrl = API_CONFIG.ENDPOINTS.MEDICAL_SERVICES;

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (_) {
        // ignore parse error
      }
      throw new Error(msg);
    }
    return res.json();
  }

  async getAll(): Promise<MedicalServiceDTO[]> {
    const url = createApiUrl('appointment', this.baseUrl);
    const res = await fetch(url, { headers: getApiHeaders() });
    return this.handleResponse<MedicalServiceDTO[]>(res);
  }

  async getById(id: string): Promise<MedicalServiceDTO> {
    const url = createApiUrl('appointment', `${this.baseUrl}/${id}`);
    const res = await fetch(url, { headers: getApiHeaders() });
    return this.handleResponse<MedicalServiceDTO>(res);
  }

  async searchByName(keyword: string): Promise<MedicalServiceDTO[]> {
    const url = createApiUrl('appointment', `${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`);
    const res = await fetch(url, { headers: getApiHeaders() });
    return this.handleResponse<MedicalServiceDTO[]>(res);
  }

  async getByType(type: string): Promise<MedicalServiceDTO[]> {
    const url = createApiUrl('appointment', `${this.baseUrl}/type/${encodeURIComponent(type)}`);
    const res = await fetch(url, { headers: getApiHeaders() });
    return this.handleResponse<MedicalServiceDTO[]>(res);
  }

  async create(payload: CreateMedicalServiceRequest): Promise<MedicalServiceDTO> {
    const url = createApiUrl('appointment', this.baseUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse<MedicalServiceDTO>(res);
  }

  async update(id: string, payload: UpdateMedicalServiceRequest): Promise<MedicalServiceDTO> {
    const url = createApiUrl('appointment', `${this.baseUrl}/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse<MedicalServiceDTO>(res);
  }

  async deactivateById(id: string): Promise<void> {
    const url = createApiUrl('appointment', `${this.baseUrl}/deactivate/${id}`);
    const res = await fetch(url, { method: 'PATCH', headers: getApiHeaders() });
    await this.handleResponse<void>(res);
  }

  async deactivateByType(type: string): Promise<void> {
    const url = createApiUrl('appointment', `${this.baseUrl}/deactivate/type/${encodeURIComponent(type)}`);
    const res = await fetch(url, { method: 'PATCH', headers: getApiHeaders() });
    await this.handleResponse<void>(res);
  }

  async delete(id: string): Promise<void> {
    const url = createApiUrl('appointment', `${this.baseUrl}/${id}`);
    const res = await fetch(url, { method: 'DELETE', headers: getApiHeaders() });
    if (!res.ok && res.status !== 204) {
      await this.handleResponse(res);
    }
  }
}

export const medicalServiceController = new MedicalServiceController();
export default MedicalServiceController;
