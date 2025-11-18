package com.main_project.labtest_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestTypeRequestDTO {
    private String name;
    private String description;
}
