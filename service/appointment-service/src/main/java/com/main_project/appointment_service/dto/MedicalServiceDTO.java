package com.main_project.appointment_service.dto;

import lombok.Data;
import java.util.UUID;
import java.math.BigDecimal;

@Data
public class MedicalServiceDTO {
    private UUID id;
    private String serviceName;
    private String serviceType;
    private Integer serviceTime;
    private Float price;
}