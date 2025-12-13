import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { LabTestTypeDTO } from "../models/LabTest";

class LabTestTypeController {
  private baseUrl = API_CONFIG.ENDPOINTS.LAB_TEST_TYPES;

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (error) {
      }
      throw new Error(msg);
    }
    return res.json();
  }

  async getAll(): Promise<LabTestTypeDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<LabTestTypeDTO[]>(res);
  }
}

export const labTestTypeController = new LabTestTypeController();
export default LabTestTypeController;