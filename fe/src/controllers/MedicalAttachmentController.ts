import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { MedicalAttachmentDTO } from "../models/MedicalAttachment";

class MedicalAttachmentController {
  private baseUrl = API_CONFIG.ENDPOINTS.MEDICAL_ATTACHMENTS;

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

  async getAll(): Promise<MedicalAttachmentDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<MedicalAttachmentDTO[]>(res);
  }

  async uploadFile(file: File, labTestId: string, type: string = "IMAGE"): Promise<MedicalAttachmentDTO> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("labTestId", labTestId);
    formData.append("type", type);

    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(createApiUrl(this.baseUrl, "upload"), {
      method: "POST",
      headers,
      body: formData,
    });
    return this.handleResponse<MedicalAttachmentDTO>(res);
  }

  async uploadMultipleFiles(files: File[], labTestId: string): Promise<MedicalAttachmentDTO[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });
    formData.append("labTestId", labTestId);

    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(createApiUrl(this.baseUrl, "upload-multiple"), {
      method: "POST",
      headers,
      body: formData,
    });
    return this.handleResponse<MedicalAttachmentDTO[]>(res);
  }
}

export const medicalAttachmentController = new MedicalAttachmentController();
export default MedicalAttachmentController;

