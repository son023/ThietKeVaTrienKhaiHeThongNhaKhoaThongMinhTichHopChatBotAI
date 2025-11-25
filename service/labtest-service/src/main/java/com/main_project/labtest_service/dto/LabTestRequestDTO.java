package com.main_project.labtest_service.dto;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestRequestDTO {

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

    private UUID labTestTypeId;    // Quan h??? 1-1 v??>i LabTestType

    private List<UUID> medicalAttachmentIds;
}
