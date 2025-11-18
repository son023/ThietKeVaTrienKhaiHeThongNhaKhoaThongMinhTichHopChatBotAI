package com.main_project.labtest_service.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistoryRequestDTO {
    private UUID appointmentId;
    private String symptoms;
    private String treatment;
    private String diagnosis;
    private String disease;
}
