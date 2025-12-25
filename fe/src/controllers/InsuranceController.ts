import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";

export interface PatientInsuranceDTO {
  id: string;
  patientId: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  createAt: string;
  updateAt: string;
  insurancePolicyId: string;
  insurancePolicy?: InsurancePolicyDTO;
}

export interface InsurancePolicyDTO {
  id: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: number;
  deductible: number;
  startDate: string;
  endDate: string;
  status: string;
  createAt: string;
  updateAt: string;
}

export interface PatientInsuranceRequestDTO {
  patientId: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  insurancePolicyId: string;
}

class InsuranceController {
  private baseUrl = "/insurance-service/patient-insurances";

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

  async getByPatientId(patientId: string): Promise<PatientInsuranceDTO | null> {
    try {
      const res = await fetch(createApiUrl(this.baseUrl, `patient/${patientId}`), {
        headers: getApiHeaders(true),
      });
      if (res.status === 404) {
        return null;
      }
      return this.handleResponse<PatientInsuranceDTO>(res);
    } catch (error) {
      console.error("Failed to get patient insurance:", error);
      return null;
    }
  }

  async getActiveByPatientId(patientId: string): Promise<PatientInsuranceDTO | null> {
    try {
      const res = await fetch(createApiUrl(this.baseUrl, `patient/${patientId}/active`), {
        headers: getApiHeaders(true),
      });
      if (res.status === 404) {
        return null;
      }
      return this.handleResponse<PatientInsuranceDTO>(res);
    } catch (error) {
      console.error("Failed to get active patient insurance:", error);
      return null;
    }
  }

  async create(request: PatientInsuranceRequestDTO): Promise<PatientInsuranceDTO> {
    const res = await fetch(createApiUrl(this.baseUrl), {
      method: "POST",
      headers: getApiHeaders(true),
      body: JSON.stringify(request),
    });
    return this.handleResponse<PatientInsuranceDTO>(res);
  }

  async update(id: string, request: PatientInsuranceRequestDTO): Promise<PatientInsuranceDTO> {
    const res = await fetch(createApiUrl(this.baseUrl, id), {
      method: "PUT",
      headers: getApiHeaders(true),
      body: JSON.stringify(request),
    });
    return this.handleResponse<PatientInsuranceDTO>(res);
  }

  async existsByPatientId(patientId: string): Promise<boolean> {
    const res = await fetch(createApiUrl(this.baseUrl, `exists/patient/${patientId}`), {
      headers: getApiHeaders(true),
    });
    return this.handleResponse<boolean>(res);
  }
}

export const insuranceController = new InsuranceController();
export default InsuranceController;


