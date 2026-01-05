import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface LabTechnicianDTO {
  userId: string;
  licenseNumber?: string;
}

export interface LabTechnicianRequest {
  userId: string;
  licenseNumber?: string;
}

class LabTechnicianController {
  private baseUrl = `${API_CONFIG.ENDPOINTS.LAB_TESTS.replace('/lab-tests', '')}/lab-technicians`;

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

  async getById(userId: string): Promise<LabTechnicianDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, userId), {
      method: "GET",
      headers: getApiHeaders(true),
    });
    return this.handleResponse<LabTechnicianDTO>(res);
  }

  async update(userId: string, payload: LabTechnicianRequest): Promise<LabTechnicianDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, userId), {
      method: "PUT",
      headers: {
        ...getApiHeaders(true),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<LabTechnicianDTO>(res);
  }
}

export const labTechnicianController = new LabTechnicianController();
export default LabTechnicianController;


