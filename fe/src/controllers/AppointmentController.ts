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

export interface CreateAppointmentRequest {
  doctorId: string;
  patientId: string;
  appointmentStartTime: string;
  medicalServiceIds: string[];
}

export interface HoldSlotRequest {
  doctorId: string;
  patientId: string;
  appointmentStartTime: string;
  medicalServiceIds: string[];
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED"
  | "IN_PROGRESS"
  | "PROGRESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

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
    const contentLength = res.headers.get('content-length');
    const isNoContent = res.status === 204 || res.status === 202 || contentLength === '0';
    if (isNoContent) {
      return undefined as T;
    }
    const text = await res.text();
    if (!text) {
      return undefined as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch (_) {
      return text as unknown as T;
    }
  }

  async getAll(): Promise<AppointmentDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async create(payload: CreateAppointmentRequest): Promise<AppointmentDTO> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AppointmentDTO>(res);
  }

  async holdSlot(payload: HoldSlotRequest): Promise<void> {
    const res = await fetch(createApiUrl(this.baseUrl, 'slots', 'hold'), {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    await this.handleResponse<void>(res);
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

  async updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentDTO> {
    const res = await fetch(
      createApiUrl(this.baseUrl, id, 'status') + `?status=${status}`,
      {
        method: 'PATCH',
        headers: getApiHeaders(true),
      }
    );
    return this.handleResponse<AppointmentDTO>(res);
  }
}

export const appointmentController = new AppointmentController();
export default AppointmentController;
