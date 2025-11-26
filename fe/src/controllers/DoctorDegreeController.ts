import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';

export interface DoctorDegreeDTO {
  id: string;
  degreeName: string;
  institution?: string;
  yearObtained?: number;
  doctorId: string;
}

class DoctorDegreeController {
  private baseUrl = '/doctor-service/doctor-degrees';

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (_err) {
        // ignore
      }
      throw new Error(msg);
    }
    return res.json();
  }

  async getByDoctor(doctorId: string): Promise<DoctorDegreeDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl, 'doctor', doctorId), {
      headers: getApiHeaders(),
    });
    return this.handleResponse<DoctorDegreeDTO[]>(res);
  }
}

export const doctorDegreeController = new DoctorDegreeController();
export default DoctorDegreeController;
