import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { userController } from "./UserController";
import { PatientDTO, PatientWithUser } from "../models/Patient";

export interface PatientAllergyInput {
  allergyId: string;
  severity?: string;
  reaction?: string;
  note?: string;
}

export interface UnderlyingDiseaseInput {
  name?: string;
  status?: string;
  severity?: string;
  isVerified?: boolean;
  note?: string;
}

export interface ToothIssueInput {
  toothNumber?: number;
  status?: string;
  description?: string;
  diagnosedDate?: string;
  note?: string;
}

export interface PatientProfileRequest {
  userId: string;
  dob?: string;
  gender?: string;
  address?: string;
  contactPhone?: string;
  bloodType?: string;
  insuranceNumber?: string;
  patientAllergies?: PatientAllergyInput[];
  underlyingDiseases?: UnderlyingDiseaseInput[];
  toothIssues?: ToothIssueInput[];
}

export type PatientProfileResponse = PatientProfileRequest;

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
    const data = await this.handleResponse<PatientDTO>(res);
    return { ...data, userId: data.userId};
  }

  async getWithUserById(id: string): Promise<PatientWithUser> {
    const patient = await this.getById(id); // id = patientId
    const user = patient.userId
      ? await userController.getById(patient.userId) // lấy user theo userId
      : undefined;
    return { ...patient, user };
  }

  async createProfile(payload: PatientProfileRequest): Promise<PatientProfileResponse> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: "POST",
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<PatientProfileResponse>(res);
  }

  async updateProfile(
    id: string,
    payload: PatientProfileRequest
  ): Promise<PatientProfileResponse> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "PUT",
      headers: getApiHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<PatientProfileResponse>(res);
  }

  async upsertProfile(
    userId: string,
    payload: Omit<PatientProfileRequest, "userId">
  ): Promise<PatientProfileResponse> {
    const enrichedPayload: PatientProfileRequest = { ...payload, userId };
    try {
      return this.updateProfile(userId, enrichedPayload);
    } catch (error) {
      return this.createProfile(enrichedPayload);
    }
  }
}

export const patientController = new PatientController();
export default PatientController;
