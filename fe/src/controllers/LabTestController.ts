import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { LabTestDTO, LabTestRequestDTO } from "../models/LabTest";

class LabTestController {
  private baseUrl = API_CONFIG.ENDPOINTS.LAB_TESTS;

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

  async getAll(): Promise<LabTestDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<LabTestDTO[]>(res);
  }

  async accept(id: string, labTechnicianId?: string): Promise<LabTestDTO> {
    const body = labTechnicianId ? JSON.stringify({ labTechnicianId }) : undefined;
    const res = await fetch(createApiUrl(this.baseUrl, id, "accept"), {
      method: "POST",
      headers: getApiHeaders(true),
      body: body,
    });
    return this.handleResponse<LabTestDTO>(res);
  }

  async start(id: string): Promise<LabTestDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id, "start"), {
      method: "POST",
      headers: getApiHeaders(true),
    });
    return this.handleResponse<LabTestDTO>(res);
  }

  async complete(
    id: string,
    payload?: Partial<LabTestRequestDTO>
  ): Promise<LabTestDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id, "complete"), {
      method: "POST",
      headers: getApiHeaders(true),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return this.handleResponse<LabTestDTO>(res);
  }

  async update(
    id: string,
    payload: Partial<LabTestRequestDTO>
  ): Promise<LabTestDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "PUT",
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<LabTestDTO>(res);
  }

  async request(payload: LabTestRequestDTO): Promise<LabTestDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, "request"), {
      method: "POST",
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<LabTestDTO>(res);
  }
  async getByTechnicianId(technicianId: string): Promise<LabTestDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl, "technician", technicianId), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<LabTestDTO[]>(res);
  }

  async getByStatus(status: string): Promise<LabTestDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl, "status", status), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<LabTestDTO[]>(res);
  }
}

export const labTestController = new LabTestController();
export default LabTestController;