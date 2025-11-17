package com.main_project.labtest_service.dto;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAttachmentDTO {
    private UUID id;
    private String filePath;
    private String type;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    private UUID labTestId;
}
