export interface MedicalHistoryDTO {
  id?: string;
  appointmentId: string;
  symptoms?: string;
  treatment?: string;
  diagnosis?: string;
  disease?: string;
  createdAt?: string;
  updatedAt?: string;
  patientId: string;
}

export type MedicalHistoryRequest = Omit<
  MedicalHistoryDTO,
  "id" | "createdAt" | "updatedAt"
>;