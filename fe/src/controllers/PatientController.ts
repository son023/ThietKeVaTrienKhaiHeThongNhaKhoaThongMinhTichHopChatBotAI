import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';

export interface PatientDTO {
  userId: string;
  dob?: string;
  gender?: string;
  address?: string;
  contactPhone?: string;
  bloodType?: string;
  allergy?: string;
  insuranceNumber?: string;
}

class PatientController {
  private baseUrl = API_CONFIG.ENDPOINTS.PATIENTS;

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

  async getAll(): Promise<PatientDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(),
    });
    return this.handleResponse<PatientDTO[]>(res);
  }

  async getById(id: string): Promise<PatientDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      headers: getApiHeaders(),
    });
    return this.handleResponse<PatientDTO>(res);
  }
}

export const patientController = new PatientController();
export default PatientController;
