import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";
import { authController } from "./AuthController";
import { userController } from "./UserController";
import { UserDTO, UserRole } from "../models";
import { PatientDTO, PatientWithUser } from "../models/Patient";

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

  async getWithUserById(id: string): Promise<PatientWithUser> {
    const patient = await this.getById(id); // id = patientId
    const user = patient.userId
      ? await userController.getById(patient.userId) // lấy user theo userId
      : undefined;
    return { ...patient, user };
  }
}

export const patientController = new PatientController();
export default PatientController;
