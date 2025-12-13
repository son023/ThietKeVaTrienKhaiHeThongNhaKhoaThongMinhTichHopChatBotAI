export interface LabTestTypeDTO {
  id: string;
  name: string;
  description?: string;
}

export interface LabTestRequestDTO {
  appointmentId?: string;
  medicalHistoryId?: string;
  labTechnicianId?: string;
  doctorId?: string;
  price?: number;
  instructions?: string;
  status?: string;
  resultDate?: string;
  abnormalFlag?: string;
  units?: string;
  structureJson?: string;
  referenceRange?: string;
  labTestTypeId?: string;
  medicalAttachmentIds?: string[];
}

export interface LabTestDTO extends LabTestRequestDTO {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  labTestType?: LabTestTypeDTO;
  doctorName?: string;
  patientName?: string;
  labTechnicianName?: string;
}