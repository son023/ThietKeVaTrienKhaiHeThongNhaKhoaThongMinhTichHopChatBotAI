package com.main_project.labtest_service.dto;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestDTO {
    private UUID id;
    private UUID medicalHistoryId;
    private UUID labTechnicianId;
    private UUID doctorId;
    private int price;
    private String instructions;
    private String status;
    private ZonedDateTime resultDate;
    private String abnormalFlag;
    private String units;
    private String structureJson;
    private String referenceRange;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    private UUID labTestTypeId;
    private LabTestTypeDTO labTestType;
    private List<UUID> medicalAttachmentIds;
    private List<MedicalAttachmentDTO> medicalAttachments;
}
