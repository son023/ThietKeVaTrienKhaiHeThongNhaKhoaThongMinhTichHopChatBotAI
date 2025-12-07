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
    const res = await fetch(
      createApiUrl(this.baseUrl, 'doctor', doctorId),
      {
        headers: getApiHeaders(true),
      }
    );
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async getByPatientId(patientId: string): Promise<AppointmentDTO[]> {
    const res = await fetch(
      createApiUrl(this.baseUrl, 'patient', patientId),
      {
        headers: getApiHeaders(true),
      }
    );
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async getById(id: string): Promise<AppointmentDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<AppointmentDTO>(res);
  }

  async getByDate(date: Date): Promise<AppointmentDTO[]> {
    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const res = await fetch(
      createApiUrl(`${this.baseUrl}/date?date=${dateStr}`),
      {
        headers: getApiHeaders(true),
      }
    );
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async checkIn(id: string): Promise<void> {
    const res = await fetch(
      createApiUrl(this.baseUrl, id, 'check-in'),
      {
        method: 'POST',
        headers: getApiHeaders(true),
      }
    );
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (error) {
      }
      throw new Error(msg);
    }
    return;
  }

  async checkInWithValidation(id: string): Promise<AppointmentDTO> {
    const appointment = await this.getById(id);

    await this.checkIn(id);
    return appointment;
  }

  async startAppointment(id: string): Promise<AppointmentDTO> {
    const res = await fetch(
      createApiUrl(this.baseUrl, id, 'start'),
      {
        method: 'POST',
        headers: getApiHeaders(true),
      }
    );
    if (!res.ok) {
      let msg = `HTTP Error: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (error) {
      }
      throw new Error(msg);
    }
    return this.getById(id);
  }
}

export const appointmentController = new AppointmentController();
export default AppointmentController;
