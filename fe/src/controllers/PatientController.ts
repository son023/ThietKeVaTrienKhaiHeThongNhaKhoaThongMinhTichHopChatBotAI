import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';
import { authController } from './AuthController';
import { userController } from './UserController';
import { UserDTO, UserRole } from '../models';

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

export interface PatientWithUser extends PatientDTO {
  user?: UserDTO;
}

class PatientController {
  private baseUrl = API_CONFIG.ENDPOINTS.PATIENTS;

  private ensureAuthorized() {
    const canAccess =
      authController.hasRole(UserRole.DOCTOR) ||
      authController.hasRole(UserRole.ADMIN) ||
      authController.hasRole(UserRole.RECEPTIONIST);

    if (!canAccess) {
      throw new Error('Ban khong co quyen truy cap du lieu benh nhan');
    }
  }

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
    this.ensureAuthorized();
    const res = await fetch(createApiUrl(this.baseUrl), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<PatientDTO[]>(res);
  }

  async getById(id: string): Promise<PatientDTO> {
    this.ensureAuthorized();
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<PatientDTO>(res);
  }

  async getWithUserById(id: string): Promise<PatientWithUser> {
    const patient = await this.getById(id);
    const user = await userController.getById(id);
    return { ...patient, user };
  }
}

export const patientController = new PatientController();
export default PatientController;
