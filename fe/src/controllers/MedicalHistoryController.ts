import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface ConditionDTO {
  id?: string;
  medicalHistoryId?: string;
  toothNumber?: number;
  name?: string;
  status?: string;
  treatment?: string;
  surface?: string;
}

export interface ConditionRequest {
  id?: string;
  toothNumber?: number;
  name?: string;
  status?: string;
  treatment?: string;
  surface?: string;
}

export interface MedicalHistoryDTO {
  id: string;
  appointmentId?: string;
  symptoms?: string;
  createdAt?: string;
  updatedAt?: string;
  patientId: string;
  conditions?: ConditionDTO[];
}

export interface MedicalHistoryRequest {
  appointmentId: string;
  symptoms?: string;
  patientId: string;
  conditions?: ConditionRequest[];
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
      } catch (error) {
        // ignore parse error
      }
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

  async addCondition(medicalHistoryId: string, condition: ConditionRequest): Promise<ConditionDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, medicalHistoryId, "conditions"), {
      method: "POST",
      headers: getApiHeaders(true),
      body: JSON.stringify(condition),
    });
    return this.handleResponse<ConditionDTO>(res);
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

  async updateByAppointment(payload: MedicalHistoryRequest): Promise<MedicalHistoryDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, "byAppointmentId"), {
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

