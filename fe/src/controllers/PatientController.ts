import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';
import { UserDTO } from '../models';
import { userController } from './UserController';

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

export interface UpsertPatientRequest {
    userId: string;
    dob?: string;
    gender?: string;
    address?: string;
    contactPhone?: string;
    bloodType?: string;
    allergy?: string;
    insuranceNumber?: string;
}

export interface PatientWithUser extends PatientDTO {
    user?: UserDTO;
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
      headers: getApiHeaders(true),
    });
    return this.handleResponse<PatientDTO[]>(res);
  }

  async getById(id: string): Promise<PatientDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<PatientDTO>(res);
  }

  async create(payload: UpsertPatientRequest): Promise<PatientDTO> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: 'POST',
      headers: {
        ...getApiHeaders(true),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<PatientDTO>(res);
  }

  async update(userId: string, payload: UpsertPatientRequest): Promise<PatientDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, userId), {
      method: 'PUT',
      headers: {
        ...getApiHeaders(true),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<PatientDTO>(res);
  }

  async getWithUserDetails(): Promise<PatientWithUser[]> {
    const patients = await this.getAll();
    if (!patients.length) return [];

    const userMap = await userController.getByIds(patients.map((p) => p.userId));
    return patients.map((p) => ({
      ...p,
      user: userMap[p.userId],
    }));
  }

  async getWithUserById(id: string): Promise<PatientWithUser> {
    const patient = await this.getById(id);
    const user = await userController.getById(id);
    return { ...patient, user };
  }
}

export const patientController = new PatientController();
export default PatientController;

