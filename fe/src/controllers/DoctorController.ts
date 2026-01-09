import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { UserDTO } from "../models";
import { userController } from "./UserController";

export interface DoctorDegreeDTO {
  id: string;
  degreeName: string;
  institution?: string;
  yearObtained?: number;
  doctorId: string;
}

export interface DoctorDTO {
  userId: string;
  specializationCode?: string;
  workingHospital?: string;
  licenseNumber?: string;
  consultationFeeAmount?: number;
  degrees?: DoctorDegreeDTO[];
}

export interface UpsertDoctorRequest {
  userId: string;
  specializationCodeId: string;
  workingHospital?: string;
  licenseNumber?: string;
  consultationFeeAmount?: number;
}

export interface DoctorWithUser extends DoctorDTO {
  user?: UserDTO;
}

class DoctorController {
  private baseUrl = API_CONFIG.ENDPOINTS.DOCTORS;

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

  async getAll(): Promise<DoctorDTO[]> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: "GET",
      headers: getApiHeaders(false),
    });
    return this.handleResponse<DoctorDTO[]>(res);
  }

  async getById(id: string): Promise<DoctorDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "GET",
      headers: getApiHeaders(false),
    });
    return this.handleResponse<DoctorDTO>(res);
  }

  async create(payload: UpsertDoctorRequest): Promise<DoctorDTO> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: "POST",
      headers: {
        ...getApiHeaders(true),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<DoctorDTO>(res);
  }

  async update(
    userId: string,
    payload: UpsertDoctorRequest
  ): Promise<DoctorDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, userId), {
      method: "PUT",
      headers: {
        ...getApiHeaders(true),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<DoctorDTO>(res);
  }

  async getWithUserDetails(): Promise<DoctorWithUser[]> {
    const doctors = await this.getAll();
    if (!doctors.length) return [];

    const userMap = await userController.getByIds(
      doctors.map((doc) => doc.userId)
    );
    return doctors.map((doc) => ({
      ...doc,
      user: userMap[doc.userId],
    }));
  }

  async getWithUserById(id: string): Promise<DoctorWithUser> {
    const doctor = await this.getById(id);
    const user = await userController.getById(id);
    return { ...doctor, user };
  }
}

export const doctorController = new DoctorController();
export default DoctorController;
