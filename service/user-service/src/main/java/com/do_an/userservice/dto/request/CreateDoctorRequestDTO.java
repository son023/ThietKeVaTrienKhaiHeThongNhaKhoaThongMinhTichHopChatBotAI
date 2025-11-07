package com.do_an.userservice.dto.request;

import com.do_an.userservice.dto.DegreeDTO;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateDoctorRequestDTO {
    @NotNull
    @NotEmpty
    private String userId; // User ID đã tồn tại
    
    private String specializationCode;
    
    private String workingHospital;
    
    private String licenseNumber;
    
    private Integer consultationFeeAmount;
    
    private List<DegreeDTO> degrees; // Danh sách bằng cấp
}
