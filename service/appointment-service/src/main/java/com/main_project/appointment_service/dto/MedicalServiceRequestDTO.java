package com.main_project.appointment_service.dto;

import com.main_project.appointment_service.enums.MedicalServiceStatus;
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
    private MedicalServiceStatus status;
    private Float price;
}
