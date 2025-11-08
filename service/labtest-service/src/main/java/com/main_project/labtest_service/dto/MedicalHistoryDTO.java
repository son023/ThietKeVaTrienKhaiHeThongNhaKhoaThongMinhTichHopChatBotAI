package com.main_project.labtest_service.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistoryDTO {
    private UUID id;
    private UUID appointmentId;
    private String symptoms;
    private String treatment;
    private String diagnosis;
    private String disease;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    private List<UUID> labTestIds;
    private List<LabTestDTO> labTests;
}
