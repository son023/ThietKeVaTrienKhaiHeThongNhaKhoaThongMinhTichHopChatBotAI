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
}

export interface PatientAllergyDTO {
  allergyId: string;
  allergyCode?: string;
  allergyName?: string;
  severity?: string;
  reaction?: string;
  note?: string;
}

export interface PatientWithUser extends PatientDTO {
  user?: UserDTO;
  patientAllergies?: PatientAllergyDTO[];
}
