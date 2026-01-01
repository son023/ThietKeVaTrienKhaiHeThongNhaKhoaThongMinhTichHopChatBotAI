package com.main_project.labtest_service.feignclient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddLabTestChargeRequestDTO {
    private UUID labTestId;
    private UUID appointmentId;
    private Integer price;
    private String description;
}