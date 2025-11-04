package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseOrderResponse {
    private UUID id;
    private Integer pharmacistId;
    private String prescription;
    private String status;
    private ZonedDateTime createAt;
    private ZonedDateTime updateAt;
}



