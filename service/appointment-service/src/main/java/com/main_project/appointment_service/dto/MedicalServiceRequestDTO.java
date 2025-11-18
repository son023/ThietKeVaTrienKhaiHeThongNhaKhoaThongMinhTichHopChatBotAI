package com.main_project.appointment_service.dto;

import jakarta.persistence.Column;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class MedicalServiceRequestDTO {
    private String serviceName;
    private String serviceType;
    private Integer serviceTime;
    private Float price;
    private UUID appointmentId;
    private AppointmentDTO appointment;
}
