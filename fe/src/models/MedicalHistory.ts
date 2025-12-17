export interface ConditionDTO {
  id?: string;
  medicalHistoryId?: string;
  toothNumber?: number;
  name?: string;
  status?: string;
  treatment?: string;
  surface?: string;
}

export interface ConditionRequest {
  id?: string;
  toothNumber?: number;
  name?: string;
  status?: string;
  treatment?: string;
  surface?: string;
}

export interface MedicalHistoryDTO {
  id?: string;
  appointmentId?: string;
  symptoms?: string;
  createdAt?: string;
  updatedAt?: string;
  patientId: string;
  conditions?: ConditionDTO[];
}

export interface MedicalHistoryRequest {
  appointmentId?: string;
  symptoms?: string;
  patientId: string;
  conditions?: ConditionRequest[];
}