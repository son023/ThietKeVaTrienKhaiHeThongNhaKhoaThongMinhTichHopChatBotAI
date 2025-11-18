package com.main_project.appointment_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInDTO {

    @Schema(description = "Mã định danh của bệnh nhân", example = "PATIENT-001")
    @NotBlank(message = "Patient ID cannot be empty")
    private String patientId;

    @Schema(description = "Ghi chú thêm khi check-in (nếu có)", example = "Bệnh nhân kêu đau đầu, cần ưu tiên")
    private String note;
}