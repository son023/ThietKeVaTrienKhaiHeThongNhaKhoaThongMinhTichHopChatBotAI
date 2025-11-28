package com.do_an.common.event;

import com.do_an.common.model.MedicalServiceDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentStartedEvent {
    private UUID clinicalId;
    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private List<MedicalServiceDTO> medicalServices;
}