import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface PharmacistDTO {
  userId: string;
  degree?: string;
  certificate?: string;
}

export interface PharmacistRequest {
  userId: string;
  degree: string;
  certificate: string;
}

class PharmacistController {
  private baseUrl = `${API_CONFIG.ENDPOINTS.INVENTORIES}/pharmacists`;

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

  async getById(userId: string): Promise<PharmacistDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, userId), {
      method: "GET",
      headers: getApiHeaders(true),
    });
    return this.handleResponse<PharmacistDTO>(res);
  }

  async update(userId: string, payload: PharmacistRequest): Promise<PharmacistDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, userId), {
      method: "PUT",
      headers: {
        ...getApiHeaders(true),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<PharmacistDTO>(res);
  }
}

export const pharmacistController = new PharmacistController();
export default PharmacistController;