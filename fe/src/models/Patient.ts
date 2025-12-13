import { UserDTO, UserRole } from "../models";

export interface PatientDTO {
  userId: string;
  dob?: string;
  gender?: string;
  address?: string;
  contactPhone?: string;
  bloodType?: string;
  allergy?: string;
  insuranceNumber?: string;
  patientAllergies?: PatientAllergy[];
  underlyingDiseases?: UnderlyingDisease[];
  toothIssues?: ToothIssue[];
}

export interface PatientAllergy {
  allergyId: string;
  allergyCode?: string;
  allergyName?: string;
  severity?: string;
  reaction?: string;
  note?: string;
}

export interface UnderlyingDisease {
  name?: string;
  status?: string;
  severity?: string;
  isVerified?: boolean;
  note?: string;
}

export interface ToothIssue {
  toothNumber?: number;
  status?: string;
  description?: string;
  diagnosedDate?: string;
  note?: string;
}


export interface PatientWithUser extends PatientDTO {
  user?: UserDTO;

}
