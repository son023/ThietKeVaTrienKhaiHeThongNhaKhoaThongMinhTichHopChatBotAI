package com.main_project.labtest_service.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestTypeDTO {
    private UUID id;
    private String name;
    private String description;
}