package com.main_project.labtest_service.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAttachmentRequestDTO {
    private String filePath;
    private String type;
    private UUID labTestId;
}
