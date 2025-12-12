import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface MedicalHistoryDTO {
  id: string;
  appointmentId: string;
  symptoms?: string;
  treatment?: string;
  diagnosis?: string;
  disease?: string;
  createdAt?: string;
  updatedAt?: string;
  patientId: string;
}

export interface MedicalHistoryRequest {
  appointmentId: string;
  symptoms?: string;
  treatment?: string;
  diagnosis?: string;
  disease?: string;
  patientId: string;
}

class MedicalHistoryController {
  // BE endpoint từ patient-service
  private baseUrl = API_CONFIG.ENDPOINTS.MEDICAL_HISTORIES;

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (_) {}
      throw new Error(msg);
    }
    return res.json();
  }

  async getAll(): Promise<MedicalHistoryDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<MedicalHistoryDTO[]>(res);
  }

  async getById(id: string): Promise<MedicalHistoryDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<MedicalHistoryDTO>(res);
  }

  async getByPatientId(patientId: string): Promise<MedicalHistoryDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl, "patient", patientId), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<MedicalHistoryDTO[]>(res);
  }

  async getByAppointmentId(appointmentId: string): Promise<MedicalHistoryDTO[]> {
    const res = await fetch(
      createApiUrl(this.baseUrl, "appointment", appointmentId),
      { headers: getApiHeaders(true) }
    );
    return this.handleResponse<MedicalHistoryDTO[]>(res);
  }

  async searchByDisease(q: string): Promise<MedicalHistoryDTO[]> {
    const res = await fetch(createApiUrl(`${this.baseUrl}/disease?q=${q}`), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<MedicalHistoryDTO[]>(res);
  }

  async create(payload: MedicalHistoryRequest): Promise<MedicalHistoryDTO> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: "POST",
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<MedicalHistoryDTO>(res);
  }

  async update(id: string, payload: MedicalHistoryRequest): Promise<MedicalHistoryDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "PUT",
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<MedicalHistoryDTO>(res);
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "DELETE",
      headers: getApiHeaders(true),
    });
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (_) {}
      throw new Error(msg);
    }
  }
}

export const medicalHistoryController = new MedicalHistoryController();
export default MedicalHistoryController;