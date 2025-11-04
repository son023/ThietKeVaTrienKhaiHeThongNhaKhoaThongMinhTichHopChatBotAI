package com.main_project.appointment_service.dto;

import jakarta.persistence.Column;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MedicalServiceRequestDTO {
    private String serviceName;
    private String serviceType;
    private Integer serviceTime;
    private Float price;
}
