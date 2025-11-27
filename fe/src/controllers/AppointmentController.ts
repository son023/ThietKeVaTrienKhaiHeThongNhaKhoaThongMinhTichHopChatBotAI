import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { MedicalServiceDTO } from "./MedicalServiceController";

export interface AppointmentDTO {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  medicalServices?: MedicalServiceDTO[];
}

class AppointmentController {
  private baseUrl = API_CONFIG.ENDPOINTS.APPOINTMENTS;

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

  async getAll(): Promise<AppointmentDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async getByDoctorId(doctorId: string): Promise<AppointmentDTO[]> {
    const res = await fetch(createApiUrl(`${this.baseUrl}/doctor`, doctorId), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async getByPatientId(patientId: string): Promise<AppointmentDTO[]> {
    const res = await fetch(
      createApiUrl(`${this.baseUrl}/patient`, patientId),
      {
        headers: getApiHeaders(true),
      }
    );
    return this.handleResponse<AppointmentDTO[]>(res);
  }
}

export const appointmentController = new AppointmentController();
export default AppointmentController;
