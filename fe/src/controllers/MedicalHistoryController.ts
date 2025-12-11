import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import {
  MedicalHistoryDTO,
  MedicalHistoryRequest,
} from "../models/MedicalHistory";

class MedicalHistoryController {
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

  async getByPatientId(patientId: string): Promise<MedicalHistoryDTO[]> {
    const res = await fetch(
      createApiUrl(this.baseUrl, "patient", patientId),
      {
        headers: getApiHeaders(true),
      }
    );
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
}

export const medicalHistoryController = new MedicalHistoryController();
export default MedicalHistoryController;

