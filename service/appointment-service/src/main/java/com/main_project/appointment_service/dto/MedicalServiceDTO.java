package com.main_project.appointment_service.dto;

import lombok.*;

import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class MedicalServiceDTO {
    private UUID id;
    private String serviceName;
    private String serviceType;
    private Integer serviceTime;
    private Float price;
}