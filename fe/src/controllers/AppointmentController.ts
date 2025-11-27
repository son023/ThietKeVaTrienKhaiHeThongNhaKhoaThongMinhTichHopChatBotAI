import { API_CONFIG, createApiUrl, getApiHeaders } from '../config/api';
import { doctorController, DoctorWithUser } from './DoctorController';
import { MedicalServiceDTO } from './MedicalServiceController';
import { patientController, PatientWithUser } from './PatientController';

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

export interface AppointmentWithDetails extends AppointmentDTO {
  patient?: PatientWithUser;
  doctor?: DoctorWithUser;
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
    const res = await fetch(createApiUrl(`${this.baseUrl}/patient`, patientId), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<AppointmentDTO[]>(res);
  }

  async getAppointmentsForDoctorWithDetails(doctorId: string): Promise<AppointmentWithDetails[]> {
    const appointments = await this.getByDoctorId(doctorId);
    if (!appointments.length) return [];

    const detailedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const patient = await patientController.getWithUserById(appointment.patientId);
          // Assuming the doctor is the current user, we can get it from the doctorId
          const doctor = await doctorController.getWithUserById(appointment.doctorId);
          return {
            ...appointment,
            patient,
            doctor,
          };
        } catch (error) {
          console.error(`Failed to get details for appointment ${appointment.id}`, error);
          // Return appointment without details if fetching fails
          return {
            ...appointment,
          };
        }
      })
    );

    return detailedAppointments;
  }
}

export const appointmentController = new AppointmentController();
export default AppointmentController;

